package repositories

import (
	"context"
	"github.com/shaeakh/sust-cms/domain/entities"
)

// UserRepository defines the interface for user persistence
type UserRepository interface {
	Save(ctx context.Context, user *entities.User) error
	FindByID(ctx context.Context, id string) (*entities.User, error)
	FindByEmail(ctx context.Context, email string) (*entities.User, error)
	Update(ctx context.Context, user *entities.User) error
	Delete(ctx context.Context, id string) error
	ListByRole(ctx context.Context, role entities.UserRole) ([]*entities.User, error)
}

// ClassroomRepository defines the interface for classroom persistence
type ClassroomRepository interface {
	Save(ctx context.Context, classroom *entities.Classroom) error
	FindByID(ctx context.Context, id string) (*entities.Classroom, error)
	FindByJoinCode(ctx context.Context, joinCode string) (*entities.Classroom, error)
	Update(ctx context.Context, classroom *entities.Classroom) error
	Delete(ctx context.Context, id string) error
	ListByInstructor(ctx context.Context, instructorID string) ([]*entities.Classroom, error)
}

// ClassroomMemberRepository defines the interface for classroom member persistence
type ClassroomMemberRepository interface {
	Save(ctx context.Context, member *entities.ClassroomMember) error
	FindByID(ctx context.Context, id string) (*entities.ClassroomMember, error)
	FindByClassroomAndStudent(ctx context.Context, classroomID, studentID string) (*entities.ClassroomMember, error)
	Delete(ctx context.Context, id string) error
	ListStudentsByClassroom(ctx context.Context, classroomID string) ([]*entities.ClassroomMember, error)
	ListClassroomsByStudent(ctx context.Context, studentID string) ([]*entities.ClassroomMember, error)
}

// ContentRepository defines the interface for content persistence
type ContentRepository interface {
	Save(ctx context.Context, content *entities.Content) error
	FindByID(ctx context.Context, id string) (*entities.Content, error)
	Update(ctx context.Context, content *entities.Content) error
	Delete(ctx context.Context, id string) error
	ListByClassroom(ctx context.Context, classroomID string, limit, offset int) ([]*entities.Content, error)
	ListByTopic(ctx context.Context, classroomID, topic string, limit, offset int) ([]*entities.Content, error)
	ListByWeek(ctx context.Context, classroomID string, week int, limit, offset int) ([]*entities.Content, error)
}

// ContentEmbeddingRepository defines the interface for content embedding persistence
type ContentEmbeddingRepository interface {
	Save(ctx context.Context, embedding *entities.ContentEmbedding) error
	FindByID(ctx context.Context, id string) (*entities.ContentEmbedding, error)
	ListByContentID(ctx context.Context, contentID string) ([]*entities.ContentEmbedding, error)
	SemanticSearch(ctx context.Context, embedding []float32, classroomID string, limit int) ([]*entities.ContentEmbedding, error)
	Delete(ctx context.Context, id string) error
}

// SearchRequestRepository defines the interface for search request persistence
type SearchRequestRepository interface {
	Save(ctx context.Context, request *entities.SearchRequest) error
	FindByID(ctx context.Context, id string) (*entities.SearchRequest, error)
	Update(ctx context.Context, request *entities.SearchRequest) error
	ListByUser(ctx context.Context, userID string, limit, offset int) ([]*entities.SearchRequest, error)
}

// AuditLogRepository defines the interface for audit log persistence
type AuditLogRepository interface {
	Save(ctx context.Context, log *entities.AuditLog) error
	ListByEntity(ctx context.Context, entityID string, limit, offset int) ([]*entities.AuditLog, error)
	ListByUser(ctx context.Context, userID string, limit, offset int) ([]*entities.AuditLog, error)
}
