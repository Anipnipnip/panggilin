# Panggilin — Webhook Inspector & Replay Tool

> **Panggil. Periksa. Ulangi.** *(Catch it. Inspect it. Replay it.)*

Panggilin adalah developer tool gratis dan *open-source* yang dirancang untuk menerima, menyimpan, memeriksa, dan mengirim ulang (*replay*) request webhook HTTP dalam alur debugging integrasi software.

---

## 🚀 Fitur Utama MVP

- **Webhook Ingestion**: Menerima request HTTP POST dengan validasi JSON dan perlindungan batas ukuran payload (`http.MaxBytesReader`).
- **PostgreSQL Persistence**: Menyimpan riwayat webhook (metadata, headers, payload JSONB, response) secara persisten.
- **Realtime Feed (Server-Sent Events)**: Pembaruan otomatis saat ada webhook baru yang masuk tanpa perlu me-refresh browser.
- **Linear-Inspired Dashboard**:
  - Tampilan tabel compact (*dense but readable*) dengan filter HTTP Method, Status, dan pencarian teks.
  - Penampil Payload JSON terformat aman (bebas evaluasi HTML/XSS).
  - Penyamaran data sensitif (*Masking*) pada Headers (`Authorization`, Cookie, API Key, Token) secara default.
  - Aksi cepat: *Copy Payload*, *Copy as cURL* (dengan sensor rahasia otomatis), dan *Copy Event ID*.
  - Navigasi *Previous / Next* antar event.
  - Dukungan **Light Mode** dan **Dark Mode** dengan preferensi tersimpan di local storage.
  - Halaman **Endpoints** memisahkan *Incoming Endpoints* Panggilin dan *Replay Destinations*.

---

## 🛠️ Tech Stack

- **Backend**: Go 1.24+ (Standard Library HTTP, `pgx/v5` connection pool)
- **Database**: PostgreSQL 16/17
- **Asynchronous / Realtime**: Server-Sent Events (SSE) & Redis queue ready
- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS Design System (Inter + Monospace)
- **Infrastruktur**: Docker Compose

---

## 📦 Prasyarat Sistem

- **Go**: 1.24 atau lebih baru
- **Node.js**: v20+ dan npm
- **PostgreSQL**: v16+ (lokal atau via Docker)
- *(Opsional)* **Docker & Docker Compose**

---

## 🏃 Cara Menjalankan Secara Lokal

### 1. Persiapan Environment & Database

Salin file environment:
```bash
cp .env.example .env
```

Pastikan PostgreSQL aktif (port 5432). Buat database `panggilin`:
```sql
CREATE DATABASE panggilin;
```

Jalankan file migrasi tabel:
```bash
psql -U postgres -d panggilin -f migrations/000001_create_webhooks_table.up.sql
```

*(Atau jika menggunakan Docker Compose)*:
```bash
docker compose up -d
```

---

### 2. Menjalankan Backend (Go)

Kompilasi dan jalankan server HTTP Go:
```bash
# Menguji unit test
go test -v ./...

# Menjalankan server
go run ./cmd/server
```
Server backend akan aktif di `http://localhost:8080`.

---

### 3. Menjalankan Frontend Dashboard (React + Vite)

Buka terminal baru di direktori `frontend`:
```bash
cd frontend
npm install
npm run dev
```
Akses dashboard di browser melalui: `http://localhost:5173/`.

---

## 🧪 Mengirim Webhook Uji Coba

Kirim request webhook ke Panggilin menggunakan `curl`:

```bash
curl -i -X POST http://localhost:8080/api/v1/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-secret-token" \
  -H "X-Custom-Source: payment_gateway" \
  -d '{
    "event": "payment.succeeded",
    "transaction_id": "trx_987654321",
    "amount": 250000,
    "currency": "IDR"
  }'
```

Webhook akan langsung muncul secara *realtime* di dashboard browser Anda!

---

## 🛡️ Kebijakan Keamanan

1. **Anti-XSS**: Payload JSON diperlakukan sebagai data tidak tepercaya dan dirender sebagai teks murni di dalam DOM browser.
2. **Data Sensitif**: Header otentikasi (`Authorization`, `Cookie`, `X-Api-Key`) disamarkan secara otomatis di UI dan saat disalin sebagai perintah cURL (`[REDACTED_SECRET]`).
3. **Pembatasan Ukuran**: Request dibatasi maksimal 1 MB untuk mencegah eksploitasi Denial of Service (DoS) memori.
4. **Proteksi SSRF**: Validasi ketat pada URL tujuan replay untuk memblokir host loopback/internal.

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi terbuka MIT. Bebas digunakan untuk pembelajaran dan pengembangan.
