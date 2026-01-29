import type { Conversation, ChatMessage } from "@/types/chat";
import type { UIMessage } from "ai";
import { nanoid } from "nanoid";

const STORAGE_KEY = "bcf-chat-conversations";
const MAX_CONVERSATIONS = 50;

/**
 * Get all conversations from localStorage
 */
export function getConversations(): Conversation[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const conversations: Conversation[] = JSON.parse(stored);
    // Sort by updatedAt descending (most recent first)
    return conversations.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } catch (error) {
    console.error("Error reading conversations from localStorage:", error);
    return [];
  }
}

/**
 * Save all conversations to localStorage
 */
export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;

  try {
    // Keep only the most recent conversations
    const trimmed = conversations.slice(0, MAX_CONVERSATIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Error saving conversations to localStorage:", error);
    // If storage is full, try to remove oldest conversations
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      const trimmed = conversations.slice(0, Math.floor(MAX_CONVERSATIONS / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }
}

/**
 * Get a single conversation by ID
 */
export function getConversation(id: string): Conversation | null {
  const conversations = getConversations();
  return conversations.find((c) => c.id === id) || null;
}

/**
 * Create a new conversation
 */
export function createConversation(
  documentIds: string[],
  title?: string,
): Conversation {
  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: nanoid(),
    title: title || "New Conversation",
    documentIds,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  const conversations = getConversations();
  conversations.unshift(conversation);
  saveConversations(conversations);

  return conversation;
}

/**
 * Update a conversation
 */
export function updateConversation(
  id: string,
  updates: Partial<Omit<Conversation, "id" | "createdAt">>,
): Conversation | null {
  const conversations = getConversations();
  const index = conversations.findIndex((c) => c.id === id);

  if (index === -1) return null;

  const updated: Conversation = {
    ...conversations[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  conversations[index] = updated;
  saveConversations(conversations);

  return updated;
}

/**
 * Add messages to a conversation
 */
export function addMessagesToConversation(
  id: string,
  messages: UIMessage[],
): Conversation | null {
  const conversation = getConversation(id);
  if (!conversation) return null;

  return updateConversation(id, {
    messages: [...conversation.messages, ...messages],
  });
}

/**
 * Update conversation messages (replace all)
 */
export function setConversationMessages(
  id: string,
  messages: UIMessage[],
): Conversation | null {
  return updateConversation(id, { messages });
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): boolean {
  const conversations = getConversations();
  const filtered = conversations.filter((c) => c.id !== id);

  if (filtered.length === conversations.length) {
    return false; // Conversation not found
  }

  saveConversations(filtered);
  return true;
}

/**
 * Update conversation title
 */
export function updateConversationTitle(
  id: string,
  title: string,
): Conversation | null {
  return updateConversation(id, { title });
}

/**
 * Generate a title from the first message
 */
export function generateTitleFromMessage(content: string): string {
  // Take first 50 characters, trim, and add ellipsis if needed
  const trimmed = content.trim();
  if (trimmed.length <= 50) return trimmed;
  return trimmed.substring(0, 47) + "...";
}

/**
 * Clear all conversations
 */
export function clearAllConversations(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export conversations as JSON (for backup)
 */
export function exportConversations(): string {
  const conversations = getConversations();
  return JSON.stringify(conversations, null, 2);
}

/**
 * Import conversations from JSON
 */
export function importConversations(json: string): boolean {
  try {
    const imported: Conversation[] = JSON.parse(json);

    // Validate structure
    if (!Array.isArray(imported)) {
      throw new Error("Invalid format: expected array");
    }

    // Merge with existing, avoiding duplicates
    const existing = getConversations();
    const existingIds = new Set(existing.map((c) => c.id));

    const newConversations = imported.filter((c) => !existingIds.has(c.id));
    const merged = [...existing, ...newConversations];

    saveConversations(merged);
    return true;
  } catch (error) {
    console.error("Error importing conversations:", error);
    return false;
  }
}

/**
 * Get conversations filtered by document IDs
 */
export function getConversationsByDocuments(
  documentIds: string[],
): Conversation[] {
  const conversations = getConversations();
  const docSet = new Set(documentIds);

  return conversations.filter((c) =>
    c.documentIds.some((id) => docSet.has(id)),
  );
}
