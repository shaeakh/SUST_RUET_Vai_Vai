.PHONY: help build run test clean docker-up docker-down migrate lint fmt

# Variables
BINARY_NAME=sust-cms
DOCKER_IMAGE=${BINARY_NAME}:latest
GO=go
GOFLAGS=-v

help:
	@echo "SUST CMS - Make Targets"
	@echo "======================="
	@echo "make build         - Build the application"
	@echo "make run           - Run the application"
	@echo "make test          - Run tests"
	@echo "make clean         - Clean build artifacts"
	@echo "make docker-build  - Build Docker image"
	@echo "make docker-up     - Start Docker containers"
	@echo "make docker-down   - Stop Docker containers"
	@echo "make docker-logs   - View Docker logs"
	@echo "make migrate       - Run database migrations"
	@echo "make lint          - Run linter"
	@echo "make fmt           - Format code"
	@echo "make install-deps  - Install dependencies"

build:
	@echo "Building application..."
	@CGO_ENABLED=0 $(GO) build $(GOFLAGS) -o bin/$(BINARY_NAME) cmd/server/main.go
	@echo "✓ Build complete"

run:
	@echo "Running application..."
	@$(GO) run cmd/server/main.go

test:
	@echo "Running tests..."
	@$(GO) test ./... -v -cover

clean:
	@echo "Cleaning build artifacts..."
	@$(GO) clean
	@rm -rf bin/

docker-build:
	@echo "Building Docker image..."
	@docker build -f docker/Dockerfile -t $(DOCKER_IMAGE) .
	@echo "✓ Docker image built"

docker-up:
	@echo "Starting Docker containers..."
	@docker-compose up -d
	@echo "✓ Containers started"

docker-down:
	@echo "Stopping Docker containers..."
	@docker-compose down
	@echo "✓ Containers stopped"

docker-logs:
	@docker-compose logs -f api

docker-ps:
	@docker-compose ps

migrate:
	@echo "Running migrations..."
	@docker exec sust-cms-postgres psql -U postgres -d sust_cms < migrations/001_initial_schema.sql
	@docker exec sust-cms-postgres psql -U postgres -d sust_cms < migrations/002_add_rate_limiting.sql
	@echo "✓ Migrations complete"

lint:
	@echo "Running linter..."
	@golangci-lint run ./...

fmt:
	@echo "Formatting code..."
	@$(GO) fmt ./...
	@echo "✓ Formatting complete"

install-deps:
	@echo "Installing dependencies..."
	@$(GO) mod download
	@echo "✓ Dependencies installed"

health:
	@echo "Checking health..."
	@curl -s http://localhost:8080/health | jq
	@echo ""
	@echo "PostgreSQL:"
	@docker exec sust-cms-postgres pg_isready -U postgres
	@echo ""
	@echo "Redis:"
	@docker exec sust-cms-redis redis-cli ping
	@echo ""

dev:
	@echo "Starting development environment..."
	@docker-compose up -d
	@$(GO) run cmd/server/main.go

prod-build:
	@echo "Building production binary..."
	@CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GO) build -ldflags="-s -w" -o bin/$(BINARY_NAME)-linux-amd64 cmd/server/main.go
	@echo "✓ Production build complete"

db-backup:
	@echo "Backing up database..."
	@docker exec sust-cms-postgres pg_dump -U postgres sust_cms > backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "✓ Backup complete"

db-restore:
	@echo "Usage: make db-restore FILE=backup-20240129-100000.sql"
	@docker exec -i sust-cms-postgres psql -U postgres sust_cms < $(FILE)
	@echo "✓ Restore complete"
