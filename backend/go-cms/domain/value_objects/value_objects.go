package value_objects

import (
	"fmt"
	"regexp"
)

// Email represents an email value object
type Email struct {
	value string
}

// NewEmail creates a new email value object
func NewEmail(email string) (*Email, error) {
	// Basic email validation
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return nil, fmt.Errorf("invalid email format: %s", email)
	}
	return &Email{value: email}, nil
}

// String returns the string representation of the email
func (e *Email) String() string {
	return e.value
}

// JoinCode represents a classroom join code value object
type JoinCode struct {
	value string
}

// NewJoinCode creates a new join code (should be 6-digit alphanumeric)
func NewJoinCode(code string) (*JoinCode, error) {
	if len(code) != 6 {
		return nil, fmt.Errorf("join code must be 6 characters, got %d", len(code))
	}
	codeRegex := regexp.MustCompile(`^[A-Za-z0-9]{6}$`)
	if !codeRegex.MatchString(code) {
		return nil, fmt.Errorf("join code must be alphanumeric, got: %s", code)
	}
	return &JoinCode{value: code}, nil
}

// String returns the string representation of the join code
func (jc *JoinCode) String() string {
	return jc.value
}

// Embedding represents a vector embedding value object
type Embedding struct {
	vector []float32
}

// NewEmbedding creates a new embedding
func NewEmbedding(vector []float32) (*Embedding, error) {
	if len(vector) == 0 {
		return nil, fmt.Errorf("embedding vector cannot be empty")
	}
	return &Embedding{vector: vector}, nil
}

// Vector returns the embedding vector
func (e *Embedding) Vector() []float32 {
	return e.vector
}

// Dimension returns the dimension of the embedding
func (e *Embedding) Dimension() int {
	return len(e.vector)
}

// SearchQuery represents a search query value object
type SearchQuery struct {
	value string
}

// NewSearchQuery creates a new search query
func NewSearchQuery(query string) (*SearchQuery, error) {
	if len(query) == 0 {
		return nil, fmt.Errorf("search query cannot be empty")
	}
	if len(query) > 500 {
		return nil, fmt.Errorf("search query too long, max 500 characters")
	}
	return &SearchQuery{value: query}, nil
}

// String returns the string representation of the search query
func (sq *SearchQuery) String() string {
	return sq.value
}
