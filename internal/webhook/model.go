package webhook

import "time"

// Event merepresentasikan seluruh data lengkap sebuah request webhook yang diterima.
type Event struct {
	ID             string              `json:"id"`
	EndpointID     string              `json:"endpoint_id"`
	Method         string              `json:"method"`
	Path           string              `json:"path"`
	Headers        map[string][]string `json:"headers"`
	Payload        string              `json:"payload"`
	RemoteAddr     string              `json:"remote_addr"`
	ContentLength  int64               `json:"content_length"`
	ResponseStatus int                 `json:"response_status"`
	ResponseBody   string              `json:"response_body"`
	DurationMs     int                 `json:"duration_ms"`
	ReceivedAt     time.Time           `json:"received_at"`
}

// EventSummary adalah ringkasan data event untuk ditampilkan pada tabel daftar Events yang compact.
type EventSummary struct {
	ID             string    `json:"id"`
	EndpointID     string    `json:"endpoint_id"`
	Method         string    `json:"method"`
	Path           string    `json:"path"`
	ResponseStatus int       `json:"response_status"`
	ContentLength  int64     `json:"content_length"`
	ReceivedAt     time.Time `json:"received_at"`
}

// ListFilter menampung parameter penyaringan (filtering) dan pagination untuk daftar event.
type ListFilter struct {
	EndpointID string
	Method     string
	Status     int
	Search     string
	Limit      int
	Offset     int
}

// EventListResponse adalah format respons JSON untuk endpoint daftar event dengan metadata pagination.
type EventListResponse struct {
	Events []EventSummary `json:"events"`
	Total  int64          `json:"total"`
	Limit  int            `json:"limit"`
	Offset int            `json:"offset"`
}

// IngestResponse adalah format respons JSON standar setelah webhook berhasil diterima.
type IngestResponse struct {
	ID         string    `json:"id"`
	Status     string    `json:"status"`
	Message    string    `json:"message"`
	ReceivedAt time.Time `json:"received_at"`
}
