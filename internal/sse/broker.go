package sse

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

// Client membungkus channel pengiriman pesan ke koneksi SSE aktif.
type Client chan []byte

// Broker mengelola daftar koneksi SSE aktif dan penyiaran (broadcast) pesan.
type Broker struct {
	mu         sync.RWMutex
	clients    map[Client]bool
	newClients chan Client
	defClients chan Client
	messages   chan []byte
}

// NewBroker membuat instance Broker baru dan menjalankan loop event.
func NewBroker() *Broker {
	b := &Broker{
		clients:    make(map[Client]bool),
		newClients: make(chan Client),
		defClients: make(chan Client),
		messages:   make(chan []byte, 100),
	}
	go b.listen()
	return b
}

func (b *Broker) listen() {
	ticker := time.NewTicker(25 * time.Second) // Heartbeat keepalive
	defer ticker.Stop()

	for {
		select {
		case s := <-b.newClients:
			b.mu.Lock()
			b.clients[s] = true
			b.mu.Unlock()
			log.Printf("[SSE] Klien baru terhubung. Total klien aktif: %d", len(b.clients))

		case s := <-b.defClients:
			b.mu.Lock()
			if _, ok := b.clients[s]; ok {
				delete(b.clients, s)
				close(s)
			}
			b.mu.Unlock()
			log.Printf("[SSE] Klien terputus. Total klien aktif: %d", len(b.clients))

		case msg := <-b.messages:
			b.mu.RLock()
			for s := range b.clients {
				select {
				case s <- msg:
				default:
					// Buffer klien penuh, lewati agar tidak memblokir klien lain
				}
			}
			b.mu.RUnlock()

		case <-ticker.C:
			// Kirim SSE comment ping agar koneksi tidak diputus oleh proxy/browser
			ping := []byte(": ping\n\n")
			b.mu.RLock()
			for s := range b.clients {
				select {
				case s <- ping:
				default:
				}
			}
			b.mu.RUnlock()
		}
	}
}

// Broadcast mengirim data JSON ke seluruh klien SSE yang terhubung.
func (b *Broker) Broadcast(eventType string, data interface{}) {
	payload, err := json.Marshal(data)
	if err != nil {
		log.Printf("[SSE_ERROR] Gagal marshal broadcast data: %v", err)
		return
	}

	msg := fmt.Sprintf("event: %s\ndata: %s\n\n", eventType, string(payload))
	b.messages <- []byte(msg)
}

// ServeHTTP menangani request koneksi SSE dari browser.
func (b *Broker) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	clientChan := make(Client, 10)
	b.newClients <- clientChan

	defer func() {
		b.defClients <- clientChan
	}()

	// Kirim pesan salam awal
	fmt.Fprintf(w, "event: connected\ndata: {\"status\":\"connected\"}\n\n")
	flusher.Flush()

	ctx := r.Context()
	for {
		select {
		case <-ctx.Done():
			return
		case msg, ok := <-clientChan:
			if !ok {
				return
			}
			_, _ = w.Write(msg)
			flusher.Flush()
		}
	}
}
