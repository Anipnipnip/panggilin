# Panggilin — Design System & UI Specification

**Dokumen:** `DESIGN.md`  
**Produk:** Panggilin  
**Status:** Baseline desain MVP  
**Target implementasi:** React + TypeScript + Vite  
**Acuan visual:** Linear dan aplikasi developer tools modern

---

## 1. Identitas Brand

- **Nama produk:** Panggilin
- **Deskriptor:** Webhook Inspector & Replay
- **Tagline utama:** Panggil. Periksa. Ulangi.
- **Tagline alternatif (Inggris):** Catch it. Inspect it. Replay it.
- **Karakter:** lokal, mudah diingat, ramah developer, dan profesional.
- **Arah logo:** simbol request/event yang masuk ke endpoint, dipadukan dengan panah berulang untuk merepresentasikan replay. Jaga bentuk tetap sederhana dan terbaca pada ukuran kecil.
- **Penggunaan nama:** tulis sebagai **Panggilin** dengan huruf P kapital; hindari variasi ejaan pada UI, dokumentasi, dan aset brand.
- **Status nama:** masih kandidat dan belum terverifikasi untuk domain, repository, username, atau merek dagang. Pemeriksaan ketersediaan harus dilakukan sebelum peluncuran publik.

Nama dan tagline tidak mengubah cakupan produk: Panggilin tetap berfokus pada penerimaan, inspeksi, penyimpanan, dan replay request webhook.

---

## 2. Tujuan Dokumen

Dokumen ini menetapkan arah visual dan perilaku antarmuka Panggilin agar implementasi frontend konsisten. Dokumen ini berfokus pada pengalaman pengguna, struktur halaman, komponen, feedback, dan aksesibilitas—bukan detail implementasi backend.

Panggilin adalah alat untuk menerima, menyimpan, memeriksa, dan melakukan replay request webhook. Antarmuka harus membantu developer memahami request dengan cepat tanpa dekorasi yang mengganggu.

### Prinsip desain

1. **Developer-first:** utamakan informasi teknis, keterbacaan, dan alur debugging.
2. **Minimal dan fungsional:** terinspirasi Linear; hindari dashboard yang penuh kartu statistik atau dekorasi.
3. **Dense but readable:** tampilkan banyak event dalam ruang yang efisien, dengan hierarki visual yang jelas.
4. **Predictable:** aksi tidak boleh mengubah konteks pengguna secara tiba-tiba.
5. **Safe by default:** aksi yang dapat memengaruhi sistem eksternal harus jelas dan terkonfirmasi.
6. **Accessible:** dukung keyboard, fokus yang terlihat, kontras yang memadai, dan preferensi reduced motion.

---

## 3. Target Pengguna dan Kebutuhan Utama

### Target pengguna

Developer yang membangun atau mengintegrasikan layanan yang mengirim maupun menerima webhook.

### Kebutuhan utama

- Melihat request webhook yang masuk.
- Mencari dan memfilter event.
- Memeriksa payload JSON, headers, informasi request, dan respons.
- Menyalin payload atau Event ID, atau menyalin request sebagai cURL.
- Mengirim ulang request ke replay destination yang sudah dikonfigurasi.
- Mengelola alamat penerima Panggilin dan tujuan Replay dengan jelas.
- Mendapatkan feedback yang dapat dipahami saat loading, berhasil, atau gagal.

---

## 4. Struktur Navigasi dan Layout

### Layout utama

- Gunakan **sidebar kiri yang dapat diciutkan**.
- Dalam keadaan terbuka, sidebar menampilkan ikon dan label menu.
- Dalam keadaan diciutkan, sidebar menampilkan ikon; sediakan tooltip dan accessible label.
- Area konten utama menggunakan sisa ruang layar.
- Header halaman menampilkan judul halaman dan aksi kontekstual.
- Halaman awal setelah membuka aplikasi adalah **Events**.

### Menu MVP

1. **Events** — daftar webhook yang diterima.
2. **Endpoints** — mengelola endpoint penerima Panggilin dan tujuan Replay.

Jangan menambahkan menu utama yang belum dibutuhkan MVP, seperti Analytics atau Integrations, tanpa keputusan produk baru. Replay History dapat ditambahkan kemudian bila alur dan model datanya siap.

