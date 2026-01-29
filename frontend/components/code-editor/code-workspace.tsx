"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import type {
  LanguageId,
  Problem,
  ExecutionResult,
  RunCodeRequest,
} from "@/types/code"
import { LANGUAGE_OPTIONS } from "@/lib/mock-data"
import { SplitLayout } from "./split-layout"
import { ProblemPanel } from "./problem-panel"
import { CodeEditor } from "./code-editor"
import { LanguageSelector } from "./language-selector"
import { ActionButtons } from "./action-buttons"
import { TestCasesPanel } from "./test-cases-panel"
import { Card, CardContent } from "@/components/ui/card"

const STORAGE_KEY_PREFIX = "code-editor-"

export function CodeWorkspace() {
  const searchParams = useSearchParams()
  const problemSlug = searchParams.get("problem") || "two-sum"

  const [problem, setProblem] = React.useState<Problem | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] =
    React.useState<LanguageId>("javascript")
  const [code, setCode] = React.useState<string>("")
  const [executionResult, setExecutionResult] =
    React.useState<ExecutionResult | null>(null)
  const [isRunning, setIsRunning] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Load problem
  React.useEffect(() => {
    async function loadProblem() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/problems/${problemSlug}`)
        if (!response.ok) {
          throw new Error(
            `Failed to load problem: ${response.statusText}`,
          )
        }
        const data = await response.json()
        setProblem(data)

        // Load saved code from localStorage
        const storageKey = `${STORAGE_KEY_PREFIX}${data.id}-${selectedLanguage}`
        const savedCode = localStorage.getItem(storageKey)
        if (savedCode) {
          setCode(savedCode)
        } else {
          setCode(data.starterCode[selectedLanguage] || "")
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load problem",
        )
      } finally {
        setLoading(false)
      }
    }

    loadProblem()
  }, [problemSlug])

  // Update code when language changes
  React.useEffect(() => {
    if (!problem) return

    const storageKey = `${STORAGE_KEY_PREFIX}${problem.id}-${selectedLanguage}`
    const savedCode = localStorage.getItem(storageKey)
    if (savedCode) {
      setCode(savedCode)
    } else {
      setCode(problem.starterCode[selectedLanguage] || "")
    }
  }, [selectedLanguage, problem])

  // Save code to localStorage
  React.useEffect(() => {
    if (!problem || !code) return
    const storageKey = `${STORAGE_KEY_PREFIX}${problem.id}-${selectedLanguage}`
    localStorage.setItem(storageKey, code)
  }, [code, selectedLanguage, problem])

  const executeCode = async (mode: "run" | "submit") => {
    if (!problem) return

    try {
      if (mode === "run") {
        setIsRunning(true)
      } else {
        setIsSubmitting(true)
      }
      setError(null)

      const request: RunCodeRequest = {
        problemId: problem.id,
        language: selectedLanguage,
        sourceCode: code,
        mode,
      }

      const response = await fetch("/api/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to execute code")
      }

      const result: { ok: boolean; error?: string; data?: ExecutionResult } =
        await response.json()

      if (!result.ok || !result.data) {
        throw new Error(result.error || "Execution failed")
      }

      setExecutionResult(result.data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to execute code",
      )
      setExecutionResult({
        status: "failed",
        summaryMessage:
          err instanceof Error ? err.message : "Execution failed",
        results: [],
      })
    } finally {
      setIsRunning(false)
      setIsSubmitting(false)
    }
  }

  const handleRun = () => executeCode("run")
  const handleSubmit = () => executeCode("submit")

  const languageOption = LANGUAGE_OPTIONS.find(
    (lang) => lang.id === selectedLanguage,
  )

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    )
  }

  if (error && !problem) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="rounded-md bg-destructive/10 p-3">
                <p className="text-sm font-semibold text-destructive">
                  Error loading problem
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-md border px-4 py-2 text-sm hover:bg-muted"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!problem) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm font-semibold text-destructive">Error</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      )}

      <SplitLayout
        left={<ProblemPanel problem={problem} selectedLanguage={selectedLanguage} />}
        right={
          <div className="flex h-full flex-col gap-4">
            {/* Header with language selector and actions */}
            <div className="flex items-center justify-between gap-4">
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

            {/* Code Editor */}
            <div className="flex-1 min-h-0">
              <CodeEditor
                language={languageOption?.monacoLanguage || "javascript"}
                value={code}
                onChange={(value) => setCode(value || "")}
                height="100%"
              />
            </div>

            {/* Test Cases Panel */}
            <div className="h-[300px] min-h-[300px]">
              <TestCasesPanel
                testCases={problem.testCases}
                results={executionResult?.results}
                isRunning={isRunning || isSubmitting}
              />
            </div>

            {/* Execution Summary */}
            {executionResult && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  executionResult.status === "success"
                    ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/5"
                    : "border-rose-500/50 bg-rose-50/50 dark:bg-rose-500/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`font-semibold ${
                      executionResult.status === "success"
                        ? "text-emerald-700 dark:text-emerald-200"
                        : "text-rose-700 dark:text-rose-200"
                    }`}
                  >
                    {executionResult.summaryMessage}
                  </p>
                  {executionResult.runtimeMs && (
                    <p className="text-xs text-muted-foreground">
                      Runtime: {executionResult.runtimeMs}ms
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  )
}
