# SUST CMS - Production-Grade Content Management System

A modular, scalable Content Management System with Intelligent RAG-based Search for academic courses.

## Tech Stack

- **Backend:** Go 1.21
- **Database:** PostgreSQL 15 + pgvector
- **Vector DB:** pgvector (embeddings)
- **LLM Runtime:** Ollama
- **Cache & Queue:** Redis
- **Auth:** JWT (RS256)
- **Container:** Docker + Docker Compose
- **Architecture:** Domain-Driven Design (DDD)

## Project Structure

```
backend/go-cms/
├── cmd/
│   └── server/
│       └── main.go
├── domain/
│   ├── entities/
│   ├── value_objects/
│   ├── repositories/
│   └── events/
├── application/
│   ├── services/
│   └── use_cases/
├── infrastructure/
│   ├── postgres/
│   ├── redis/
│   ├── ollama/
│   ├── file_storage/
│   └── config/
├── interfaces/
│   ├── http/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   └── routes.go
│   └── grpc/
├── migrations/
├── docker/
├── .env.example
├── go.mod
├── go.sum
└── README.md
```

## Quick Start

### Prerequisites
- Go 1.21+
- Docker & Docker Compose
- PostgreSQL 15
- Redis
- Ollama

### Environment Setup

```bash
cp .env.example .env
docker-compose up -d
go run cmd/server/main.go
```

## Key Features

1. **Content Management**
   - Upload & organize course materials (PDFs, slides, code, notes)
   - Support for multiple content types
   - Metadata tagging and categorization
   - Soft delete support

2. **Classroom Management**
   - Instructor-created classrooms with 6-digit join codes
   - Student enrollment via join codes
   - Course-student associations

3. **Intelligent Search (RAG)**
   - Semantic search over course materials
   - pgvector embeddings with Ollama inference
   - Code-aware search with syntax understanding
   - Retrieval-Augmented Generation for enhanced results

4. **Authentication**
   - JWT-based auth (RS256)
   - Role-based access control (Instructor, Student)
   - Email + password login

5. **Queue Architecture**
   - Redis-backed search queue
   - Async embedding generation
   - Worker pool for background jobs

## API Endpoints

All APIs use consistent response format and are versioned under `/api/v1`.

See `interfaces/http/routes.go` for complete endpoint list.

## Database Schema

See `migrations/` folder for all schema definitions including:
- Users table
- Classrooms table
- Content items table
- Vector embeddings table
- Search queue table
- Audit logs table

## Configuration

See `.env.example` for all configurable options.