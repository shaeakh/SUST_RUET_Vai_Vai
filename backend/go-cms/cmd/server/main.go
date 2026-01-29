package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/shaeakh/sust-cms/application/services"
	"github.com/shaeakh/sust-cms/infrastructure/config"
	"github.com/shaeakh/sust-cms/infrastructure/gemini"
	"github.com/shaeakh/sust-cms/infrastructure/postgres"
	"github.com/shaeakh/sust-cms/infrastructure/redis"
	httputil "github.com/shaeakh/sust-cms/interfaces/http"
)

func main() {
	// Load environment variables
	_ = godotenv.Load()

	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database connection
	db, err := postgres.NewConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize repositories
	userRepo := postgres.NewUserRepository(db)
	classroomRepo := postgres.NewClassroomRepository(db)
	classroomMemberRepo := postgres.NewClassroomMemberRepository(db)
	contentRepo := postgres.NewContentRepository(db)
	embeddingRepo := postgres.NewContentEmbeddingRepository(db)
	searchReqRepo := postgres.NewSearchRequestRepository(db)

	// Initialize Redis queue
	searchQueue, err := redis.NewSearchQueue(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer searchQueue.Close()

	// Initialize Gemini embedder
	if cfg.GeminiAPIKey == "" {
		log.Fatalf("GEMINI_API_KEY is required. Please set it in your .env file")
	}

	geminiEmbedder, err := gemini.NewEmbedder(cfg.GeminiAPIKey)
	if err != nil {
		log.Fatalf("Failed to initialize Gemini embedder: %v", err)
	}
	defer geminiEmbedder.Close()

	log.Printf("✓ Gemini embedder initialized (embedding dimension: %d)", geminiEmbedder.GetDimensions())

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWTSecret, cfg.JWTExpiration)
	classroomService := services.NewClassroomService(classroomRepo, classroomMemberRepo)
	contentService := services.NewContentService(contentRepo, embeddingRepo, geminiEmbedder)
	searchService := services.NewSearchService(embeddingRepo, contentRepo, searchReqRepo, geminiEmbedder, searchQueue)

	// Setup router
	router := mux.NewRouter()
	httputil.SetupRoutes(router, authService, classroomService, contentService, searchService)

	// Create server
	server := &http.Server{
		Addr:           fmt.Sprintf("%s:%d", cfg.ServerHost, cfg.ServerPort),
		Handler:        router,
		ReadTimeout:    15 * time.Second,
		WriteTimeout:   15 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	<-sigChan

	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
	}

	log.Println("Server stopped")
}

// Add missing Server type (http package uses net/http, not ours)
type Server struct {
	Addr           string
	Handler        http.Handler
	ReadTimeout    time.Duration
	WriteTimeout   time.Duration
	MaxHeaderBytes int
}
