# SUST CMS - API Documentation

## Overview

SUST CMS is a production-grade Content Management System with Intelligent RAG-based Search for academic courses. This document provides comprehensive API documentation.

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All responses follow a consistent format:

### Success Response (2xx)
```json
{
  "success": true,
  "status_code": 200,
  "data": {}
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "status_code": 400,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Endpoints

### Authentication Endpoints

#### Register User
**POST** `/auth/register`

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "role": "student"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "student"
  }
}
```

**Roles:** `student`, `instructor`

---

#### Login
**POST** `/auth/login`

Authenticate and obtain JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "student",
    "expires_at": 1706505600
  }
}
```

---

#### Refresh Token
**POST** `/auth/refresh` (Protected)

Get a new JWT token.

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": 1706505600
  }
}
```

---

### Classroom Endpoints

#### Create Classroom
**POST** `/classrooms` (Protected - Instructor only)

Create a new classroom.

**Request Body:**
```json
{
  "name": "Introduction to Computer Science",
  "description": "Learn the basics of CS",
  "type": "theory"
}
```

**Parameters:**
- `name` (string, required): Classroom name
- `description` (string, optional): Classroom description
- `type` (string, optional): Classroom type - `theory` (default) or `lab`

**Response (201 Created):**
```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "instructor_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Introduction to Computer Science",
    "description": "Learn the basics of CS",
    "type": "theory",
    "join_code": "ABC123",
    "created_at": "2024-01-29T10:00:00Z"
  }
}
```

**Classroom Types:**
- `theory`: Theoretical courses and lectures
- `lab`: Practical, hands-on laboratory/coding courses

**Note:** Join code is auto-generated and displayed to the instructor.

---

#### Join Classroom
**POST** `/classrooms/join` (Protected - Student only)

Join an existing classroom using a join code.

**Request Body:**
```json
{
  "join_code": "ABC123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "instructor_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Introduction to Computer Science",
    "description": "Learn the basics of CS",
    "type": "theory",
    "join_code": "ABC123",
    "created_at": "2024-01-29T10:00:00Z"
  }
}
```

---

#### List My Classrooms (Student)
**GET** `/classrooms/my-classrooms` (Protected)

Get all classrooms the student is enrolled in.

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "instructor_id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Introduction to Computer Science",
      "description": "Learn the basics of CS",
      "type": "theory",
      "join_code": "ABC123",
      "created_at": "2024-01-29T10:00:00Z"
    }
  ]
}
```

---

#### List Instructor's Classrooms
**GET** `/classrooms/instructor` (Protected - Instructor only)

Get all classrooms created by the instructor.

**Response (200 OK):** Same as above

---

#### Get Classroom
**GET** `/classrooms/{id}` (Protected)

Get details of a specific classroom.

**Response (200 OK):** Same as classroom response

---

#### List Classroom Members
**GET** `/classrooms/{id}/members` (Protected)

Get all members (students) in a classroom.

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "student_id": "550e8400-e29b-41d4-a716-446655440101",
      "joined_at": "2024-01-29T10:00:00Z"
    }
  ]
}
```

---

#### Update Classroom
**PUT** `/classrooms/{id}` (Protected - Instructor only)

Update classroom details.

**Request Body:**
```json
{
  "name": "Advanced Computer Science",
  "description": "Learn advanced CS concepts"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "message": "Classroom updated successfully"
  }
}
```

---

#### Delete Classroom
**DELETE** `/classrooms/{id}` (Protected - Instructor only)

