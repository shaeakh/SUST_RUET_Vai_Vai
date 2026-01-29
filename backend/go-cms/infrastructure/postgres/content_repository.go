package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/lib/pq"
	"github.com/shaeakh/sust-cms/domain/entities"
)

// ContentRepository is a PostgreSQL implementation of the ContentRepository interface
type ContentRepository struct {
	db *sql.DB
}

// NewContentRepository creates a new ContentRepository
func NewContentRepository(db *sql.DB) *ContentRepository {
	return &ContentRepository{db: db}
}

// Save saves content to the database
func (r *ContentRepository) Save(ctx context.Context, content *entities.Content) error {
	query := `
		INSERT INTO content_items 
		(id, classroom_id, title, description, content_type, category, topic, week, tags, uploaded_by, file_url, file_size, mime_type, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`
	_, err := r.db.ExecContext(ctx, query,
		content.ID, content.ClassroomID, content.Title, content.Description,
		content.ContentType, content.Category, content.Topic, content.Week,
		pq.Array(content.Tags), content.UploadedBy, content.FileURL, content.FileSize,
		content.MimeType, content.CreatedAt, content.UpdatedAt,
	)
	return err
}

// FindByID finds content by ID
func (r *ContentRepository) FindByID(ctx context.Context, id string) (*entities.Content, error) {
	content := &entities.Content{}
	query := `
		SELECT id, classroom_id, title, description, content_type, category, topic, week, tags, 
		       uploaded_by, file_url, file_size, mime_type, created_at, updated_at, deleted_at
		FROM content_items WHERE id = $1 AND deleted_at IS NULL
	`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&content.ID, &content.ClassroomID, &content.Title, &content.Description,
		&content.ContentType, &content.Category, &content.Topic, &content.Week,
		pq.Array(&content.Tags), &content.UploadedBy, &content.FileURL, &content.FileSize,
		&content.MimeType, &content.CreatedAt, &content.UpdatedAt, &content.DeletedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("content not found: %w", err)
		}
		return nil, err
	}
	return content, nil
}

// Update updates content
func (r *ContentRepository) Update(ctx context.Context, content *entities.Content) error {
	content.UpdatedAt = time.Now()
	query := `
		UPDATE content_items
		SET title = $1, description = $2, topic = $3, week = $4, tags = $5, updated_at = $6
		WHERE id = $7
	`
	_, err := r.db.ExecContext(ctx, query,
		content.Title, content.Description, content.Topic, content.Week,
		pq.Array(content.Tags), content.UpdatedAt, content.ID,
	)
	return err
}

// Delete soft deletes content
func (r *ContentRepository) Delete(ctx context.Context, id string) error {
	query := `UPDATE content_items SET deleted_at = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, time.Now(), id)
	return err
}

// ListByClassroom lists content by classroom with pagination
func (r *ContentRepository) ListByClassroom(ctx context.Context, classroomID string, limit, offset int) ([]*entities.Content, error) {
	query := `
		SELECT id, classroom_id, title, description, content_type, category, topic, week, tags,
		       uploaded_by, file_url, file_size, mime_type, created_at, updated_at, deleted_at
		FROM content_items 
		WHERE classroom_id = $1 AND deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, classroomID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contents []*entities.Content
	for rows.Next() {
		content := &entities.Content{}
		if err := rows.Scan(
			&content.ID, &content.ClassroomID, &content.Title, &content.Description,
			&content.ContentType, &content.Category, &content.Topic, &content.Week,
			pq.Array(&content.Tags), &content.UploadedBy, &content.FileURL, &content.FileSize,
			&content.MimeType, &content.CreatedAt, &content.UpdatedAt, &content.DeletedAt,
		); err != nil {
			return nil, err
		}
		contents = append(contents, content)
	}
	return contents, rows.Err()
}

// ListByTopic lists content by topic
func (r *ContentRepository) ListByTopic(ctx context.Context, classroomID, topic string, limit, offset int) ([]*entities.Content, error) {
	query := `
		SELECT id, classroom_id, title, description, content_type, category, topic, week, tags,
		       uploaded_by, file_url, file_size, mime_type, created_at, updated_at, deleted_at
		FROM content_items 
		WHERE classroom_id = $1 AND topic = $2 AND deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $3 OFFSET $4
	`
	rows, err := r.db.QueryContext(ctx, query, classroomID, topic, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contents []*entities.Content
	for rows.Next() {
		content := &entities.Content{}
		if err := rows.Scan(
			&content.ID, &content.ClassroomID, &content.Title, &content.Description,
			&content.ContentType, &content.Category, &content.Topic, &content.Week,
			pq.Array(&content.Tags), &content.UploadedBy, &content.FileURL, &content.FileSize,
			&content.MimeType, &content.CreatedAt, &content.UpdatedAt, &content.DeletedAt,
		); err != nil {
			return nil, err
		}
		contents = append(contents, content)
	}
	return contents, rows.Err()
}

// ListByWeek lists content by week
func (r *ContentRepository) ListByWeek(ctx context.Context, classroomID string, week int, limit, offset int) ([]*entities.Content, error) {
	query := `
		SELECT id, classroom_id, title, description, content_type, category, topic, week, tags,
		       uploaded_by, file_url, file_size, mime_type, created_at, updated_at, deleted_at
		FROM content_items 
		WHERE classroom_id = $1 AND week = $2 AND deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $3 OFFSET $4
	`
	rows, err := r.db.QueryContext(ctx, query, classroomID, week, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contents []*entities.Content
	for rows.Next() {
		content := &entities.Content{}
		if err := rows.Scan(
			&content.ID, &content.ClassroomID, &content.Title, &content.Description,
			&content.ContentType, &content.Category, &content.Topic, &content.Week,
			pq.Array(&content.Tags), &content.UploadedBy, &content.FileURL, &content.FileSize,
			&content.MimeType, &content.CreatedAt, &content.UpdatedAt, &content.DeletedAt,
		); err != nil {
			return nil, err
		}
		contents = append(contents, content)
	}
	return contents, rows.Err()
}
