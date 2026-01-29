package types

import (
	"encoding/json"
	"net/http"
)

// Response represents a standard API response
type Response struct {
	Success    bool        `json:"success"`
	StatusCode int         `json:"status_code"`
	Data       interface{} `json:"data,omitempty"`
	Error      *ErrorInfo  `json:"error,omitempty"`
}

// ErrorInfo represents error information
type ErrorInfo struct {
	Message string `json:"message"`
	Code    string `json:"code"`
}

// WriteJSON writes a JSON response
func WriteJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	response := Response{
		Success:    statusCode >= 200 && statusCode < 300,
		StatusCode: statusCode,
		Data:       data,
	}

	json.NewEncoder(w).Encode(response)
}

// WriteError writes an error response
func WriteError(w http.ResponseWriter, statusCode int, message, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	response := Response{
		Success:    false,
		StatusCode: statusCode,
		Error: &ErrorInfo{
			Message: message,
			Code:    code,
		},
	}

	json.NewEncoder(w).Encode(response)
}

// RegisterRequest represents a user registration request
type RegisterRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FullName  string `json:"full_name"`
	Role      string `json:"role"`
}

// LoginRequest represents a login request
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse represents a login response
type LoginResponse struct {
	Token     string `json:"token"`
	UserID    string `json:"user_id"`
	Email     string `json:"email"`
	FullName  string `json:"full_name"`
	Role      string `json:"role"`
	ExpiresAt int64  `json:"expires_at"`
}

// CreateClassroomRequest represents a classroom creation request
type CreateClassroomRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Type        string `json:"type"` // "theory" or "lab"
}

// JoinClassroomRequest represents a join classroom request
type JoinClassroomRequest struct {
	JoinCode string `json:"join_code"`
}

// ClassroomResponse represents a classroom response
type ClassroomResponse struct {
	ID           string `json:"id"`
	InstructorID string `json:"instructor_id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	Type         string `json:"type"`
	JoinCode     string `json:"join_code"`
	CreatedAt    string `json:"created_at"`
}

// UploadContentRequest represents a content upload request
type UploadContentRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	ContentType string   `json:"content_type"`
	Category    string   `json:"category"`
	Topic       string   `json:"topic"`
	Week        int      `json:"week"`
	Tags        []string `json:"tags"`
	FileURL     string   `json:"file_url"`
	FileSize    int64    `json:"file_size"`
	MimeType    string   `json:"mime_type"`
}

// ContentResponse represents content metadata
type ContentResponse struct {
	ID          string   `json:"id"`
	ClassroomID string   `json:"classroom_id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	ContentType string   `json:"content_type"`
	Category    string   `json:"category"`
	Topic       string   `json:"topic"`
	Week        int      `json:"week"`
	Tags        []string `json:"tags"`
	UploadedBy  string   `json:"uploaded_by"`
	FileURL     string   `json:"file_url"`
	CreatedAt   string   `json:"created_at"`
}

// SearchRequest represents a search request
type SearchRequest struct {
	Query string `json:"query"`
}

// SearchResponse represents a search result
type SearchResponse struct {
	ContentID   string   `json:"content_id"`
	Title       string   `json:"title"`
	ContentType string   `json:"content_type"`
	ChunkIndex  int      `json:"chunk_index"`
	ChunkText   string   `json:"chunk_text"`
	Topic       string   `json:"topic"`
	Week        int      `json:"week"`
	Tags        []string `json:"tags"`
	UploadedAt  string   `json:"uploaded_at"`
}

// PaginationParams represents pagination parameters
type PaginationParams struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
}

// PaginatedResponse represents a paginated response
type PaginatedResponse struct {
	Items      interface{} `json:"items"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	TotalPages int         `json:"total_pages"`
}