Delete a classroom (soft delete).

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "message": "Classroom deleted successfully"
  }
}
```

---

### Content Endpoints

#### Upload Content
**POST** `/classrooms/{classroom_id}/content` (Protected - Instructor only)

Upload new course material from a local file.

**Request Type:** `multipart/form-data`

**Form Fields:**
- `title` (string, required): Content title
- `description` (string, optional): Content description
- `content_type` (string, required): `pdf`, `slide`, `code`, `note`
- `category` (string, required): `theory` or `lab`
- `topic` (string, optional): Topic name
- `week` (integer, optional): Week number
- `tags` (array of strings, optional): Tags (send multiple `tags` form fields)
- `file` (file, required): The PDF or document file to upload

**Example cURL:**
```bash
curl -X POST http://localhost:8080/api/v1/classrooms/{classroom_id}/content \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Week 1 Lecture Slides" \
  -F "description=Introduction to programming" \
  -F "content_type=slide" \
  -F "category=theory" \
  -F "topic=Fundamentals" \
  -F "week=1" \
  -F "tags=programming" \
  -F "tags=basics" \
  -F "file=@/path/to/document.pdf"
```

**Response (201 Created):**
```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "classroom_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Week 1 Lecture Slides",
    "description": "Introduction to programming concepts",
    "content_type": "slide",
    "category": "theory",
    "topic": "Fundamentals",
    "week": 1,
    "tags": ["programming", "basics"],
    "uploaded_by": "550e8400-e29b-41d4-a716-446655440001",
    "file_url": "uploads/unique-id_filename.pdf",
    "created_at": "2024-01-29T10:00:00Z"
  }
}
```

**Supported File Types:**
- PDF documents
- Text files (.txt)
- Microsoft Office (.docx, .doc, .pptx, .ppt)
- Images (.png, .jpg, .jpeg)

**Processing:**
- File is saved locally in the `uploads/` directory
- Embeddings are generated automatically in the background
- Processing typically takes 10-60 seconds depending on file size
- Embeddings are used for semantic search and RAG operations

---

#### Get Content
**GET** `/classrooms/{classroom_id}/content/{content_id}` (Protected)

Get details of a specific content item.

**Response (200 OK):** Same as content response

---

#### List Classroom Content
**GET** `/classrooms/{classroom_id}/content` (Protected)

List all content in a classroom with pagination.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440200",
        "classroom_id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Week 1 Lecture Slides",
        "description": "Introduction to programming concepts",
        "content_type": "slide",
        "category": "theory",
        "topic": "Fundamentals",
        "week": 1,
        "tags": ["programming", "basics"],
        "uploaded_by": "550e8400-e29b-41d4-a716-446655440001",
        "file_url": "https://example.com/file.pdf",
        "created_at": "2024-01-29T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

---

#### List Content by Topic
**GET** `/classrooms/{classroom_id}/content/topic/{topic}` (Protected)

List content filtered by topic.

**Response (200 OK):** Same as list response

---

#### List Content by Week
**GET** `/classrooms/{classroom_id}/content/week/{week}` (Protected)

List content filtered by week number.

**Response (200 OK):** Same as list response

---

### Search Endpoints

#### Semantic Search (Synchronous)
**POST** `/classrooms/{classroom_id}/search` (Protected)

Perform semantic search over course materials. Returns chunks of content most relevant to the query based on vector similarity.

**Request Body:**
```json
{
  "query": "what is a function in programming"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": [
    {
      "content_id": "550e8400-e29b-41d4-a716-446655440200",
      "title": "Week 1 Lecture Slides",
      "content_type": "slide",
      "chunk_index": 3,
      "chunk_text": "A function is a reusable block of code that performs a specific task...",
      "topic": "Fundamentals",
      "week": 1,
      "tags": ["programming", "basics"],
      "uploaded_at": "2024-01-29T10:00:00Z"
    }
  ]
}
```

**Use Case:** Direct search when you want to find specific course materials.

---

#### RAG Search (Retrieval Augmented Generation)
**POST** `/classrooms/{classroom_id}/search/rag` (Protected)

Perform semantic search and generate an AI-powered answer using Gemini based on the retrieved course materials. Returns both the generated answer and source chunks for verification.

**Request Body:**
```json
{
  "query": "explain how functions work in programming"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "query": "explain how functions work in programming",
    "generated_answer": "Functions are reusable blocks of code that perform specific tasks. They help organize code, reduce repetition, and make programs easier to maintain. Functions can take inputs (parameters) and return outputs (return values)...",
    "source_chunks": [
      {
        "content_id": "550e8400-e29b-41d4-a716-446655440200",
        "title": "Week 1 Lecture Slides",
        "content_type": "slide",
        "chunk_index": 2,
        "chunk_text": "A function is a reusable block of code...",
        "topic": "Fundamentals",
        "week": 1,
        "tags": ["programming", "basics"],
        "uploaded_at": "2024-01-29T10:00:00Z"
      }
    ],
    "chunk_count": 5
  }
}
```

**Use Case:** Educational AI assistant - get explanations tailored to course materials with source verification.

---

#### Enqueue Search (Asynchronous)
**POST** `/classrooms/{classroom_id}/search/queue` (Protected)

Enqueue a search request for async processing.

**Request Body:**
```json
{
  "query": "what is recursion"
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "status_code": 202,
  "data": {
    "request_id": "550e8400-e29b-41d4-a716-446655440300",
    "status": "pending",
    "created_at": "2024-01-29T10:00:00Z"
  }
}
```

---

#### Get Search History
**GET** `/classrooms/{classroom_id}/search/history` (Protected)

Get search history for the current user.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440300",
        "query": "what is recursion",
        "status": "completed",
        "result_count": 3,
        "created_at": "2024-01-29T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

---

### Content Generation Endpoints (AI-Powered Study Materials)

#### Generate Study Material
**POST** `/classrooms/{classroom_id}/generate/study-material` (Protected)

Generate comprehensive AI-powered study materials based on class content and a topic query. Combines class materials with online knowledge, includes code examples and diagrams.

**Request Body:**
```json
{
  "query": "explain REST APIs and HTTP methods",
  "include_code_examples": true,
  "include_diagrams": true,
  "export_format": "markdown"
}
```

**Parameters:**
- `query` (string, required): Topic to generate materials for
- `include_code_examples` (boolean, optional): Include code examples in the material
- `include_diagrams` (boolean, optional): Include ASCII diagrams and visual elements
- `export_format` (string, optional): `markdown` (default), `html`, or `pdf`

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440400",
    "query": "explain REST APIs and HTTP methods",
    "title": "Understanding REST APIs and HTTP Methods",
    "format": "markdown",
    "source_count": 8,
    "generated_at": "2024-01-29T10:00:00Z",
    "content": "# Understanding REST APIs and HTTP Methods\n\n## Overview\nREST (Representational State Transfer) is an architectural style for designing networked applications...\n\n## HTTP Methods\n\n### GET\n- Retrieves data from a server\n- Safe and idempotent\n\n### POST\n- Sends data to create a new resource\n\n```javascript\nfetch('https://api.example.com/users', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ name: 'John' })\n})\n```\n\n### PUT\n- Updates an existing resource\n\n### DELETE\n- Removes a resource\n\n## ASCII Diagram\n\n```\nClient          Server\n  |----GET----->|\n  |<---200 OK---|\n  |             |\n  |--POST----->|\n  |<--201 Created|\n```\n\n## Summary\nREST APIs use standard HTTP methods to perform CRUD operations..."
  }
}
```

