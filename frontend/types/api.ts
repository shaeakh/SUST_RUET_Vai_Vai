/**
 * API Response Types
 */

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Document from Go backend
export interface Document {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

// Documents list response from Go backend
export interface DocumentsResponse {
  documents: Document[];
  total: number;
}

// Document chunk (for RAG context)
export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity?: number;
}

// Chat API request
export interface ChatRequest {
  messages: ChatMessage[];
  documentIds: string[];
  conversationId?: string;
}

// Chat message structure
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

// Content generation request
export interface GenerateContentRequest {
  type: "notes" | "summary" | "flashcards" | "quiz";
  documentIds: string[];
  topic?: string;
  customPrompt?: string;
}

// Content generation response
export interface GenerateContentResponse {
  content: string;
  format: "markdown" | "pdf";
  downloadUrl?: string;
}