### Tema

- Sediakan **Light Mode** dan **Dark Mode**.
- Pengguna dapat mengganti tema melalui toggle yang mudah ditemukan.
- Simpan preferensi tema agar tetap berlaku setelah reload.
- Gunakan token warna semantik agar seluruh komponen berubah konsisten antar tema.
- Pastikan status dan interaksi tetap jelas pada kedua tema.

---

## 5. Sistem Visual

### 4.1 Tipografi

- Gunakan **Inter** untuk UI: navigasi, judul, label, tombol, tabel, formulir, dan notifikasi.
- Gunakan font **monospace** untuk data teknis seperti:
  - JSON payload
  - HTTP headers
  - URL/path
  - Event ID
  - HTTP status code bila sesuai
  - perintah cURL
- Terapkan hierarki ukuran yang sederhana. Hindari terlalu banyak ukuran font.
- Utamakan keterbacaan dan line-height yang memadai untuk payload panjang.

Fallback font harus tersedia jika Inter tidak dapat dimuat. Jangan membuat aplikasi gagal dirender hanya karena font eksternal tidak tersedia.

### 4.2 Warna

- **Aksen utama:** biru.
- **Permukaan:** netral.
  - Light Mode: putih dan abu-abu netral.
  - Dark Mode: charcoal/abu-abu gelap netral.
- Gunakan warna aksen untuk tombol utama, navigasi aktif, tautan, dan fokus—bukan sebagai warna latar dominan.
- Gunakan warna semantik untuk success, warning, dan error dengan kontras yang cukup.
- Jangan mengandalkan warna saja untuk menyampaikan status; sertakan teks dan/atau ikon.
- Hindari penggunaan banyak warna dekoratif.

### 4.3 Kepadatan dan jarak

- Gunakan kepadatan **compact**, terutama pada tabel Events agar banyak baris dapat terlihat sekaligus.
- Tetap pertahankan padding yang cukup untuk target interaksi dan keterbacaan.
- Payload JSON dan konten detail harus memiliki ruang baca yang cukup meskipun tabel menggunakan layout compact.
- Jaga jarak antarkelompok kontrol secara konsisten.

### 4.4 Radius dan batas komponen

- Gunakan **radius sedang** untuk tombol, input, dialog, panel, dan permukaan.
- Gunakan border tipis dan netral untuk memisahkan area; hindari bayangan berlebihan.
- Gunakan elevasi/shadow terutama untuk dialog atau popover yang perlu terlihat berada di atas konten.
- Hindari kartu besar yang tidak menambah informasi.

### 4.5 Ikon dan animasi

- Gunakan ikon sederhana dan konsisten.
- Ikon tanpa label harus memiliki accessible name atau tooltip.
- Animasi hanya untuk membantu memahami perubahan UI, bukan sebagai dekorasi.
- Hormati preferensi `prefers-reduced-motion`.

---

## 6. Halaman Events

### 5.1 Tujuan

Halaman Events adalah halaman utama untuk memantau dan memeriksa request webhook yang diterima Panggilin.

### 5.2 Daftar event

Gunakan **tabel compact** dengan kolom berikut, dalam urutan:

1. **Method** — HTTP method, misalnya `POST`.
2. **Path** — path endpoint yang menerima request.
3. **Status** — status respons/penanganan yang tersedia dan didefinisikan oleh sistem.
4. **Time** — waktu request diterima.

Jangan menambahkan kolom Source IP atau Payload Size ke tabel MVP kecuali keputusan produk berubah. Informasi tambahan dapat tersedia di panel detail jika data tersebut benar-benar dicatat.

### 5.3 Pencarian dan filter

Sediakan:

- Pencarian teks.
- Filter HTTP method.
- Filter status.
- Filter rentang waktu.

Kontrol filter harus mudah dipindai dan tidak mendominasi ruang tabel. Tampilkan state aktif dengan jelas dan sediakan cara untuk membersihkan filter.

Perilaku pencarian perlu didefinisikan konsisten dengan data yang tersedia. Jangan mengklaim pencarian berdasarkan isi payload bila backend belum mendukungnya.

### 5.4 Pemilihan event

