"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = "Ask a question about your documents...",
  className,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !disabled && value.trim()) {
        onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex items-end gap-2 p-4 border-t bg-background",
        className,
      )}
    >
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          rows={1}
          className={cn(
            "w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pr-12",
            "text-sm placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "min-h-[48px] max-h-[200px]",
          )}
        />
        <span className="absolute bottom-3 right-3 text-[10px] text-muted-foreground pointer-events-none">
          Enter to send
        </span>
      </div>

      <Button
        type="submit"
        size="icon"
        disabled={isLoading || disabled || !value.trim()}
        className="h-12 w-12 rounded-xl shrink-0"
      >
        {isLoading ? (
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}

// Quick action buttons for common queries
interface QuickActionsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  const quickPrompts = [
    {
      label: "Summarize",
      prompt: "Please summarize the key points from the selected documents.",
    },
    {
      label: "Key Concepts",
      prompt: "What are the main concepts covered in these documents?",
    },
    {
      label: "Study Notes",
      prompt: "Create study notes from the selected documents.",
    },
    {
      label: "Quiz Me",
      prompt: "Generate practice questions based on the documents.",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {quickPrompts.map((item) => (
        <Button
          key={item.label}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(item.prompt)}
          className="text-xs"
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
