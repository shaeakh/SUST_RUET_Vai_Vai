import { spawn } from "child_process";
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
 * Get execution command that writes code to /tmp and runs it
 * This avoids volume mounting issues by using the container's tmpfs
 */
function getExecutionCommand(
  language: LanguageId,
  base64Code: string,
): string[] {
  switch (language) {
    case "javascript":
      return [
        "sh",
        "-c",
        `echo "${base64Code}" | base64 -d > /tmp/code.js && node /tmp/code.js`,
      ];
    case "python":
      return [
        "sh",
        "-c",
        `echo "${base64Code}" | base64 -d > /tmp/code.py && python3 /tmp/code.py`,
      ];
    case "java":
      return [
        "sh",
        "-c",
        `echo "${base64Code}" | base64 -d > /tmp/Solution.java && cd /tmp && javac Solution.java && java Solution`,
      ];
    case "cpp":
      return [
        "sh",
        "-c",
        `echo "${base64Code}" | base64 -d > /tmp/code.cpp && g++ -o /tmp/code /tmp/code.cpp && /tmp/code`,
      ];
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

/**
 * Execute code in Docker container for a single test case
 * Code is passed via base64 encoding in the command, avoiding volume mount issues
 */
async function executeTestCase(
  language: LanguageId,
  runnerCode: string,
  testInput: unknown,
  _timeout: number,
  executionId: string,
): Promise<DockerExecutionResult> {
  const startTime = Date.now();
  const imageName = DOCKER_CONFIG.images[language];

  // Generate unique container name for this execution
  const containerName = `code-runner-${executionId}-${randomUUID().slice(0, 8)}`;

  // Base64 encode the runner code to safely pass it through shell
  const base64Code = Buffer.from(runnerCode, "utf-8").toString("base64");

  // Prepare Docker command - code is passed via base64 in the command
  const dockerArgs = [
    "run",
    "--rm",
    "--stop-timeout",
    "2",
    "--name",
    containerName,
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
    "/tmp:rw,exec,nosuid,size=50m", // Changed noexec to exec for compiled languages
    "-i", // Interactive mode to allow stdin
    imageName,
    ...getExecutionCommand(language, base64Code),
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

    // Handle timeout
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
        cleanupContainer(containerName).catch((err) => {
          console.error(`Failed to cleanup container ${containerName}:`, err);
        });
        return;
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
      cleanupContainer(containerName).catch((err) => {
        console.error(`Failed to cleanup container ${containerName}:`, err);
      });
      reject(error);
    });
  });
}

/**
 * Cleanup Docker container if it still exists
 */
async function cleanupContainer(containerName: string): Promise<void> {
  return new Promise((resolve) => {
    const cleanupProcess = spawn("docker", ["rm", "-f", containerName], {
      stdio: "ignore",
    });
    cleanupProcess.on("close", () => resolve());
    cleanupProcess.on("error", () => resolve());
  });
}

/**
 * Parse output from container
 */
function parseOutput(output: string): { output?: unknown; error?: string } {
  try {
    const parsed = JSON.parse(output);
    return parsed;
  } catch {
    return { output: output.trim() || "" };
  }
}

/**
 * Format output for display
 */
function formatOutputForDisplay(output: unknown): string {
  if (output === null || output === undefined) {
    return "null";
  }

  if (typeof output === "string") {
    try {
      const parsed = JSON.parse(output);
      return JSON.stringify(parsed, null, 0);
    } catch {
      return output;
    }
  }

  if (typeof output === "object") {
    return JSON.stringify(output, null, 0);
  }

  return String(output);
}

/**
 * Compare actual output with expected output
 */
function compareOutputs(actual: unknown, expected: string): boolean {
  const actualStr = String(actual);

  try {
    const expectedParsed = JSON.parse(expected);
    const actualParsed =
      typeof actual === "string" ? JSON.parse(actual) : actual;
    return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
  } catch {
    return actualStr.trim() === expected.trim();
  }
}

/**
 * Extract function name from code
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
      // Handle return types with brackets (int[]), generics (List<Integer>), etc.
      // Match: public <return_type> <method_name>(
      const match = code.match(/public\s+[\w\[\]<>,?\s]+\s+(\w+)\s*\(/);
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

  // Check if required Docker image exists
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

  // Generate unique execution ID
  const executionId = randomUUID().slice(0, 8);

  // Extract function name
  const functionName = extractFunctionName(language, sourceCode);

  // Generate runner code
  const runnerCode = generateRunner(language, sourceCode, functionName);

  // Execute each test case
  const results: SingleTestResult[] = [];
  let totalRuntime = 0;

  for (const testCase of testCases) {
    try {
      let testInput: unknown[] = [];
      if (testCase.inputJson?.args) {
        testInput = testCase.inputJson.args;
      } else {
        testInput = [testCase.input];
      }

      const execResult = await executeTestCase(
        language,
        runnerCode,
        testInput,
        DOCKER_CONFIG.timeout,
        executionId,
      );

      totalRuntime += execResult.runtimeMs;

      const parsed = parseOutput(execResult.stdout);

      if (execResult.exitCode !== 0 || parsed.error) {
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
      const errorMessage =
        err instanceof Error ? err.message : "Execution failed";
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
