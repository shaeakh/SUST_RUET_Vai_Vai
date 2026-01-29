"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "./markdown-preview";
import { generateAndDownloadPDF } from "@/lib/pdf/generator";

interface ContentGeneratorProps {
  documentIds: string[];
  className?: string;
}

type GenerationStatus = "idle" | "generating" | "complete" | "error";

interface GenerationResult {
  content: string;
  sources: { documentName: string; content: string }[];
}

export function ContentGenerator({
  documentIds,
  className,
}: ContentGeneratorProps) {
  const [prompt, setPrompt] = React.useState("");
  const [status, setStatus] = React.useState<GenerationStatus>("idle");
  const [result, setResult] = React.useState<GenerationResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || documentIds.length === 0) return;

    setStatus("generating");
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          documentIds,
          format: "markdown",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate content");
      }

      const data = await response.json();
      setResult(data);
      setStatus("complete");
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setStatus("error");
    }
  };

  const handleExportPDF = async () => {
    if (!result) return;

    try {
      await generateAndDownloadPDF(
        prompt.slice(0, 50) || "Generated Content",
        result.content,
      );
    } catch (err) {
      console.error("PDF export error:", err);
      setError("Failed to export PDF");
    }
  };

  const handleCopyMarkdown = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.content);
    } catch (err) {
      console.error("Copy error:", err);
    }
  };

  const hasDocuments = documentIds.length > 0;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Input Section */}
      <div className="p-4 border-b space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            What would you like to generate?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              hasDocuments
                ? "E.g., Create comprehensive study notes on Chapter 3..."
                : "Select documents first"
            }
            disabled={!hasDocuments || status === "generating"}
            className={cn(
              "w-full min-h-24 p-3 rounded-lg border resize-none",
              "text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          />
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2">
          {[
            "Create study notes",
            "Generate a summary",
            "Make flashcard content",
            "Write practice questions",
            "Create an outline",
          ].map((quickPrompt) => (
            <Button
              key={quickPrompt}
              variant="outline"
              size="sm"
              onClick={() => setPrompt(quickPrompt)}
              disabled={!hasDocuments || status === "generating"}
              className="text-xs"
            >
              {quickPrompt}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerate}
            disabled={
              !prompt.trim() || !hasDocuments || status === "generating"
            }
            className="flex-1 sm:flex-none"
          >
            {status === "generating" ? (
              <>
                <svg
                  className="h-4 w-4 mr-2 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate
              </>
            )}
          </Button>

          <span className="text-xs text-muted-foreground">
            {hasDocuments
              ? `${documentIds.length} document${documentIds.length > 1 ? "s" : ""} selected`
              : "No documents selected"}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Result Section */}
      {result && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Result Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
            <span className="text-sm font-medium">Generated Content</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </Button>
              <Button variant="default" size="sm" onClick={handleExportPDF}>
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export PDF
              </Button>
            </div>
          </div>

          {/* Content Preview */}
          <div className="flex-1 overflow-y-auto p-4">
            <MarkdownPreview content={result.content} />
          </div>

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="border-t p-4">
              <h4 className="text-sm font-medium mb-2">Sources</h4>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((source, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-muted px-2 py-1 rounded"
                  >
                    [{idx + 1}] {source.documentName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && status !== "generating" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <svg
              className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium mb-2">Generate Content</h3>
            <p className="text-sm text-muted-foreground">
              {hasDocuments
                ? "Describe what you want to create from your documents. The AI will generate well-formatted markdown that you can export as a PDF."
                : "Select documents first, then describe the content you want to generate."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
