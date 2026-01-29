package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/shaeakh/sust-cms/application/services"
	"github.com/shaeakh/sust-cms/domain/entities"
	"github.com/shaeakh/sust-cms/interfaces/http/types"
)

// ClassroomHandler handles classroom endpoints
type ClassroomHandler struct {
	classroomService *services.ClassroomService
}

// NewClassroomHandler creates a new ClassroomHandler
func NewClassroomHandler(classroomService *services.ClassroomService) *ClassroomHandler {
	return &ClassroomHandler{classroomService: classroomService}
}

// CreateClassroom creates a new classroom
func (ch *ClassroomHandler) CreateClassroom(w http.ResponseWriter, r *http.Request) {
	instructorID, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	var req types.CreateClassroomRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	classroom, err := ch.classroomService.CreateClassroom(r.Context(), instructorID, req.Name, req.Description, req.Type)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to create classroom", "CREATION_FAILED")
		return
	}

	response := types.ClassroomResponse{
		ID:           classroom.ID,
		InstructorID: classroom.InstructorID,
		Name:         classroom.Name,
		Description:  classroom.Description,
		Type:         string(classroom.Type),
		JoinCode:     classroom.JoinCode,
		CreatedAt:    classroom.CreatedAt.String(),
	}

	types.WriteJSON(w, http.StatusCreated, response)
}

// JoinClassroom allows a student to join a classroom
func (ch *ClassroomHandler) JoinClassroom(w http.ResponseWriter, r *http.Request) {
	studentID, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	var req types.JoinClassroomRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	classroom, err := ch.classroomService.JoinClassroom(r.Context(), studentID, req.JoinCode)
	if err != nil {
		types.WriteError(w, http.StatusNotFound, err.Error(), "JOIN_FAILED")
		return
	}

	response := types.ClassroomResponse{
		ID:           classroom.ID,
		InstructorID: classroom.InstructorID,
		Name:         classroom.Name,
		Description:  classroom.Description,
		Type:         string(classroom.Type),
		JoinCode:     classroom.JoinCode,
		CreatedAt:    classroom.CreatedAt.String(),
	}

	types.WriteJSON(w, http.StatusOK, response)
}

// GetClassroom retrieves a classroom
func (ch *ClassroomHandler) GetClassroom(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["id"]

	classroom, err := ch.classroomService.GetClassroom(r.Context(), classroomID)
	if err != nil {
		types.WriteError(w, http.StatusNotFound, "Classroom not found", "NOT_FOUND")
		return
	}

	response := types.ClassroomResponse{
		ID:           classroom.ID,
		InstructorID: classroom.InstructorID,
		Name:         classroom.Name,
		Description:  classroom.Description,
		Type:         string(classroom.Type),
		JoinCode:     classroom.JoinCode,
		CreatedAt:    classroom.CreatedAt.String(),
	}

	types.WriteJSON(w, http.StatusOK, response)
}

// ListClassroomsByInstructor lists classrooms by instructor
func (ch *ClassroomHandler) ListClassroomsByInstructor(w http.ResponseWriter, r *http.Request) {
	instructorID, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	classrooms, err := ch.classroomService.ListClassroomsByInstructor(r.Context(), instructorID)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to list classrooms", "LIST_FAILED")
		return
	}

	var responses []types.ClassroomResponse
	for _, classroom := range classrooms {
		responses = append(responses, types.ClassroomResponse{
			ID:           classroom.ID,
			InstructorID: classroom.InstructorID,
			Name:         classroom.Name,
			Description:  classroom.Description,
			Type:         string(classroom.Type),
			JoinCode:     classroom.JoinCode,
			CreatedAt:    classroom.CreatedAt.String(),
		})
	}

	types.WriteJSON(w, http.StatusOK, responses)
}

// ListClassroomsByStudent lists classrooms by student
func (ch *ClassroomHandler) ListClassroomsByStudent(w http.ResponseWriter, r *http.Request) {
	studentID, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found", "UNAUTHORIZED")
		return
	}

	classrooms, err := ch.classroomService.ListClassroomsByStudent(r.Context(), studentID)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to list classrooms", "LIST_FAILED")
		return
	}

	var responses []types.ClassroomResponse
	for _, classroom := range classrooms {
		responses = append(responses, types.ClassroomResponse{
			ID:           classroom.ID,
			InstructorID: classroom.InstructorID,
			Name:         classroom.Name,
			Description:  classroom.Description,
			Type:         string(classroom.Type),
			JoinCode:     classroom.JoinCode,
			CreatedAt:    classroom.CreatedAt.String(),
		})
	}

	types.WriteJSON(w, http.StatusOK, responses)
}

// ListClassroomMembers lists members of a classroom
func (ch *ClassroomHandler) ListClassroomMembers(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["id"]

	members, err := ch.classroomService.ListClassroomMembers(r.Context(), classroomID)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to list members", "LIST_FAILED")
		return
	}

	type MemberResponse struct {
		ID        string `json:"id"`
		StudentID string `json:"student_id"`
		JoinedAt  string `json:"joined_at"`
	}

	var responses []MemberResponse
	for _, member := range members {
		responses = append(responses, MemberResponse{
			ID:        member.ID,
			StudentID: member.StudentID,
			JoinedAt:  member.JoinedAt.String(),
		})
	}

	types.WriteJSON(w, http.StatusOK, responses)
}

// UpdateClassroom updates classroom details
func (ch *ClassroomHandler) UpdateClassroom(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["id"]

	var req types.CreateClassroomRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	classroom := &entities.Classroom{
		ID:          classroomID,
		Name:        req.Name,
		Description: req.Description,
	}

	if err := ch.classroomService.UpdateClassroom(r.Context(), classroom); err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to update classroom", "UPDATE_FAILED")
		return
	}

	types.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "Classroom updated successfully",
	})
}

// DeleteClassroom deletes a classroom
func (ch *ClassroomHandler) DeleteClassroom(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classroomID := vars["id"]

	if err := ch.classroomService.DeleteClassroom(r.Context(), classroomID); err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to delete classroom", "DELETE_FAILED")
		return
	}

	types.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "Classroom deleted successfully",
	})
}
