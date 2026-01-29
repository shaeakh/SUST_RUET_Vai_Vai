package entities

import "time"

// UserRole represents the role of a user in the system
type UserRole string

const (
	RoleInstructor UserRole = "instructor"
	RoleStudent    UserRole = "student"
)

// User represents a user in the system
type User struct {
	ID        string    `db:"id"`
	Email     string    `db:"email"`
	Password  string    `db:"password"` // hashed
	FullName  string    `db:"full_name"`
	Role      UserRole  `db:"role"`
	CreatedAt time.Time `db:"created_at"`
	UpdatedAt time.Time `db:"updated_at"`
	DeletedAt *time.Time `db:"deleted_at"`
}

// ClassroomType represents the type of classroom
type ClassroomType string

const (
	ClassroomTypeTheory ClassroomType = "theory"
	ClassroomTypeLab    ClassroomType = "lab"
)

// Classroom represents a classroom created by an instructor
type Classroom struct {
	ID           string        `db:"id"`
	InstructorID string        `db:"instructor_id"`
	Name         string        `db:"name"`
	Description  string        `db:"description"`
	Type         ClassroomType `db:"type"`
	JoinCode     string        `db:"join_code"`
	CreatedAt    time.Time     `db:"created_at"`
	UpdatedAt    time.Time     `db:"updated_at"`
	DeletedAt    *time.Time    `db:"deleted_at"`
}

// ClassroomMember represents the relationship between a student and a classroom
type ClassroomMember struct {
	ID          string    `db:"id"`
	ClassroomID string    `db:"classroom_id"`
	StudentID   string    `db:"student_id"`
	JoinedAt    time.Time `db:"joined_at"`
	CreatedAt   time.Time `db:"created_at"`
	DeletedAt   *time.Time `db:"deleted_at"`
}

// ContentType represents the type of content
type ContentType string

const (
	ContentTypePDF    ContentType = "pdf"
	ContentTypeSlide  ContentType = "slide"
	ContentTypeCode   ContentType = "code"
	ContentTypeNote   ContentType = "note"
)

// ContentCategory represents the category of content
type ContentCategory string

const (
	CategoryTheory ContentCategory = "theory"
	CategoryLab    ContentCategory = "lab"
)

// Content represents a content item in the CMS
type Content struct {
	ID            string          `db:"id"`
	ClassroomID   string          `db:"classroom_id"`
	Title         string          `db:"title"`
	Description   string          `db:"description"`
	ContentType   ContentType     `db:"content_type"`
	Category      ContentCategory `db:"category"`
	Topic         string          `db:"topic"`
	Week          int             `db:"week"`
	Tags          []string        `db:"tags"`
	UploadedBy    string          `db:"uploaded_by"`
	FileURL       string          `db:"file_url"`
	FileSize      int64           `db:"file_size"`
	MimeType      string          `db:"mime_type"`
	CreatedAt     time.Time       `db:"created_at"`
	UpdatedAt     time.Time       `db:"updated_at"`
	DeletedAt     *time.Time      `db:"deleted_at"`
}

// ContentEmbedding represents the vector embedding for a content item
type ContentEmbedding struct {
	ID        string    `db:"id"`
	ContentID string    `db:"content_id"`
	ChunkIndex int      `db:"chunk_index"`
	ChunkText  string    `db:"chunk_text"`
	Embedding []float32 `db:"embedding"` // pgvector format
	Metadata  string    `db:"metadata"`  // JSON string
	CreatedAt time.Time `db:"created_at"`
}

// SearchRequest represents a search request
type SearchRequest struct {
	ID          string    `db:"id"`
	UserID      string    `db:"user_id"`
	ClassroomID string    `db:"classroom_id"`
	Query       string    `db:"query"`
	Status      string    `db:"status"`
	ResultCount int       `db:"result_count"`
	CreatedAt   time.Time `db:"created_at"`
	CompletedAt *time.Time `db:"completed_at"`
}

// AuditLog represents an audit log entry
type AuditLog struct {
	ID        string    `db:"id"`
	UserID    string    `db:"user_id"`
	Action    string    `db:"action"`
	EntityID  string    `db:"entity_id"`
	EntityType string   `db:"entity_type"`
	Details   string    `db:"details"` // JSON string
	CreatedAt time.Time `db:"created_at"`
}
