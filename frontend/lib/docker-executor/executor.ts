import { spawn } from "child_process";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import type {
  LanguageId,
  TestCase,
  ExecutionResult,
  SingleTestResult,
} from "@/types/code";
import { DOCKER_CONFIG } from "./config";
import { generateRunner } from "./runners";

interface DockerExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtimeMs: number;
}

/**
 * Execute code in Docker container for a single test case
 * Each execution spawns a NEW isolated Docker container
 */
async function executeTestCase(
  language: LanguageId,
  runnerCode: string,
  testInput: unknown,
  timeout: number,
  executionId: string,
): Promise<DockerExecutionResult> {
  const startTime = Date.now();
  // Create unique temp directory for this execution
  const tempDir = await fs.mkdtemp(join(tmpdir(), `code-exec-${executionId}-`));
  const codePath = join(tempDir, getCodeFileName(language));
  const imageName = DOCKER_CONFIG.images[language];

  // Generate unique container name for this execution
  const containerName = `code-runner-${executionId}-${randomUUID().slice(0, 8)}`;

  try {
    // Write runner code to temp file
    await fs.writeFile(codePath, runnerCode, "utf-8");

    // Prepare Docker command - each execution gets its own isolated container
    const dockerArgs = [
      "run",
      "--rm", // Automatically remove container after execution
      "--stop-timeout",
      "2", // Give container 2 seconds to stop gracefully
      "--name",
      containerName, // Unique container name for this execution
      "--memory",
      DOCKER_CONFIG.memoryLimit,
      "--cpus",
      DOCKER_CONFIG.cpuLimit,
      "--network",
      DOCKER_CONFIG.networkMode,
      "--pids-limit",
      String(DOCKER_CONFIG.pidsLimit),
      "--cap-drop",
      "ALL",
      "--security-opt",
      "no-new-privileges",
      "--read-only",
      "--tmpfs",
      "/tmp:rw,noexec,nosuid,size=50m",
      "--workdir",
      "/app",
      "-v",
      `${codePath}:/app/${getCodeFileName(language)}:ro`,
      imageName,
      ...getExecutionCommand(language, getCodeFileName(language)),
    ];

    return new Promise((resolve, reject) => {
      const dockerProcess = spawn("docker", dockerArgs, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";
      let timedOut = false;

      // Write test input to stdin
      dockerProcess.stdin?.write(JSON.stringify({ args: testInput }));
      dockerProcess.stdin?.end();

      // Collect stdout
      dockerProcess.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      // Collect stderr
      dockerProcess.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      // Handle timeout - use total timeout which includes Docker overhead
      const totalTimeout = DOCKER_CONFIG.timeout;
      const timeoutId = setTimeout(() => {
        timedOut = true;
        dockerProcess.kill("SIGKILL");
        const elapsed = Date.now() - startTime;
        reject(
          new Error(
            `Time Limit Exceeded (${elapsed}ms). This includes Docker container startup time.`,
          ),
        );
      }, totalTimeout);

      // Handle completion
      dockerProcess.on("close", (code) => {
        clearTimeout(timeoutId);
        const runtimeMs = Date.now() - startTime;

        if (timedOut) {
          // Container was killed due to timeout - ensure it's removed
          cleanupContainer(containerName).catch((err) => {
            console.error(`Failed to cleanup container ${containerName}:`, err);
          });
          return; // Already rejected
        }

        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0,
          runtimeMs,
        });
      });

      dockerProcess.on("error", (error) => {
        clearTimeout(timeoutId);
        // Ensure container is cleaned up on error
        cleanupContainer(containerName).catch((err) => {
          console.error(`Failed to cleanup container ${containerName}:`, err);
        });
        reject(error);
      });
    });
  } catch (error) {
    // Ensure container is cleaned up on exception
    await cleanupContainer(containerName).catch(() => {
      // Ignore cleanup errors
    });
    throw error;
  } finally {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error("Failed to cleanup temp directory:", cleanupError);
    }
  }
}

