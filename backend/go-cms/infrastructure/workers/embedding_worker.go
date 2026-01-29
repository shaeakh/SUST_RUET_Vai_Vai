package workers

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/shaeakh/sust-cms/application/services"
	"github.com/shaeakh/sust-cms/infrastructure/queue"
)

// EmbeddingWorker processes embedding generation jobs
type EmbeddingWorker struct {
	embeddingQueue  *queue.EmbeddingQueue
	contentService  *services.ContentService
	workerID        string
	stopChan        chan bool
	isRunning       bool
}

// NewEmbeddingWorker creates a new embedding worker
func NewEmbeddingWorker(
	embeddingQueue *queue.EmbeddingQueue,
	contentService *services.ContentService,
	workerID string,
) *EmbeddingWorker {
	return &EmbeddingWorker{
		embeddingQueue: embeddingQueue,
		contentService: contentService,
		workerID:       workerID,
		stopChan:       make(chan bool),
		isRunning:      false,
	}
}

// Start starts the worker
func (ew *EmbeddingWorker) Start() {
	if ew.isRunning {
		log.Printf("[Worker %s] Already running\n", ew.workerID)
		return
	}

	ew.isRunning = true
	log.Printf("[Worker %s] Starting embedding worker\n", ew.workerID)

	go ew.run()
}

// Stop stops the worker
func (ew *EmbeddingWorker) Stop() {
	if !ew.isRunning {
		return
	}
	ew.stopChan <- true
	ew.isRunning = false
	log.Printf("[Worker %s] Stopped\n", ew.workerID)
}

// run is the main worker loop
func (ew *EmbeddingWorker) run() {
	ctx := context.Background()
	ticker := time.NewTicker(10 * time.Second) // Health check interval
	defer ticker.Stop()

	for {
		select {
		case <-ew.stopChan:
			return

		default:
			// Try to dequeue and process a job
			job, err := ew.embeddingQueue.Dequeue(ctx)
			if err != nil {
				log.Printf("[Worker %s] Error dequeuing job: %v\n", ew.workerID, err)
				time.Sleep(1 * time.Second)
				continue
			}

			if job == nil {
				// Queue is empty, sleep a bit
				time.Sleep(100 * time.Millisecond)
				continue
			}

			// Process the job
			ew.processJob(ctx, job)

		case <-ticker.C:
			// Optional: log worker health
			// log.Printf("[Worker %s] Healthy\n", ew.workerID)
		}
	}
}

// processJob processes a single embedding job
func (ew *EmbeddingWorker) processJob(ctx context.Context, job *queue.EmbeddingJob) {
	log.Printf("[Worker %s] Processing job %s for content %s\n", ew.workerID, job.JobID, job.ContentID)

	// Step 1: Extract text from file
	text, err := ew.extractTextFromFile(ctx, job.FileURL, job.MimeType)
	if err != nil {
		log.Printf("[Worker %s] Error extracting text: %v\n", ew.workerID, err)
		_ = ew.embeddingQueue.MarkFailed(ctx, job, err)
		return
	}

	if text == "" {
		log.Printf("[Worker %s] No text extracted from file\n", ew.workerID)
		_ = ew.embeddingQueue.MarkComplete(ctx, job)
		return
	}

	// Step 2: Generate embeddings
	err = ew.contentService.GenerateEmbeddings(ctx, job.ContentID, text)
	if err != nil {
		log.Printf("[Worker %s] Error generating embeddings: %v\n", ew.workerID, err)
		_ = ew.embeddingQueue.MarkFailed(ctx, job, err)
		return
	}

	// Step 3: Mark as complete
	err = ew.embeddingQueue.MarkComplete(ctx, job)
	if err != nil {
		log.Printf("[Worker %s] Error marking job complete: %v\n", ew.workerID, err)
		return
	}

	log.Printf("[Worker %s] Successfully processed job %s\n", ew.workerID, job.JobID)
}

// extractTextFromFile extracts text from a file
// Supports: PDFs, text files, and other formats
func (ew *EmbeddingWorker) extractTextFromFile(ctx context.Context, fileURL, mimeType string) (string, error) {
	// Check if it's a local file path (absolute, relative, or uploads directory)
	isLocalFile := strings.HasPrefix(fileURL, "/") || 
		strings.HasPrefix(fileURL, "./") || 
		strings.HasPrefix(fileURL, "../") ||
		strings.HasPrefix(fileURL, "uploads/") ||
		(!strings.HasPrefix(fileURL, "http://") && !strings.HasPrefix(fileURL, "https://"))
	
	if isLocalFile {
		// Local file
		content, err := os.ReadFile(fileURL)
		if err != nil {
			return "", fmt.Errorf("failed to read file: %w", err)
		}
		return ew.extractTextFromBytes(content, mimeType)
	}

	// Download from URL
	resp, err := http.Get(fileURL)
	if err != nil {
		return "", fmt.Errorf("failed to download file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to download file: status code %d", resp.StatusCode)
	}

	// Read file content
	content, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read file content: %w", err)
	}

	return ew.extractTextFromBytes(content, mimeType)
}

// extractTextFromBytes extracts text from file bytes based on mime type
func (ew *EmbeddingWorker) extractTextFromBytes(content []byte, mimeType string) (string, error) {
	switch {
	case strings.Contains(mimeType, "pdf"):
		return ew.extractTextFromPDF(content)
	case strings.Contains(mimeType, "image"):
		return ew.extractTextFromImage(content)
	case strings.Contains(mimeType, "text"):
		return string(content), nil
	default:
		// For unsupported types, return basic metadata
		return fmt.Sprintf("File: content extracted from %s", mimeType), nil
	}
}

// extractTextFromPDF extracts text from PDF
// Note: Full PDF text extraction requires additional setup (Tesseract or dedicated PDF library)
// For now, we return metadata about the PDF and store it for processing later
func (ew *EmbeddingWorker) extractTextFromPDF(content []byte) (string, error) {
	// For now, return a placeholder that includes basic metadata
	// In production, integrate with Tesseract OCR or a dedicated PDF library
	sizeKB := len(content) / 1024
	text := fmt.Sprintf("PDF Document [Size: %d KB]. Content indexed for semantic search. For OCR extraction, please upload plain text (.txt) files or ensure PDFs contain embedded text.", sizeKB)
	
	log.Printf("Note: PDF text extraction not fully implemented. Storing PDF for semantic search using document metadata.")
	return text, nil
}

// extractTextFromImage extracts text from image using OCR (stub)
// TODO: Implement with Tesseract or Google Vision API
func (ew *EmbeddingWorker) extractTextFromImage(content []byte) (string, error) {
	log.Println("Note: OCR extraction not yet implemented. Add Tesseract or Vision API.")
	return "Image content extraction placeholder. Please configure OCR library.", nil
}

// IsRunning returns whether the worker is running
func (ew *EmbeddingWorker) IsRunning() bool {
	return ew.isRunning
}
