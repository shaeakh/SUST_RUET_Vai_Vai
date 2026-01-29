# Docker Code Execution Setup Guide

This guide explains how to set up and use the Docker-based code execution system.

## Prerequisites

1. **Docker Desktop** (or Docker Engine) installed and running
2. **Node.js** 20+ and npm installed
3. **Next.js** application running

## Quick Start

### 1. Build Docker Images

From the `frontend` directory:

```bash
docker compose build
```

This builds all four language runner images:
- `code-runner-node:latest` - JavaScript/Node.js
- `code-runner-python:latest` - Python 3.12
- `code-runner-java:latest` - Java 21
- `code-runner-cpp:latest` - C/C++ (GCC 13)

### 2. Verify Images

```bash
docker images | grep code-runner
```

You should see all four images.

### 3. Start Development Server

```bash
npm run dev
```

The system will automatically use Docker execution when available. If Docker is not available, it falls back to mock execution mode.

## How It Works

**Each code execution spawns its own isolated Docker container(s):**

1. **User submits code** via the `/code` page
2. **API route** (`/api/code`) receives the request
3. **For each test case**, a NEW Docker container is spawned with:
   - Unique container name (prevents conflicts)
   - 128MB memory limit
   - 0.5 CPU cores
   - 15 second total timeout (includes Docker startup overhead)
   - 5 second limit for actual code execution
   - No network access
   - Read-only filesystem
   - Non-root user
   - Automatic cleanup (`--rm` flag)
4. **Code executes** in the isolated container
5. **Container is automatically removed** after execution completes
6. **Results** are compared with expected outputs
7. **Response** is sent back to the frontend

**Key Points:**
- Each code submission gets a unique execution ID
- Each test case runs in its own separate container
- Containers are automatically cleaned up after execution
- No containers persist between executions
- Multiple concurrent executions don't interfere with each other

## Security Features

- **Isolated containers**: Each execution runs in a fresh container
- **Resource limits**: Memory, CPU, and time limits prevent abuse
- **No network**: Containers cannot make external requests
- **Read-only filesystem**: Code cannot write files
- **Non-root user**: Containers run as unprivileged user
- **Process limits**: Maximum 50 processes per container

## Troubleshooting

### Docker Not Available

If you see "[Mock Mode]" in execution results, Docker is not available. Check:

```bash
# Check Docker is installed
docker --version

# Check Docker is running
docker ps

# Start Docker Desktop if needed
```

### Images Not Found

If you get "image not found" errors:

```bash
# Rebuild images
cd frontend
docker compose build
```

### Permission Errors

On Linux, you may need to add your user to the docker group:

```bash
sudo usermod -aG docker $USER
# Log out and back in
```

### Timeout Issues

The system uses a 15-second total timeout to account for Docker container startup overhead (which can take 2-5 seconds). The actual code execution is limited to 5 seconds.

If you need to adjust timeouts, modify:
`frontend/lib/docker-executor/config.ts`

- `timeout`: Total timeout including Docker overhead (default: 15000ms)
- `codeExecutionTimeout`: Limit for actual code execution (default: 5000ms)
- `dockerStartupTimeout`: Limit for Docker container startup (default: 5000ms)

**Note:** Docker container startup can take 2-5 seconds on slower systems, so the total timeout accounts for this overhead.

## Testing

Test a simple execution:

1. Navigate to `/code?problem=two-sum`
2. Select JavaScript
3. Enter code:
```javascript
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}

module.exports = twoSum;
```
4. Click "Run"
5. Check results in the Test Cases panel

## Production Deployment

For production:

1. Ensure Docker is installed on the server
2. Build images on the server or push to a registry
3. Set appropriate resource limits based on server capacity
4. Monitor container resource usage
5. Consider using Docker Swarm or Kubernetes for scaling

## Limitations

- **Java and C++ runners** are simplified and may need enhancement for complex cases
- **JSON parsing** in test inputs is basic - may need improvement for edge cases
- **Function name extraction** is regex-based and may fail on complex code structures

## Next Steps

- Enhance Java and C++ runners with proper JSON parsing
- Add support for more languages (Go, Rust, etc.)
- Implement code compilation caching
- Add execution metrics and monitoring
- Set up container orchestration for high load
