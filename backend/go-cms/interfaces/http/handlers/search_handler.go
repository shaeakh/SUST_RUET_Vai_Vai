package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/shaeakh/sust-cms/application/services"
	"github.com/shaeakh/sust-cms/interfaces/http/types"
)

// SearchHandler handles search endpoints
type SearchHandler struct {
	searchService *services.SearchService
}

// NewSearchHandler creates a new SearchHandler
func NewSearchHandler(searchService *services.SearchService) *SearchHandler {
	return &SearchHandler{searchService: searchService}
}

// SemanticSearch performs semantic search
func (sh *SearchHandler) SemanticSearch(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["classroom_id"]

	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	var req types.SearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	if req.Query == "" {
		types.WriteError(w, http.StatusBadRequest, "Query cannot be empty", "EMPTY_QUERY")
		return
	}

	// Perform search
	results, err := sh.searchService.SemanticSearch(r.Context(), userID, classroomID, req.Query)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Search failed", "SEARCH_FAILED")
		return
	}

	var responses []types.SearchResponse
	for _, result := range results {
		responses = append(responses, types.SearchResponse{
			ContentID:   result.ContentID,
			Title:       result.Title,
			ContentType: result.ContentType,
			ChunkIndex:  result.ChunkIndex,
			ChunkText:   result.ChunkText,
			Topic:       result.Topic,
			Week:        result.Week,
			Tags:        result.Tags,
			UploadedAt:  result.UploadedAt.String(),
		})
	}

	types.WriteJSON(w, http.StatusOK, responses)
}

// RAGSearch performs retrieval augmented generation
func (sh *SearchHandler) RAGSearch(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["classroom_id"]

	_, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	var req types.SearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	if req.Query == "" {
		types.WriteError(w, http.StatusBadRequest, "Query cannot be empty", "EMPTY_QUERY")
		return
	}

	// Perform RAG (Retrieval Augmented Generation)
	ragResponse, err := sh.searchService.RetrievalAugmentedGeneration(r.Context(), req.Query, classroomID, 10)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "RAG search failed", "RAG_FAILED")
		return
	}

	// Convert source chunks to response format
	var sourceChunks []types.SearchResponse
	for _, chunk := range ragResponse.SourceChunks {
		sourceChunks = append(sourceChunks, types.SearchResponse{
			ContentID:   chunk.ContentID,
			Title:       chunk.Title,
			ContentType: chunk.ContentType,
			ChunkIndex:  chunk.ChunkIndex,
			ChunkText:   chunk.ChunkText,
			Topic:       chunk.Topic,
			Week:        chunk.Week,
			Tags:        chunk.Tags,
			UploadedAt:  chunk.UploadedAt.String(),
		})
	}

	response := map[string]interface{}{
		"query":            ragResponse.Query,
		"generated_answer": ragResponse.GeneratedAnswer,
		"source_chunks":    sourceChunks,
		"chunk_count":      ragResponse.ChunkCount,
	}

	types.WriteJSON(w, http.StatusOK, response)
}

// EnqueueSearch enqueues a search request
func (sh *SearchHandler) EnqueueSearch(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["classroom_id"]

	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	var req types.SearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	if req.Query == "" {
		types.WriteError(w, http.StatusBadRequest, "Query cannot be empty", "EMPTY_QUERY")
		return
	}

	// Enqueue search
	searchReq, err := sh.searchService.EnqueueSearchRequest(r.Context(), userID, classroomID, req.Query)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to enqueue search", "ENQUEUE_FAILED")
		return
	}

	types.WriteJSON(w, http.StatusAccepted, map[string]interface{}{
		"request_id": searchReq.ID,
		"status":     searchReq.Status,
		"created_at": searchReq.CreatedAt,
	})
}

// GetSearchHistory retrieves search history
func (sh *SearchHandler) GetSearchHistory(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

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

	searchRequests, err := sh.searchService.GetSearchHistory(r.Context(), userID, limit, offset)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to retrieve history", "RETRIEVE_FAILED")
		return
	}

	type SearchHistoryItem struct {
		ID        string `json:"id"`
		Query     string `json:"query"`
		Status    string `json:"status"`
		ResultCount int   `json:"result_count"`
		CreatedAt string `json:"created_at"`
	}

	var items []SearchHistoryItem
	for _, sr := range searchRequests {
		items = append(items, SearchHistoryItem{
			ID:         sr.ID,
			Query:      sr.Query,
			Status:     sr.Status,
			ResultCount: sr.ResultCount,
			CreatedAt:  sr.CreatedAt.String(),
		})
	}

	types.WriteJSON(w, http.StatusOK, types.PaginatedResponse{
		Items:      items,
		Total:      len(items),
		Page:       page,
		Limit:      limit,
		TotalPages: (len(items) + limit - 1) / limit,
	})
}
