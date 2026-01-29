package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/shaeakh/sust-cms/domain/entities"
)

// SearchRequestRepository is a PostgreSQL implementation
type SearchRequestRepository struct {
	db *sql.DB
}

// NewSearchRequestRepository creates a new SearchRequestRepository
func NewSearchRequestRepository(db *sql.DB) *SearchRequestRepository {
	return &SearchRequestRepository{db: db}
}

// Save saves a search request
func (r *SearchRequestRepository) Save(ctx context.Context, request *entities.SearchRequest) error {
	query := `
		INSERT INTO search_requests (id, user_id, classroom_id, query, status, result_count, created_at, completed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.ExecContext(ctx, query,
		request.ID, request.UserID, request.ClassroomID, request.Query,
		request.Status, request.ResultCount, request.CreatedAt, request.CompletedAt,
	)
	return err
}

// FindByID finds a search request by ID
func (r *SearchRequestRepository) FindByID(ctx context.Context, id string) (*entities.SearchRequest, error) {
	request := &entities.SearchRequest{}
	query := `
		SELECT id, user_id, classroom_id, query, status, result_count, created_at, completed_at
		FROM search_requests WHERE id = $1
	`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&request.ID, &request.UserID, &request.ClassroomID, &request.Query,
		&request.Status, &request.ResultCount, &request.CreatedAt, &request.CompletedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("search request not found: %w", err)
		}
		return nil, err
	}
	return request, nil
}

// Update updates a search request
func (r *SearchRequestRepository) Update(ctx context.Context, request *entities.SearchRequest) error {
	query := `
		UPDATE search_requests
		SET status = $1, result_count = $2, completed_at = $3
		WHERE id = $4
	`
	_, err := r.db.ExecContext(ctx, query,
		request.Status, request.ResultCount, request.CompletedAt, request.ID,
	)
	return err
}

// ListByUser lists search requests by user
func (r *SearchRequestRepository) ListByUser(ctx context.Context, userID string, limit, offset int) ([]*entities.SearchRequest, error) {
	query := `
		SELECT id, user_id, classroom_id, query, status, result_count, created_at, completed_at
		FROM search_requests WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*entities.SearchRequest
	for rows.Next() {
		request := &entities.SearchRequest{}
		if err := rows.Scan(
			&request.ID, &request.UserID, &request.ClassroomID, &request.Query,
			&request.Status, &request.ResultCount, &request.CreatedAt, &request.CompletedAt,
		); err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}
	return requests, rows.Err()
}
