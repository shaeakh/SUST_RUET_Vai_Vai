"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export function TagsInput({
  value,
  onChange,
  placeholder = "Add tags (press Enter or comma)",
  disabled,
  error,
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: TagsInputProps) {
  const [input, setInput] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const addTag = React.useCallback(
    (raw: string) => {
      const t = raw.trim();
      if (!t || value.includes(t)) return;
      onChange([...value, t]);
    },
    [value, onChange],
  );

  const removeTag = React.useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
        setInput("");
      }
      return;
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleBlur = () => {
    if (input.trim()) {
      addTag(input);
      setInput("");
    }
  };

  return (
    <div className="w-full space-y-1">
      <div
        ref={containerRef}
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
          error && "border-red-500 focus-within:ring-red-500",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="rounded p-0.5 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              aria-label={`Remove tag ${tag}`}
              disabled={disabled}
            >
              <span aria-hidden>×</span>
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="min-w-32 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid ?? !!error}
        />
      </div>
      {error ? (
        <p
          id={id ? `${id}-error` : undefined}
          className="text-xs font-medium text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
