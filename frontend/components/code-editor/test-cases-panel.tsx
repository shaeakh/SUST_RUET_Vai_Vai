"use client"

import * as React from "react"
import type { TestCase, SingleTestResult } from "@/types/code"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TestCasesPanelProps {
  testCases: TestCase[]
  results?: SingleTestResult[]
  isRunning?: boolean
}

export function TestCasesPanel({
  testCases,
  results = [],
  isRunning = false,
}: TestCasesPanelProps) {
  const visibleTestCases = testCases.filter((tc) => !tc.isHidden)
  const hiddenTestCases = testCases.filter((tc) => tc.isHidden)

  const getResultForTestCase = (testCaseId: string) => {
    return results.find((r) => r.testCaseId === testCaseId)
  }

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="test-cases" className="flex h-full flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          <TabsTrigger value="results">
            Results
            {results.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
              >
                {results.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test-cases" className="flex-1 overflow-auto">
          <div className="space-y-3">
            {visibleTestCases.map((testCase, index) => (
              <Card key={testCase.id} size="sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Test Case {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Input:
                    </span>
                    <pre className="mt-1 rounded bg-muted p-2 font-mono text-[11px]">
                      {testCase.input}
                    </pre>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Expected Output:
                    </span>
                    <pre className="mt-1 rounded bg-muted p-2 font-mono text-[11px]">
                      {testCase.expectedOutput}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
            {hiddenTestCases.length > 0 && (
              <Card size="sm" className="border-dashed">
                <CardContent className="py-4 text-center text-xs text-muted-foreground">
                  {hiddenTestCases.length} hidden test case
                  {hiddenTestCases.length > 1 ? "s" : ""} will be checked on
                  submit
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="results" className="flex-1 overflow-auto">
          {isRunning ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Running test cases...
                </p>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No results yet. Click "Run" to test your code.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {testCases.map((testCase, index) => {
                const result = getResultForTestCase(testCase.id)
                const isHidden = testCase.isHidden

                if (!result && isHidden) {
                  return null // Don't show hidden test cases that haven't been run
                }

                return (
                  <Card
                    key={testCase.id}
                    size="sm"
                    className={cn(
                      result &&
                        (result.passed
                          ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/5"
                          : "border-rose-500/50 bg-rose-50/50 dark:bg-rose-500/5"),
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          Test Case {index + 1}
                          {isHidden && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-[10px]"
                            >
                              Hidden
                            </Badge>
                          )}
                        </CardTitle>
                        {result && (
                          <Badge
                            variant={result.passed ? "default" : "destructive"}
                            className={cn(
                              result.passed
                                ? "bg-emerald-500 text-white"
                                : "bg-rose-500 text-white",
                            )}
                          >
                            {result.passed ? "Passed" : "Failed"}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-muted-foreground">
                          Input:
                        </span>
                        <pre className="mt-1 rounded bg-muted p-2 font-mono text-[11px]">
                          {testCase.input}
                        </pre>
                      </div>
                      <div>
                        <span className="font-semibold text-muted-foreground">
                          Expected Output:
                        </span>
                        <pre className="mt-1 rounded bg-muted p-2 font-mono text-[11px]">
                          {testCase.expectedOutput}
                        </pre>
                      </div>
                      {result && (
                        <>
                          <div>
                            <span className={cn(
                              "font-semibold",
                              result.passed 
                                ? "text-emerald-700 dark:text-emerald-200" 
                                : "text-foreground"
                            )}>
                              Your Output:
                            </span>
                            <pre className={cn(
                              "mt-1 rounded p-2 font-mono text-[11px] whitespace-pre-wrap break-words",
                              result.passed
                                ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                                : "bg-muted"
                            )}>
                              {result.actualOutput || "(empty)"}
                            </pre>
                          </div>
                          {result.errorMessage && (
                            <div>
                              <span className="font-semibold text-destructive">
                                Error:
                              </span>
                              <pre className="mt-1 rounded bg-destructive/10 p-2 font-mono text-[11px] text-destructive whitespace-pre-wrap break-words">
                                {result.errorMessage}
                              </pre>
                            </div>
                          )}
                          {!result.passed && !result.errorMessage && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-semibold">Note:</span> Output does not match expected result.
                            </div>
                          )}
                        </>
                      )}
                      {!result && (
                        <div className="text-xs text-muted-foreground italic">
                          Not executed yet
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
