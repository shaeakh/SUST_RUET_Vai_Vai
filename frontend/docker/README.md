# Docker Code Execution Images

This directory contains Dockerfiles for building isolated code execution environments for each supported language.

## Building Images

### Using Docker Compose (Recommended)

From the `frontend` directory:

```bash
docker compose build
```

This will build all four images:
- `code-runner-node:latest` - Node.js 20
- `code-runner-python:latest` - Python 3.12
- `code-runner-java:latest` - OpenJDK 21
- `code-runner-cpp:latest` - GCC 13

### Building Individual Images

```bash
# Node.js
docker build -f docker/Dockerfile.node -t code-runner-node:latest docker/

# Python
docker build -f docker/Dockerfile.python -t code-runner-python:latest docker/

# Java
docker build -f docker/Dockerfile.java -t code-runner-java:latest docker/

# C++
docker build -f docker/Dockerfile.cpp -t code-runner-cpp:latest docker/
```

## Verifying Images

```bash
docker images | grep code-runner
```

You should see all four images listed.

## Security Features

All images run as non-root user (`runner`, uid 1000) and include:
- Minimal base images (Alpine/Debian)
- No network access
- Read-only filesystem
- Resource limits (memory, CPU, time)
- Process limits

## Testing

To test an image manually:

```bash
# Test Node.js
docker run --rm --network none --read-only --tmpfs /tmp:rw,noexec,nosuid,size=50m code-runner-node:latest node --version

# Test Python
docker run --rm --network none --read-only --tmpfs /tmp:rw,noexec,nosuid,size=50m code-runner-python:latest python3 --version
```

## Troubleshooting

If Docker is not available, the system will automatically fall back to mock execution mode.

To check if Docker is running:
```bash
docker --version
docker ps
```
