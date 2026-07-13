# Task: Update Landing Page

Kerjakan seluruh perbaikan berikut pada halaman Landing Page (`resources/js/pages/welcome.tsx` dan komponen terkait). Analisis terlebih dahulu struktur section yang ada saat ini sebelum melakukan perubahan. Gunakan best practice Laravel dan React. Jangan mengubah fitur/halaman lain yang tidak berkaitan.

> Referensi struktur section saat ini di `welcome.tsx` (dari atas ke bawah): Promo top banner → `PublicNavbar` → Hero → Studi Kasus/Featured Courses (grid) → Cara Kerja (3 langkah) → Kategori (stack & topik) → Paket Bundle ("Paling Hemat") → Testimonial → FAQ → CTA Banner akhir (berisi kode promo) → `PublicFooter`.

---

## 1. Hero — Ganti Ilustrasi Jadi Thumbnail Course Terbaik

### Kondisi Saat Ini
Bagian kanan Hero memakai ilustrasi custom (avatar kartun + badge mengambang "Progres Web Dev", "streak", "Studi Kasus") — bukan gambar course sungguhan.

### Perubahan yang Diinginkan
Ganti bagian kanan Hero dengan **gambar thumbnail course terbaik** (mis. course dengan rating/penjualan tertinggi, atau featured course pertama). Badge-badge mengambang boleh dipertahankan sebagai overlay dekoratif di atas gambar jika masih relevan.

---

## 2. Hero — Sederhanakan Jadi 1 Tombol CTA

### Kondisi Saat Ini
Ada 2 tombol di Hero: **"Mulai gratis"** (link ke halaman Register) dan **"Lihat cara kerja"** (anchor ke section Cara Kerja).

### Perubahan yang Diinginkan
Hilangkan kedua tombol tersebut, ganti dengan **1 tombol CTA** yang mengarah ke halaman **daftar/katalog course** (`/courses`).

---

## 3. Section Voucher — Pindahkan ke Bawah Hero, Full-Width

### Kondisi Saat Ini
- Ada **promo banner tipis di atas navbar** (sebelum `PublicNavbar`) bertuliskan kode voucher "NGODING40".
- Ada juga **kotak kode promo** di dalam CTA banner paling bawah halaman (section "Siap mulai ngoding?").

### Perubahan yang Diinginkan
- **Hapus** promo banner tipis di atas navbar.
- Buat **section Voucher baru** yang diletakkan **tepat di bawah Hero**, tampil **full-width (selebar halaman)**, bukan kotak kecil seperti sebelumnya.

---

## 4. Section Kategori — Setelah Voucher

### Kondisi Saat Ini
Section "Jelajahi per stack & topik" sudah ada, saat ini posisinya di antara Cara Kerja dan Paket Bundle.

### Perubahan yang Diinginkan
Pindahkan section ini agar tampil **tepat di bawah section Voucher** (lihat poin 3).

---

## 5. Section Galeri Proyek Course — Model Carousel

### Kondisi Saat Ini
Section "Studi kasus nyata, langsung jadi portfolio" menampilkan course unggulan dalam bentuk **grid statis** (4 kolom).

### Perubahan yang Diinginkan
Ubah section ini menjadi **galeri/carousel** yang menampilkan proyek/tampilan course (bisa geser kiri-kanan), bukan grid statis.

---

## 6. List Testimonial

### Kondisi Saat Ini
Section "Kata Siswa" sudah ada dan sudah sesuai.

### Perubahan yang Diinginkan
Tetap dipertahankan — pastikan urutannya tampil setelah section Galeri Proyek (poin 5).

---

## 7. Section FAQ

### Kondisi Saat Ini
Section FAQ accordion sudah ada dan sudah sesuai.

### Perubahan yang Diinginkan
Tetap dipertahankan — tampil setelah Testimonial.

---

## 8. Footer

### Kondisi Saat Ini
`PublicFooter` sudah 3 kolom (Produk/Rakryan/Bantuan) + sosmed, sudah sesuai desain.

### Perubahan yang Diinginkan
Tidak ada perubahan — tetap di paling bawah halaman.

---

## Urutan Section Baru (Ringkasan)

1. `PublicNavbar` (tanpa promo banner di atasnya)
2. Hero (gambar thumbnail course terbaik + 1 tombol CTA ke `/courses`)
3. **Voucher (baru, full-width)**
4. Kategori (stack & topik)
5. **Galeri Proyek Course (carousel)**
6. Testimonial
7. FAQ
8. Footer

