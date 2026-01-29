package services

import (
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/shaeakh/sust-cms/domain/entities"
	"github.com/shaeakh/sust-cms/domain/repositories"
)

// AuthService handles authentication operations
type AuthService struct {
	userRepo  repositories.UserRepository
	jwtSecret string
	expiration int
}

// NewAuthService creates a new AuthService
func NewAuthService(userRepo repositories.UserRepository, jwtSecret string, expiration int) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		jwtSecret:  jwtSecret,
		expiration: expiration,
	}
}

// JWTClaims represents JWT claims
type JWTClaims struct {
	UserID string                `json:"user_id"`
	Email  string                `json:"email"`
	Role   entities.UserRole     `json:"role"`
	jwt.RegisteredClaims
}

// RegisterUser registers a new user
func (as *AuthService) RegisterUser(ctx context.Context, email, password, fullName string, role entities.UserRole) (*entities.User, error) {
	// Check if user already exists
	existingUser, err := as.userRepo.FindByEmail(ctx, email)
	if err == nil && existingUser != nil {
		return nil, fmt.Errorf("user with email already exists: %s", email)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := &entities.User{
		ID:        uuid.New().String(),
		Email:     email,
		Password:  string(hashedPassword),
		FullName:  fullName,
		Role:      role,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := as.userRepo.Save(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	return user, nil
}

// Login authenticates a user and returns a JWT token
func (as *AuthService) Login(ctx context.Context, email, password string) (string, *entities.User, error) {
	// Find user by email
	user, err := as.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return "", nil, fmt.Errorf("invalid email or password")
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", nil, fmt.Errorf("invalid email or password")
	}

	// Generate JWT token
	token, err := as.GenerateToken(user)
	if err != nil {
		return "", nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return token, user, nil
}

// GenerateToken generates a JWT token for a user
func (as *AuthService) GenerateToken(user *entities.User) (string, error) {
	claims := &JWTClaims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(as.expiration) * time.Second)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(as.jwtSecret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// VerifyToken verifies and parses a JWT token
func (as *AuthService) VerifyToken(tokenString string) (*JWTClaims, error) {
	claims := &JWTClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(as.jwtSecret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

// RefreshToken generates a new token for an existing user
func (as *AuthService) RefreshToken(ctx context.Context, userID string) (string, error) {
	user, err := as.userRepo.FindByID(ctx, userID)
	if err != nil {
		return "", fmt.Errorf("user not found: %w", err)
	}

	return as.GenerateToken(user)
}
