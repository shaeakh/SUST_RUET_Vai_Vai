export const DOCKER_CONFIG = {
  memoryLimit: "128m", // 128MB RAM
  cpuLimit: "0.5", // Half a CPU core
  timeout: 15000, // 15 second total timeout (includes Docker overhead)
  codeExecutionTimeout: 5000, // 5 second limit for actual code execution
  dockerStartupTimeout: 5000, // 5 second limit for Docker container startup
  networkMode: "none", // No network access
  readonlyRootfs: true, // Read-only filesystem
  pidsLimit: 50, // Maximum number of processes
  images: {
    javascript: "code-runner-node:latest",
    python: "code-runner-python:latest",
    java: "code-runner-java:latest",
    cpp: "code-runner-cpp:latest",
  },
} as const
