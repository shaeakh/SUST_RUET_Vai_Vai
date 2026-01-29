package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/shaeakh/sust-cms/domain/entities"
	"github.com/shaeakh/sust-cms/domain/repositories"
	"github.com/shaeakh/sust-cms/infrastructure/gemini"
	"github.com/shaeakh/sust-cms/infrastructure/redis"
)

// SearchService handles search operations using RAG
type SearchService struct {
	embeddingRepo  repositories.ContentEmbeddingRepository
	contentRepo    repositories.ContentRepository
	searchReqRepo  repositories.SearchRequestRepository
	geminiEmbedder *gemini.Embedder
	searchQueue    *redis.SearchQueue
}

// NewSearchService creates a new SearchService
func NewSearchService(
	embeddingRepo repositories.ContentEmbeddingRepository,
	contentRepo repositories.ContentRepository,
	searchReqRepo repositories.SearchRequestRepository,
	geminiEmbedder *gemini.Embedder,
	searchQueue *redis.SearchQueue,
) *SearchService {
	return &SearchService{
		embeddingRepo:  embeddingRepo,
		contentRepo:    contentRepo,
		searchReqRepo:  searchReqRepo,
		geminiEmbedder: geminiEmbedder,
		searchQueue:    searchQueue,
	}
}

// SearchResult represents a search result
type SearchResult struct {
	ContentID      string  `json:"content_id"`
	Title          string  `json:"title"`
	ContentType    string  `json:"content_type"`
	ChunkIndex     int     `json:"chunk_index"`
	ChunkText      string  `json:"chunk_text"`
	Similarity     float32 `json:"similarity"`
	Topic          string  `json:"topic"`
	Week           int     `json:"week"`
	Tags           []string `json:"tags"`
	UploadedAt     time.Time `json:"uploaded_at"`
}

// SemanticSearch performs semantic search on course materials
func (ss *SearchService) SemanticSearch(ctx context.Context, userID, classroomID, query string) ([]SearchResult, error) {
	// Generate embedding for the query
	queryEmbedding, err := ss.geminiEmbedder.Embed(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to generate query embedding: %w", err)
	}

	// Search for similar embeddings
	embeddingResults, err := ss.embeddingRepo.SemanticSearch(ctx, queryEmbedding, classroomID, 20)
	if err != nil {
		return nil, fmt.Errorf("failed to search embeddings: %w", err)
	}

	// Enrich results with content metadata
	var results []SearchResult
	contentCache := make(map[string]*entities.Content)

	for _, emb := range embeddingResults {
		// Get content details (cached)
		var content *entities.Content
		if cached, ok := contentCache[emb.ContentID]; ok {
			content = cached
		} else {
			var err error
			content, err = ss.contentRepo.FindByID(ctx, emb.ContentID)
			if err != nil {
				continue
			}
			contentCache[emb.ContentID] = content
		}

		result := SearchResult{
			ContentID:   emb.ContentID,
			Title:       content.Title,
			ContentType: string(content.ContentType),
			ChunkIndex:  emb.ChunkIndex,
			ChunkText:   truncateText(emb.ChunkText, 300),
			Topic:       content.Topic,
			Week:        content.Week,
			Tags:        content.Tags,
			UploadedAt:  content.CreatedAt,
		}

		results = append(results, result)
	}

	return results, nil
}

// EnqueueSearchRequest adds a search request to the queue
func (ss *SearchService) EnqueueSearchRequest(ctx context.Context, userID, classroomID, query string) (*entities.SearchRequest, error) {
	// Create search request record
	searchReq := &entities.SearchRequest{
		ID:          uuid.New().String(),
		UserID:      userID,
		ClassroomID: classroomID,
		Query:       query,
		Status:      "pending",
		CreatedAt:   time.Now(),
	}

	if err := ss.searchReqRepo.Save(ctx, searchReq); err != nil {
		return nil, fmt.Errorf("failed to save search request: %w", err)
	}

	// Enqueue to Redis
	queueMsg := &redis.QueueMessage{
		RequestID:   searchReq.ID,
		UserID:      userID,
		ClassroomID: classroomID,
		Query:       query,
		CreatedAt:   time.Now(),
	}

	if err := ss.searchQueue.Enqueue(ctx, queueMsg); err != nil {
		return nil, fmt.Errorf("failed to enqueue search: %w", err)
	}

	return searchReq, nil
}

// ProcessSearchRequest processes a search request from the queue
func (ss *SearchService) ProcessSearchRequest(ctx context.Context, queueMsg *redis.QueueMessage) error {
	// Update status to processing
	searchReq := &entities.SearchRequest{
		ID:    queueMsg.RequestID,
		Status: "processing",
	}

	// Perform semantic search
	results, err := ss.SemanticSearch(ctx, queueMsg.UserID, queueMsg.ClassroomID, queueMsg.Query)
	if err != nil {
		searchReq.Status = "failed"
		ss.searchReqRepo.Update(ctx, searchReq)
		return fmt.Errorf("search failed: %w", err)
	}

	// Update search request with results
	searchReq.Status = "completed"
	searchReq.ResultCount = len(results)
	searchReq.CompletedAt = timePtr(time.Now())

	if err := ss.searchReqRepo.Update(ctx, searchReq); err != nil {
		return fmt.Errorf("failed to update search request: %w", err)
	}

	return nil
}

// GetSearchHistory retrieves search history for a user
func (ss *SearchService) GetSearchHistory(ctx context.Context, userID string, limit, offset int) ([]*entities.SearchRequest, error) {
	return ss.searchReqRepo.ListByUser(ctx, userID, limit, offset)
}

// truncateText truncates text to a maximum length
func truncateText(text string, maxLen int) string {
	if len(text) <= maxLen {
		return text
	}
	return text[:maxLen] + "..."
}

// timePtr returns a pointer to a time
func timePtr(t time.Time) *time.Time {
	return &t
}
