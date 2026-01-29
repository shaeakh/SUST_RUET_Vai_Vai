package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/shaeakh/sust-cms/application/services"
	"github.com/shaeakh/sust-cms/interfaces/http/types"
)

// JWTAuth middleware validates JWT tokens
func JWTAuth(authService *services.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Allow preflight OPTIONS requests without authentication
			if r.Method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}

			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				types.WriteError(w, http.StatusUnauthorized, "Missing authorization header", "UNAUTHORIZED")
				return
			}

			// Extract token from "Bearer <token>"
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				types.WriteError(w, http.StatusUnauthorized, "Invalid authorization header", "UNAUTHORIZED")
				return
			}

			token := parts[1]

			// Verify token
			claims, err := authService.VerifyToken(token)
			if err != nil {
				types.WriteError(w, http.StatusUnauthorized, "Invalid token", "UNAUTHORIZED")
				return
			}

			// Add claims to context
			ctx := context.WithValue(r.Context(), "user_id", claims.UserID)
			ctx = context.WithValue(ctx, "user_email", claims.Email)
			ctx = context.WithValue(ctx, "user_role", claims.Role)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RoleCheck middleware checks user role
func RoleCheck(requiredRole string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userRole, ok := r.Context().Value("user_role").(string)
			if !ok || userRole != requiredRole {
				types.WriteError(w, http.StatusForbidden, "Insufficient permissions", "FORBIDDEN")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequestLogger middleware logs incoming requests
func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Log request details (implement with your logger)
		// fmt.Printf("[%s] %s %s\n", time.Now().Format(time.RFC3339), r.Method, r.RequestURI)
		next.ServeHTTP(w, r)
	})
}

// CORS middleware handles CORS with full access
func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "86400")
		w.Header().Set("Access-Control-Expose-Headers", "Content-Length, Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// RateLimit middleware implements rate limiting
func RateLimit(limiter *RateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID, ok := r.Context().Value("user_id").(string)
			if !ok {
				userID = r.RemoteAddr
			}

			if !limiter.Allow(userID) {
				types.WriteError(w, http.StatusTooManyRequests, "Rate limit exceeded", "RATE_LIMIT_EXCEEDED")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RateLimiter implements a simple rate limiter
type RateLimiter struct {
	requests map[string]int
	limit    int
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(limit int) *RateLimiter {
	return &RateLimiter{
		requests: make(map[string]int),
		limit:    limit,
	}
}

// Allow checks if a request is allowed
func (rl *RateLimiter) Allow(id string) bool {
	if rl.requests[id] < rl.limit {
		rl.requests[id]++
		return true
	}
	return false
}

// Reset resets the rate limiter
func (rl *RateLimiter) Reset() {
	rl.requests = make(map[string]int)
}
