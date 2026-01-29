FROM gcc:13-bookworm

# Create non-root user for security
# Check if user exists, if not create it. If UID 1000 is taken, use existing user or create with different UID
RUN if ! id -u runner 2>/dev/null; then \
      if getent passwd 1000 >/dev/null 2>&1; then \
        EXISTING_USER=$(getent passwd 1000 | cut -d: -f1); \
        if [ "$EXISTING_USER" != "runner" ]; then \
          userdel "$EXISTING_USER" 2>/dev/null || true; \
        fi; \
      fi; \
      useradd -m -u 1000 runner 2>/dev/null || useradd -m runner; \
    fi

# Set working directory
WORKDIR /app

# Switch to non-root user
USER runner

# Default command (can be overridden)
CMD ["g++"]
