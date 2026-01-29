/**
 * Search utilities for intelligent semantic search
 */

import type { CourseMaterial } from "./mock-course-data";

// Tag Matching (Weight: 40%)
function calculateTagScore(query: string, tags: string[] = []): number {
  if (tags.length === 0) return 0;

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 0);

  let matchCount = 0;
  tags.forEach((tag) => {
    const tagLower = tag.toLowerCase();
    // Exact match
    if (tagLower === queryLower) {
      matchCount += 3;
    }
    // Partial match
    else if (tagLower.includes(queryLower) || queryLower.includes(tagLower)) {
      matchCount += 2;
    }
    // Word-level match
    else if (queryWords.some((word) => tagLower.includes(word))) {
      matchCount += 1;
    }
  });

  return matchCount / tags.length; // Normalize
}

// Semantic/Content Matching (Weight: 30%)
function calculateContentScore(
  query: string,
  description: string = "",
  content: string = "",
): number {
  const queryLower = query.toLowerCase();
  const descLower = description.toLowerCase();
  const contentLower = content.toLowerCase();

  let score = 0;

  // Description match
  if (descLower.includes(queryLower)) {
    score += 2;
  }

  // Content match (with word boundary awareness)
  const words = queryLower.split(/\s+/).filter((w) => w.length >= 3);
  words.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const descMatches = descLower.match(regex);
    const contentMatches = contentLower.match(regex);
    if (descMatches) score += descMatches.length * 0.5;
    if (contentMatches) score += contentMatches.length * 0.3;
  });

  return Math.min(score, 10) / 10; // Normalize, cap at 10
}

// Syntax-Aware Code Matching (Weight: 20% for code files)
function calculateSyntaxScore(
  query: string,
  syntaxTokens: string[] = [],
): number {
  if (syntaxTokens.length === 0) return 0;

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 0);

  let matchCount = 0;
  syntaxTokens.forEach((token) => {
    const tokenLower = token.toLowerCase();
    if (tokenLower === queryLower) {
      matchCount += 3;
    } else if (tokenLower.includes(queryLower)) {
      matchCount += 2;
    } else if (queryWords.some((word) => tokenLower.includes(word))) {
      matchCount += 1;
    }
  });

  return matchCount / syntaxTokens.length;
}

// File Name Matching (Weight: 10%)
function calculateNameScore(query: string, fileName: string): number {
  const queryLower = query.toLowerCase();
  const nameLower = fileName.toLowerCase();

  if (nameLower.includes(queryLower)) return 1;

  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 0);
  const matchCount = queryWords.filter((word) =>
    nameLower.includes(word),
  ).length;

  return matchCount / Math.max(queryWords.length, 1);
}

// Combined Relevance Score
export function calculateRelevanceScore(
  query: string,
  material: CourseMaterial,
): number {
  const tagScore = calculateTagScore(query, material.tags || []);
  const contentScore = calculateContentScore(
    query,
    material.description || "",
    material.content || "",
  );
  const nameScore = calculateNameScore(query, material.name);

  let totalScore = 0;

  if (material.type === "Code" && material.syntaxTokens) {
    // For code files
    const syntaxScore = calculateSyntaxScore(query, material.syntaxTokens);
    totalScore =
      tagScore * 0.4 + contentScore * 0.3 + syntaxScore * 0.2 + nameScore * 0.1;
  } else {
    // For PDFs, Slides, etc.
    totalScore = tagScore * 0.4 + contentScore * 0.4 + nameScore * 0.2;
  }

  return totalScore * 100; // Convert to percentage
}

// Search Function
export function searchMaterials(
  query: string,
  allMaterials: CourseMaterial[],
): Array<CourseMaterial & { relevanceScore: number }> {
  if (!query || query.trim().length < 2) return [];

  // Calculate relevance score for each material
  const scoredMaterials = allMaterials.map((material) => ({
    ...material,
    relevanceScore: calculateRelevanceScore(query, material),
  }));

  // Filter materials with score > 0
  const relevantMaterials = scoredMaterials.filter((m) => m.relevanceScore > 0);

  // Sort by relevance score (descending)
  relevantMaterials.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Return top 5 results
  return relevantMaterials.slice(0, 5);
}

// Helper function to highlight query terms in text
export function highlightQueryInText(text: string, query: string): string {
  if (!query || !text) return text;

  const queryWords = query
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); // Escape regex special chars

  if (queryWords.length === 0) return text;

  const regex = new RegExp(`(${queryWords.join("|")})`, "gi");
  return text.replace(
    regex,
    '<mark class="bg-yellow-200 dark:bg-yellow-900">$1</mark>',
  );
}

// Check if a tag matches the query
export function isTagMatched(tag: string, query: string): boolean {
  const tagLower = tag.toLowerCase();
  const queryLower = query.toLowerCase();
  return (
    tagLower.includes(queryLower) ||
    queryLower.split(/\s+/).some((word) => tagLower.includes(word))
  );
}
