package postgres

import (
	"context"
	"database/sql"

	"github.com/shaeakh/sust-cms/domain/entities"
)

// AuditLogRepository is a PostgreSQL implementation
type AuditLogRepository struct {
	db *sql.DB
}

// NewAuditLogRepository creates a new AuditLogRepository
func NewAuditLogRepository(db *sql.DB) *AuditLogRepository {
	return &AuditLogRepository{db: db}
}

// Save saves an audit log
func (r *AuditLogRepository) Save(ctx context.Context, log *entities.AuditLog) error {
	query := `
		INSERT INTO audit_logs (id, user_id, action, entity_id, entity_type, details, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.ExecContext(ctx, query,
		log.ID, log.UserID, log.Action, log.EntityID, log.EntityType, log.Details, log.CreatedAt,
	)
	return err
}

// ListByEntity lists audit logs by entity
func (r *AuditLogRepository) ListByEntity(ctx context.Context, entityID string, limit, offset int) ([]*entities.AuditLog, error) {
	query := `
		SELECT id, user_id, action, entity_id, entity_type, details, created_at
		FROM audit_logs WHERE entity_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, entityID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*entities.AuditLog
	for rows.Next() {
		log := &entities.AuditLog{}
		if err := rows.Scan(
			&log.ID, &log.UserID, &log.Action, &log.EntityID, &log.EntityType, &log.Details, &log.CreatedAt,
		); err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, rows.Err()
}

// ListByUser lists audit logs by user
func (r *AuditLogRepository) ListByUser(ctx context.Context, userID string, limit, offset int) ([]*entities.AuditLog, error) {
	query := `
		SELECT id, user_id, action, entity_id, entity_type, details, created_at
		FROM audit_logs WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*entities.AuditLog
	for rows.Next() {
		log := &entities.AuditLog{}
		if err := rows.Scan(
			&log.ID, &log.UserID, &log.Action, &log.EntityID, &log.EntityType, &log.Details, &log.CreatedAt,
		); err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, rows.Err()
}
