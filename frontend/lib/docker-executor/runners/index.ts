import type { LanguageId } from "@/types/code"
import { generateJavaScriptRunner } from "./javascript"
import { generatePythonRunner } from "./python"
import { generateJavaRunner } from "./java"
import { generateCppRunner } from "./cpp"

export function generateRunner(
  language: LanguageId,
  userCode: string,
  functionName?: string,
): string {
  switch (language) {
    case "javascript":
      return generateJavaScriptRunner(
        userCode,
        functionName || "solution",
      )
    case "python":
      return generatePythonRunner(userCode, functionName || "solution")
    case "java":
      return generateJavaRunner(userCode, functionName || "Solution")
    case "cpp":
      return generateCppRunner(userCode, functionName || "solution")
    default:
      throw new Error(`Unsupported language: ${language}`)
  }
}
