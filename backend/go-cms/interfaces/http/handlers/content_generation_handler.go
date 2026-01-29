package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/shaeakh/sust-cms/application/services"
	"github.com/shaeakh/sust-cms/interfaces/http/types"
)

// ContentGenerationHandler handles content generation endpoints
type ContentGenerationHandler struct {
	contentGenService *services.ContentGenerationService
}

// NewContentGenerationHandler creates a new content generation handler
func NewContentGenerationHandler(contentGenService *services.ContentGenerationService) *ContentGenerationHandler {
	return &ContentGenerationHandler{contentGenService: contentGenService}
}

// GenerateStudyMaterial generates AI-powered study material
func (cgh *ContentGenerationHandler) GenerateStudyMaterial(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["classroom_id"]

	_, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	var req struct {
		Query             string `json:"query"`
		IncludeCodeExamples bool `json:"include_code_examples"`
		IncludeDiagrams   bool `json:"include_diagrams"`
		ExportFormat      string `json:"export_format"` // markdown, html, pdf
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	if req.Query == "" {
		types.WriteError(w, http.StatusBadRequest, "Query cannot be empty", "EMPTY_QUERY")
		return
	}

	// Default values
	if req.ExportFormat == "" {
		req.ExportFormat = "markdown"
	}

	// Generate study material
	material, err := cgh.contentGenService.GenerateStudyMaterial(
		r.Context(),
		classroomID,
		req.Query,
		req.IncludeCodeExamples,
		req.IncludeDiagrams,
	)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to generate study material", "GENERATION_FAILED")
		return
	}

	// Export in requested format
	var exportedContent string
	contentType := "application/json"

	switch req.ExportFormat {
	case "html":
		exportedContent = material.ExportToHTML()
		contentType = "text/html"

	case "markdown":
		fallthrough
	default:
		exportedContent = material.ExportToMarkdown()
		contentType = "text/markdown"
	}

	// Return response with download headers
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", "attachment; filename=\"study-material."+req.ExportFormat+"\"")

	types.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"id":           material.ID,
		"query":        material.Query,
		"title":        material.Title,
		"format":       req.ExportFormat,
		"source_count": material.SourceCount,
		"generated_at": material.GeneratedAt,
		"content":      exportedContent,
	})
}

// PreviewStudyMaterial returns a preview of generated material without download
func (cgh *ContentGenerationHandler) PreviewStudyMaterial(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["classroom_id"]

	_, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	var req struct {
		Query             string `json:"query"`
		IncludeCodeExamples bool `json:"include_code_examples"`
		IncludeDiagrams   bool `json:"include_diagrams"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	if req.Query == "" {
		types.WriteError(w, http.StatusBadRequest, "Query cannot be empty", "EMPTY_QUERY")
		return
	}

	// Generate study material
	material, err := cgh.contentGenService.GenerateStudyMaterial(
		r.Context(),
		classroomID,
		req.Query,
		req.IncludeCodeExamples,
		req.IncludeDiagrams,
	)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to generate study material", "GENERATION_FAILED")
		return
	}

	// Return preview (not as download)
	types.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"id":           material.ID,
		"query":        material.Query,
		"title":        material.Title,
		"format":       "markdown",
		"source_count": material.SourceCount,
		"generated_at": material.GeneratedAt,
		"preview":      material.ExportToMarkdown(),
		"content":      material.Content,
	})
}

// DownloadStudyMaterial returns raw file for download
func (cgh *ContentGenerationHandler) DownloadStudyMaterial(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["classroom_id"]

	format := r.URL.Query().Get("format")
	if format == "" {
		format = "markdown"
	}

	_, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	var req struct {
		Query             string `json:"query"`
		IncludeCodeExamples bool `json:"include_code_examples"`
		IncludeDiagrams   bool `json:"include_diagrams"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	if req.Query == "" {
		types.WriteError(w, http.StatusBadRequest, "Query cannot be empty", "EMPTY_QUERY")
		return
	}

	// Generate study material
	material, err := cgh.contentGenService.GenerateStudyMaterial(
		r.Context(),
		classroomID,
		req.Query,
		req.IncludeCodeExamples,
		req.IncludeDiagrams,
	)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to generate study material", "GENERATION_FAILED")
		return
	}

	// Export in requested format
	var content string
	fileExt := format
	mimeType := "text/plain"

	switch format {
	case "html":
		content = material.ExportToHTML()
		mimeType = "text/html"
	case "markdown":
		fallthrough
	default:
		content = material.ExportToMarkdown()
		mimeType = "text/markdown"
		fileExt = "md"
	}

	// Set download headers
	w.Header().Set("Content-Type", mimeType)
	w.Header().Set("Content-Disposition", "attachment; filename=\"study-material."+fileExt+"\"")
	w.Header().Set("Content-Length", strconv.Itoa(len(content)))

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(content))
}
