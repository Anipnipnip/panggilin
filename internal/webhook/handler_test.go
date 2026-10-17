package webhook

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

type mockRepository struct {
	events map[string]*Event
}

func newMockRepository() *mockRepository {
	return &mockRepository{events: make(map[string]*Event)}
}

func (m *mockRepository) Insert(ctx context.Context, event *Event) error {
	event.ID = "test-uuid-1234"
	m.events[event.ID] = event
	return nil
}

func (m *mockRepository) List(ctx context.Context, filter ListFilter) ([]EventSummary, int64, error) {
	var list []EventSummary
	for _, e := range m.events {
		list = append(list, EventSummary{
			ID:             e.ID,
			EndpointID:     e.EndpointID,
			Method:         e.Method,
			Path:           e.Path,
			ResponseStatus: e.ResponseStatus,
			ContentLength:  e.ContentLength,
			ReceivedAt:     e.ReceivedAt,
		})
	}
	return list, int64(len(list)), nil
}

func (m *mockRepository) GetByID(ctx context.Context, id string) (*Event, error) {
	if e, exists := m.events[id]; exists {
		return e, nil
	}
	return nil, nil
}

type mockBroadcaster struct {
	lastEvent string
	lastData  interface{}
}

func (b *mockBroadcaster) Broadcast(eventType string, data interface{}) {
	b.lastEvent = eventType
	b.lastData = data
}

func TestHandleIngest_ValidJSON(t *testing.T) {
	mockRepo := newMockRepository()
	mockBC := &mockBroadcaster{}
	handler := NewHandler(mockRepo, mockBC, 1024*1024)

	payload := `{"event":"payment_success","amount":150000,"currency":"IDR"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/webhooks", bytes.NewBufferString(payload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	handler.HandleIngest(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d. Body: %s", rr.Code, rr.Body.String())
	}

	var resp IngestResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response JSON: %v", err)
	}

	if resp.Status != "received" {
		t.Errorf("expected status 'received', got '%s'", resp.Status)
	}

	if resp.ID != "test-uuid-1234" {
		t.Errorf("expected ID 'test-uuid-1234', got '%s'", resp.ID)
	}

	if mockBC.lastEvent != "new_webhook" {
		t.Errorf("expected broadcast event 'new_webhook', got '%s'", mockBC.lastEvent)
	}
}

func TestHandleIngest_InvalidJSON(t *testing.T) {
	handler := NewHandler(nil, nil, 1024*1024)

	payload := `{"event": "unclosed_bracket`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/webhooks", bytes.NewBufferString(payload))
	rr := httptest.NewRecorder()

	handler.HandleIngest(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 Bad Request, got %d. Body: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleIngest_PayloadTooLarge(t *testing.T) {
	limit := int64(64)
	handler := NewHandler(nil, nil, limit)

	largePayload := `{"data":"` + strings.Repeat("A", 100) + `"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/webhooks", bytes.NewBufferString(largePayload))
	rr := httptest.NewRecorder()

	handler.HandleIngest(rr, req)

	if rr.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected status 413 Payload Too Large, got %d. Body: %s", rr.Code, rr.Body.String())
	}
}

func TestHandleListWebhooks(t *testing.T) {
	mockRepo := newMockRepository()
	_ = mockRepo.Insert(context.Background(), &Event{
		Method:         "POST",
		Path:           "/api/v1/webhooks",
		Payload:        `{"ok":true}`,
		ResponseStatus: 200,
		ReceivedAt:     time.Now(),
	})

	handler := NewHandler(mockRepo, nil, 1024*1024)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/webhooks", nil)
	rr := httptest.NewRecorder()

	handler.HandleList(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d", rr.Code)
	}

	var listResp EventListResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &listResp); err != nil {
		t.Fatalf("failed to decode list response: %v", err)
	}

	if listResp.Total != 1 || len(listResp.Events) != 1 {
		t.Fatalf("expected 1 event, got %d", listResp.Total)
	}
}

func TestHandleGetByID_FoundAndNotFound(t *testing.T) {
	mockRepo := newMockRepository()
	event := &Event{
		Method:         "POST",
		Path:           "/api/v1/webhooks",
		Payload:        `{"user":"developer"}`,
		ResponseStatus: 200,
		ReceivedAt:     time.Now(),
	}
	_ = mockRepo.Insert(context.Background(), event)

	handler := NewHandler(mockRepo, nil, 1024*1024)

	// Test Found
	req := httptest.NewRequest(http.MethodGet, "/api/v1/webhooks/"+event.ID, nil)
	req.SetPathValue("id", event.ID)
	rr := httptest.NewRecorder()

	handler.HandleGetByID(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rr.Code)
	}

	// Test Not Found
	reqNF := httptest.NewRequest(http.MethodGet, "/api/v1/webhooks/unknown-id", nil)
	reqNF.SetPathValue("id", "unknown-id")
	rrNF := httptest.NewRecorder()

	handler.HandleGetByID(rrNF, reqNF)

	if rrNF.Code != http.StatusNotFound {
		t.Fatalf("expected 404 Not Found, got %d", rrNF.Code)
	}
}

func TestHandleHealth(t *testing.T) {
	handler := NewHandler(nil, nil, 1024*1024)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	rr := httptest.NewRecorder()

	handler.HandleHealth(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d", rr.Code)
	}
}
