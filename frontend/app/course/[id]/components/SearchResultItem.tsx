"use client";

import { Badge } from "@/components/ui/badge";
import type { CourseMaterial } from "@/lib/mock-course-data";
import { highlightQueryInText, isTagMatched } from "@/lib/search-utils";
import { cn } from "@/lib/utils";
import { CodeIcon, File01Icon, FileIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface SearchResultItemProps {
  material: CourseMaterial & { relevanceScore: number };
  query: string;
  onClick: () => void;
}

const getFileIcon = (type: CourseMaterial["type"]) => {
  switch (type) {
    case "Slide":
      return File01Icon;
    case "PDF":
      return FileIcon;
    case "Code":
      return CodeIcon;
    case "Problem Sheet":
      return FileIcon;
    default:
      return FileIcon;
  }
};

const getMaterialTypeColor = (type: CourseMaterial["type"]) => {
  switch (type) {
    case "Slide":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "PDF":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    case "Code":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "Problem Sheet":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getMatchStrength = (score: number) => {
  if (score >= 80)
    return {
      text: "Excellent Match",
      color: "text-green-600 dark:text-green-400",
    };
  if (score >= 60)
    return { text: "Good Match", color: "text-blue-600 dark:text-blue-400" };
  if (score >= 40)
    return {
      text: "Fair Match",
      color: "text-yellow-600 dark:text-yellow-400",
    };
  return { text: "Weak Match", color: "text-gray-600 dark:text-gray-400" };
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export function SearchResultItem({
  material,
  query,
  onClick,
}: SearchResultItemProps) {
  const Icon = getFileIcon(material.type);
  const matchStrength = getMatchStrength(material.relevanceScore);

  return (
    <div
      className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <HugeiconsIcon
            icon={Icon}
            className={cn(
              "size-6",
              material.type === "Slide" && "text-blue-500",
              material.type === "PDF" && "text-red-500",
              material.type === "Code" && "text-green-500",
              material.type === "Problem Sheet" && "text-purple-500",
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {material.name}
            </h4>
            <Badge
              className={cn(
                "text-xs px-2 py-0.5 flex-shrink-0",
                getMaterialTypeColor(material.type),
              )}
            >
              {material.type}
            </Badge>
          </div>

          {/* Relevance Score */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={cn("text-xs font-medium", matchStrength.color)}>
              {matchStrength.text}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(material.relevanceScore)}%
            </span>
            {material.weekNumber && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  Week {material.weekNumber}
                </span>
              </>
            )}
          </div>

          {/* Tags */}
          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {material.tags.slice(0, 5).map((tag) => {
                const isMatched = isTagMatched(tag, query);
                return (
                  <span
                    key={tag}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full border",
                      isMatched
                        ? "bg-primary/20 text-primary border-primary/30 font-medium"
                        : "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    {tag}
                  </span>
                );
              })}
              {material.tags.length > 5 && (
                <span className="text-xs text-muted-foreground px-2 py-0.5">
                  +{material.tags.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {material.description && (
            <p
              className="text-xs text-muted-foreground line-clamp-2 mb-2"
              dangerouslySetInnerHTML={{
                __html: highlightQueryInText(
                  material.description.slice(0, 150),
                  query,
                ),
              }}
            />
          )}

          {/* Metadata */}
          <div className="flex gap-2 text-xs text-muted-foreground">
            {material.size && <span>{material.size}</span>}
            {material.size && material.uploadedAt && <span>•</span>}
            {material.uploadedAt && (
              <span>{formatDate(material.uploadedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
