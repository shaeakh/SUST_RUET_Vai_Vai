"use client";

import { Button } from "@/components/Button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PracticalProblem } from "@/lib/mock-course-data";
import { cn } from "@/lib/utils";
import { ChevronDown, CodeIcon, ShieldIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";

interface PracticalProblemViewProps {
  problems: PracticalProblem[];
  selectedProblemId: string | null;
  onProblemSelect: (problemId: string) => void;
  userAttempts: Record<string, number>;
  userId: string;
  isAdmin: boolean;
}

// Simple markdown renderer (basic implementation)
function renderMarkdown(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentCodeBlock: string[] = [];
  let inCodeBlock = false;
  let codeLanguage = "";

  lines.forEach((line, index) => {
    // Code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <pre
            key={`code-${index}`}
            className="bg-muted rounded-md p-4 overflow-x-auto my-2"
          >
            <code className="text-sm">{currentCodeBlock.join("\n")}</code>
          </pre>,
        );
        currentCodeBlock = [];
        inCodeBlock = false;
        codeLanguage = "";
      } else {
        // Start code block
        codeLanguage = line.slice(3).trim();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      currentCodeBlock.push(line);
      return;
    }

    // Headers
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={index} className="text-2xl font-bold mt-4 mb-2">
          {line.slice(2)}
        </h1>,
      );
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="text-xl font-semibold mt-3 mb-2">
          {line.slice(3)}
        </h2>,
      );
      return;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={index} className="text-lg font-medium mt-2 mb-1">
          {line.slice(4)}
        </h3>,
      );
      return;
    }

    // Inline code
    const codeRegex = /`([^`]+)`/g;
    if (codeRegex.test(line)) {
      const parts = line.split(codeRegex);
      const renderedParts = parts.map((part, i) => {
        if (i % 2 === 1) {
          return (
            <code
              key={i}
              className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
            >
              {part}
            </code>
          );
        }
        return part;
      });
      elements.push(
        <p key={index} className="mb-2">
          {renderedParts}
        </p>,
      );
      return;
    }

    // Regular paragraphs
    if (line.trim()) {
      elements.push(
        <p key={index} className="mb-2 text-sm">
          {line}
        </p>,
      );
    } else {
      elements.push(<br key={index} />);
    }
  });

  return <div className="prose prose-sm max-w-none">{elements}</div>;
}

export function PracticalProblemView({
  problems,
  selectedProblemId,
  onProblemSelect,
  userAttempts,
  userId,
  isAdmin,
}: PracticalProblemViewProps) {
  const [expandedWeeks, setExpandedWeeks] = React.useState<Set<number>>(
    new Set(),
  );
  const [showSolution, setShowSolution] = React.useState(false);
  const selectedProblem = problems.find((p) => p.id === selectedProblemId);

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        // Single expansion: clear all and add this one
        newSet.clear();
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };

  const problemsByWeek = problems.reduce(
    (acc, problem) => {
      if (!acc[problem.weekNumber]) {
        acc[problem.weekNumber] = [];
      }
      acc[problem.weekNumber].push(problem);
      return acc;
    },
    {} as Record<number, PracticalProblem[]>,
  );

  const canViewSolution = (problem: PracticalProblem) => {
    if (isAdmin) return true;
    const attempts = userAttempts[problem.id] || 0;
    return attempts >= problem.maxAttemptsBeforeSolution;
  };

  return (
    <div className="space-y-6">
      {/* Problem List (Left Sidebar or Top) */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Available Problems</h3>
        {Object.entries(problemsByWeek)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([weekNum, weekProblems]) => {
            const weekNumber = parseInt(weekNum);
            const isExpanded = expandedWeeks.has(weekNumber);
            return (
              <Card key={weekNumber} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                  onClick={() => toggleWeek(weekNumber)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      Week {weekNumber}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {weekProblems.length} problem
                        {weekProblems.length !== 1 ? "s" : ""}
                      </span>
                      <HugeiconsIcon
                        icon={ChevronDown}
                        className={cn(
                          "size-5 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {weekProblems.map((problem) => {
                        const isSelected = problem.id === selectedProblemId;
                        const attempts = userAttempts[problem.id] || 0;
                        return (
                          <button
                            key={problem.id}
                            onClick={() => onProblemSelect(problem.id)}
                            className={cn(
                              "w-full text-left rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors",
                              isSelected && "ring-2 ring-primary",
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">
                                    {problem.title}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {problem.difficulty}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>{problem.language}</span>
                                  {!isAdmin && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        Attempts: {attempts}/
                                        {problem.maxAttemptsBeforeSolution}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
      </div>

      {/* Split View */}
      {selectedProblem && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Panel: Problem Statement */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedProblem.title}</CardTitle>
                <Badge variant="outline">{selectedProblem.difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {selectedProblem.readmeContent ? (
                <div className="prose prose-sm max-w-none">
                  {renderMarkdown(selectedProblem.readmeContent)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Problem statement will be loaded here...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Right Panel: Code Editor Placeholder */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Code Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 bg-[#1e1e1e] rounded-md p-4 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <HugeiconsIcon
                    icon={CodeIcon}
                    className="size-12 mx-auto mb-2 opacity-50"
                  />
                  <p className="text-sm font-medium mb-1">
                    Code Editor (Coming Soon)
                  </p>
                  <p className="text-xs">IDE will be integrated here</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" disabled className="flex-1">
                  Run Code
                </Button>
                <Button variant="default" size="sm" disabled className="flex-1">
                  Submit Solution
                </Button>
              </div>
              {!isAdmin && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Wrong Attempts:{" "}
                      </span>
                      <span className="font-medium">
                        {userAttempts[selectedProblem.id] || 0}/
                        {selectedProblem.maxAttemptsBeforeSolution}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSolution(true)}
                      disabled={!canViewSolution(selectedProblem)}
                    >
                      {canViewSolution(selectedProblem) ? (
                        <>
                          <HugeiconsIcon
                            icon={ShieldIcon}
                            className="size-4 mr-2"
                          />
                          View Solution
                        </>
                      ) : (
                        <>
                          <HugeiconsIcon
                            icon={ShieldIcon}
                            className="size-4 mr-2 opacity-50"
                          />
                          Locked
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Solution Modal */}
      <AlertDialog open={showSolution} onOpenChange={setShowSolution}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Solution Code</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProblem?.title} - {selectedProblem?.language}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            {selectedProblem?.solutionContent ? (
              <pre className="bg-muted rounded-md p-4 overflow-x-auto">
                <code className="text-sm font-mono">
                  {selectedProblem.solutionContent}
                </code>
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">
                Solution code not available
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSolution(false)}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