- Klik baris untuk memilih event dan membuka detailnya di panel kanan.
- Baris terpilih harus memiliki visual state yang jelas.
- Memilih event lain memperbarui panel detail.
- Pembaruan event baru **tidak boleh mengganti event terpilih secara otomatis**.

### 5.5 Event baru dan pembaruan otomatis

- Perbarui daftar secara otomatis saat webhook baru masuk, menggunakan mekanisme realtime yang didukung aplikasi.
- Tampilkan indikator halus seperti **“New events”** ketika ada event baru yang belum dilihat, atau ketika daftar berada pada posisi yang membuat event baru tidak langsung terlihat.
- Jangan menggeser konteks pengguna atau mengganti event yang sedang dibaca.
- Jika realtime belum tersedia atau koneksi terputus, tampilkan status koneksi secara wajar dan sediakan fallback refresh bila diperlukan.

### 5.6 Empty state

Ketika belum ada event:

- Jelaskan bahwa belum ada webhook yang diterima.
- Tampilkan contoh alamat penerima atau petunjuk singkat untuk mengirim request uji.
- Sediakan contoh perintah atau cara mengirim request lokal bila sesuai.
- Hindari tampilan kosong tanpa arahan.

### 5.7 Pagination dan volume data

Jika jumlah event besar, gunakan pagination atau mekanisme pemuatan bertahap sesuai kemampuan backend. Pertahankan filter dan pencarian saat berpindah halaman. Jangan memuat seluruh riwayat tanpa batas hanya demi UI.

---

## 7. Panel Detail Webhook

### 6.1 Layout

- Detail tampil pada **panel di sebelah kanan** daftar Events.
- Panel harus tetap nyaman digunakan pada ukuran layar yang didukung.
- Pada layar sempit, panel dapat berubah menjadi tampilan overlay atau halaman detail yang memenuhi area konten, tanpa menghilangkan kemampuan kembali ke daftar.
- Bagian atas panel menampilkan identitas ringkas event dan toolbar aksi.

### 6.2 Toolbar aksi

Tampilkan aksi berikut di toolbar atas panel:

- **Copy Payload**
- **Copy as cURL**
- **Copy Event ID**
- **Replay**

Gunakan label yang jelas pada viewport yang cukup lebar. Pada layar sempit, sebagian aksi dapat masuk ke menu overflow, tetapi aksi utama tetap mudah ditemukan. Ikon tanpa teks harus memiliki tooltip dan accessible label.

### 6.3 Tab detail

Sediakan empat tab berikut:

#### Payload

- Tampilkan body request sebagai JSON terformat bila body merupakan JSON valid.
- Gunakan syntax highlighting dengan kontras yang baik.
- Pertahankan indentasi dan dukung payload panjang melalui scrolling di area konten.
- Sediakan fallback raw text untuk body yang bukan JSON valid.
- Hindari merender konten payload sebagai HTML aktif.
- Pertimbangkan tombol expand/collapse untuk objek atau array yang besar jika implementasi mendukungnya.

#### Headers

- Tampilkan request headers dalam format key/value yang mudah dibaca.
- Header sensitif seperti `Authorization`, cookie, API key, atau token harus disamarkan secara default.
- Jika pengguna menyalin headers, jangan memasukkan nilai rahasia yang disamarkan kembali ke clipboard.
- Jangan mengasumsikan semua header tersedia jika sistem tidak menyimpannya.

#### Request Info

Tampilkan informasi teknis yang tersedia, seperti:

- Method
- URL/path penerima
- Waktu diterima
- IP pengirim, jika dicatat
- Ukuran body, jika dicatat
- Durasi penanganan, jika dicatat
- Identitas event

Hanya tampilkan metrik yang benar-benar diukur atau disimpan. Jangan membuat nilai perkiraan seolah-olah merupakan fakta.

#### Response

- Tampilkan respons HTTP yang dikirim Panggilin kepada pengirim webhook, jika informasi tersebut dicatat.
- Sertakan status code dan body respons jika tersedia.
- Jelaskan bila detail respons tidak disimpan atau tidak tersedia.
- Jangan menyamakan respons Panggilin dengan respons layanan bisnis/pengirim webhook.

### 6.4 Previous / Next

