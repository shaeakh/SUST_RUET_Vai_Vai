"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { cn } from "@/lib/utils";
import { MessageList } from "./message-list";
import { ChatInput, QuickActions } from "./chat-input";
import { Button } from "@/components/ui/button";
import {
  getConversation,
  updateConversation,
} from "@/lib/storage/conversations";
import type { UIMessage } from "ai";

interface ChatInterfaceProps {
  documentIds: string[];
  conversationId?: string;
  onConversationUpdate?: (id: string, title: string) => void;
  className?: string;
}

// Helper to extract text content from UIMessage parts
function getMessageContent(message: UIMessage): string {
  if (!message.parts) return "";
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("");
}

export function ChatInterface({
  documentIds,
  conversationId,
  onConversationUpdate,
  className,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = React.useState("");

  // Track if title has been updated for this conversation to avoid duplicate updates
  const titleUpdatedRef = React.useRef<string | null>(null);

  // Create transport with the API endpoint and document IDs in body
  const transport = React.useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { documentIds },
      }),
    [documentIds],
  );

  // Load initial messages for the conversation
  const getInitialMessages = React.useCallback((): UIMessage[] => {
    if (conversationId) {
      const conversation = getConversation(conversationId);
      return conversation?.messages || [];
    }
    return [];
  }, [conversationId]);

  const {
    messages,
    sendMessage,
    status,
    error,
    setMessages,
    regenerate,
    stop,
  } = useChat({
    transport,
    messages: getInitialMessages(),
    id: conversationId,
    onFinish: ({ messages: finishedMessages }) => {
      // Save all messages to localStorage when assistant finishes responding
      // Use finishedMessages from callback which contains the complete updated array
      if (conversationId && finishedMessages) {
        updateConversation(conversationId, { messages: finishedMessages });

        // Update title if it's the first exchange (user + assistant = 2 messages)
        if (
          finishedMessages.length === 2 &&
          onConversationUpdate &&
          titleUpdatedRef.current !== conversationId
        ) {
          const firstMessage = finishedMessages[0];
          const content = getMessageContent(firstMessage);
          const title = generateTitle(content);
          onConversationUpdate(conversationId, title);
          titleUpdatedRef.current = conversationId;
        }
      }
    },
    onError: (error: Error) => {
      console.error("Chat error:", error);
    },
  });

  // Sync messages when conversation changes
  React.useEffect(() => {
    const loadedMessages = getInitialMessages();
    setMessages(loadedMessages);
    // Reset title tracking when switching to a different conversation
    if (conversationId !== titleUpdatedRef.current) {
      titleUpdatedRef.current = null;
    }
  }, [conversationId, getInitialMessages, setMessages]);

  const isLoading = status === "streaming" || status === "submitted";

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  // Send message - useChat handles message state, onFinish saves to localStorage
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // Send message using the simpler text format
    await sendMessage({ text: userMessage });
  };

  // Handle quick action selection
  const handleQuickAction = async (prompt: string) => {
    if (isLoading) return;
    await sendMessage({ text: prompt });
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
    if (conversationId) {
      updateConversation(conversationId, { messages: [] });
    }
  };

  const hasDocuments = documentIds.length > 0;
  const showQuickActions = messages.length === 0 && hasDocuments;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header actions */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {hasDocuments
              ? `${documentIds.length} document${documentIds.length > 1 ? "s" : ""} selected`
              : "General chat (no documents)"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <Button variant="ghost" size="sm" onClick={stop}>
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              Stop
            </Button>
          )}
          {messages.length > 0 && !isLoading && (
            <Button variant="ghost" size="sm" onClick={handleClearChat}>
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-sm text-destructive/80 mt-1">{error.message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerate()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Quick actions for empty chat */}
      {showQuickActions && (
        <QuickActions onSelect={handleQuickAction} disabled={!hasDocuments} />
      )}

      {/* Input area */}
      <ChatInput
        value={inputValue}
        onChange={handleInputChange}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        placeholder={
          hasDocuments
            ? "Ask a question about your documents..."
            : "Ask anything or select documents for context..."
        }
      />
    </div>
  );
}

// Generate a title from the first message
function generateTitle(content: string): string {
  const maxLength = 50;
  const cleaned = content.replace(/\n/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + "...";
}