/**
 * Cleanup Docker container if it still exists
 * This is a safety measure in case --rm flag didn't work
 */
async function cleanupContainer(containerName: string): Promise<void> {
  return new Promise((resolve) => {
    const cleanupProcess = spawn("docker", ["rm", "-f", containerName], {
      stdio: "ignore",
    });
    cleanupProcess.on("close", () => resolve());
    cleanupProcess.on("error", () => resolve()); // Ignore errors
  });
}

/**
 * Get code file name based on language
 */
function getCodeFileName(language: LanguageId): string {
  const extensions: Record<LanguageId, string> = {
    javascript: "code.js",
    python: "code.py",
    java: "Solution.java",
    cpp: "code.cpp",
  };
  return extensions[language];
}

/**
 * Get execution command based on language
 */
function getExecutionCommand(language: LanguageId, fileName: string): string[] {
  switch (language) {
    case "javascript":
      return ["node", fileName];
    case "python":
      return ["python3", fileName];
    case "java":
      return ["sh", "-c", `javac ${fileName} && java Solution`];
    case "cpp":
      return ["sh", "-c", `g++ -o code ${fileName} && ./code`];
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

/**
 * Parse output from container
 */
function parseOutput(output: string): { output?: unknown; error?: string } {
  try {
    const parsed = JSON.parse(output);
    return parsed;
  } catch {
    // If not JSON, treat as plain output
    return { output: output.trim() || "" };
  }
}

/**
 * Format output for display
 * Converts objects/arrays to readable string format
 */
function formatOutputForDisplay(output: unknown): string {
  if (output === null || output === undefined) {
    return "null";
  }
  
  if (typeof output === "string") {
    // Try to parse as JSON to format it nicely
    try {
      const parsed = JSON.parse(output);
      return JSON.stringify(parsed, null, 0);
    } catch {
      return output;
    }
  }
  
  // For arrays and objects, stringify with no indentation for compact display
  if (typeof output === "object") {
    return JSON.stringify(output, null, 0);
  }
  
  return String(output);
}

/**
 * Compare actual output with expected output
 */
function compareOutputs(actual: unknown, expected: string): boolean {
  // Convert actual to string for comparison
  const actualStr = String(actual);

  // Try to parse expected as JSON if it looks like JSON
  try {
    const expectedParsed = JSON.parse(expected);
    const actualParsed =
      typeof actual === "string" ? JSON.parse(actual) : actual;
    return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
  } catch {
    // Fallback to string comparison
    return actualStr.trim() === expected.trim();
  }
}

/**
 * Extract function name from code (simplified)
 */
function extractFunctionName(language: LanguageId, code: string): string {
  switch (language) {
    case "javascript": {
      const match = code.match(/function\s+(\w+)\s*\(/i);
      return match ? match[1] : "solution";
    }
    case "python": {
      const match = code.match(/def\s+(\w+)\s*\(/i);
      return match ? match[1] : "solution";
    }
    case "java": {
      const match = code.match(/public\s+\w+\s+(\w+)\s*\(/i);
      return match ? match[1] : "solution";
    }
    case "cpp": {
      const match = code.match(/(\w+)\s*\([^)]*\)\s*\{/i);
      return match ? match[1] : "solution";
    }
    default:
      return "solution";
  }
}

/**
 * Main executor function
 * Each code execution spawns its own isolated Docker containers
 */
export async function executeInDocker(
  language: LanguageId,
  sourceCode: string,
  testCases: TestCase[],
): Promise<ExecutionResult> {
  // Check if Docker is available
  try {
    await new Promise<void>((resolve, reject) => {
      const dockerCheck = spawn("docker", ["--version"]);
      dockerCheck.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error("Docker is not available"));
      });
      dockerCheck.on("error", () => {
        reject(new Error("Docker is not available"));
      });
    });
  } catch {
    throw new Error(
      "Docker is not available. Please ensure Docker is installed and running.",
    );
  }

  // Check if required Docker images exist locally
  const requiredImage = DOCKER_CONFIG.images[language];
  const imageExists = await new Promise<boolean>((resolve) => {
    const imageCheck = spawn("docker", ["images", "-q", requiredImage]);
    let output = "";
    imageCheck.stdout?.on("data", (data) => {
      output += data.toString();
    });
    imageCheck.on("close", () => {
      resolve(output.trim().length > 0);
    });
    imageCheck.on("error", () => {
      resolve(false);
    });
  });

  if (!imageExists) {
    const dockerfileMap: Record<LanguageId, string> = {
      javascript: "Dockerfile.node",
      python: "Dockerfile.python",
      java: "Dockerfile.java",
      cpp: "Dockerfile.cpp",
    };

    throw new Error(
      `Docker image '${requiredImage}' not found locally.\n\n` +
        `Please build the images first:\n\n` +
        `  cd frontend\n` +
        `  docker compose build\n\n` +
        `Or build this image individually:\n\n` +
        `  docker build -f docker/${dockerfileMap[language]} -t ${requiredImage} docker/`,
    );
  }

  // Generate unique execution ID for this code submission
  // This ensures each code execution has its own isolated containers
  const executionId = randomUUID().slice(0, 8);

  // Extract function name
  const functionName = extractFunctionName(language, sourceCode);

  // Generate runner code
  const runnerCode = generateRunner(language, sourceCode, functionName);

  // Execute each test case - each test case gets its own Docker container
  const results: SingleTestResult[] = [];
  let totalRuntime = 0;

  for (const testCase of testCases) {
    try {
      // Get test input (use inputJson if available, otherwise parse from input string)
      let testInput: unknown[] = [];
      if (testCase.inputJson && testCase.inputJson.args) {
        testInput = testCase.inputJson.args;
      } else {
        // Fallback: try to parse from input string
        // This is a simplified parser - in production, use proper parsing
        testInput = [testCase.input];
      }

      // Each test case execution spawns a NEW isolated Docker container
      // Use total timeout which accounts for Docker overhead
      const execResult = await executeTestCase(
        language,
        runnerCode,
        testInput,
        DOCKER_CONFIG.timeout, // Total timeout includes Docker startup
        executionId, // Pass execution ID for unique container naming
      );

      totalRuntime += execResult.runtimeMs;

      // Parse output
      const parsed = parseOutput(execResult.stdout);

      if (execResult.exitCode !== 0 || parsed.error) {
        // Execution failed - show error and any output that was produced
        const actualOutput = parsed.output
          ? formatOutputForDisplay(parsed.output)
          : execResult.stderr || "";
        
        results.push({
          testCaseId: testCase.id,
          passed: false,
          actualOutput: actualOutput || "No output generated",
          expectedOutput: testCase.expectedOutput,
          errorMessage: parsed.error || execResult.stderr || "Execution failed",
        });
      } else {
        // Execution succeeded - format and compare output
        const formattedOutput = formatOutputForDisplay(parsed.output);
        const passed = compareOutputs(parsed.output, testCase.expectedOutput);

        results.push({
          testCaseId: testCase.id,
          passed,
          actualOutput: formattedOutput,
          expectedOutput: testCase.expectedOutput,
          errorMessage: passed ? undefined : "Output does not match expected",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Execution failed";
      results.push({
        testCaseId: testCase.id,
        passed: false,
        actualOutput: "",
        expectedOutput: testCase.expectedOutput,
        errorMessage,
      });
    }
  }

  const allPassed = results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;

  return {
    status: allPassed ? "success" : "failed",
    summaryMessage: allPassed
      ? `Accepted! All ${results.length} test cases passed.`
      : `Wrong Answer. ${passedCount}/${results.length} test cases passed.`,
    results,
    runtimeMs: totalRuntime,
  };
}