- Sediakan tombol **Previous** dan **Next** pada panel detail untuk menavigasi event.
- Navigasi mengikuti urutan daftar yang sedang diterapkan, termasuk filter dan pengurutan aktif.
- Nonaktifkan tombol jika tidak ada event sebelumnya/berikutnya.
- Perubahan pilihan harus memperbarui panel tanpa menutupnya.
- Tetap izinkan pengguna memilih event langsung dari tabel.

### 6.5 Copy feedback

- Setelah copy berhasil, tampilkan toast singkat seperti “Payload copied” atau “Event ID copied”.
- Jika clipboard gagal, tampilkan pesan yang jelas dan jangan menyatakan berhasil.
- Copy as cURL harus menghasilkan perintah yang dapat dibaca dan diedit.
- Jangan memasukkan token atau header sensitif ke cURL secara terbuka. Gunakan placeholder atau redaksi untuk nilai rahasia.

---

## 8. Replay

### 7.1 Perilaku

- Replay mengirim ulang request webhook yang tersimpan ke **tujuan Replay yang sudah dikonfigurasi**.
- Pengguna tidak perlu memasukkan URL tujuan setiap kali melakukan Replay.
- Tujuan Replay dikelola melalui halaman Endpoints.
- UI harus membedakan event asli dari hasil Replay agar tidak membingungkan riwayat request.

### 7.2 Dialog konfirmasi

Sebelum Replay dikirim, tampilkan dialog yang berisi:

- Identitas ringkas event.
- Tujuan Replay yang akan menerima request.
- Ringkasan method dan path.
- Peringatan singkat bahwa request dapat memicu efek nyata di sistem tujuan.
- Tombol **Cancel** dan **Confirm Replay**.

Jangan mengirim request sebelum pengguna mengonfirmasi.

### 7.3 Status Replay

Tampilkan status yang jelas:

- **Sending** — request sedang dikirim.
- **Success** — tujuan merespons dengan hasil yang dikategorikan berhasil sesuai definisi backend.
- **Failed** — request gagal dikirim atau hasilnya dikategorikan gagal.

Sertakan HTTP status code jika tersedia. Bedakan kegagalan jaringan dari respons HTTP non-success bila backend menyediakan detail tersebut. Jangan menyimpulkan bahwa operasi bisnis di server tujuan berhasil hanya karena server memberikan respons HTTP sukses.

### 7.4 Keamanan

- Validasi dan batasi URL tujuan di backend untuk mencegah SSRF.
- Blokir tujuan internal atau alamat terlarang sesuai kebijakan keamanan backend.
- Batasi redirect atau validasi setiap redirect dengan aman.
- Terapkan timeout dan batas ukuran request.
- Jangan mengekspos secret atau header autentikasi dalam dialog maupun log UI.
- UI bukan pengganti validasi keamanan di backend.

---

## 9. Halaman Endpoints

### 8.1 Tujuan dan pemisahan konsep

Halaman Endpoints mengelola dua konsep yang harus dibedakan secara visual:

1. **Incoming endpoints:** alamat Panggilin yang menerima webhook dari layanan eksternal.
2. **Replay destinations:** alamat tujuan yang menerima request saat Replay.

Keduanya tidak boleh ditampilkan seolah-olah merupakan alamat yang sama. Gunakan judul/subbagian yang jelas dan deskripsi singkat yang menjelaskan fungsinya.

### 8.2 Layout

- Gunakan tabel.
- Untuk daftar tujuan Replay, tampilkan kolom:
  1. Name
  2. URL
  3. Created At
  4. Status
- Alamat penerima Panggilin ditampilkan pada bagian terpisah dengan instruksi penggunaan yang jelas.
- Jangan mencampurkan kolom atau status incoming endpoint dan replay destination tanpa label yang membedakan keduanya.

### 8.3 Menambahkan endpoint

- Tombol utama: **Add Endpoint**.
- Formulir dibuka dalam **dialog/modal**.
- Formulir minimal meminta nama endpoint dan URL tujuan Replay, serta field tambahan yang memang diperlukan oleh implementasi.
- Validasi input di sisi UI untuk feedback cepat, tetapi validasi final wajib dilakukan backend.
- Pesan validasi harus spesifik pada field yang bermasalah.
- Dialog mendukung keyboard, memiliki judul yang jelas, dan mengembalikan fokus ke kontrol pemicu saat ditutup.

