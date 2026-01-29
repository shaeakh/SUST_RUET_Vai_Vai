FROM eclipse-temurin:21-jdk-alpine

# Create non-root user for security
# Check if user exists, if not create it. If UID 1000 is taken, use existing user or create with different UID
RUN if ! id -u runner 2>/dev/null; then \
      if getent passwd 1000 >/dev/null 2>&1; then \
        EXISTING_USER=$(getent passwd 1000 | cut -d: -f1); \
        if [ "$EXISTING_USER" != "runner" ]; then \
          deluser "$EXISTING_USER" 2>/dev/null || true; \
        fi; \
      fi; \
      adduser -D -u 1000 runner 2>/dev/null || adduser -D runner; \
    fi

# Set working directory
WORKDIR /app

# Switch to non-root user
USER runner

# Default command (can be overridden)
CMD ["java"]
