# Product Requirements Document (PRD)

# Panggilin — Webhook Inspector & Replay Tool

**Versi:** 1.2\
**Status:** Draft untuk MVP\
**Bahasa:** Indonesia

## Identitas Brand

- **Nama produk:** Panggilin
- **Deskripsi:** Free, open-source webhook inspector and replay tool.
- **Tagline utama:** Panggil. Periksa. Ulangi.
- **Tagline alternatif (Inggris):** Catch it. Inspect it. Replay it.
- **Karakter brand:** lokal, mudah diingat, ramah developer, tetapi tetap profesional.
- **Status nama:** kandidat brand; ketersediaan domain, repository, username, dan merek dagang belum diverifikasi. Jangan menganggap nama ini sudah aman secara hukum atau digital sebelum pemeriksaan selesai.

Nama Panggilin tidak mengubah ruang lingkup produk. Fokus tetap pada penerimaan, penyimpanan, inspeksi, dan replay request webhook.

## 1. Ringkasan Produk

Panggilin adalah aplikasi web untuk menerima, menyimpan, melihat, dan
menguji webhook. Pengguna dapat mengirim HTTP request ke endpoint
Panggilin, lalu memeriksa informasi request tersebut melalui dashboard.

Panggilin ditujukan sebagai proyek open-source sekaligus sarana belajar
membangun aplikasi full-stack menggunakan Go, PostgreSQL, Redis, dan
React + TypeScript.

Panggilin bukan penyedia layanan pembayaran atau WhatsApp. Aplikasi ini
merupakan alat bantu untuk memeriksa webhook yang dikirim oleh aplikasi
atau layanan lain.

## 2. Masalah yang Ingin Diselesaikan

Saat mengintegrasikan dua aplikasi, developer perlu mengetahui apakah
webhook benar-benar dikirim, data apa yang diterima, dan bagaimana
bentuk request-nya. Memeriksa request secara manual dapat merepotkan,
terutama saat proses debugging.

Panggilin menyediakan endpoint pengujian dan dashboard untuk membantu
developer melihat request webhook yang masuk dengan lebih mudah.

## 3. Tujuan

-   Membangun aplikasi full-stack yang bisa dijalankan secara lokal.
-   Menerima webhook HTTP dan menampilkan payload-nya.
-   Menyimpan riwayat webhook agar tetap tersedia setelah backend
    dimulai ulang.
-   Menyediakan dashboard untuk melihat daftar dan detail webhook.
-   Menyediakan fondasi untuk fitur replay webhook.
-   Menggunakan Go, PostgreSQL, Redis, dan React + TypeScript dengan
    alasan yang jelas.
-   Menghasilkan repository open-source dengan dokumentasi instalasi dan
    pengujian.

## 4. Target Pengguna

Developer atau mahasiswa yang sedang mempelajari atau menguji integrasi
antar-aplikasi, misalnya integrasi pembayaran, chatbot, e-commerce, atau
layanan pengiriman.

## 5. Ruang Lingkup MVP

### 5.1 Fitur utama

1.  **Menerima webhook**
    -   Backend menyediakan endpoint HTTP untuk menerima request POST.
    -   Payload JSON yang valid dapat diterima.
    -   Informasi dasar request dicatat, termasuk waktu penerimaan, HTTP
        method, path, header yang relevan, dan payload.
    -   Ukuran request dibatasi untuk mencegah payload yang terlalu
        besar.
2.  **Menyimpan riwayat webhook**
    -   Informasi webhook disimpan di PostgreSQL.
    -   Riwayat tetap tersedia setelah backend dimulai ulang.
    -   Kegagalan penyimpanan ditangani secara aman dan dicatat.
3.  **Melihat daftar webhook**
    -   Dashboard menampilkan webhook yang diterima.
    -   Informasi ringkas mencakup waktu, endpoint, dan jenis/status
        pemrosesan jika tersedia.
    -   Pengguna dapat membuka salah satu item untuk melihat detail.
4.  **Melihat detail webhook**
    -   Detail menampilkan payload JSON, waktu penerimaan, method, path,
        dan header yang relevan.
    -   Data yang berasal dari request diperlakukan sebagai data tidak
        tepercaya dan ditampilkan dengan aman.
5.  **Fondasi replay webhook**
    -   Setelah fitur dasar stabil, pengguna dapat meminta Panggilin
        mengirim ulang request yang tersimpan ke URL tujuan yang
        ditentukan.
    -   Replay harus memiliki validasi URL dan batasan keamanan untuk
        mengurangi risiko penyalahgunaan.
    -   Fitur replay tidak perlu disertakan pada tahap pertama
        implementasi.

### 5.2 Fitur Redis

Redis termasuk dalam arsitektur proyek, tetapi penggunaannya harus
bertahap dan tidak menggantikan PostgreSQL sebagai penyimpanan riwayat
utama.

