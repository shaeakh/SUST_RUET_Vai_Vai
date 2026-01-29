package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/shaeakh/sust-cms/application/services"
	"github.com/shaeakh/sust-cms/domain/entities"
	"github.com/shaeakh/sust-cms/interfaces/http/types"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	authService *services.AuthService
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Register handles user registration
func (ah *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req types.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	// Validate role
	role := entities.UserRole(req.Role)
	if role != entities.RoleInstructor && role != entities.RoleStudent {
		types.WriteError(w, http.StatusBadRequest, "Invalid role", "INVALID_ROLE")
		return
	}

	// Register user
	user, err := ah.authService.RegisterUser(r.Context(), req.Email, req.Password, req.FullName, role)
	if err != nil {
		types.WriteError(w, http.StatusConflict, err.Error(), "REGISTRATION_FAILED")
		return
	}

	types.WriteJSON(w, http.StatusCreated, map[string]interface{}{
		"user_id":  user.ID,
		"email":    user.Email,
		"full_name": user.FullName,
		"role":     user.Role,
	})
}

// Login handles user login
func (ah *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req types.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		types.WriteError(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST")
		return
	}

	// Login user
	token, user, err := ah.authService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		types.WriteError(w, http.StatusUnauthorized, "Invalid email or password", "AUTHENTICATION_FAILED")
		return
	}

	// Calculate expiration time
	expiresAt := time.Now().Add(24 * time.Hour).Unix()

	response := types.LoginResponse{
		Token:     token,
		UserID:    user.ID,
		Email:     user.Email,
		FullName:  user.FullName,
		Role:      string(user.Role),
		ExpiresAt: expiresAt,
	}

	types.WriteJSON(w, http.StatusOK, response)
}

// RefreshToken handles token refresh
func (ah *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		types.WriteError(w, http.StatusUnauthorized, "User not found in context", "UNAUTHORIZED")
		return
	}

	token, err := ah.authService.RefreshToken(r.Context(), userID)
	if err != nil {
		types.WriteError(w, http.StatusInternalServerError, "Failed to refresh token", "REFRESH_FAILED")
		return
	}

	expiresAt := time.Now().Add(24 * time.Hour).Unix()

	types.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"token":      token,
		"expires_at": expiresAt,
	})
}
