export type LanguageId = "javascript" | "python" | "java" | "cpp"

export interface LanguageOption {
  id: LanguageId
  label: string
  monacoLanguage: string
  fileExtension: string
}

export type Difficulty = "Easy" | "Medium" | "Hard"

export interface TestCaseInput {
  args: unknown[] // Function arguments as array
}

export interface TestCase {
  id: string
  input: string // Human-readable input for display
  inputJson?: TestCaseInput // JSON-formatted input for execution
  expectedOutput: string
  isHidden?: boolean
}

export interface Example {
  id: string
  input: string
  output: string
  explanation?: string
}

export interface Problem {
  id: string
  slug: string
  title: string
  difficulty: Difficulty
  description: string
  constraints: string[]
  examples: Example[]
  starterCode: Record<LanguageId, string>
  solutions?: Record<LanguageId, string> // Optional solutions per language
  testCases: TestCase[]
}

export type ExecutionStatus =
  | "idle"
  | "running"
  | "success"
  | "failed"

export interface SingleTestResult {
  testCaseId: string
  passed: boolean
  actualOutput: string
  expectedOutput: string
  errorMessage?: string
}

export interface ExecutionResult {
  status: ExecutionStatus
  summaryMessage: string
  results: SingleTestResult[]
  runtimeMs?: number
}

export interface RunCodeRequest {
  problemId: string
  language: LanguageId
  sourceCode: string
  // For real backend this could be "run" vs "submit"
  mode: "run" | "submit"
}

export interface RunCodeResponse {
  ok: boolean
  error?: string
  data?: ExecutionResult
}