Rencana penggunaan Redis: - Menjadi fondasi antrean pekerjaan untuk
proses replay atau pekerjaan latar belakang pada tahap lanjutan. -
Menyimpan data sementara yang memang membutuhkan akses cepat jika
kebutuhan sudah jelas. - Menambahkan Redis hanya pada tahap ketika ada
fitur yang benar-benar memerlukannya; tidak perlu memasukkannya ke jalur
penerimaan webhook paling sederhana sejak hari pertama.

Jika antrean Redis diimplementasikan, sistem harus mempertimbangkan
kegagalan pemrosesan, percobaan ulang, dan perilaku saat Redis tidak
tersedia. PostgreSQL tetap menjadi sumber utama riwayat webhook yang
tersimpan.

## 6. Di Luar Ruang Lingkup MVP

-   Sistem akun, login, dan manajemen organisasi.
-   Multi-tenant dengan banyak tim/proyek.
-   Integrasi khusus dengan akun WhatsApp atau penyedia pembayaran.
-   Otomatis mengirim balasan WhatsApp.
-   Sistem billing atau pembayaran untuk Panggilin.
-   Arsitektur microservices.
-   Kubernetes atau infrastruktur produksi skala besar.
-   Pemrosesan volume besar sebelum ada kebutuhan dan pengujian yang
    mendukungnya.

## 7. Teknologi

-   **Go:** backend HTTP API dan pemrosesan request webhook.
-   **PostgreSQL:** penyimpanan permanen untuk riwayat webhook dan
    metadata terkait.
-   **Redis:** penyimpanan sementara/antrean pekerjaan untuk fitur
    lanjutan seperti replay.
-   **React + TypeScript:** dashboard web.
-   **Vite:** tooling pengembangan frontend.
-   **Docker Compose:** membantu menjalankan layanan lokal seperti
    PostgreSQL dan Redis secara konsisten.
-   **Testing tools:** Go test dan curl atau Postman untuk menguji
    endpoint. Pilihan alat tambahan dapat ditentukan saat implementasi.

## 8. Persyaratan Frontend dan UX

PRD ini sudah menetapkan **frontend dashboard React + TypeScript**,
halaman utama, dan informasi yang perlu ditampilkan. Namun, dokumen ini
belum menetapkan desain visual final atau mockup pixel-perfect. Tampilan
detail dapat dirancang dan disepakati sebelum tahap implementasi
frontend.

### 8.1 Halaman Dashboard

Dashboard menjadi halaman utama setelah aplikasi dibuka.

Elemen yang dibutuhkan: - Nama produk Panggilin. - Navigasi sederhana. -
Ringkasan jumlah webhook yang diterima (jika datanya tersedia). - Tabel
atau daftar webhook terbaru. - Kolom informasi minimal: waktu diterima,
method, endpoint, dan ringkasan status. - Loading state, empty state
ketika belum ada data, dan error state ketika data gagal dimuat. -
Tautan atau tindakan untuk membuka detail webhook.

### 8.2 Halaman Detail Webhook

Elemen yang dibutuhkan: - Identitas webhook dan waktu penerimaan. - HTTP
method dan path. - Header yang relevan. - Payload JSON dengan format
yang mudah dibaca. - Tombol salin payload bila mudah dan aman
diimplementasikan. - Tombol replay dapat ditambahkan pada tahap
lanjutan, bukan diwajibkan pada versi pertama.

### 8.3 Prinsip desain

-   Bersih, sederhana, dan berorientasi pada developer.
-   Informasi teknis mudah dibaca.
-   Payload JSON ditampilkan dalam area yang dapat dibaca tanpa merusak
    layout.
-   Tampilan responsif untuk desktop dan layar lebih kecil.
-   Data webhook tidak boleh dirender sebagai HTML aktif.
-   Jangan membuat fitur atau tombol yang belum berfungsi.

## 9. Persyaratan Nonfungsional

-   Struktur kode mudah dipahami pemula dan mudah dikembangkan.
-   Konfigurasi sensitif disimpan melalui environment variables, bukan
    hard-coded.
-   Error ditangani dengan pesan yang sesuai dan tidak membocorkan
    informasi sensitif.
-   Endpoint memiliki batas ukuran request.
-   Validasi dan pengujian dasar tersedia.
-   Instruksi setup lokal terdokumentasi.
-   Layanan lokal dapat dijalankan dengan langkah yang jelas.
-   Tidak mengklaim sistem siap produksi tanpa pengujian dan tinjauan
    keamanan yang sesuai.

## 10. Kriteria Penerimaan

