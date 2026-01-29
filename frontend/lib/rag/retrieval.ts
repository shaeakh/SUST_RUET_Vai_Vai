import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { pool } from "@/lib/db";
import type { RetrievedChunk } from "@/types/chat";

// Initialize embeddings model for query embedding generation
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  modelName: "text-embedding-004",
});

// Minimum similarity threshold for relevant results
const DEFAULT_SIMILARITY_THRESHOLD = 0.6;
const DEFAULT_TOP_K = 5;

/**
 * Generate embedding for a query string
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const embedding = await embeddings.embedQuery(query);
    return embedding;
  } catch (error) {
    console.error("Error generating query embedding:", error);
    throw new Error("Failed to generate query embedding");
  }
}

/**
 * Retrieve relevant document chunks based on semantic similarity
 *
 * @param query - The user's query string
 * @param documentIds - Array of document IDs to search within
 * @param topK - Maximum number of results to return
 * @param similarityThreshold - Minimum similarity score (0-1)
 * @returns Array of retrieved chunks with content and metadata
 */
export async function retrieveContext(
  query: string,
  documentIds: string[],
  topK: number = DEFAULT_TOP_K,
  similarityThreshold: number = DEFAULT_SIMILARITY_THRESHOLD,
): Promise<RetrievedChunk[]> {
  if (!documentIds || documentIds.length === 0) {
    console.warn("No document IDs provided for context retrieval");
    return [];
  }

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateQueryEmbedding(query);

    // Format embedding as pgvector-compatible string
    const embeddingString = `[${queryEmbedding.join(",")}]`;

    // Query existing vectors in pgvector, filtered by document IDs
    // Using cosine distance (<=>), converted to similarity (1 - distance)
    const result = await pool.query(
      `
      SELECT
        dc.content,
        dc.document_id,
        dc.metadata,
        d.name as document_name,
        1 - (dc.embedding <=> $1::vector) as similarity
      FROM document_chunks dc
      LEFT JOIN documents d ON dc.document_id = d.id::text
      WHERE dc.document_id = ANY($2::text[])
      ORDER BY dc.embedding <=> $1::vector
      LIMIT $3
      `,
      [embeddingString, documentIds, topK * 2], // Fetch more to filter by threshold
    );

    // Filter by similarity threshold and map to RetrievedChunk format
    const chunks: RetrievedChunk[] = result.rows
      .filter((row) => row.similarity >= similarityThreshold)
      .slice(0, topK)
      .map((row) => ({
        content: row.content,
        documentId: row.document_id,
        documentName:
          row.document_name || row.metadata?.documentName || "Document",
        similarity: parseFloat(row.similarity),
        metadata: row.metadata || {},
      }));

    console.log(
      `Retrieved ${chunks.length} relevant chunks for query: "${query.substring(0, 50)}..."`,
    );

    return chunks;
  } catch (error) {
    console.error("Error retrieving context:", error);
    throw new Error("Failed to retrieve context from documents");
  }
}

/**
 * Format retrieved chunks into a context string for the LLM
 *
 * @param chunks - Array of retrieved chunks
 * @returns Formatted context string with source citations
 */
export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant context found in the selected documents.";
  }

  return chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] From "${chunk.documentName}" (similarity: ${(chunk.similarity * 100).toFixed(1)}%):\n${chunk.content}`,
    )
    .join("\n\n---\n\n");
}

/**
 * Get document names for citation purposes
 */
export function getSourceCitations(chunks: RetrievedChunk[]): string[] {
  const uniqueSources = new Map<string, string>();

  chunks.forEach((chunk) => {
    if (!uniqueSources.has(chunk.documentId)) {
      uniqueSources.set(chunk.documentId, chunk.documentName);
    }
  });

  return Array.from(uniqueSources.values());
}

/**
 * Multi-query retrieval for better coverage
 * Generates multiple query variations and combines results
 */
export async function retrieveContextMultiQuery(
  queries: string[],
  documentIds: string[],
  topK: number = DEFAULT_TOP_K,
): Promise<RetrievedChunk[]> {
  const allChunks: RetrievedChunk[] = [];
  const seenContent = new Set<string>();

  for (const query of queries) {
    const chunks = await retrieveContext(query, documentIds, topK);

    for (const chunk of chunks) {
      // Deduplicate by content hash
      const contentKey = chunk.content.substring(0, 100);
      if (!seenContent.has(contentKey)) {
        seenContent.add(contentKey);
        allChunks.push(chunk);
      }
    }
  }

  // Sort by similarity and return top K
  return allChunks.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}
