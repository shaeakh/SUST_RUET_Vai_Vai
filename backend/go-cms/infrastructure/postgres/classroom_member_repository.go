package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/shaeakh/sust-cms/domain/entities"
)

// ClassroomMemberRepository is a PostgreSQL implementation
type ClassroomMemberRepository struct {
	db *sql.DB
}

// NewClassroomMemberRepository creates a new ClassroomMemberRepository
func NewClassroomMemberRepository(db *sql.DB) *ClassroomMemberRepository {
	return &ClassroomMemberRepository{db: db}
}

// Save saves a classroom member
func (r *ClassroomMemberRepository) Save(ctx context.Context, member *entities.ClassroomMember) error {
	query := `
		INSERT INTO classroom_members (id, classroom_id, student_id, joined_at, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.ExecContext(ctx, query,
		member.ID, member.ClassroomID, member.StudentID, member.JoinedAt, member.CreatedAt,
	)
	return err
}

// FindByID finds a classroom member by ID
func (r *ClassroomMemberRepository) FindByID(ctx context.Context, id string) (*entities.ClassroomMember, error) {
	member := &entities.ClassroomMember{}
	query := `
		SELECT id, classroom_id, student_id, joined_at, created_at, deleted_at
		FROM classroom_members WHERE id = $1 AND deleted_at IS NULL
	`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&member.ID, &member.ClassroomID, &member.StudentID, &member.JoinedAt, &member.CreatedAt, &member.DeletedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("classroom member not found: %w", err)
		}
		return nil, err
	}
	return member, nil
}

// FindByClassroomAndStudent finds a membership
func (r *ClassroomMemberRepository) FindByClassroomAndStudent(ctx context.Context, classroomID, studentID string) (*entities.ClassroomMember, error) {
	member := &entities.ClassroomMember{}
	query := `
		SELECT id, classroom_id, student_id, joined_at, created_at, deleted_at
		FROM classroom_members WHERE classroom_id = $1 AND student_id = $2 AND deleted_at IS NULL
	`
	err := r.db.QueryRowContext(ctx, query, classroomID, studentID).Scan(
		&member.ID, &member.ClassroomID, &member.StudentID, &member.JoinedAt, &member.CreatedAt, &member.DeletedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("classroom member not found: %w", err)
		}
		return nil, err
	}
	return member, nil
}

// Delete soft deletes a classroom member
func (r *ClassroomMemberRepository) Delete(ctx context.Context, id string) error {
	query := `UPDATE classroom_members SET deleted_at = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, time.Now(), id)
	return err
}

// ListStudentsByClassroom lists students in a classroom
func (r *ClassroomMemberRepository) ListStudentsByClassroom(ctx context.Context, classroomID string) ([]*entities.ClassroomMember, error) {
	query := `
		SELECT id, classroom_id, student_id, joined_at, created_at, deleted_at
		FROM classroom_members WHERE classroom_id = $1 AND deleted_at IS NULL
		ORDER BY joined_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, classroomID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []*entities.ClassroomMember
	for rows.Next() {
		member := &entities.ClassroomMember{}
		if err := rows.Scan(
			&member.ID, &member.ClassroomID, &member.StudentID, &member.JoinedAt, &member.CreatedAt, &member.DeletedAt,
		); err != nil {
			return nil, err
		}
		members = append(members, member)
	}
	return members, rows.Err()
}

// ListClassroomsByStudent lists classrooms for a student
func (r *ClassroomMemberRepository) ListClassroomsByStudent(ctx context.Context, studentID string) ([]*entities.ClassroomMember, error) {
	query := `
		SELECT id, classroom_id, student_id, joined_at, created_at, deleted_at
		FROM classroom_members WHERE student_id = $1 AND deleted_at IS NULL
		ORDER BY joined_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []*entities.ClassroomMember
	for rows.Next() {
		member := &entities.ClassroomMember{}
		if err := rows.Scan(
			&member.ID, &member.ClassroomID, &member.StudentID, &member.JoinedAt, &member.CreatedAt, &member.DeletedAt,
		); err != nil {
			return nil, err
		}
		members = append(members, member)
	}
	return members, rows.Err()
}
