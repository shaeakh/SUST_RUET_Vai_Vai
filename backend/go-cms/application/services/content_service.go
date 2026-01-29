package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/shaeakh/sust-cms/domain/entities"
	"github.com/shaeakh/sust-cms/domain/repositories"
	"github.com/shaeakh/sust-cms/infrastructure/gemini"
	"github.com/shaeakh/sust-cms/infrastructure/queue"
)

// ContentService handles content management operations
type ContentService struct {
	contentRepo      repositories.ContentRepository
	embeddingRepo    repositories.ContentEmbeddingRepository
	geminiEmbedder   *gemini.Embedder
	embeddingQueue   *queue.EmbeddingQueue
}

// NewContentService creates a new ContentService
func NewContentService(
	contentRepo repositories.ContentRepository,
	embeddingRepo repositories.ContentEmbeddingRepository,
	geminiEmbedder *gemini.Embedder,
	embeddingQueue *queue.EmbeddingQueue,
) *ContentService {
	return &ContentService{
		contentRepo:    contentRepo,
		embeddingRepo:  embeddingRepo,
		geminiEmbedder: geminiEmbedder,
		embeddingQueue: embeddingQueue,
	}
}

// UploadContent uploads new content to a classroom
func (cs *ContentService) UploadContent(ctx context.Context, classroomID, title, description string, contentType, category, topic string, week int, tags []string, uploadedBy, fileURL string, fileSize int64, mimeType string) (*entities.Content, error) {
	content := &entities.Content{
		ID:          uuid.New().String(),
		ClassroomID: classroomID,
		Title:       title,
		Description: description,
		ContentType: entities.ContentType(contentType),
		Category:    entities.ContentCategory(category),
		Topic:       topic,
		Week:        week,
		Tags:        tags,
		UploadedBy:  uploadedBy,
		FileURL:     fileURL,
		FileSize:    fileSize,
		MimeType:    mimeType,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := cs.contentRepo.Save(ctx, content); err != nil {
		return nil, fmt.Errorf("failed to save content: %w", err)
	}

	// Enqueue embedding generation job in background
	job := &queue.EmbeddingJob{
		JobID:       uuid.New().String(),
		ContentID:   content.ID,
		ClassroomID: classroomID,
		FileURL:     fileURL,
		Title:       title,
		MimeType:    mimeType,
		CreatedAt:   time.Now(),
		Retries:     0,
	}

	if err := cs.embeddingQueue.Enqueue(ctx, job); err != nil {
		// Log the error but don't fail the upload - embeddings can be generated later
		fmt.Printf("Warning: Failed to enqueue embedding job: %v\n", err)
	}

	return content, nil
}

// GenerateEmbeddings generates and stores embeddings for content
func (cs *ContentService) GenerateEmbeddings(ctx context.Context, contentID, text string) error {
	// Chunk the text intelligently
	chunks := cs.chunkText(text)

	for chunkIndex, chunk := range chunks {
		// Skip empty chunks
		if strings.TrimSpace(chunk) == "" {
			continue
		}

		// Validate UTF-8
		if !isValidUTF8(chunk) {
			fmt.Printf("Skipping chunk %d: invalid UTF-8 content\n", chunkIndex)
			continue
		}

		// Generate embedding
		embedding, err := cs.geminiEmbedder.Embed(ctx, chunk)
		if err != nil {
			// Log and skip problematic chunks instead of failing entire batch
			fmt.Printf("Warning: Failed to generate embedding for chunk %d: %v\n", chunkIndex, err)
			continue
		}

		// Prepare metadata
		metadata := map[string]interface{}{
			"chunk_index": chunkIndex,
			"chunk_size":  len(chunk),
			"embedding_model": "gemini-embedding-001",
		}
		metadataJSON, _ := json.Marshal(metadata)

		// Store embedding
		contentEmb := &entities.ContentEmbedding{
			ID:        uuid.New().String(),
			ContentID: contentID,
			ChunkIndex: chunkIndex,
			ChunkText:  chunk,
			Embedding: embedding,
			Metadata:  string(metadataJSON),
			CreatedAt: time.Now(),
		}

		if err := cs.embeddingRepo.Save(ctx, contentEmb); err != nil {
			return fmt.Errorf("failed to save embedding: %w", err)
		}
	}

	return nil
}

// isValidUTF8 checks if a string contains only valid UTF-8
func isValidUTF8(s string) bool {
	for _, r := range s {
		if r == '\uFFFD' {
			return false
		}
	}
	return true
}

// GetContent retrieves content by ID
func (cs *ContentService) GetContent(ctx context.Context, contentID string) (*entities.Content, error) {
	return cs.contentRepo.FindByID(ctx, contentID)
}

// ListContentByClassroom lists content in a classroom with pagination
func (cs *ContentService) ListContentByClassroom(ctx context.Context, classroomID string, limit, offset int) ([]*entities.Content, error) {
	return cs.contentRepo.ListByClassroom(ctx, classroomID, limit, offset)
}

// ListContentByTopic lists content by topic
func (cs *ContentService) ListContentByTopic(ctx context.Context, classroomID, topic string, limit, offset int) ([]*entities.Content, error) {
	return cs.contentRepo.ListByTopic(ctx, classroomID, topic, limit, offset)
}

// ListContentByWeek lists content by week
func (cs *ContentService) ListContentByWeek(ctx context.Context, classroomID string, week int, limit, offset int) ([]*entities.Content, error) {
	return cs.contentRepo.ListByWeek(ctx, classroomID, week, limit, offset)
}

// UpdateContent updates content metadata
func (cs *ContentService) UpdateContent(ctx context.Context, content *entities.Content) error {
	return cs.contentRepo.Update(ctx, content)
}

// DeleteContent soft deletes content
func (cs *ContentService) DeleteContent(ctx context.Context, contentID string) error {
	return cs.contentRepo.Delete(ctx, contentID)
}

// chunkText intelligently chunks text for embedding
// Uses a simple sliding window approach, but can be enhanced for code awareness
func (cs *ContentService) chunkText(text string) []string {
	const (
		maxChunkSize = 500  // characters per chunk
		overlap      = 100  // characters of overlap between chunks
	)

	var chunks []string
	lines := strings.Split(text, "\n")

	var currentChunk string
	for _, line := range lines {
		if len(currentChunk)+len(line) > maxChunkSize {
			if currentChunk != "" {
				chunks = append(chunks, currentChunk)
				// Keep last part for overlap
				parts := strings.Split(currentChunk, " ")
				if len(parts) > overlap/10 {
					currentChunk = strings.Join(parts[len(parts)-overlap/10:], " ") + "\n" + line
				} else {
					currentChunk = line
				}
			}
		} else {
			if currentChunk != "" {
				currentChunk += "\n"
			}
			currentChunk += line
		}
	}

	if currentChunk != "" {
		chunks = append(chunks, currentChunk)
	}

	// Ensure we have at least one chunk
	if len(chunks) == 0 {
		chunks = append(chunks, text)
	}

	return chunks
}

// ExtractCodeBlocks extracts code blocks from text for syntax-aware search
func (cs *ContentService) ExtractCodeBlocks(text string) []map[string]string {
	var codeBlocks []map[string]string
	lines := strings.Split(text, "\n")

	var inCodeBlock bool
	var currentBlock strings.Builder
	var language string

	for _, line := range lines {
		// Check for code block markers (``` or ~~~)
		if strings.HasPrefix(strings.TrimSpace(line), "```") || strings.HasPrefix(strings.TrimSpace(line), "~~~") {
			if inCodeBlock {
				codeBlocks = append(codeBlocks, map[string]string{
					"language": language,
					"code":     currentBlock.String(),
				})
				currentBlock.Reset()
				inCodeBlock = false
			} else {
				inCodeBlock = true
				language = strings.TrimPrefix(strings.TrimSpace(line), "```")
				language = strings.TrimPrefix(language, "~~~")
			}
		} else if inCodeBlock {
			currentBlock.WriteString(line + "\n")
		}
	}

	return codeBlocks
}
