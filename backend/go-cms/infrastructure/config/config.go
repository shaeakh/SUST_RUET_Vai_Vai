package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds all configuration for the application
type Config struct {
	// Server
	ServerPort int
	ServerHost string
	Environment string

	// Database
	DatabaseURL string
	DatabaseHost string
	DatabasePort int
	DatabaseName string
	DatabaseUser string
	DatabasePassword string
	DatabaseMaxOpenConns int
	DatabaseMaxIdleConns int

	// Redis
	RedisURL string
	RedisHost string
	RedisPort int
	RedisPassword string
	RedisDB int

	// Gemini AI
	GeminiAPIKey string

	// JWT
	JWTSecret string
	JWTExpiration int // seconds

	// File Storage
	FileStoragePath string
	MaxFileSize int64 // bytes

	// CORS
	CORSAllowedOrigins []string

	// Rate Limiting
	RateLimitRequests int
	RateLimitWindow int // seconds
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	cfg := &Config{
		ServerPort:           getEnvInt("SERVER_PORT", 8080),
		ServerHost:           getEnv("SERVER_HOST", "0.0.0.0"),
		Environment:          getEnv("ENVIRONMENT", "development"),
		DatabaseHost:         getEnv("DB_HOST", "localhost"),
		DatabasePort:         getEnvInt("DB_PORT", 5432),
		DatabaseName:         getEnv("DB_NAME", "sust_cms"),
		DatabaseUser:         getEnv("DB_USER", "postgres"),
		DatabasePassword:     getEnv("DB_PASSWORD", "postgres"),
		DatabaseMaxOpenConns: getEnvInt("DB_MAX_OPEN_CONNS", 25),
		DatabaseMaxIdleConns: getEnvInt("DB_MAX_IDLE_CONNS", 5),
		RedisHost:            getEnv("REDIS_HOST", "localhost"),
		RedisPort:            getEnvInt("REDIS_PORT", 6379),
		RedisPassword:        getEnv("REDIS_PASSWORD", ""),
		RedisDB:              getEnvInt("REDIS_DB", 0),
		GeminiAPIKey:         getEnv("GEMINI_API_KEY", ""),
		JWTSecret:            getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTExpiration:        getEnvInt("JWT_EXPIRATION", 86400), // 24 hours
		FileStoragePath:      getEnv("FILE_STORAGE_PATH", "./uploads"),
		MaxFileSize:          getEnvInt64("MAX_FILE_SIZE", 100*1024*1024), // 100MB
		RateLimitRequests:    getEnvInt("RATE_LIMIT_REQUESTS", 100),
		RateLimitWindow:      getEnvInt("RATE_LIMIT_WINDOW", 60),
	}

	// Build database URL
	cfg.DatabaseURL = fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=disable",
		cfg.DatabaseUser,
		cfg.DatabasePassword,
		cfg.DatabaseHost,
		cfg.DatabasePort,
		cfg.DatabaseName,
	)

	// Build Redis URL
	cfg.RedisURL = fmt.Sprintf("redis://:%s@%s:%d/%d", cfg.RedisPassword, cfg.RedisHost, cfg.RedisPort, cfg.RedisDB)

	return cfg
}

// Helper functions to read environment variables
func getEnv(key, defaultValue string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value, ok := os.LookupEnv(key); ok {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvInt64(key string, defaultValue int64) int64 {
	if value, ok := os.LookupEnv(key); ok {
		if intVal, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intVal
		}
	}
	return defaultValue
}
