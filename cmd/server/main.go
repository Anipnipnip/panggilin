package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/panggilin/panggilin/internal/config"
	"github.com/panggilin/panggilin/internal/database"
	"github.com/panggilin/panggilin/internal/sse"
	"github.com/panggilin/panggilin/internal/webhook"
)

func main() {
	cfg := config.Load()

	// Inisialisasi koneksi database PostgreSQL
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Gagal inisialisasi koneksi PostgreSQL: %v", err)
	}
	defer db.Close()

	// Inisialisasi SSE broker untuk streaming realtime
	sseBroker := sse.NewBroker()

	// Inisialisasi repository & HTTP handler
	webhookRepo := webhook.NewPostgresRepository(db.Pool)
	webhookHandler := webhook.NewHandler(webhookRepo, sseBroker, cfg.MaxBodySizeBytes)

	mux := http.NewServeMux()

	// CORS middleware sederhana untuk mendukung pengembangan frontend lokal (Vite)
	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}

	// Register routes
	mux.HandleFunc("GET /api/v1/health", webhookHandler.HandleHealth)
	mux.Handle("GET /api/v1/events/stream", sseBroker)
	mux.HandleFunc("POST /api/v1/webhooks", webhookHandler.HandleIngest)
	mux.HandleFunc("POST /api/v1/webhooks/{slug}", webhookHandler.HandleIngest)
	mux.HandleFunc("GET /api/v1/webhooks", webhookHandler.HandleList)
	mux.HandleFunc("GET /api/v1/webhooks/{id}", webhookHandler.HandleGetByID)

	serverAddr := fmt.Sprintf("%s:%s", cfg.ServerHost, cfg.ServerPort)
	srv := &http.Server{
		Addr:         serverAddr,
		Handler:      corsMiddleware(mux),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Channel untuk menangkap signal shutdown
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("=========================================")
		log.Printf("  Panggilin Webhook Inspector (MVP v1.2) ")
		log.Printf("  Listening on http://%s", serverAddr)
		log.Printf("  Ingestion URL: POST http://%s/api/v1/webhooks", serverAddr)
		log.Printf("  List Events:   GET  http://%s/api/v1/webhooks", serverAddr)
		log.Printf("  Detail Event:  GET  http://%s/api/v1/webhooks/{id}", serverAddr)
		log.Printf("  Health Check:  GET  http://%s/api/v1/health", serverAddr)
		log.Printf("=========================================")

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server gagal berjalan: %v", err)
		}
	}()

	// Menunggu signal interrupt / termination
	<-stopChan
	log.Println("Menerima signal shutdown, mematikan server secara graceful...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Shutdown server gagal: %v", err)
	}

	log.Println("Server Panggilin berhasil dihentikan.")
}
