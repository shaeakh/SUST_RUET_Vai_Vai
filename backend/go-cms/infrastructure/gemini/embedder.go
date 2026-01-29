package gemini

import (
	"context"
	"fmt"
	"log"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// Embedder handles Gemini embeddings for text
type Embedder struct {
	client *genai.Client
	apiKey string
}

// NewEmbedder creates a new Gemini embedder
func NewEmbedder(apiKey string) (*Embedder, error) {
	client, err := genai.NewClient(context.Background(), option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}

	return &Embedder{client: client, apiKey: apiKey}, nil
}

// Embed generates an embedding for the given text using Gemini
func (e *Embedder) Embed(ctx context.Context, text string) ([]float32, error) {
	if text == "" {
		return nil, fmt.Errorf("text cannot be empty")
	}

	// Get the embedding model
	em := e.client.EmbeddingModel("models/embedding-001")

	// Create embedding request using the simpler API
	resp, err := em.EmbedContent(ctx, genai.Text(text))
	if err != nil {
		return nil, fmt.Errorf("failed to generate embedding: %w", err)
	}

	if resp.Embedding == nil || len(resp.Embedding.Values) == 0 {
		return nil, fmt.Errorf("empty embedding response from Gemini")
	}

	// Convert float64 to float32
	embedding := make([]float32, len(resp.Embedding.Values))
	for i, v := range resp.Embedding.Values {
		embedding[i] = float32(v)
	}

	return embedding, nil
}

// EmbedBatch generates embeddings for multiple texts
func (e *Embedder) EmbedBatch(ctx context.Context, texts []string) ([][]float32, error) {
	if len(texts) == 0 {
		return nil, fmt.Errorf("texts list cannot be empty")
	}

	embeddings := make([][]float32, 0, len(texts))

	// Process texts one by one
	for _, text := range texts {
		embedding, err := e.Embed(ctx, text)
		if err != nil {
			log.Printf("Warning: failed to embed text: %v", err)
			// Return zero embedding on error to continue processing
			embedding = make([]float32, 768)
		}
		embeddings = append(embeddings, embedding)
	}

	return embeddings, nil
}

// Close closes the Gemini client
func (e *Embedder) Close() error {
	return e.client.Close()
}

// GetAPIKey returns the API key (needed for creating new clients)
func (e *Embedder) GetAPIKey() string {
	return e.apiKey
}

// GetDimensions returns the embedding dimension (768 for Gemini embedding-001)
func (e *Embedder) GetDimensions() int {
	return 768
}
