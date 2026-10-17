package config

import (
	"os"
	"strconv"
)

// Config menyimpan konfigurasi runtime aplikasi Panggilin.
type Config struct {
	ServerPort       string
	ServerHost       string
	Env              string
	MaxBodySizeBytes int64
	DatabaseURL      string
	RedisURL         string
}

// Load membaca konfigurasi dari environment variables dengan nilai default yang aman.
func Load() *Config {
	return &Config{
		ServerPort:       getEnv("SERVER_PORT", "8080"),
		ServerHost:       getEnv("SERVER_HOST", "0.0.0.0"),
		Env:              getEnv("ENV", "development"),
		MaxBodySizeBytes: getEnvInt64("MAX_BODY_SIZE_BYTES", 1048576), // Default 1 MB
		DatabaseURL:      getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/panggilin?sslmode=disable"),
		RedisURL:         getEnv("REDIS_URL", "redis://localhost:6379/0"),
	}
}

func getEnv(key, defaultVal string) string {
	if val, exists := os.LookupEnv(key); exists && val != "" {
		return val
	}
	return defaultVal
}

func getEnvInt64(key string, defaultVal int64) int64 {
	if val, exists := os.LookupEnv(key); exists && val != "" {
		if parsed, err := strconv.ParseInt(val, 10, 64); err == nil {
			return parsed
		}
	}
	return defaultVal
}
