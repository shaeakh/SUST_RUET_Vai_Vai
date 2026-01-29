"use client"

import * as React from "react"
import type { Problem, LanguageId } from "@/types/code"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CodeEditor } from "./code-editor"
import { LANGUAGE_OPTIONS } from "@/lib/mock-data"

interface ProblemPanelProps {
  problem: Problem
  selectedLanguage?: LanguageId
}

function difficultyColor(difficulty: Problem["difficulty"]) {
  switch (difficulty) {
    case "Easy":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
    case "Medium":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"
    case "Hard":
      return "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200"
    default:
      return ""
  }
}

export function ProblemPanel({
  problem,
  selectedLanguage = "javascript",
}: ProblemPanelProps) {
  const [showSolution, setShowSolution] = React.useState(false)
  const hasSolutions = problem.solutions && Object.keys(problem.solutions).length > 0
  const languageOption = LANGUAGE_OPTIONS.find(
    (lang) => lang.id === selectedLanguage,
  )
  const solutionCode =
    problem.solutions?.[selectedLanguage] || problem.solutions?.javascript || ""

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      <Card className="border-none shadow-none">
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg font-semibold">
              {problem.title}
            </CardTitle>
            <Badge
              className={difficultyColor(problem.difficulty)}
              variant="secondary"
            >
              {problem.difficulty}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            ID: {problem.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              Description
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {problem.description}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              Examples
            </h3>
            <div className="space-y-3">
              {problem.examples.map((example) => (
                <div
                  key={example.id}
                  className="rounded-md bg-muted px-3 py-2 text-xs"
                >
                  <p className="font-mono text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Input:
                    </span>{" "}
                    {example.input}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Output:
                    </span>{" "}
                    {example.output}
                  </p>
                  {example.explanation && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Explanation:
                      </span>{" "}
                      {example.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              Constraints
            </h3>
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              {problem.constraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>

          {hasSolutions && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">
                  Solution
                </h3>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="text-xs text-primary hover:underline"
                >
                  {showSolution ? "Hide Solution" : "Show Solution"}
                </button>
              </div>
              {showSolution && (
                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted px-3 py-2 text-xs font-medium">
                    Solution ({languageOption?.label || selectedLanguage})
                  </div>
                  <div className="h-[300px]">
                    <CodeEditor
                      language={languageOption?.monacoLanguage || "javascript"}
                      value={solutionCode}
                      onChange={() => {}} // Read-only
                      height="100%"
                      className="border-0"
                      readOnly={true}
                    />
                  </div>
                </div>
              )}
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

