package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

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

// UploadContent handles content upload
func (ch *ContentHandler) UploadContent(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["classroom_id"]

	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	var req types.UploadContentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	content, err := ch.contentService.UploadContent(
		r.Context(),
		classroomID,
		req.Title,
		req.Description,
		req.ContentType,
		req.Category,
		req.Topic,
		req.Week,
		req.Tags,
		userID,
		req.FileURL,
		req.FileSize,
		req.MimeType,
	)
	if err != nil {
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
