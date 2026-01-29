package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/shaeakh/sust-cms/application/services"
	"github.com/shaeakh/sust-cms/interfaces/http/types"
)

// ContentHandler handles content endpoints
type ContentHandler struct {
	contentService *services.ContentService
}

// NewContentHandler creates a new ContentHandler
func NewContentHandler(contentService *services.ContentService) *ContentHandler {
	return &ContentHandler{contentService: contentService}
}

// UploadContent handles content upload (multipart form data)
func (ch *ContentHandler) UploadContent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["classroom_id"]

	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	// Parse multipart form (32 MB max)
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		fmt.Printf("ParseMultipartForm error: %v\n", err)
		fmt.Printf("Content-Type header: %s\n", r.Header.Get("Content-Type"))
		types.WriteError(w, http.StatusBadRequest, fmt.Sprintf("Invalid multipart form: %v", err), "INVALID_REQUEST")
		return
	}

	// Required fields
	title := r.FormValue("title")
	description := r.FormValue("description")
	contentType := r.FormValue("content_type")
	category := r.FormValue("category")
	topic := r.FormValue("topic")
	weekStr := r.FormValue("week")

	if title == "" || contentType == "" || category == "" {
		types.WriteError(w, http.StatusBadRequest, "Missing required fields", "INVALID_REQUEST")
		return
	}

	week := 0
	if weekStr != "" {
		w, _ := strconv.Atoi(weekStr)
		week = w
	}

	// Parse tags (comma-separated or multiple tag values)
	tags := r.Form["tags"]

	// Get file from multipart
	file, handler, err := r.FormFile("file")
	if err != nil {
		types.WriteError(w, http.StatusBadRequest, "No file provided", "INVALID_REQUEST")
		return
	}
	defer file.Close()

	// Create uploads directory if it doesn't exist
	uploadsDir := "uploads"
	os.MkdirAll(uploadsDir, 0755)

	// Generate unique filename
	uniqueID := uuid.New().String()
	filename := filepath.Join(uploadsDir, uniqueID+"_"+handler.Filename)

	// Save file to disk
	dst, err := os.Create(filename)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to save file", "UPLOAD_FAILED")
		return
	}
	defer dst.Close()

	fileSize, err := io.Copy(dst, file)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to write file", "UPLOAD_FAILED")
		return
	}

	// Get MIME type from handler or detect from extension
	mimeType := handler.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = detectMimeType(handler.Filename)
	}

	// Upload content with local file path
	content, err := ch.contentService.UploadContent(
		r.Context(),
		classroomID,
		title,
		description,
		contentType,
		category,
		topic,
		week,
		tags,
		userID,
		filename, // Use local file path instead of URL
		fileSize,
		mimeType,
	)
	if err != nil {
		// Clean up file if upload fails
		os.Remove(filename)
		// Log the actual error for debugging
		fmt.Printf("Content upload error: %v\n", err)
		types.WriteError(w, http.StatusInternalServerError, "Failed to upload content", "UPLOAD_FAILED")
		return
	}

	response := types.ContentResponse{
		ID:          content.ID,
		ClassroomID: content.ClassroomID,
		Title:       content.Title,
		Description: content.Description,
		ContentType: string(content.ContentType),
		Category:    string(content.Category),
		Topic:       content.Topic,
		Week:        content.Week,
		Tags:        content.Tags,
		UploadedBy:  content.UploadedBy,
		FileURL:     content.FileURL,
		CreatedAt:   content.CreatedAt.String(),
	}

	types.WriteJSON(w, http.StatusCreated, response)
}

// detectMimeType detects MIME type from filename
func detectMimeType(filename string) string {
	ext := filepath.Ext(filename)
	switch ext {
	case ".pdf":
		return "application/pdf"
	case ".txt":
		return "text/plain"
	case ".doc", ".docx":
		return "application/msword"
	case ".ppt", ".pptx":
		return "application/vnd.ms-powerpoint"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	default:
		return "application/octet-stream"
	}
}

// GetContent retrieves content by ID
func (ch *ContentHandler) GetContent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	contentID := vars["content_id"]

	content, err := ch.contentService.GetContent(r.Context(), contentID)
	if err != nil {
		types.WriteError(w, http.StatusNotFound, "Content not found", "NOT_FOUND")
		return
	}

	response := types.ContentResponse{
		ID:          content.ID,
		ClassroomID: content.ClassroomID,
		Title:       content.Title,
		Description: content.Description,
		ContentType: string(content.ContentType),
		Category:    string(content.Category),
		Topic:       content.Topic,
		Week:        content.Week,
		Tags:        content.Tags,
		UploadedBy:  content.UploadedBy,
		FileURL:     content.FileURL,
		CreatedAt:   content.CreatedAt.String(),
	}

	types.WriteJSON(w, http.StatusOK, response)
}

