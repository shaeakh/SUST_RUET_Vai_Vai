package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/shaeakh/sust-cms/domain/entities"
)

// ClassroomRepository is a PostgreSQL implementation of the ClassroomRepository interface
type ClassroomRepository struct {
	db *sql.DB
}

// NewClassroomRepository creates a new ClassroomRepository
func NewClassroomRepository(db *sql.DB) *ClassroomRepository {
	return &ClassroomRepository{db: db}
}

// Save saves a classroom to the database
func (r *ClassroomRepository) Save(ctx context.Context, classroom *entities.Classroom) error {
	query := `
		INSERT INTO classrooms (id, instructor_id, name, description, join_code, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.ExecContext(ctx, query,
		classroom.ID, classroom.InstructorID, classroom.Name, classroom.Description,
		classroom.JoinCode, classroom.CreatedAt, classroom.UpdatedAt,
	)
	return err
}

// FindByID finds a classroom by ID
func (r *ClassroomRepository) FindByID(ctx context.Context, id string) (*entities.Classroom, error) {
	classroom := &entities.Classroom{}
	query := `
		SELECT id, instructor_id, name, description, join_code, created_at, updated_at, deleted_at
		FROM classrooms WHERE id = $1 AND deleted_at IS NULL
	`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&classroom.ID, &classroom.InstructorID, &classroom.Name, &classroom.Description,
		&classroom.JoinCode, &classroom.CreatedAt, &classroom.UpdatedAt, &classroom.DeletedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("classroom not found: %w", err)
		}
		return nil, err
	}
	return classroom, nil
}

// FindByJoinCode finds a classroom by join code
func (r *ClassroomRepository) FindByJoinCode(ctx context.Context, joinCode string) (*entities.Classroom, error) {
	classroom := &entities.Classroom{}
	query := `
		SELECT id, instructor_id, name, description, join_code, created_at, updated_at, deleted_at
		FROM classrooms WHERE join_code = $1 AND deleted_at IS NULL
	`
	err := r.db.QueryRowContext(ctx, query, joinCode).Scan(
		&classroom.ID, &classroom.InstructorID, &classroom.Name, &classroom.Description,
		&classroom.JoinCode, &classroom.CreatedAt, &classroom.UpdatedAt, &classroom.DeletedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("classroom not found: %w", err)
		}
		return nil, err
	}
	return classroom, nil
}

// Update updates a classroom
func (r *ClassroomRepository) Update(ctx context.Context, classroom *entities.Classroom) error {
	classroom.UpdatedAt = time.Now()
	query := `
		UPDATE classrooms
		SET name = $1, description = $2, updated_at = $3
		WHERE id = $4
	`
	_, err := r.db.ExecContext(ctx, query,
		classroom.Name, classroom.Description, classroom.UpdatedAt, classroom.ID,
	)
	return err
}

// Delete soft deletes a classroom
func (r *ClassroomRepository) Delete(ctx context.Context, id string) error {
	query := `UPDATE classrooms SET deleted_at = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, time.Now(), id)
	return err
}

// ListByInstructor lists classrooms by instructor
func (r *ClassroomRepository) ListByInstructor(ctx context.Context, instructorID string) ([]*entities.Classroom, error) {
	query := `
		SELECT id, instructor_id, name, description, join_code, created_at, updated_at, deleted_at
		FROM classrooms WHERE instructor_id = $1 AND deleted_at IS NULL
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, instructorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var classrooms []*entities.Classroom
	for rows.Next() {
		classroom := &entities.Classroom{}
		if err := rows.Scan(
			&classroom.ID, &classroom.InstructorID, &classroom.Name, &classroom.Description,
			&classroom.JoinCode, &classroom.CreatedAt, &classroom.UpdatedAt, &classroom.DeletedAt,
		); err != nil {
			return nil, err
		}
		classrooms = append(classrooms, classroom)
	}
	return classrooms, rows.Err()
}
