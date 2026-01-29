import { streamText, createUIMessageStreamResponse } from "ai";
import { google } from "@ai-sdk/google";
import { retrieveContext, formatContextForPrompt } from "@/lib/rag/retrieval";

export const runtime = "nodejs";
export const maxDuration = 60;

// Helper to extract text content from UIMessage parts
function getTextFromMessage(message: {
  role: string;
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (message.content) return message.content;
  if (message.parts) {
    return message.parts
      .filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("");
  }
  return "";
}

// Convert UIMessage format to ModelMessage format
function convertMessages(
  messages: Array<{
    role: string;
    content?: string;
    parts?: Array<{ type: string; text?: string }>;
  }>,
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: getTextFromMessage(m),
    }));
}

const SYSTEM_PROMPT_TEMPLATE = `You are a helpful learning assistant for university courses. Your role is to help students understand course materials, answer questions, and provide explanations based on their uploaded documents.

## Retrieved Context from Course Materials:
{context}

## Instructions:
- Answer questions based primarily on the provided context from course documents
- Cite your sources using [1], [2], etc. when referencing specific content
- If the answer is not found in the context, clearly state that the information is not available in the provided documents
- Provide clear, educational explanations suitable for university students
- Use markdown formatting for better readability (headers, lists, code blocks when appropriate)
- For complex topics, break down explanations into digestible parts
- If asked to generate content (notes, summaries, etc.), structure it in a well-organized format

## Response Guidelines:
- Be accurate and educational
- Acknowledge uncertainty when appropriate
- Encourage further exploration of topics
- Maintain a supportive, helpful tone`;

export async function POST(req: Request) {
  try {
    const { messages, documentIds = [] } = await req.json();

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // documentIds is optional, default to empty array
    const docIds = Array.isArray(documentIds) ? documentIds : [];

    // Get the last user message for context retrieval
    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === "user")
      .pop();

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: "No user message found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract text from the last user message (handles both UIMessage and regular format)
    const lastUserMessageText = getTextFromMessage(lastUserMessage);

    // Retrieve relevant context from documents
    let contextString = "No documents selected for context.";

    if (docIds.length > 0) {
      try {
        const retrievedChunks = await retrieveContext(
          lastUserMessageText,
          docIds,
          5, // topK
          0.6, // similarity threshold
        );

        if (retrievedChunks.length > 0) {
          contextString = formatContextForPrompt(retrievedChunks);
        } else {
          contextString =
            "No relevant context found in the selected documents for this query.";
        }
      } catch (error) {
        console.error("Error retrieving context:", error);
        contextString =
          "Unable to retrieve context from documents. Proceeding without document context.";
      }
    }

    // Build the system prompt with context
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace(
      "{context}",
      contextString,
    );

    // Convert UIMessage format to ModelMessage format
    const modelMessages = convertMessages(messages);

    // Stream the response using Gemini
    const result = streamText({
      model: google(process.env.CHAT_MODEL || "gemini-2.0-flash"),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
      maxOutputTokens: 4096,
    });

    // Return UI message stream response for useChat compatibility
    return createUIMessageStreamResponse({
      status: 200,
      stream: result.toUIMessageStream(),
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

// Health check endpoint
export async function GET() {
  return new Response(
    JSON.stringify({
      status: "ok",
      service: "chat-api",
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