MVP dinyatakan memenuhi sasaran dasar ketika: 1. Backend Go dapat
dijalankan secara lokal. 2. Endpoint menerima POST dengan payload JSON
valid. 3. Request webhook tercatat di PostgreSQL. 4. Data yang tersimpan
tetap tersedia setelah backend dimulai ulang. 5. Dashboard menampilkan
daftar webhook yang tersimpan. 6. Halaman detail menampilkan payload dan
metadata yang benar. 7. Payload ditampilkan sebagai data, bukan
dieksekusi sebagai HTML. 8. Request invalid dan payload terlalu besar
ditangani dengan benar. 9. Tersedia pengujian dasar untuk jalur penting.
10. README menjelaskan cara instalasi, konfigurasi, menjalankan, dan
menguji aplikasi.

Redis dan replay dapat diimplementasikan pada tahap terpisah setelah
alur dasar berhasil. Jika Redis sudah diintegrasikan, dokumentasi harus
menjelaskan perannya dan cara menjalankannya.

## 11. Tahapan Implementasi

### Tahap 0 --- Persiapan

-   Periksa instalasi Go, Git, Node.js, dan Docker.
-   Buat repository dan dokumentasi PRD.
-   Sepakati struktur folder awal.

### Tahap 1 --- Server HTTP Go

-   Buat server HTTP.
-   Buat endpoint POST pengujian.
-   Baca dan validasi payload JSON.
-   Tampilkan hasil penerimaan di log.
-   Uji menggunakan curl atau Postman.

**Hasil:** webhook dapat diterima, belum disimpan permanen.

### Tahap 2 --- PostgreSQL

-   Jalankan PostgreSQL secara lokal.
-   Rancang tabel untuk menyimpan webhook.
-   Simpan request yang valid.
-   Buat endpoint untuk mengambil daftar dan detail.
-   Uji persistensi setelah backend dimulai ulang.

**Hasil:** webhook tersimpan dan bisa diambil kembali melalui API.

### Tahap 3 --- Frontend Dashboard

-   Buat aplikasi React + TypeScript menggunakan Vite.
-   Bangun halaman daftar webhook dan detail.
-   Hubungkan frontend ke API Go.
-   Tambahkan loading, empty, dan error states.
-   Uji tampilan dan alur utama.

**Hasil:** pengguna dapat memeriksa webhook melalui browser.

### Tahap 4 --- Redis dan Replay

-   Jelaskan terlebih dahulu kebutuhan antrean pekerjaan.
-   Integrasikan Redis secara terukur untuk pekerjaan replay/latar
    belakang.
-   Validasi URL tujuan dan batasi perilaku replay.
-   Tangani kegagalan, status pekerjaan, dan retry secara terkontrol.
-   Uji kondisi ketika Redis tidak tersedia.

**Hasil:** fondasi pemrosesan pekerjaan latar belakang tersedia.

### Tahap 5 --- Keamanan dan Kualitas

-   Tambahkan batas ukuran request dan validasi.
-   Pastikan payload ditampilkan dengan aman.
-   Tambahkan pengujian untuk kasus error.
-   Periksa penanganan rahasia dan konfigurasi.
-   Tinjau risiko replay ke URL yang tidak tepercaya.

### Tahap 6 --- Dokumentasi dan Open Source

-   Tulis README dan panduan setup.
-   Dokumentasikan contoh request.
-   Tambahkan contoh environment configuration tanpa rahasia.
-   Jelaskan fitur yang sudah tersedia dan yang belum.
-   Pastikan instruksi setup dapat diikuti dari awal.

## 12. Aturan Kerja untuk AI Coding Agent

AI coding agent harus: - Membaca PRD sebelum melakukan perubahan. -
Menjelaskan konsep dan rencana sebelum mengerjakan tahap baru. -
Mengerjakan satu tahap pada satu waktu. - Menjelaskan tujuan file dan
keputusan teknis dengan bahasa Indonesia yang sederhana. - Menjalankan
atau menyarankan pengujian yang sesuai setelah perubahan. - Tidak
menambahkan teknologi atau arsitektur yang belum dibutuhkan. - Tidak
mengimplementasikan seluruh aplikasi sekaligus. - Tidak mengklaim tes
berhasil jika tes belum dijalankan. - Menandai asumsi dan meminta
persetujuan ketika keputusan berdampak besar. - Memperbarui dokumentasi
ketika perilaku aplikasi berubah.

## 13. Definisi Selesai untuk Setiap Tahap

Satu tahap dianggap selesai jika: - Implementasi sesuai tujuan tahap. -
Pengujian yang relevan berhasil atau keterbatasannya dijelaskan dengan
jujur. - Pengguna mendapat penjelasan tentang kode dan cara
menjalankannya. - Tidak ada fitur tambahan yang tidak diperlukan. -
Langkah berikutnya dijelaskan sebelum mulai dikerjakan.

## 14. Catatan Penting

PRD ini adalah panduan awal yang dapat diperbarui seiring pembelajaran.
Jika kebutuhan berubah, perubahan harus dijelaskan dan disepakati
terlebih dahulu. Fokus utama adalah membangun aplikasi yang berfungsi,
memahami setiap komponen, dan menjaga cakupan tetap realistis untuk
proyek pertama Go.
