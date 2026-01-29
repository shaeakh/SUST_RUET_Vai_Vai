package events

import "time"

// DomainEvent is the base interface for all domain events
type DomainEvent interface {
	EventType() string
	Timestamp() time.Time
}

// UserRegisteredEvent represents a user registration event
type UserRegisteredEvent struct {
	UserID    string
	Email     string
	FullName  string
	Role      string
	EventTime time.Time
}

// EventType returns the event type
func (e *UserRegisteredEvent) EventType() string {
	return "user.registered"
}

// Timestamp returns the event timestamp
func (e *UserRegisteredEvent) Timestamp() time.Time {
	return e.EventTime
}

// ClassroomCreatedEvent represents a classroom creation event
type ClassroomCreatedEvent struct {
	ClassroomID  string
	InstructorID string
	Name         string
	JoinCode     string
	EventTime    time.Time
}

// EventType returns the event type
func (e *ClassroomCreatedEvent) EventType() string {
	return "classroom.created"
}

// Timestamp returns the event timestamp
func (e *ClassroomCreatedEvent) Timestamp() time.Time {
	return e.EventTime
}

// ContentUploadedEvent represents a content upload event
type ContentUploadedEvent struct {
	ContentID   string
	ClassroomID string
	Title       string
	ContentType string
	UploadedBy  string
	EventTime   time.Time
}

// EventType returns the event type
func (e *ContentUploadedEvent) EventType() string {
	return "content.uploaded"
}

// Timestamp returns the event timestamp
func (e *ContentUploadedEvent) Timestamp() time.Time {
	return e.EventTime
}

// EmbeddingGeneratedEvent represents an embedding generation event
type EmbeddingGeneratedEvent struct {
	EmbeddingID string
	ContentID   string
	ChunkIndex  int
	Dimension   int
	EventTime   time.Time
}

// EventType returns the event type
func (e *EmbeddingGeneratedEvent) EventType() string {
	return "embedding.generated"
}

// Timestamp returns the event timestamp
func (e *EmbeddingGeneratedEvent) Timestamp() time.Time {
	return e.EventTime
}

// SearchExecutedEvent represents a search execution event
type SearchExecutedEvent struct {
	SearchRequestID string
	UserID          string
	ClassroomID     string
	Query           string
	ResultCount     int
	EventTime       time.Time
}

// EventType returns the event type
func (e *SearchExecutedEvent) EventType() string {
	return "search.executed"
}

// Timestamp returns the event timestamp
func (e *SearchExecutedEvent) Timestamp() time.Time {
	return e.EventTime
}
