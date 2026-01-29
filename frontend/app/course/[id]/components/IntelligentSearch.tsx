"use client";

import type { CourseMaterial } from "@/lib/mock-course-data";
import { searchMaterials } from "@/lib/search-utils";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { FilePreviewDialog } from "./FilePreviewDialog";
import { SearchResultItem } from "./SearchResultItem";

interface IntelligentSearchProps {
  allMaterials: CourseMaterial[];
}

export function IntelligentSearch({ allMaterials }: IntelligentSearchProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<
    Array<CourseMaterial & { relevanceScore: number }>
  >([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [selectedMaterial, setSelectedMaterial] =
    React.useState<CourseMaterial | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Debounced search
  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const searchResults = searchMaterials(query, allMaterials);
      setResults(searchResults);
      setShowResults(true);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, allMaterials]);

  // Close results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowResults(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleResultClick = (material: CourseMaterial) => {
    setSelectedMaterial(material);
    setShowPreview(true);
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <>
      <div className="relative w-full max-w-2xl" ref={searchContainerRef}>
        {/* Search Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <HugeiconsIcon
              icon={Search01Icon}
              className="size-5 text-muted-foreground"
            />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setShowResults(true);
            }}
            placeholder="Search materials, topics, code snippets..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              type="button"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-[500px] overflow-y-auto z-50">
            {results.length > 0 ? (
              <>
                <div className="px-4 py-2 border-b border-border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground">
                    Found {results.length} result
                    {results.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="p-2 space-y-2">
                  {results.map((material) => (
                    <SearchResultItem
                      key={material.id}
                      material={material}
                      query={query}
                      onClick={() => handleResultClick(material)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="size-12 text-muted-foreground mx-auto mb-3"
                />
                <p className="text-sm font-medium text-foreground mb-1">
                  No materials found for &quot;{query}&quot;
                </p>
                <p className="text-xs text-muted-foreground">
                  Try different keywords or check spelling
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      {selectedMaterial && (
        <FilePreviewDialog
          material={selectedMaterial}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      )}
    </>
  );
}