---

#### Preview Study Material
**POST** `/classrooms/{classroom_id}/generate/study-material/preview` (Protected)

Generate and preview study material without downloading. Same as above but returns preview format.

**Request Body:**
```json
{
  "query": "machine learning algorithms",
  "include_code_examples": true,
  "include_diagrams": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440401",
    "query": "machine learning algorithms",
    "title": "Machine Learning Algorithms",
    "format": "markdown",
    "source_count": 12,
    "generated_at": "2024-01-29T10:00:00Z",
    "preview": "# Machine Learning Algorithms\n\n...",
    "content": "Full markdown content here..."
  }
}
```

---

#### Download Study Material
**POST** `/classrooms/{classroom_id}/generate/study-material/download` (Protected)

Generate and download study material as a file.

**Query Parameters:**
- `format` (optional): `markdown` (default), `html`, `pdf`

**Request Body:**
```json
{
  "query": "database design and normalization",
  "include_code_examples": true,
  "include_diagrams": true
}
```

**Response (200 OK):**
- Content-Type: `text/markdown`, `text/html`, or `application/pdf`
- Content-Disposition: `attachment; filename="study-material.md"` (or appropriate extension)
- Raw file content

**Features:**
- ✨ AI-Generated content based on class materials
- 📚 Combines class resources with general knowledge
- 💻 Optional code examples with syntax highlighting
- 📊 Optional ASCII diagrams and visual representations
- 📥 Download in multiple formats
- 🎯 Class-specific and context-aware content

