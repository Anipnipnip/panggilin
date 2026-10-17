package webhook

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// Broadcaster adalah interface untuk menyiarkan event baru ke koneksi SSE.
type Broadcaster interface {
	Broadcast(eventType string, data interface{})
}

// Handler mengelola request HTTP untuk webhook ingestion dan query.
type Handler struct {
	repo         Repository
	broker       Broadcaster
	maxBodyBytes int64
}

// NewHandler membuat instance Handler baru dengan batasan ukuran body, repository, dan broadcaster.
func NewHandler(repo Repository, broker Broadcaster, maxBodyBytes int64) *Handler {
	return &Handler{
		repo:         repo,
		broker:       broker,
		maxBodyBytes: maxBodyBytes,
	}
}

// HandleIngest menerima HTTP POST webhook, memvalidasi JSON dan batasan ukuran, menyimpan ke DB, lalu merespons.
func (h *Handler) HandleIngest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed. Use POST.")
		return
	}

	startTime := time.Now()

	// Batasi ukuran request body untuk mencegah resource exhaustion (DoS)
	r.Body = http.MaxBytesReader(w, r.Body, h.maxBodyBytes)

	var status = http.StatusOK
	var respBody = `{"status":"received"}`
	var errorMessage = ""

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		var maxBytesErr *http.MaxBytesError
		if errors.As(err, &maxBytesErr) {
			status = http.StatusRequestEntityTooLarge
			errorMessage = "Payload too large. Exceeds maximum allowed size."
		} else {
			status = http.StatusBadRequest
			errorMessage = "Failed to read request body."
		}
	} else if len(bodyBytes) == 0 || !json.Valid(bodyBytes) {
		status = http.StatusBadRequest
		errorMessage = "Invalid JSON payload."
	}

	if errorMessage != "" {
		errJSON, _ := json.Marshal(map[string]string{"error": errorMessage})
		respBody = string(errJSON)
	}

	now := time.Now().UTC()
	durationMs := int(time.Since(startTime).Milliseconds())

	// Tentukan endpoint_id dari path jika ada subpath, default 'default'
	endpointID := "default"
	trimmedPath := strings.TrimPrefix(r.URL.Path, "/api/v1/webhooks")
	trimmedPath = strings.TrimPrefix(trimmedPath, "/")
	if trimmedPath != "" && !strings.Contains(trimmedPath, "/") {
		endpointID = trimmedPath
	}

	// Salin headers
	headersCopy := make(map[string][]string)
	for k, v := range r.Header {
		headersCopy[k] = v
	}

	event := &Event{
		EndpointID:     endpointID,
		Method:         r.Method,
		Path:           r.URL.Path,
		Headers:        headersCopy,
		Payload:        string(bodyBytes),
		RemoteAddr:     r.RemoteAddr,
		ContentLength:  int64(len(bodyBytes)),
		ResponseStatus: status,
		ResponseBody:   respBody,
		DurationMs:     durationMs,
		ReceivedAt:     now,
	}

	// Simpan ke database jika repository terkonfigurasi
	if h.repo != nil {
		if err := h.repo.Insert(r.Context(), event); err != nil {
			log.Printf("[INGEST_ERROR] Gagal menyimpan webhook ke database: %v", err)
		}
	}

	// Siarkan event baru ke koneksi SSE realtime agar muncul di dashboard
	if h.broker != nil {
		h.broker.Broadcast("new_webhook", EventSummary{
			ID:             event.ID,
			EndpointID:     event.EndpointID,
			Method:         event.Method,
			Path:           event.Path,
			ResponseStatus: event.ResponseStatus,
			ContentLength:  event.ContentLength,
			ReceivedAt:     event.ReceivedAt,
		})
	}

	// Jika request error, kirim respons error yang sesuai
	if status != http.StatusOK {
		log.Printf("[INGEST_WARN] Status: %d | Path: %s | RemoteAddr: %s | Error: %s", status, r.URL.Path, r.RemoteAddr, errorMessage)
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(status)
		_, _ = w.Write([]byte(respBody))
		return
	}

	log.Printf("[INGEST_SUCCESS] ID: %s | Method: %s | Path: %s | RemoteAddr: %s | Size: %d bytes | Duration: %dms",
		event.ID, r.Method, r.URL.Path, r.RemoteAddr, len(bodyBytes), durationMs)

	resp := IngestResponse{
		ID:         event.ID,
		Status:     "received",
		Message:    "Webhook received successfully",
		ReceivedAt: now,
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}

// HandleList mengambil daftar webhook dengan filter dan pagination.
func (h *Handler) HandleList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed. Use GET.")
		return
	}

	if h.repo == nil {
		writeJSONError(w, http.StatusInternalServerError, "Database repository not available.")
		return
	}

	query := r.URL.Query()
	limit, _ := strconv.Atoi(query.Get("limit"))
	offset, _ := strconv.Atoi(query.Get("offset"))
	status, _ := strconv.Atoi(query.Get("status"))

	filter := ListFilter{
		EndpointID: query.Get("endpoint_id"),
		Method:     query.Get("method"),
		Status:     status,
		Search:     query.Get("search"),
		Limit:      limit,
		Offset:     offset,
	}

	events, total, err := h.repo.List(r.Context(), filter)
	if err != nil {
		log.Printf("[QUERY_ERROR] Gagal mengambil daftar webhook: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Failed to fetch webhooks.")
		return
	}

	resp := EventListResponse{
		Events: events,
		Total:  total,
		Limit:  filter.Limit,
		Offset: filter.Offset,
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}

// HandleGetByID mengambil detail lengkap satu webhook berdasarkan ID.
func (h *Handler) HandleGetByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSONError(w, http.StatusMethodNotAllowed, "Method not allowed. Use GET.")
		return
	}

	if h.repo == nil {
		writeJSONError(w, http.StatusInternalServerError, "Database repository not available.")
		return
	}

	id := r.PathValue("id")
	if id == "" {
		// Fallback extraction jika router tidak mendukung PathValue
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) > 0 {
			id = parts[len(parts)-1]
		}
	}

	if id == "" {
		writeJSONError(w, http.StatusBadRequest, "Missing webhook ID.")
		return
	}

	event, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		log.Printf("[QUERY_ERROR] Gagal mengambil detail webhook %s: %v", id, err)
		writeJSONError(w, http.StatusInternalServerError, "Failed to fetch webhook details.")
		return
	}

	if event == nil {
		writeJSONError(w, http.StatusNotFound, "Webhook not found.")
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(event)
}

// HandleHealth menyediakan endpoint healthcheck sederhana.
func (h *Handler) HandleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
		"app":    "panggilin",
	})
}

// writeJSONError menulis respons error standar dalam format JSON.
func writeJSONError(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}