### 8.4 Empty state

Jika belum ada tujuan Replay:

- Jelaskan kegunaan tujuan Replay.
- Berikan contoh URL yang tidak mengarah ke layanan nyata, misalnya `https://example.com/webhook`.
- Sediakan tombol **Add Endpoint**.
- Hindari menampilkan endpoint contoh seolah-olah sudah terdaftar atau aktif.

### 8.5 Status dan aksi

- Status harus berupa label teks yang jelas, bukan warna saja.
- Jika tersedia aksi edit atau delete, gunakan konfirmasi untuk penghapusan.
- Setelah perubahan berhasil, perbarui tabel dan tampilkan toast.
- Jika endpoint sedang digunakan oleh Replay atau memiliki batasan penghapusan, jelaskan alasannya sebelum pengguna mengonfirmasi.

---

## 10. UI States dan Feedback

### 9.1 Loading

- Gunakan **skeleton placeholders** untuk tabel Events, daftar Endpoints, dan panel detail.
- Skeleton harus menyerupai struktur konten yang akan muncul.
- Hindari skeleton yang berkedip cepat atau animasi berlebihan.
- Bedakan loading awal dari refresh ringan jika memungkinkan.

### 9.2 Success

- Gunakan **toast notification** untuk keberhasilan aksi, misalnya:
  - `Endpoint created`
  - `Endpoint updated`
  - `Payload copied`
  - `Replay completed`
- Toast tidak boleh menjadi satu-satunya tempat menyimpan informasi penting yang perlu dibaca lama.
- Toast harus memiliki teks yang jelas dan tidak hanya berupa warna atau ikon.

### 9.3 Error

- Utamakan pesan error **inline** di area yang relevan.
- Gunakan toast tambahan bila error juga perlu menarik perhatian pengguna.
- Sertakan aksi pemulihan bila memungkinkan, misalnya **Try again**.
- Gunakan bahasa yang ringkas dan spesifik, contohnya: “Failed to load events. Try again.”
- Jangan tampilkan stack trace, query database, secret, atau detail internal server kepada pengguna.

### 9.4 Dialog aksi berbahaya

- Gunakan dialog konfirmasi untuk Replay dan penghapusan endpoint.
- Tampilkan tindakan yang akan dilakukan dan objek yang terdampak.
- Sediakan tombol Cancel yang mudah ditemukan.
- Gunakan label tombol yang spesifik, misalnya **Confirm Replay** atau **Delete Endpoint**, bukan label samar seperti “OK”.
- Untuk penghapusan yang sulit dipulihkan, pertimbangkan konfirmasi tambahan seperti mengetik nama endpoint; jangan mewajibkannya untuk setiap aksi.

### 9.5 Kegagalan koneksi realtime

Jika koneksi untuk update otomatis terputus:

- Tampilkan indikator koneksi yang tidak mengganggu.
- Jangan menghapus data yang sudah tampil hanya karena koneksi terputus.
- Sediakan cara memuat ulang data.
- Saat koneksi pulih, sinkronkan event terbaru tanpa mengganti event yang sedang dipilih.

---

## 11. Responsivitas

- Desktop adalah target utama karena Panggilin merupakan developer tool.
- Pada desktop, sidebar dan tabel Events ditampilkan berdampingan dengan panel detail.
- Pada viewport menengah, jaga agar kolom penting tetap terbaca; panel detail dapat memiliki lebar minimum yang wajar.
- Pada viewport sempit, panel detail dapat menjadi overlay/halaman tersendiri dan tabel boleh memakai horizontal scrolling bila perlu.
- Jangan menghilangkan informasi teknis penting hanya untuk memaksakan semua kolom pada layar kecil.
- Kontrol utama harus tetap dapat dioperasikan dengan keyboard dan layar sentuh.

---

## 12. Aksesibilitas

Standar dasar yang wajib dipenuhi:

### Kontras

- Targetkan **WCAG 2.2 AA** untuk kontras teks dan komponen UI.
- Periksa Light Mode dan Dark Mode secara terpisah.
- Status, teks placeholder, border input, dan teks sekunder harus tetap dapat dibaca.

### Keyboard

