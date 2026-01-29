"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Panel, Group, Separator } from "react-resizable-panels";
import type {
  LanguageId,
  Problem,
  ExecutionResult,
  RunCodeRequest,
} from "@/types/code";
import { LANGUAGE_OPTIONS } from "@/lib/mock-data";
import { ProblemPanel } from "./problem-panel";
import { CodeEditor } from "./code-editor";
import { LanguageSelector } from "./language-selector";
import { ActionButtons } from "./action-buttons";
import { TestCasesPanel } from "./test-cases-panel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STORAGE_KEY_PREFIX = "code-editor-";

function ResizeHandle({
  className,
  vertical = false,
}: {
  className?: string;
  vertical?: boolean;
}) {
  return (
    <Separator
      className={cn(
        "relative flex items-center justify-center bg-transparent transition-colors hover:bg-primary/5 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
        vertical
          ? "h-2 w-full cursor-row-resize"
          : "w-2 h-full cursor-col-resize",
        className,
      )}
    >
      <div
        className={cn(
          "bg-border rounded-full transition-colors group-hover:bg-primary",
          vertical ? "h-1 w-12" : "h-12 w-1",
        )}
      />
    </Separator>
  );
}

export function CodeWorkspace() {
  const searchParams = useSearchParams();
  const problemSlug = searchParams.get("problem") || "two-sum";

  const [problem, setProblem] = React.useState<Problem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] =
    React.useState<LanguageId>("javascript");
  const [code, setCode] = React.useState<string>("");
  const [executionResult, setExecutionResult] =
    React.useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [testCasesTab, setTestCasesTab] = React.useState("test-cases");

  // Load problem
  React.useEffect(() => {
    async function loadProblem() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/problems/${problemSlug}`);
        if (!response.ok) {
          throw new Error(`Failed to load problem: ${response.statusText}`);
        }
        const data = await response.json();
        setProblem(data);

        // Load saved code from localStorage
        const storageKey = `${STORAGE_KEY_PREFIX}${data.id}-${selectedLanguage}`;
        const savedCode = localStorage.getItem(storageKey);
        if (savedCode) {
          setCode(savedCode);
        } else {
          setCode(data.starterCode[selectedLanguage] || "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load problem");
      } finally {
        setLoading(false);
      }
    }

    loadProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only load when problemSlug changes; selectedLanguage used for initial code only
  }, [problemSlug]);

  // Update code when language changes
  React.useEffect(() => {
    if (!problem) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${problem.id}-${selectedLanguage}`;
    const savedCode = localStorage.getItem(storageKey);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(problem.starterCode[selectedLanguage] || "");
    }
  }, [selectedLanguage, problem]);

  // Save code to localStorage
  React.useEffect(() => {
    if (!problem || !code) return;
    const storageKey = `${STORAGE_KEY_PREFIX}${problem.id}-${selectedLanguage}`;
    localStorage.setItem(storageKey, code);
  }, [code, selectedLanguage, problem]);

  const executeCode = async (mode: "run" | "submit") => {
    if (!problem) return;

    setTestCasesTab("results");

    try {
      if (mode === "run") {
        setIsRunning(true);
      } else {
        setIsSubmitting(true);
      }
      setError(null);

      const request: RunCodeRequest = {
        problemId: problem.id,
        language: selectedLanguage,
        sourceCode: code,
        mode,
      };

      const response = await fetch("/api/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to execute code");
      }

      const result: { ok: boolean; error?: string; data?: ExecutionResult } =
        await response.json();

      if (!result.ok || !result.data) {
        throw new Error(result.error || "Execution failed");
      }

      setExecutionResult(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute code");
      setExecutionResult({
        status: "failed",
        summaryMessage: err instanceof Error ? err.message : "Execution failed",
        results: [],
      });
    } finally {
      setIsRunning(false);
      setIsSubmitting(false);
    }
  };

  const handleRun = () => executeCode("run");
  const handleSubmit = () => executeCode("submit");

  const languageOption = LANGUAGE_OPTIONS.find(
    (lang) => lang.id === selectedLanguage,
  );

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative h-16 w-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error && !problem) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="rounded-md bg-destructive/10 p-4 flex items-start gap-3">
                <div className="p-1 bg-destructive/20 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-destructive"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    Error loading problem
                  </p>
                  <p className="mt-1 text-xs text-destructive/80">{error}</p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!problem) {
    return null;
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {error && (
        <div className="absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 shadow-md backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-destructive"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <p className="text-sm font-semibold text-destructive">Error</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      <Group orientation="horizontal" className="h-full">
        {/* Left Panel: Problem Description */}
        <Panel defaultSize={40} minSize={25} className="bg-card/50">
          <div className="h-full overflow-hidden border-r bg-card">
            <ProblemPanel
              problem={problem}
              selectedLanguage={selectedLanguage}
            />
          </div>
        </Panel>

        <ResizeHandle />

        {/* Right Panel: Code Editor & Test Cases */}
        <Panel defaultSize={60} minSize={30}>
          <Group orientation="vertical">
            {/* Top Right: Code Editor */}
            <Panel defaultSize={65} minSize={30} className="flex flex-col">
              <div className="flex items-center justify-between border-b bg-card px-4 py-2">
                <LanguageSelector
                  value={selectedLanguage}
                  onValueChange={setSelectedLanguage}
                />
                <ActionButtons
                  onRun={handleRun}
                  onSubmit={handleSubmit}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  disabled={!code.trim()}
                />
              </div>
              <div className="flex-1 overflow-hidden relative">
                <CodeEditor
                  language={languageOption?.monacoLanguage || "javascript"}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  height="100%"
                />
              </div>
            </Panel>

            <ResizeHandle vertical />

            {/* Bottom Right: Test Cases & Results */}
            <Panel defaultSize={35} minSize={20} className="bg-card">
              <div className="flex h-full flex-col border-t">
                {executionResult && (
                  <div
                    className={cn(
                      "flex items-center justify-between border-b px-4 py-2 text-xs transition-colors",
                      executionResult.status === "success"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                    )}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <span
                        className={cn(
                          "flex h-2 w-2 rounded-full",
                          executionResult.status === "success"
                            ? "bg-emerald-500"
                            : "bg-rose-500",
                        )}
                      />
                      {executionResult.summaryMessage}
                    </div>
                    {executionResult.runtimeMs && (
                      <span className="text-muted-foreground">
                        {executionResult.runtimeMs}ms
                      </span>
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-hidden">
                  <TestCasesPanel
                    testCases={problem.testCases}
                    results={executionResult?.results}
                    isRunning={isRunning || isSubmitting}
                    value={testCasesTab}
                    onValueChange={setTestCasesTab}
                  />
                </div>
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
    </div>
  );
}
