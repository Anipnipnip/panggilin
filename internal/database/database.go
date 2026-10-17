package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// DB membungkus pool koneksi pgxpool.Pool untuk PostgreSQL.
type DB struct {
	Pool *pgxpool.Pool
}

// Connect menginisialisasi koneksi pool ke database PostgreSQL.
func Connect(ctx context.Context, databaseURL string) (*DB, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("gagal parsing DATABASE_URL: %w", err)
	}

	config.MaxConns = 25
	config.MinConns = 2
	config.MaxConnLifetime = 1 * time.Hour
	config.MaxConnIdleTime = 15 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat pool koneksi database: %w", err)
	}

	// Tes ping koneksi dengan timeout
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("gagal ping database PostgreSQL: %w", err)
	}

	log.Println("[DATABASE] Berhasil terhubung ke database PostgreSQL")
	return &DB{Pool: pool}, nil
}

// Close menutup pool koneksi database.
func (db *DB) Close() {
	if db != nil && db.Pool != nil {
		db.Pool.Close()
		log.Println("[DATABASE] Koneksi PostgreSQL ditutup.")
	}
}