- Semua menu, tombol, filter, tab, dialog, dan kontrol interaktif dapat dioperasikan dengan keyboard.
- Dialog mengelola fokus dengan benar dan mengembalikannya setelah ditutup.
- Jangan membuat fitur yang hanya dapat digunakan dengan hover atau drag.

### Focus indicator

- Tampilkan indikator fokus yang terlihat untuk elemen interaktif.
- Jangan menghapus outline tanpa menyediakan pengganti yang jelas.
- Pastikan indikator fokus tidak tertutup oleh panel atau overflow.

### Reduced motion

- Hormati `prefers-reduced-motion`.
- Kurangi atau hilangkan transisi yang tidak esensial jika pengguna meminta reduced motion.

### Status dan pembaca layar

- Jangan menyampaikan status hanya lewat warna.
- Toast dan status Replay perlu diumumkan secara wajar melalui pola live region yang sesuai.
- Gunakan label yang jelas pada input dan accessible name untuk ikon.
- Urutan heading dan struktur halaman harus logis.

---

## 13. Keamanan dan Penanganan Data di UI

- Perlakukan payload webhook sebagai **data tidak tepercaya**.
- Render payload sebagai teks, bukan HTML aktif.
- Jangan menjalankan script, HTML, atau konten aktif yang dikirim dalam payload.
- Samarkan token, cookie, API key, dan informasi autentikasi secara default pada headers maupun output salinan.
- Hindari menampilkan secret pada toast, error, log frontend, atau URL navigasi.
- Berikan feedback yang jelas saat payload terlalu besar atau formatnya tidak valid.
- UI harus membatasi tampilan data besar bila perlu tanpa mengubah data asli yang disimpan.
- Jangan menaruh credential sensitif di local storage atau konfigurasi frontend publik.

---

## 14. Komponen UI yang Disarankan

Bangun komponen yang dapat digunakan ulang, misalnya:

- `AppShell`
- `Sidebar`
- `ThemeToggle`
- `PageHeader`
- `EventsTable`
- `EventFilters`
- `EventDetailPanel`
- `EventDetailTabs`
- `JsonViewer`
- `CopyButton`
- `ReplayConfirmationDialog`
- `ReplayStatus`
- `EndpointsTable`
- `EndpointFormDialog`
- `ToastProvider`
- `SkeletonTable`
- `EmptyState`
- `InlineError`

Nama komponen adalah rekomendasi, bukan kewajiban. Prioritaskan pemisahan tanggung jawab, aksesibilitas, dan kemudahan pemeliharaan.

---

## 15. Batasan MVP

Fokus implementasi awal:

- Light/Dark Mode dengan preferensi yang tersimpan.
- Sidebar kiri yang dapat diciutkan.
- Halaman Events sebagai halaman awal.
- Tabel Events dengan kolom Method, Path, Status, Time.
- Pencarian dan filter method, status, serta rentang waktu.
- Panel detail dengan tab Payload, Headers, Request Info, Response.
- JSON viewer yang aman, terformat, dan memiliki syntax highlighting.
- Copy Payload, Copy as cURL, Copy Event ID.
- Previous/Next pada panel detail.
- Pembaruan event baru tanpa mengganti event terpilih.
- Halaman Endpoints dengan incoming endpoint dan replay destination yang dipisahkan.
- Dialog tambah endpoint.
- Dialog konfirmasi Replay dan feedback status Replay.
- Skeleton, toast, inline error, dan empty states.
- Standar aksesibilitas yang dijelaskan dalam dokumen ini.

### Di luar cakupan desain MVP kecuali diputuskan kemudian

- Analytics/dashboard statistik yang kompleks.
- Integrasi pihak ketiga yang luas.
- Replay scheduling atau retry otomatis kompleks.
- Pengaturan pengguna/organisasi multi-tenant tingkat lanjut.
- Pengeditan payload secara interaktif sebelum Replay.
- Fitur yang tidak didukung oleh backend.

Jangan menampilkan tombol fitur yang belum berfungsi. Jika suatu kemampuan belum tersedia, jangan membuat UI seolah-olah sudah aktif.

---

## 16. Acceptance Checklist untuk Review UI

Gunakan checklist ini saat meninjau implementasi frontend:

