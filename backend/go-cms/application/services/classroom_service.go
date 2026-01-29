package services

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"github.com/shaeakh/sust-cms/domain/entities"
	"github.com/shaeakh/sust-cms/domain/repositories"
)

// ClassroomService handles classroom operations
type ClassroomService struct {
	classroomRepo repositories.ClassroomRepository
	memberRepo    repositories.ClassroomMemberRepository
}

// NewClassroomService creates a new ClassroomService
func NewClassroomService(
	classroomRepo repositories.ClassroomRepository,
	memberRepo repositories.ClassroomMemberRepository,
) *ClassroomService {
	return &ClassroomService{
		classroomRepo: classroomRepo,
		memberRepo:    memberRepo,
	}
}

// CreateClassroom creates a new classroom
func (cs *ClassroomService) CreateClassroom(ctx context.Context, instructorID, name, description, classroomType string) (*entities.Classroom, error) {
	// Generate unique join code
	joinCode := cs.generateJoinCode()

	// Default to "theory" if not specified
	ctype := entities.ClassroomTypeTheory
	if classroomType == string(entities.ClassroomTypeLab) {
		ctype = entities.ClassroomTypeLab
	}

	classroom := &entities.Classroom{
		ID:           uuid.New().String(),
		InstructorID: instructorID,
		Name:         name,
		Description:  description,
		Type:         ctype,
		JoinCode:     joinCode,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := cs.classroomRepo.Save(ctx, classroom); err != nil {
		return nil, fmt.Errorf("failed to create classroom: %w", err)
	}

	return classroom, nil
}

// JoinClassroom allows a student to join a classroom using join code
func (cs *ClassroomService) JoinClassroom(ctx context.Context, studentID, joinCode string) (*entities.Classroom, error) {
	// Find classroom by join code
	classroom, err := cs.classroomRepo.FindByJoinCode(ctx, joinCode)
	if err != nil {
		return nil, fmt.Errorf("invalid join code: %w", err)
	}

	// Check if student is already a member
	existingMember, _ := cs.memberRepo.FindByClassroomAndStudent(ctx, classroom.ID, studentID)
	if existingMember != nil {
		return classroom, nil // Already a member
	}

	// Add student to classroom
	member := &entities.ClassroomMember{
		ID:          uuid.New().String(),
		ClassroomID: classroom.ID,
		StudentID:   studentID,
		JoinedAt:    time.Now(),
		CreatedAt:   time.Now(),
	}

	if err := cs.memberRepo.Save(ctx, member); err != nil {
		return nil, fmt.Errorf("failed to join classroom: %w", err)
	}

	return classroom, nil
}

// GetClassroom retrieves a classroom by ID
func (cs *ClassroomService) GetClassroom(ctx context.Context, classroomID string) (*entities.Classroom, error) {
	return cs.classroomRepo.FindByID(ctx, classroomID)
}

// ListClassroomsByInstructor lists all classrooms created by an instructor
func (cs *ClassroomService) ListClassroomsByInstructor(ctx context.Context, instructorID string) ([]*entities.Classroom, error) {
	return cs.classroomRepo.ListByInstructor(ctx, instructorID)
}

// ListClassroomsByStudent lists all classrooms a student is enrolled in
func (cs *ClassroomService) ListClassroomsByStudent(ctx context.Context, studentID string) ([]*entities.Classroom, error) {
	members, err := cs.memberRepo.ListClassroomsByStudent(ctx, studentID)
	if err != nil {
		return nil, fmt.Errorf("failed to list classrooms: %w", err)
	}

	var classrooms []*entities.Classroom
	for _, member := range members {
		classroom, err := cs.classroomRepo.FindByID(ctx, member.ClassroomID)
		if err != nil {
			continue
		}
		classrooms = append(classrooms, classroom)
	}

	return classrooms, nil
}

// ListClassroomMembers lists all students in a classroom
func (cs *ClassroomService) ListClassroomMembers(ctx context.Context, classroomID string) ([]*entities.ClassroomMember, error) {
	return cs.memberRepo.ListStudentsByClassroom(ctx, classroomID)
}

// UpdateClassroom updates classroom details
func (cs *ClassroomService) UpdateClassroom(ctx context.Context, classroom *entities.Classroom) error {
	return cs.classroomRepo.Update(ctx, classroom)
}

// DeleteClassroom deletes a classroom (soft delete)
func (cs *ClassroomService) DeleteClassroom(ctx context.Context, classroomID string) error {
	return cs.classroomRepo.Delete(ctx, classroomID)
}

// generateJoinCode generates a random 6-character alphanumeric join code
func (cs *ClassroomService) generateJoinCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
