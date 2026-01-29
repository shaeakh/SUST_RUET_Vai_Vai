package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/shaeakh/sust-cms/infrastructure/config"
)

// QueueMessage represents a message in the search queue
type QueueMessage struct {
	RequestID   string    `json:"request_id"`
	UserID      string    `json:"user_id"`
	ClassroomID string    `json:"classroom_id"`
	Query       string    `json:"query"`
	CreatedAt   time.Time `json:"created_at"`
}

// SearchQueue handles Redis-based search request queue
type SearchQueue struct {
	client *redis.Client
	queueKey string
}

// NewSearchQueue creates a new SearchQueue
func NewSearchQueue(cfg *config.Config) (*SearchQueue, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	// Test connection
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &SearchQueue{
		client:   client,
		queueKey: "search:queue",
	}, nil
}

// Enqueue adds a search request to the queue
func (sq *SearchQueue) Enqueue(ctx context.Context, msg *QueueMessage) error {
	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	// Add to queue (left push - LPUSH)
	if err := sq.client.LPush(ctx, sq.queueKey, data).Err(); err != nil {
		return fmt.Errorf("failed to enqueue message: %w", err)
	}

	// Also add to set for tracking
	trackingKey := fmt.Sprintf("search:request:%s", msg.RequestID)
	if err := sq.client.Set(ctx, trackingKey, data, 24*time.Hour).Err(); err != nil {
		return fmt.Errorf("failed to track request: %w", err)
	}

	return nil
}

// Dequeue retrieves a search request from the queue
func (sq *SearchQueue) Dequeue(ctx context.Context) (*QueueMessage, error) {
	// Right pop - RPOP (FIFO)
	result, err := sq.client.RPop(ctx, sq.queueKey).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, nil // Queue is empty
		}
		return nil, fmt.Errorf("failed to dequeue message: %w", err)
	}

	var msg QueueMessage
	if err := json.Unmarshal([]byte(result), &msg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal message: %w", err)
	}

	return &msg, nil
}

// DequeueWithTimeout retrieves a message with a timeout using BLPOP
func (sq *SearchQueue) DequeueWithTimeout(ctx context.Context, timeout time.Duration) (*QueueMessage, error) {
	result, err := sq.client.BRPop(ctx, timeout, sq.queueKey).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, nil // Timeout or queue empty
		}
		return nil, fmt.Errorf("failed to dequeue message: %w", err)
	}

	var msg QueueMessage
	if err := json.Unmarshal([]byte(result[1]), &msg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal message: %w", err)
	}

	return &msg, nil
}

// QueueLength returns the number of messages in the queue
func (sq *SearchQueue) QueueLength(ctx context.Context) (int64, error) {
	length, err := sq.client.LLen(ctx, sq.queueKey).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to get queue length: %w", err)
	}
	return length, nil
}

// GetRequestStatus retrieves the status of a search request
func (sq *SearchQueue) GetRequestStatus(ctx context.Context, requestID string) (string, error) {
	trackingKey := fmt.Sprintf("search:request:%s", requestID)
	status, err := sq.client.Get(ctx, trackingKey).Result()
	if err != nil {
		if err == redis.Nil {
			return "", fmt.Errorf("request not found: %s", requestID)
		}
		return "", fmt.Errorf("failed to get request status: %w", err)
	}
	return status, nil
}

// ClearQueue clears all messages from the queue (use carefully!)
func (sq *SearchQueue) ClearQueue(ctx context.Context) error {
	if err := sq.client.Del(ctx, sq.queueKey).Err(); err != nil {
		return fmt.Errorf("failed to clear queue: %w", err)
	}
	return nil
}

// Close closes the Redis connection
func (sq *SearchQueue) Close() error {
	return sq.client.Close()
}
