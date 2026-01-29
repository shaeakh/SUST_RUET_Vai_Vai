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
) {
	// Create handlers
	authHandler := handlers.NewAuthHandler(authService)
	classroomHandler := handlers.NewClassroomHandler(classroomService)
	contentHandler := handlers.NewContentHandler(contentService)
	searchHandler := handlers.NewSearchHandler(searchService)

	// Middleware
	rateLimiter := middleware.NewRateLimiter(100)

	// Apply global middleware
	router.Use(middleware.CORS)
	router.Use(middleware.RequestLogger)
	router.Use(middleware.RateLimit(rateLimiter))

	// Public routes (no auth required)
	publicRoutes := router.PathPrefix("/api/v1/auth").Subrouter()
	publicRoutes.HandleFunc("/register", authHandler.Register).Methods("POST")
	publicRoutes.HandleFunc("/login", authHandler.Login).Methods("POST")

	// Protected routes (auth required)
	protectedRoutes := router.PathPrefix("/api/v1").Subrouter()
	protectedRoutes.Use(middleware.JWTAuth(authService))

	// Auth routes
	protectedRoutes.HandleFunc("/auth/refresh", authHandler.RefreshToken).Methods("POST")

	// Classroom routes
	classroomRoutes := protectedRoutes.PathPrefix("/classrooms").Subrouter()
	classroomRoutes.HandleFunc("", classroomHandler.CreateClassroom).Methods("POST")
	classroomRoutes.HandleFunc("/join", classroomHandler.JoinClassroom).Methods("POST")
	classroomRoutes.HandleFunc("/my-classrooms", classroomHandler.ListClassroomsByStudent).Methods("GET")
	classroomRoutes.HandleFunc("/instructor", classroomHandler.ListClassroomsByInstructor).Methods("GET")
	classroomRoutes.HandleFunc("/{id}", classroomHandler.GetClassroom).Methods("GET")
	classroomRoutes.HandleFunc("/{id}", classroomHandler.UpdateClassroom).Methods("PUT")
	classroomRoutes.HandleFunc("/{id}", classroomHandler.DeleteClassroom).Methods("DELETE")
	classroomRoutes.HandleFunc("/{id}/members", classroomHandler.ListClassroomMembers).Methods("GET")

	// Content routes
	contentRoutes := protectedRoutes.PathPrefix("/classrooms/{classroom_id}/content").Subrouter()
	contentRoutes.HandleFunc("", contentHandler.UploadContent).Methods("POST")
	contentRoutes.HandleFunc("", contentHandler.ListContentByClassroom).Methods("GET")
	contentRoutes.HandleFunc("/{content_id}", contentHandler.GetContent).Methods("GET")
	contentRoutes.HandleFunc("/topic/{topic}", contentHandler.ListContentByTopic).Methods("GET")
	contentRoutes.HandleFunc("/week/{week}", contentHandler.ListContentByWeek).Methods("GET")

	// Search routes
	searchRoutes := protectedRoutes.PathPrefix("/classrooms/{classroom_id}/search").Subrouter()
	searchRoutes.HandleFunc("", searchHandler.SemanticSearch).Methods("POST")
	searchRoutes.HandleFunc("/queue", searchHandler.EnqueueSearch).Methods("POST")
	searchRoutes.HandleFunc("/history", searchHandler.GetSearchHistory).Methods("GET")

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods("GET")
}
