"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { StreamingMarkdown } from "./markdown-preview";
import type { UIMessage } from "ai";

interface MessageBubbleProps {
  message: UIMessage;
  isStreaming?: boolean;
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

export function MessageBubble({
  message,
  isStreaming = false,
  className,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const content = getMessageContent(message);

  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isUser ? "justify-end" : "justify-start",
        className,
      )}
    >
      {/* Avatar for assistant */}
      {isAssistant && (
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
      )}

      {/* Message content */}
      <div
        className={cn(
          "flex flex-col max-w-[80%] min-w-0",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Role label */}
        <span
          className={cn(
            "text-xs font-medium mb-1",
            isUser ? "text-muted-foreground" : "text-primary",
          )}
        >
          {isUser ? "You" : "Assistant"}
        </span>

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted rounded-bl-md",
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <StreamingMarkdown
              content={content}
              isStreaming={isStreaming}
              className="text-sm"
            />
          )}
        </div>

        {/* Timestamp - check if createdAt exists (may be added by storage) */}
        {(() => {
          const createdAt = (message as unknown as { createdAt?: Date | string }).createdAt;
          return createdAt ? (
            <span className="text-[10px] text-muted-foreground mt-1">
              {formatTimestamp(createdAt)}
            </span>
          ) : null;
        })()}

        {/* Loading indicator for streaming */}
        {isStreaming && !content && (
          <div className="flex items-center gap-1 mt-2">
            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
          </div>
        )}
      </div>

      {/* Avatar for user */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimestamp(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  // Less than a minute ago
  if (diff < 60000) {
    return "Just now";
  }

  // Less than an hour ago
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Same day
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Different day
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Compact version for list views
interface CompactMessageProps {
  message: UIMessage;
  className?: string;
}

export function CompactMessage({ message, className }: CompactMessageProps) {
  const isUser = message.role === "user";
  const content = getMessageContent(message);

  return (
    <div className={cn("flex items-start gap-2", className)}>
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {isUser ? "U" : "A"}
      </div>
      <p className="text-sm text-muted-foreground truncate flex-1">
        {content.substring(0, 100)}
        {content.length > 100 ? "..." : ""}
      </p>
    </div>
  );
}

// System message component
interface SystemMessageProps {
  content: string;
  className?: string;
}

export function SystemMessage({ content, className }: SystemMessageProps) {
  return (
    <div className={cn("flex items-center justify-center py-2", className)}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{content}</span>
      </div>
    </div>
  );
}
