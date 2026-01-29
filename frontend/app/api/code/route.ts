import { NextRequest, NextResponse } from "next/server"
import type {
  RunCodeRequest,
  RunCodeResponse,
  ExecutionResult,
  SingleTestResult,
} from "@/types/code"
import { MOCK_PROBLEMS } from "@/lib/mock-data"
import { executeInDocker } from "@/lib/docker-executor/executor"

// Mock code execution - fallback when Docker is not available
function mockExecuteCode(
  problemId: string,
  language: string,
  sourceCode: string,
  mode: "run" | "submit",
): ExecutionResult {
  const problem = MOCK_PROBLEMS.find((p) => p.id === problemId)
  if (!problem) {
    return {
      status: "failed",
      summaryMessage: "Problem not found",
      results: [],
    }
  }

  // Determine which test cases to run
  const testCasesToRun =
    mode === "run"
      ? problem.testCases.filter((tc) => !tc.isHidden)
      : problem.testCases

  // Mock execution - fallback when Docker is not available
  const results: SingleTestResult[] = testCasesToRun.map((testCase) => {
    // Simple mock: check if code contains certain patterns
    const hasReturn = sourceCode.includes("return")
    const hasFunction =
      sourceCode.includes("function") || sourceCode.includes("def")

    // Mock: randomly pass/fail for demonstration
    const passed = Math.random() > 0.3 && hasReturn && hasFunction

    return {
      testCaseId: testCase.id,
      passed,
      actualOutput: passed
        ? testCase.expectedOutput
        : `[${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}]`,
      expectedOutput: testCase.expectedOutput,
      errorMessage: passed
        ? undefined
        : "Output does not match expected result",
    }
  })

  const allPassed = results.every((r) => r.passed)
  const passedCount = results.filter((r) => r.passed).length

  return {
    status: allPassed ? "success" : "failed",
    summaryMessage:
      mode === "submit"
        ? allPassed
          ? `Accepted! All ${results.length} test cases passed.`
          : `Wrong Answer. ${passedCount}/${results.length} test cases passed.`
        : `${passedCount}/${results.length} test cases passed.`,
    results,
    runtimeMs: Math.floor(Math.random() * 100) + 10,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RunCodeRequest = await request.json()

    // Validate request
    if (!body.problemId || !body.language || !body.sourceCode) {
      return NextResponse.json<RunCodeResponse>(
        {
          ok: false,
          error: "Missing required fields: problemId, language, sourceCode",
        },
        { status: 400 },
      )
    }

    // Validate language
    const validLanguages = ["javascript", "python", "java", "cpp"]
    if (!validLanguages.includes(body.language)) {
      return NextResponse.json<RunCodeResponse>(
        {
          ok: false,
          error: `Invalid language. Must be one of: ${validLanguages.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Find the problem
    const problem = MOCK_PROBLEMS.find((p) => p.id === body.problemId)
    if (!problem) {
      return NextResponse.json<RunCodeResponse>(
        {
          ok: false,
          error: "Problem not found",
        },
        { status: 404 },
      )
    }

    // Determine which test cases to run
    const testCasesToRun =
      body.mode === "submit"
        ? problem.testCases
        : problem.testCases.filter((tc) => !tc.isHidden)

    let result: ExecutionResult

    try {
      // Try Docker execution first
      result = await executeInDocker(
        body.language,
        body.sourceCode,
        testCasesToRun,
      )
    } catch (dockerError) {
      // Fallback to mock execution if Docker is not available
      console.warn(
        "Docker execution failed, falling back to mock:",
        dockerError,
      )
      result = mockExecuteCode(
        body.problemId,
        body.language,
        body.sourceCode,
        body.mode || "run",
      )
      // Add warning to summary message
      result.summaryMessage =
        "[Mock Mode] " + result.summaryMessage +
        " (Docker not available - using mock execution)"
    }

    return NextResponse.json<RunCodeResponse>({
      ok: true,
      data: result,
    })
  } catch (error) {
    console.error("Error executing code:", error)
    return NextResponse.json<RunCodeResponse>(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while executing code",
      },
      { status: 500 },
    )
  }
}
