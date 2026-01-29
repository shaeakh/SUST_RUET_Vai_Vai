package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/pgvector/pgvector-go"
	"github.com/shaeakh/sust-cms/domain/entities"
)

// ContentEmbeddingRepository is a PostgreSQL implementation for embeddings
type ContentEmbeddingRepository struct {
	db *sql.DB
}

// NewContentEmbeddingRepository creates a new ContentEmbeddingRepository
func NewContentEmbeddingRepository(db *sql.DB) *ContentEmbeddingRepository {
	return &ContentEmbeddingRepository{db: db}
}

// Save saves an embedding to the database
func (r *ContentEmbeddingRepository) Save(ctx context.Context, embedding *entities.ContentEmbedding) error {
	query := `
		INSERT INTO content_embeddings (id, content_id, chunk_index, chunk_text, embedding, metadata, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	vec := pgvector.NewVector(embedding.Embedding)
	metadataJSON, _ := json.Marshal(embedding.Metadata)

	_, err := r.db.ExecContext(ctx, query,
		embedding.ID, embedding.ContentID, embedding.ChunkIndex, embedding.ChunkText,
		vec, metadataJSON, embedding.CreatedAt,
	)
	return err
}

// FindByID finds an embedding by ID
func (r *ContentEmbeddingRepository) FindByID(ctx context.Context, id string) (*entities.ContentEmbedding, error) {
	embedding := &entities.ContentEmbedding{}
	query := `
		SELECT id, content_id, chunk_index, chunk_text, embedding, metadata, created_at
		FROM content_embeddings WHERE id = $1
	`

	var vec pgvector.Vector
	var metadataJSON []byte

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&embedding.ID, &embedding.ContentID, &embedding.ChunkIndex, &embedding.ChunkText,
		&vec, &metadataJSON, &embedding.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("embedding not found: %w", err)
		}
		return nil, err
	}

	embedding.Embedding = vec.Slice()
	_ = json.Unmarshal(metadataJSON, &embedding.Metadata)

	return embedding, nil
}

// ListByContentID lists embeddings by content ID
func (r *ContentEmbeddingRepository) ListByContentID(ctx context.Context, contentID string) ([]*entities.ContentEmbedding, error) {
	query := `
		SELECT id, content_id, chunk_index, chunk_text, embedding, metadata, created_at
		FROM content_embeddings 
		WHERE content_id = $1
		ORDER BY chunk_index ASC
	`

	rows, err := r.db.QueryContext(ctx, query, contentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var embeddings []*entities.ContentEmbedding
	for rows.Next() {
		embedding := &entities.ContentEmbedding{}
		var vec pgvector.Vector
		var metadataJSON []byte

		if err := rows.Scan(
			&embedding.ID, &embedding.ContentID, &embedding.ChunkIndex, &embedding.ChunkText,
			&vec, &metadataJSON, &embedding.CreatedAt,
		); err != nil {
			return nil, err
		}

		embedding.Embedding = vec.Slice()
		_ = json.Unmarshal(metadataJSON, &embedding.Metadata)

		embeddings = append(embeddings, embedding)
	}
	return embeddings, rows.Err()
}

// SemanticSearch performs semantic search using pgvector
func (r *ContentEmbeddingRepository) SemanticSearch(ctx context.Context, embedding []float32, classroomID string, limit int) ([]*entities.ContentEmbedding, error) {
	query := `
		SELECT ce.id, ce.content_id, ce.chunk_index, ce.chunk_text, ce.embedding, ce.metadata, ce.created_at
		FROM content_embeddings ce
		JOIN content_items ci ON ce.content_id = ci.id
		WHERE ci.classroom_id = $1 AND ci.deleted_at IS NULL
		ORDER BY ce.embedding <-> $2 LIMIT $3
	`

	vec := pgvector.NewVector(embedding)
	rows, err := r.db.QueryContext(ctx, query, classroomID, vec, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var embeddings []*entities.ContentEmbedding
	for rows.Next() {
		e := &entities.ContentEmbedding{}
		var resultVec pgvector.Vector
		var metadataJSON []byte

		if err := rows.Scan(
			&e.ID, &e.ContentID, &e.ChunkIndex, &e.ChunkText,
			&resultVec, &metadataJSON, &e.CreatedAt,
		); err != nil {
			return nil, err
		}

		e.Embedding = resultVec.Slice()
		_ = json.Unmarshal(metadataJSON, &e.Metadata)

		embeddings = append(embeddings, e)
	}
	return embeddings, rows.Err()
}

// Delete deletes an embedding
func (r *ContentEmbeddingRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM content_embeddings WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
