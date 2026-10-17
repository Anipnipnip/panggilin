package webhook

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Repository mengelola operasi database untuk data webhook.
type Repository interface {
	Insert(ctx context.Context, event *Event) error
	List(ctx context.Context, filter ListFilter) ([]EventSummary, int64, error)
	GetByID(ctx context.Context, id string) (*Event, error)
}

type postgresRepository struct {
	pool *pgxpool.Pool
}

// NewPostgresRepository membuat instance Repository dengan PostgreSQL pgxpool.
func NewPostgresRepository(pool *pgxpool.Pool) Repository {
	return &postgresRepository{pool: pool}
}

// Insert menyimpan data webhook baru ke tabel webhooks.
func (r *postgresRepository) Insert(ctx context.Context, event *Event) error {
	headersJSON, err := json.Marshal(event.Headers)
	if err != nil {
		headersJSON = []byte("{}")
	}

	payloadJSON := []byte(event.Payload)
	if len(payloadJSON) == 0 || !json.Valid(payloadJSON) {
		wrapped, _ := json.Marshal(map[string]string{
			"raw":    event.Payload,
			"_error": "invalid_or_empty_json",
		})
		payloadJSON = wrapped
	}

	query := `
		INSERT INTO webhooks (
			id, endpoint_id, method, path, headers, payload,
			remote_addr, content_length, response_status, response_body,
			duration_ms, received_at
		) VALUES (
			gen_random_uuid(), $1, $2, $3, $4, $5,
			$6, $7, $8, $9,
			$10, $11
		) RETURNING id`

	err = r.pool.QueryRow(ctx, query,
		event.EndpointID,
		event.Method,
		event.Path,
		headersJSON,
		payloadJSON,
		event.RemoteAddr,
		event.ContentLength,
		event.ResponseStatus,
		event.ResponseBody,
		event.DurationMs,
		event.ReceivedAt,
	).Scan(&event.ID)

	if err != nil {
		return fmt.Errorf("gagal insert webhook ke database: %w", err)
	}

	return nil
}

// List mengambil daftar event ringkas dengan filter dan pagination.
func (r *postgresRepository) List(ctx context.Context, filter ListFilter) ([]EventSummary, int64, error) {
	if filter.Limit <= 0 {
		filter.Limit = 20
	}
	if filter.Limit > 100 {
		filter.Limit = 100
	}
	if filter.Offset < 0 {
		filter.Offset = 0
	}

	whereClauses := []string{"1=1"}
	args := []interface{}{}
	argIdx := 1

	if filter.EndpointID != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("endpoint_id = $%d", argIdx))
		args = append(args, filter.EndpointID)
		argIdx++
	}

	if filter.Method != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("method = $%d", argIdx))
		args = append(args, strings.ToUpper(filter.Method))
		argIdx++
	}

	if filter.Status > 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("response_status = $%d", argIdx))
		args = append(args, filter.Status)
		argIdx++
	}

	if filter.Search != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("path ILIKE $%d", argIdx))
		args = append(args, "%"+filter.Search+"%")
		argIdx++
	}

	whereSQL := strings.Join(whereClauses, " AND ")

	// Hitung total matching rows
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM webhooks WHERE %s", whereSQL)
	var total int64
	if err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("gagal menghitung total webhooks: %w", err)
	}

	// Query data halaman aktif
	dataQuery := fmt.Sprintf(`
		SELECT id, endpoint_id, method, path, response_status, content_length, received_at
		FROM webhooks
		WHERE %s
		ORDER BY received_at DESC
		LIMIT $%d OFFSET $%d`, whereSQL, argIdx, argIdx+1)

	argsWithLimit := append(args, filter.Limit, filter.Offset)

	rows, err := r.pool.Query(ctx, dataQuery, argsWithLimit...)
	if err != nil {
		return nil, 0, fmt.Errorf("gagal query daftar webhooks: %w", err)
	}
	defer rows.Close()

	var events []EventSummary
	for rows.Next() {
		var s EventSummary
		if err := rows.Scan(
			&s.ID,
			&s.EndpointID,
			&s.Method,
			&s.Path,
			&s.ResponseStatus,
			&s.ContentLength,
			&s.ReceivedAt,
		); err != nil {
			return nil, 0, fmt.Errorf("gagal scan baris webhook: %w", err)
		}
		events = append(events, s)
	}

	if events == nil {
		events = []EventSummary{}
	}

	return events, total, nil
}

// GetByID mengambil detail lengkap satu webhook berdasarkan ID.
func (r *postgresRepository) GetByID(ctx context.Context, id string) (*Event, error) {
	query := `
		SELECT id, endpoint_id, method, path, headers, payload,
		       remote_addr, content_length, response_status, response_body,
		       duration_ms, received_at
		FROM webhooks
		WHERE id = $1`

	var event Event
	var headersRaw []byte
	var payloadRaw []byte

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&event.ID,
		&event.EndpointID,
		&event.Method,
		&event.Path,
		&headersRaw,
		&payloadRaw,
		&event.RemoteAddr,
		&event.ContentLength,
		&event.ResponseStatus,
		&event.ResponseBody,
		&event.DurationMs,
		&event.ReceivedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("gagal query webhook by id: %w", err)
	}

	event.Headers = make(map[string][]string)
	_ = json.Unmarshal(headersRaw, &event.Headers)
	event.Payload = string(payloadRaw)

	return &event, nil
}
