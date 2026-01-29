import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { retrieveContext, formatContextForPrompt } from "@/lib/rag/retrieval";

export const runtime = "nodejs";
export const maxDuration = 60;

const GENERATION_PROMPT_TEMPLATE = `You are an expert content creator for university courses. Your role is to generate high-quality educational content based on course materials.

## Retrieved Context from Course Materials:
{context}

## Content Generation Guidelines:
1. Structure content with clear headings and subheadings (use Markdown)
2. Include key concepts, definitions, and explanations
3. Use bullet points and numbered lists for clarity
4. Add examples where relevant
5. Include summary sections
6. Cite sources from the provided context using [1], [2], etc.
7. Make content suitable for university-level learning
8. Ensure accuracy based on the provided materials

## Output Format:
Generate well-formatted Markdown that can be:
- Read directly as formatted text
- Exported to PDF
- Used as study materials

If the requested content cannot be fully generated from the provided context, clearly indicate what information is available and what is missing.`;

export async function POST(req: Request) {
  try {
    const { prompt, documentIds, format = "markdown" } = await req.json();

    // Validate request
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!documentIds || !Array.isArray(documentIds)) {
      return new Response(
        JSON.stringify({ error: "Document IDs array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Retrieve relevant context from documents
    let contextString = "No documents selected for context.";
    let sources: { documentName: string; content: string }[] = [];

    if (documentIds.length > 0) {
      try {
        const retrievedChunks = await retrieveContext(
          prompt,
          documentIds,
          10, // Higher topK for content generation
          0.5, // Lower threshold to get more context
        );

        if (retrievedChunks.length > 0) {
          contextString = formatContextForPrompt(retrievedChunks);
          sources = retrievedChunks.map((chunk) => ({
            documentName: chunk.documentName,
            content: chunk.content.slice(0, 200) + "...",
          }));
        } else {
          contextString =
            "No relevant context found in the selected documents.";
        }
      } catch (error) {
        console.error("Error retrieving context:", error);
        contextString = "Unable to retrieve context from documents.";
      }
    }

    // Prepare system prompt with context
    const systemPrompt = GENERATION_PROMPT_TEMPLATE.replace(
      "{context}",
      contextString,
    );

    // Generate content
    const result = await streamText({
      model: google(process.env.CHAT_MODEL || "gemini-2.5-flash"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Generate the following content:\n\n${prompt}`,
        },
      ],
    });

    // For streaming response
    if (format === "stream") {
      return result.toTextStreamResponse();
    }

    // For complete markdown response
    const content = await result.text;

    return new Response(
      JSON.stringify({
        content,
        sources,
        format: "markdown",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Content generation error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
