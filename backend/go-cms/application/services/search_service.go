package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/generative-ai-go/genai"
	"github.com/google/uuid"
	"google.golang.org/api/option"
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

// RAGResponse represents a RAG (Retrieval Augmented Generation) response
type RAGResponse struct {
	Query       string        `json:"query"`
	GeneratedAnswer string     `json:"generated_answer"`
	SourceChunks []SearchResult `json:"source_chunks"`
	ChunkCount  int           `json:"chunk_count"`
}

// RetrievalAugmentedGeneration performs semantic search and generates answer using Gemini
func (ss *SearchService) RetrievalAugmentedGeneration(ctx context.Context, query string, classroomID string, maxChunks int) (*RAGResponse, error) {
	// Step 1: Perform semantic search
	searchResults, err := ss.SemanticSearch(ctx, "", classroomID, query)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve documents: %w", err)
	}

	// Step 2: Limit number of chunks
	if maxChunks <= 0 {
		maxChunks = 10
	}
	if len(searchResults) > maxChunks {
		searchResults = searchResults[:maxChunks]
	}

	// Step 3: Build context from retrieved chunks
	var contextBuilder strings.Builder
	contextBuilder.WriteString("Based on the following course materials:\n\n")
	
	for i, result := range searchResults {
		contextBuilder.WriteString(fmt.Sprintf("[Source %d - %s (Week %d, Topic: %s)]\n%s\n\n",
			i+1, result.Title, result.Week, result.Topic, result.ChunkText))
	}

	// Step 4: Generate answer using Gemini
	systemPrompt := "You are an educational AI assistant helping students understand course materials. " +
		"Answer the student's question based on the provided course materials. " +
		"If the materials don't contain enough information to answer, say so clearly. " +
		"Cite which course materials you're referencing."

	generatedAnswer, err := ss.generateAnswerWithGemini(ctx, systemPrompt, contextBuilder.String(), query)
	if err != nil {
		return nil, fmt.Errorf("failed to generate answer: %w", err)
	}

	return &RAGResponse{
		Query:           query,
		GeneratedAnswer: generatedAnswer,
		SourceChunks:    searchResults,
		ChunkCount:      len(searchResults),
	}, nil
}

// generateAnswerWithGemini generates an answer using Gemini API
func (ss *SearchService) generateAnswerWithGemini(ctx context.Context, systemPrompt, context, question string) (string, error) {
	// Create Gemini client using the embedder's API key
	client, err := genai.NewClient(ctx, option.WithAPIKey(ss.geminiEmbedder.GetAPIKey()))
	if err != nil {
		return "", fmt.Errorf("failed to create Gemini client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")

	// Build the prompt with system instruction embedded
	fullPrompt := fmt.Sprintf("%s\n\nCourse Materials:\n%s\n\nStudent Question: %s\n\nProvide a clear, concise answer based on the materials above.",
		systemPrompt, context, question)

	// Generate response
	resp, err := model.GenerateContent(ctx, genai.Text(fullPrompt))
	if err != nil {
		return "", fmt.Errorf("failed to generate content: %w", err)
	}

	// Extract text from response
	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no content in response")
	}

	answer := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	return answer, nil
}
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
