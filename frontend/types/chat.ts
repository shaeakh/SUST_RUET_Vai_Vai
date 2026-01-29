import type { UIMessage } from "ai";

// Document types (from Go backend)
export interface Document {
  id: string;
  name: string;
  type: string;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Retrieved chunk from RAG
export interface RetrievedChunk {
  content: string;
  documentId: string;
  documentName: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

// Conversation stored in localStorage
export interface Conversation {
  id: string;
  title: string;
  documentIds: string[];
  messages: UIMessage[];
  createdAt: string;
  updatedAt: string;
}

// Chat request body
export interface ChatRequest {
  messages: UIMessage[];
  documentIds: string[];
}

// Content generation request
export interface GenerateRequest {
  prompt: string;
  documentIds: string[];
  format: "markdown" | "pdf";
}

// Content generation response
export interface GenerateResponse {
  content: string;
  sources: RetrievedChunk[];
}

// Chat context for components
export interface ChatContextValue {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  documentIds: string[];
  isLoading: boolean;
  createConversation: (documentIds: string[]) => Conversation;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  setDocumentIds: (ids: string[]) => void;
}

// Message role types
export type MessageRole = "user" | "assistant" | "system";

// Extended message with metadata
export interface ChatMessage extends UIMessage {
  sources?: RetrievedChunk[];
  isStreaming?: boolean;
}
