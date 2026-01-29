"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Document } from "@/types/chat";

const GO_BACKEND_URL =
  process.env.NEXT_PUBLIC_GO_BACKEND_URL || "http://localhost:8080";

interface PDFSelectorProps {
  selected: string[];
  onSelect: (ids: string[]) => void;
  className?: string;
}

export function PDFSelector({
  selected,
  onSelect,
  className,
}: PDFSelectorProps) {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchDocuments() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${GO_BACKEND_URL}/api/documents`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.statusText}`);
        }

        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load documents",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  const toggleDocument = (id: string) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((i) => i !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  const selectAll = () => {
    onSelect(documents.map((d) => d.id));
  };

  const clearAll = () => {
    onSelect([]);
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return (
          <svg
            className="h-5 w-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3z" />
          </svg>
        );
      default:
        return (
          <svg
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Select Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading documents...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full border-destructive/50", className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Select Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Select Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-sm text-muted-foreground">
            No documents available. Upload documents to start chatting.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn("w-full border-0 bg-transparent shadow-none", className)}
    >
      <CardHeader className="pb-3 px-4">
        <div className="flex flex-col gap-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Documents ({selected.length}/{documents.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={selectAll}
              disabled={selected.length === documents.length}
              className="flex-1 text-[10px] h-7 border-slate-200"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={clearAll}
              disabled={selected.length === 0}
              className="flex-1 text-[10px] h-7 border-slate-200"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3">
        <div className="space-y-1">
          {documents.map((doc) => {
            const isSelected = selected.includes(doc.id);

            return (
              <button
                key={doc.id}
                onClick={() => toggleDocument(doc.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all border",
                  isSelected
                    ? "border-primary/20 bg-primary/5 text-primary"
                    : "border-transparent text-slate-600 hover:bg-slate-100",
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30",
                  )}
                >
                  {isSelected && (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                {getFileIcon(doc.type)}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">
                    {doc.type}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