- [ ] Light Mode dan Dark Mode berfungsi dan preferensinya bertahan setelah reload.
- [ ] Sidebar dapat diciutkan dan tetap dapat dipahami saat hanya menampilkan ikon.
- [ ] Events adalah halaman awal.
- [ ] Tabel Events memiliki kolom Method, Path, Status, dan Time.
- [ ] Pencarian dan filter method, status, serta rentang waktu tersedia.
- [ ] Memilih event membuka panel detail di kanan.
- [ ] Panel detail memiliki tab Payload, Headers, Request Info, dan Response.
- [ ] Payload ditampilkan dengan aman; JSON valid diformat dan diberi syntax highlighting.
- [ ] Aksi Copy Payload, Copy as cURL, dan Copy Event ID tersedia.
- [ ] Previous/Next mengikuti urutan daftar yang aktif.
- [ ] Event baru tidak mengganti event terpilih.
- [ ] Incoming endpoint dan Replay destination dibedakan dengan jelas.
- [ ] Endpoints menggunakan tabel dengan kolom Name, URL, Created At, Status untuk tujuan Replay.
- [ ] Add Endpoint membuka dialog/modal.
- [ ] Empty state menjelaskan langkah berikutnya dan menyediakan aksi yang relevan.
- [ ] Replay meminta konfirmasi dan menampilkan tujuan serta ringkasan request.
- [ ] Status Replay menunjukkan Sending, Success, atau Failed dan HTTP status jika tersedia.
- [ ] Loading menggunakan skeleton yang sesuai.
- [ ] Aksi berhasil memberi toast.
- [ ] Error dijelaskan secara inline dan menawarkan pemulihan jika memungkinkan.
- [ ] Dialog aksi berbahaya memiliki tombol Cancel yang jelas.
- [ ] UI dapat digunakan dengan keyboard dan memiliki indikator fokus.
- [ ] Kontras diperiksa di Light Mode dan Dark Mode.
- [ ] Reduced motion dihormati.
- [ ] Status tidak hanya dibedakan menggunakan warna.
- [ ] Payload dan headers tidak mengeksekusi konten aktif atau membocorkan secret.

---

## 17. Panduan untuk AI Coding Agent

Saat mengimplementasikan dokumen ini:

1. Baca `PRD.md` dan dokumen arsitektur terkait sebelum mengubah kode.
2. Ikuti stack dan batasan yang telah ditetapkan proyek.
3. Implementasikan secara bertahap; jangan membangun seluruh fitur sekaligus.
4. Jangan menambahkan library UI atau dependency baru tanpa alasan yang jelas.
5. Gunakan komponen reusable dan token tema yang konsisten.
6. Jangan membuat data, status, atau feedback palsu untuk menutupi endpoint backend yang belum tersedia.
7. Jika backend belum mendukung fitur tertentu, jelaskan gap tersebut sebelum membuat kontrak baru.
8. Jangan menambahkan menu atau fitur di luar MVP tanpa persetujuan.
9. Validasi seluruh state penting: loading, success, empty, error, dan data panjang.
10. Periksa aksesibilitas keyboard, fokus, kontras, reduced motion, dan rendering payload tidak tepercaya.
11. Jalankan lint, typecheck, dan test yang tersedia setelah perubahan.
12. Laporkan file yang diubah, keputusan penting, pengujian yang dijalankan, dan pekerjaan yang masih tersisa.

---

## 18. Catatan Implementasi yang Perlu Disepakati dengan PRD

Dokumen ini menjelaskan pengalaman UI. Perilaku berikut perlu selaras dengan PRD dan API backend sebelum implementasi:

- Definisi pasti kolom `Status` pada Events.
- Format serta cakupan pencarian payload.
- Urutan default Events dan perilaku pagination.
- Apakah response body/header disimpan atau hanya status code.
- Skema penyimpanan dan retensi data Replay.
- Definisi `Success` untuk hasil Replay.
- Cara membuat, menampilkan, dan mengamankan incoming endpoint Panggilin.
- Validasi dan kebijakan URL tujuan Replay.
- Field yang dapat diedit pada Replay destination.
- Mekanisme realtime, reconnect, dan fallback refresh.

Jika terdapat konflik antara mockup, PRD, dan implementasi backend, jangan menebak diam-diam. Catat konflik dan selesaikan kontrak terlebih dahulu.

---

**Akhir dokumen.**