// ListContentByClassroom lists content in a classroom
func (ch *ContentHandler) ListContentByClassroom(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["classroom_id"]

	// Parse pagination parameters
	page := 1
	limit := 20
	if p := r.URL.Query().Get("page"); p != "" {
		if pageNum, err := strconv.Atoi(p); err == nil && pageNum > 0 {
			page = pageNum
		}
	}
	if l := r.URL.Query().Get("limit"); l != "" {
		if limitNum, err := strconv.Atoi(l); err == nil && limitNum > 0 && limitNum <= 100 {
			limit = limitNum
		}
	}

	offset := (page - 1) * limit

	contents, err := ch.contentService.ListContentByClassroom(r.Context(), classroomID, limit, offset)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to list content", "LIST_FAILED")
		return
	}

	var responses []types.ContentResponse
	for _, content := range contents {
		responses = append(responses, types.ContentResponse{
			ID:          content.ID,
			ClassroomID: content.ClassroomID,
			Title:       content.Title,
			Description: content.Description,
			ContentType: string(content.ContentType),
			Category:    string(content.Category),
			Topic:       content.Topic,
			Week:        content.Week,
			Tags:        content.Tags,
			UploadedBy:  content.UploadedBy,
			FileURL:     content.FileURL,
			CreatedAt:   content.CreatedAt.String(),
		})
	}

	types.WriteJSON(w, http.StatusOK, types.PaginatedResponse{
		Items:      responses,
		Total:      len(responses),
		Page:       page,
		Limit:      limit,
		TotalPages: (len(responses) + limit - 1) / limit,
	})
}

// ListContentByTopic lists content by topic
func (ch *ContentHandler) ListContentByTopic(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["classroom_id"]
	topic := vars["topic"]

	page := 1
	limit := 20
	if p := r.URL.Query().Get("page"); p != "" {
		if pageNum, err := strconv.Atoi(p); err == nil && pageNum > 0 {
			page = pageNum
		}
	}

	offset := (page - 1) * limit

	contents, err := ch.contentService.ListContentByTopic(r.Context(), classroomID, topic, limit, offset)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to list content", "LIST_FAILED")
		return
	}

	var responses []types.ContentResponse
	for _, content := range contents {
		responses = append(responses, types.ContentResponse{
			ID:          content.ID,
			ClassroomID: content.ClassroomID,
			Title:       content.Title,
			Description: content.Description,
			ContentType: string(content.ContentType),
			Category:    string(content.Category),
			Topic:       content.Topic,
			Week:        content.Week,
			Tags:        content.Tags,
			UploadedBy:  content.UploadedBy,
			FileURL:     content.FileURL,
			CreatedAt:   content.CreatedAt.String(),
		})
	}

	types.WriteJSON(w, http.StatusOK, responses)
}

// ListContentByWeek lists content by week
func (ch *ContentHandler) ListContentByWeek(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["classroom_id"]
	week, err := strconv.Atoi(vars["week"])
	if err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid week parameter", "INVALID_PARAMETER")
		return
	}

	page := 1
	limit := 20
	if p := r.URL.Query().Get("page"); p != "" {
		if pageNum, err := strconv.Atoi(p); err == nil && pageNum > 0 {
			page = pageNum
		}
	}

	offset := (page - 1) * limit

	contents, err := ch.contentService.ListContentByWeek(r.Context(), classroomID, week, limit, offset)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to list content", "LIST_FAILED")
		return
	}

	var responses []types.ContentResponse
	for _, content := range contents {
		responses = append(responses, types.ContentResponse{
			ID:          content.ID,
			ClassroomID: content.ClassroomID,
			Title:       content.Title,
			Description: content.Description,
			ContentType: string(content.ContentType),
			Category:    string(content.Category),
			Topic:       content.Topic,
			Week:        content.Week,
			Tags:        content.Tags,
			UploadedBy:  content.UploadedBy,
			FileURL:     content.FileURL,
			CreatedAt:   content.CreatedAt.String(),
		})
	}

	types.WriteJSON(w, http.StatusOK, responses)
}