## ✅ Keputusan (Sudah Dikonfirmasi)

- **"Cara Kerja" (3 langkah)** → **dihapus**.
- **"Paket Bundle" ("Paling Hemat")** → **dihapus**.
- CTA banner paling bawah ("Siap mulai ngoding?" + kotak kode promo) → **dihapus juga** (fungsinya digantikan oleh section Voucher baru di poin 3 + tombol CTA tunggal di Hero).

---

## Acceptance Criteria

* Tidak ada error baru.
* Tidak merusak fitur yang sudah berjalan (halaman lain, komponen `PublicNavbar`/`PublicFooter` yang dipakai di halaman lain).
* Seluruh perubahan mengikuti struktur project yang ada.
* Gunakan clean code, reusable component, jangan duplicate code.
* Pastikan seluruh perubahan telah diuji sebelum dianggap selesai.

## Output yang Diharapkan

Sebelum mulai mengubah kode:
1. Analisis file yang akan diubah.
2. Jelaskan rencana implementasi (termasuk jawaban atas pertanyaan terbuka di atas).
3. Setelah implementasi selesai, berikan ringkasan perubahan.
4. Sebutkan file yang ditambahkan, diubah, atau dihapus.
5. Jelaskan alasan setiap perubahan penting.

---

## ✅ Ringkasan Implementasi (Selesai)

### File yang diubah
- **`resources/js/pages/welcome.tsx`** — rewrite total mengikuti urutan section baru. Section "Cara Kerja", "Paket Bundle", dan CTA banner bawah (kotak kode promo) dihapus. Promo banner tipis di atas navbar juga dihapus.
- **`app/Http/Controllers/WelcomeController.php`** — query `bundles` (Product tipe Bundle) dihapus karena section-nya sudah tidak ada; ditambahkan query `vouchers` (voucher aktif & belum kedaluwarsa, maks 3) untuk section Voucher baru.
- **`resources/js/components/public-navbar.tsx`** — item menu "Cara kerja" (anchor `#cara-kerja`) dihapus karena section tujuannya sudah tidak ada (mencegah dead-link). Sekaligus dirapikan beberapa unused-import lint pre-existing di file ini.

### Detail per poin
1. **Hero — thumbnail course terbaik**: bagian kanan Hero sekarang menampilkan gambar thumbnail dari `featuredCourses[0]` (course unggulan pertama) dengan overlay kategori & rating asli dari database, dibungkus `<Link>` ke halaman detail course. Fallback ke ikon buku kalau belum ada course.
2. **Hero — 1 tombol CTA**: tombol "Mulai gratis" & "Lihat cara kerja" dihapus, diganti 1 tombol "Lihat Semua Course" → `/courses` (khusus guest; user yang sudah login tetap lihat "Lanjutkan Belajar Anda" → `/dashboard`, perilaku ini tidak disebut di scope task jadi dipertahankan).
3. **Section Voucher baru**: full-width, langsung di bawah Hero, menampilkan hingga 3 voucher aktif dari database (kode, diskon, syarat min. belanja, tanggal berakhir, tombol salin kode). Section ini otomatis tersembunyi kalau tidak ada voucher aktif. Diberi `id="paket"` supaya link navbar "Paket" tetap berfungsi mengarah ke sini.
4. **Kategori**: dipindah tepat di bawah section Voucher.
5. **Galeri Proyek Course (carousel)**: grid statis 4 kolom diganti carousel scroll horizontal (native CSS scroll-snap + tombol panah kiri/kanan) — **tidak menambah dependency baru** (tidak ada package carousel/embla di project, jadi dibangun tanpa lib tambahan sesuai batasan "jangan mengubah dependencies tanpa approval").
6-8. **Testimonial, FAQ, Footer**: tidak ada perubahan konten, hanya ikut urutan baru.

### Verifikasi
- `tsc --noEmit` dan `eslint` bersih untuk ketiga file yang diubah — sisa error di `tsc` semuanya pre-existing di file admin/internal yang tidak berkaitan.
- `vendor/bin/pint --dirty` passed untuk `WelcomeController.php`.
- Belum dites visual langsung di browser (rekomendasi: jalankan `npm run dev`/`composer run dev` lalu cek halaman landing).
