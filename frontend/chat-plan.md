# Simplified Plan: Vector Retrieval Only

Since vectors are already in the database, Next.js only needs to **query** pgvector using document IDs from Go backend metadata.

---

## TL;DR

Build a streaming chat interface using Vercel AI SDK with Gemini. Go backend provides PDF metadata. Next.js uses **LangChain** to query **existing vectors** in pgvector filtered by selected document IDs. No embedding generation needed.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Go Backend                                  │
├─────────────────────────────────────────────────────────────────┤
│  /api/documents         → PDF metadata (id, name, fileUrl)       │
│  PostgreSQL             → documents + document_chunks (vectors)  │
│                           (vectors already populated)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js Frontend                               │
├─────────────────────────────────────────────────────────────────┤
│  UI: PDF Selector → Chat Interface → Content Generator           │
│                           │                                      │
│                    localStorage (conversations)                  │
├─────────────────────────────────────────────────────────────────┤
│  API Routes                                                      │
│  /api/chat     → Query pgvector + Gemini streaming               │
│  /api/generate → Content generation to PDF                       │
├─────────────────────────────────────────────────────────────────┤
│  LangChain.js                                                    │
│  - GoogleGenerativeAIEmbeddings (query embedding only)           │
│  - Raw pg query to existing pgvector table                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Steps

### Step 1: Install Dependencies

```bash
# AI & Streaming
npm install ai @ai-sdk/google

# LangChain (for embeddings only)
npm install @langchain/google-genai

# PostgreSQL
npm install pg @types/pg

# PDF Generation & Markdown
npm install @react-pdf/renderer react-markdown remark-gfm

# Utilities
npm install zod nanoid
```

---

### Step 2: Database Connection

Create [lib/db/index.ts](lib/db/index.ts):

```typescript
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

---

### Step 3: RAG Retrieval (Query Existing Vectors)

Create [lib/rag/retrieval.ts](lib/rag/retrieval.ts):

```typescript
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { pool } from '@/lib/db';

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  modelName: 'text-embedding-004',
});

export interface RetrievedChunk {
  content: string;
  documentId: string;
  documentName: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

export async function retrieveContext(
  query: string,
  documentIds: string[],
  topK: number = 5
): Promise<RetrievedChunk[]> {
  // Generate embedding for the query
  const queryEmbedding = await embeddings.embedQuery(query);

  // Query existing vectors filtered by document IDs
  const result = await pool.query(
    `
    SELECT 
      content,
      document_id,
      metadata,
      1 - (embedding <=> $1::vector) as similarity
    FROM document_chunks
    WHERE document_id = ANY($2::text[])
    ORDER BY embedding <=> $1::vector
    LIMIT $3
    `,
    [`[${queryEmbedding.join(',')}]`, documentIds, topK]
  );

  return result.rows
    .filter(row => row.similarity > 0.6)
    .map(row => ({
      content: row.content,
      documentId: row.document_id,
      documentName: row.metadata?.documentName || 'Document',
      similarity: row.similarity,
      metadata: row.metadata || {},
    }));
}
```

---

### Step 4: Streaming Chat API

Create [app/api/chat/route.ts](app/api/chat/route.ts):

```typescript
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { retrieveContext } from '@/lib/rag/retrieval';

export async function POST(req: Request) {
  const { messages, documentIds } = await req.json();

  const lastMessage = messages[messages.length - 1].content;
  const context = await retrieveContext(lastMessage, documentIds);

  const systemPrompt = `You are a helpful learning assistant for university courses.

## Retrieved Context:
${context.map((c, i) => `[${i + 1}] From "${c.documentName}":\n${c.content}`).join('\n\n')}

## Instructions:
- Answer based on the provided context
- Cite sources using [1], [2], etc.
- If not in context, state that clearly
- For content generation, output well-structured markdown`;

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
```

---

### Step 5: Chat UI Components

**[components/chat/pdf-selector.tsx](components/chat/pdf-selector.tsx)** - Fetch metadata from Go:

```typescript
'use client';

import { useEffect, useState } from 'react';

const GO_BACKEND_URL = process.env.NEXT_PUBLIC_GO_BACKEND_URL;

interface Document {
  id: string;
  name: string;
  type: string;
}

export function PDFSelector({
  selected,
  onSelect,
}: {
  selected: string[];
  onSelect: (ids: string[]) => void;
}) {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    fetch(`${GO_BACKEND_URL}/api/documents`)
      .then(res => res.json())
      .then(data => setDocuments(data.documents));
  }, []);

  const toggle = (id: string) => {
    onSelect(
      selected.includes(id)
        ? selected.filter(i => i !== id)
        : [...selected, id]
    );
  };

  // ... render checkboxes
}
```

**[components/chat/chat-interface.tsx](components/chat/chat-interface.tsx):**

```typescript
'use client';

import { useChat } from 'ai/react';

export function ChatInterface({ documentIds }: { documentIds: string[] }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { documentIds },
  });

  // ... render messages + input
}
```

---

## File Structure

```
frontend/
├── app/
│   ├── chat/
│   │   └── page.tsx
│   └── api/
│       ├── chat/
│       │   └── route.ts          # RAG query + Gemini streaming
│       └── generate/
│           └── route.ts          # Content → PDF
├── components/
│   └── chat/
│       ├── chat-page.tsx
│       ├── pdf-selector.tsx      # Fetches from Go backend
│       ├── chat-interface.tsx    # useChat hook
│       ├── message-list.tsx
│       ├── message-bubble.tsx
│       ├── chat-input.tsx
│       └── markdown-preview.tsx
├── lib/
│   ├── rag/
│   │   └── retrieval.ts          # Query pgvector
│   ├── db/
│   │   └── index.ts              # pg Pool
│   ├── pdf/
│   │   └── generator.ts          # Markdown → PDF
│   └── storage/
│       └── conversations.ts      # localStorage
├── types/
│   ├── api.ts
│   └── chat.ts
└── .env.local
```

---

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bcf_db"
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_GO_BACKEND_URL="http://localhost:8080"
```

---

## Summary

| Component | Responsibility |
|-----------|---------------|
| **Go Backend** | PDF storage, metadata, vector population |
| **Next.js** | Query existing vectors, chat streaming, UI |
| **pgvector** | Store vectors (managed by Go) |
| **LangChain** | Generate query embedding only |
| **Vercel AI SDK** | Gemini streaming |
| **localStorage** | Conversation history |

**Not needed in Next.js:**
- ❌ PDF upload/processing
- ❌ Chunking logic
- ❌ Embedding generation for documents
- ❌ PGVectorStore (using raw SQL instead)
