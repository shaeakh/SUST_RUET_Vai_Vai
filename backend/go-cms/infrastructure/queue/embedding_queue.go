package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// EmbeddingJob represents an embedding generation job
type EmbeddingJob struct {
	JobID      string    `json:"job_id"`
	ContentID  string    `json:"content_id"`
	ClassroomID string   `json:"classroom_id"`
	FileURL    string    `json:"file_url"`
	Title      string    `json:"title"`
	MimeType   string    `json:"mime_type"`
	CreatedAt  time.Time `json:"created_at"`
	Retries    int       `json:"retries"`
}

// EmbeddingQueue manages embedding generation jobs
type EmbeddingQueue struct {
	client *redis.Client
}

const (
	EmbeddingQueueKey   = "embedding:queue"
	EmbeddingProcessing = "embedding:processing"
	EmbeddingDeadletter = "embedding:deadletter"
	MaxRetries          = 3
)

// NewEmbeddingQueue creates a new embedding queue
func NewEmbeddingQueue(client *redis.Client) *EmbeddingQueue {
	return &EmbeddingQueue{client: client}
}

// Enqueue adds a new embedding job to the queue
func (eq *EmbeddingQueue) Enqueue(ctx context.Context, job *EmbeddingJob) error {
	jobJSON, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to marshal job: %w", err)
	}

	err = eq.client.LPush(ctx, EmbeddingQueueKey, jobJSON).Err()
	if err != nil {
		return fmt.Errorf("failed to enqueue job: %w", err)
	}

	return nil
}

// Dequeue gets the next job from the queue
func (eq *EmbeddingQueue) Dequeue(ctx context.Context) (*EmbeddingJob, error) {
	result, err := eq.client.BRPop(ctx, 5*time.Second, EmbeddingQueueKey).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, nil // Queue empty
		}
		return nil, fmt.Errorf("failed to dequeue job: %w", err)
	}

	if len(result) < 2 {
		return nil, fmt.Errorf("invalid dequeue result")
	}

	var job EmbeddingJob
	if err := json.Unmarshal([]byte(result[1]), &job); err != nil {
		return nil, fmt.Errorf("failed to unmarshal job: %w", err)
	}

	// Add to processing set
	jobJSON, _ := json.Marshal(job)
	_ = eq.client.SAdd(ctx, EmbeddingProcessing, jobJSON).Err()

	return &job, nil
}

// MarkComplete removes job from processing set
func (eq *EmbeddingQueue) MarkComplete(ctx context.Context, job *EmbeddingJob) error {
	jobJSON, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to marshal job: %w", err)
	}

	return eq.client.SRem(ctx, EmbeddingProcessing, jobJSON).Err()
}

// MarkFailed moves job to dead letter queue or re-enqueues
func (eq *EmbeddingQueue) MarkFailed(ctx context.Context, job *EmbeddingJob, err error) error {
	job.Retries++

	if job.Retries >= MaxRetries {
		// Move to dead letter queue
		jobJSON, _ := json.Marshal(job)
		return eq.client.LPush(ctx, EmbeddingDeadletter, jobJSON).Err()
	}

	// Re-enqueue
	return eq.Enqueue(ctx, job)
}

// GetQueueStats returns queue statistics
func (eq *EmbeddingQueue) GetQueueStats(ctx context.Context) (map[string]interface{}, error) {
	pending, err := eq.client.LLen(ctx, EmbeddingQueueKey).Result()
	if err != nil {
		return nil, err
	}

	processing, err := eq.client.SCard(ctx, EmbeddingProcessing).Result()
	if err != nil {
		return nil, err
	}

	deadletter, err := eq.client.LLen(ctx, EmbeddingDeadletter).Result()
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"pending":      pending,
		"processing":   processing,
		"deadletter":   deadletter,
	}, nil
}
