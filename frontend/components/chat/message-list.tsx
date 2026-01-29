"use client";

import * as React from "react";
import { MessageBubble, SystemMessage } from "./message-bubble";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";

interface MessageListProps {
  messages: UIMessage[];
  isLoading?: boolean;
  className?: string;
}

export function MessageList({
  messages,
  isLoading = false,
  className,
}: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full",
          className,
        )}
      >
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col gap-4 p-4 overflow-y-auto h-full",
        className,
      )}
    >
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
        const isStreaming =
          isLastMessage && isLoading && message.role === "assistant";

        return (
          <MessageBubble
            key={message.id || index}
            message={message}
            isStreaming={isStreaming}
          />
        );
      })}

      {/* Loading indicator for initial assistant response */}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex gap-3 w-full justify-start">
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium mb-1 text-primary">
              Assistant
            </span>
            <div className="flex items-center gap-1 bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
              <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
              <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center max-w-md space-y-6">
      <div className="flex items-center justify-center">
        <div className="h-20 w-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
          <svg
            className="h-10 w-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900">
          Start a conversation
        </h3>
        <p className="text-sm text-slate-500 font-light">
          Ask questions about your course materials or request study aids like
          summaries and practice notes.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <SuggestionChip text="Summarize this chapter" />
        <SuggestionChip text="Explain this concept" />
        <SuggestionChip text="Generate practice questions" />
      </div>
    </div>
  );
}

function SuggestionChip({ text }: { text: string }) {
  return (
    <div className="px-4 py-2 bg-white rounded-full text-xs text-slate-600 border border-slate-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
      {text}
    </div>
  );
}
