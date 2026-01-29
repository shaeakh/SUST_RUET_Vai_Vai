package http

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/shaeakh/sust-cms/application/services"
	"github.com/shaeakh/sust-cms/interfaces/http/handlers"
	"github.com/shaeakh/sust-cms/interfaces/http/middleware"
)

// SetupRoutes sets up all API routes
func SetupRoutes(
	router *mux.Router,
	authService *services.AuthService,
	classroomService *services.ClassroomService,
	contentService *services.ContentService,
	searchService *services.SearchService,
	contentGenService *services.ContentGenerationService,
) {
	// Create handlers
	authHandler := handlers.NewAuthHandler(authService)
	classroomHandler := handlers.NewClassroomHandler(classroomService)
	contentHandler := handlers.NewContentHandler(contentService)
	searchHandler := handlers.NewSearchHandler(searchService)
	contentGenHandler := handlers.NewContentGenerationHandler(contentGenService)

	// Middleware
	rateLimiter := middleware.NewRateLimiter(100)

	// Apply global middleware
	router.Use(middleware.CORS)
	router.Use(middleware.RequestLogger)
	router.Use(middleware.RateLimit(rateLimiter))

	// Public routes (no auth required)
	publicRoutes := router.PathPrefix("/api/v1/auth").Subrouter()
	publicRoutes.HandleFunc("/register", authHandler.Register).Methods("POST", "OPTIONS")
	publicRoutes.HandleFunc("/login", authHandler.Login).Methods("POST", "OPTIONS")

	// Protected routes (auth required)
	protectedRoutes := router.PathPrefix("/api/v1").Subrouter()
	protectedRoutes.Use(middleware.JWTAuth(authService))

	// Auth routes
	protectedRoutes.HandleFunc("/auth/refresh", authHandler.RefreshToken).Methods("POST", "OPTIONS")

	// Classroom routes
	classroomRoutes := protectedRoutes.PathPrefix("/classrooms").Subrouter()
	classroomRoutes.HandleFunc("", classroomHandler.CreateClassroom).Methods("POST", "OPTIONS")
	classroomRoutes.HandleFunc("/join", classroomHandler.JoinClassroom).Methods("POST", "OPTIONS")
	classroomRoutes.HandleFunc("/my-classrooms", classroomHandler.ListClassroomsByStudent).Methods("GET", "OPTIONS")
	classroomRoutes.HandleFunc("/instructor", classroomHandler.ListClassroomsByInstructor).Methods("GET", "OPTIONS")
	classroomRoutes.HandleFunc("/{id}", classroomHandler.GetClassroom).Methods("GET", "OPTIONS")
	classroomRoutes.HandleFunc("/{id}", classroomHandler.UpdateClassroom).Methods("PUT", "OPTIONS")
	classroomRoutes.HandleFunc("/{id}", classroomHandler.DeleteClassroom).Methods("DELETE", "OPTIONS")
	classroomRoutes.HandleFunc("/{id}/members", classroomHandler.ListClassroomMembers).Methods("GET", "OPTIONS")

	// Content routes
	contentRoutes := protectedRoutes.PathPrefix("/classrooms/{classroom_id}/content").Subrouter()
	contentRoutes.HandleFunc("", contentHandler.UploadContent).Methods("POST", "OPTIONS")
	contentRoutes.HandleFunc("", contentHandler.ListContentByClassroom).Methods("GET", "OPTIONS")
	contentRoutes.HandleFunc("/{content_id}", contentHandler.GetContent).Methods("GET", "OPTIONS")
	contentRoutes.HandleFunc("/topic/{topic}", contentHandler.ListContentByTopic).Methods("GET", "OPTIONS")
	contentRoutes.HandleFunc("/week/{week}", contentHandler.ListContentByWeek).Methods("GET", "OPTIONS")

	// Search routes
	searchRoutes := protectedRoutes.PathPrefix("/classrooms/{classroom_id}/search").Subrouter()
	searchRoutes.HandleFunc("", searchHandler.SemanticSearch).Methods("POST", "OPTIONS")
	searchRoutes.HandleFunc("/rag", searchHandler.RAGSearch).Methods("POST", "OPTIONS")
	searchRoutes.HandleFunc("/queue", searchHandler.EnqueueSearch).Methods("POST", "OPTIONS")
	searchRoutes.HandleFunc("/history", searchHandler.GetSearchHistory).Methods("GET", "OPTIONS")

	// Content Generation routes (AI-powered study material generation)
	genRoutes := protectedRoutes.PathPrefix("/classrooms/{classroom_id}/generate").Subrouter()
	genRoutes.HandleFunc("/study-material", contentGenHandler.GenerateStudyMaterial).Methods("POST", "OPTIONS")
	genRoutes.HandleFunc("/study-material/preview", contentGenHandler.PreviewStudyMaterial).Methods("POST", "OPTIONS")
	genRoutes.HandleFunc("/study-material/download", contentGenHandler.DownloadStudyMaterial).Methods("POST", "OPTIONS")

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods("GET")
}