---

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440300",
        "query": "what is recursion",
        "status": "completed",
        "result_count": 3,
        "created_at": "2024-01-29T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

---

## Background Processing

### Embedding Generation
When you upload content (PDF, slides, code, notes), the system automatically:
1. **Saves** the content metadata immediately (fast response)
2. **Enqueues** an embedding generation job to Redis
3. **Worker Process** (running in background):
   - Downloads the file
   - Extracts text from PDF/images
   - Chunks the text intelligently
   - Generates vector embeddings using Google Gemini
   - Stores embeddings in vector database for semantic search

**Timeline:**
- Upload response: Immediate (< 500ms)
- Embeddings available for search: 10-60 seconds depending on file size

**Benefits:**
- Instant content availability
- Fast API response times
- Non-blocking embedding generation
- Automatic retry on failure (max 3 retries)

---

## Error Codes

| Code | HTTP Status | Description |
|------|-----------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authorization |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_REQUEST` | 400 | Invalid request body or parameters |
| `AUTHENTICATION_FAILED` | 401 | Invalid credentials |
| `REGISTRATION_FAILED` | 409 | Registration error (e.g., email exists) |
| `CREATION_FAILED` | 500 | Failed to create resource |
| `UPDATE_FAILED` | 500 | Failed to update resource |
| `DELETE_FAILED` | 500 | Failed to delete resource |
| `LIST_FAILED` | 500 | Failed to list resources |
| `UPLOAD_FAILED` | 500 | Failed to upload content |
| `SEARCH_FAILED` | 500 | Search operation failed |
| `RAG_FAILED` | 500 | RAG search operation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Search Capabilities Comparison

| Feature | Semantic Search | RAG Search |
|---------|-----------------|-----------|
| **Returns** | Matching chunks | AI-generated answer + chunks |
| **Speed** | Fast (< 1s) | Slower (2-5s) |
| **Use Case** | Find specific content | Get explanations & insights |
| **Endpoint** | `/search` | `/search/rag` |
| **AI Involved** | No (vector similarity) | Yes (Gemini generation) |
| **Verification** | Source material included | Source chunks provided |

---

## Example Workflows

### Workflow 1: Instructor Setup

1. Register as instructor
   ```bash
   POST /auth/register
   ```

2. Create classroom
   ```bash
   POST /classrooms
   ```

3. Upload content
   ```bash
   POST /classrooms/{classroom_id}/content
   ```

### Workflow 2: Student Access

1. Register as student
   ```bash
   POST /auth/register
   ```

2. Login to get token
   ```bash
   POST /auth/login
   ```

3. Join classroom with code
   ```bash
   POST /classrooms/join
   ```

4. Search content
   ```bash
   POST /classrooms/{classroom_id}/search
   ```

---

## Rate Limiting

- **Limit:** 100 requests per 60 seconds (configurable)
- **Headers:** Rate limit info included in response headers
- **Response:** 429 Too Many Requests when exceeded

---

## Pagination

For paginated endpoints:
- Default page size: 20
- Maximum page size: 100
- Pages are 1-indexed

---

## Data Types

### Timestamps
All timestamps are in ISO 8601 format: `2024-01-29T10:00:00Z`

### UUIDs
All IDs are UUIDs: `550e8400-e29b-41d4-a716-446655440000`

### Status Values

**Search Status:**
- `pending` - Waiting to be processed
- `processing` - Currently being processed
- `completed` - Successfully completed
- `failed` - Processing failed
