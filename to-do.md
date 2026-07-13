# To-Do List — Gap Analysis vs "Rakryan Coding FE.pdf"

> Status: Landing, Katalog, Checkout, Riwayat Pesanan ✅ sudah sesuai desain PDF.
> Update terbaru: Reader Materi, Voucher Saya, Notifikasi, Dashboard dinamis **sudah diimplementasikan** — progres bagus! Tapi ada beberapa hal yang masih perlu dibereskan (lihat item bertanda ⚠️).

## 🔧 Perbaikan yang Sudah Dikerjakan (Sesi Ini)

- [x] **BUG KRITIS diperbaiki**: `orders/create.tsx` & `orders/show.tsx` — komponen di-export sebagai `OrdersCreate`/`OrdersShow`, tapi baris `.layout = ...` di paling bawah file salah tulis merujuk ke `OrderCreate`/`OrderShow` (identifier yang tidak pernah dideklarasikan). Ini menyebabkan `ReferenceError` yang membuat `.layout` **gagal terpasang** — jadi navbar/breadcrumb `AppLayout` yang seharusnya membungkus halaman checkout **tidak pernah berjalan**. **Inilah akar penyebab masalah "header & footer belum sesuai" di halaman `/orders/1?mock_pay=1`.** Sudah diperbaiki, dikonfirmasi bersih lewat `tsc --noEmit` & `eslint`.
- [x] `courses/show.tsx` (Detail Course) — dulu selalu render `PublicNavbar`/`PublicFooter` tanpa syarat. Sekarang dibuat kondisional persis seperti `courses/index.tsx`: kalau `auth.user` ada → dibungkus `AppLayout` + breadcrumb "Dashboard > Katalog Courses > {judul course}" (navbar area siswa), kalau guest → tetap pakai `PublicNavbar`/`PublicFooter`.
- [x] **Ditemukan: `AppHeader` (`resources/js/components/app-header.tsx`) ternyata SUDAH mengimplementasikan navbar horizontal area siswa** yang diminta di task #9 — lengkap dengan menu Dashboard/Katalog Courses/Voucher Saya/Pesanan, bell notifikasi dengan badge unread (`auth.unread_notifications_count`, sudah di-share lewat `HandleInertiaRequests`), toggle dark/light, dan avatar dropdown. `AppLayout` (`layouts/app-layout.tsx`) sudah otomatis memilih `AppHeaderLayout` (navbar atas) untuk user biasa dan `AppSidebarLayout` (sidebar gelap) khusus admin. **Sidebar gelap yang muncul di screenshot sebelumnya kemungkinan besar karena akun yang dipakai bertanda `role: admin`, atau screenshot diambil dari build lama sebelum logic ini ada — bukan bug pada arsitektur navbar siswa.**

---

## 1. Reader Materi — ✅ Sudah Diimplementasikan

> File: `resources/js/pages/courses/contents/show.tsx`, `app/Http/Controllers/CourseContentController.php`

- [x] Backend: endpoint `POST courses/{course}/contents/{content}/complete` sudah ada, tulis ke `UserProgress::firstOrCreate`, auto-redirect ke modul berikutnya
- [x] Controller sudah kirim data lengkap: `lessons` (untuk sidebar), `prevContent`/`nextContent`, `progress` (total/completed/percentage/current_index)
- [ ] ⚠️ **Perlu verifikasi visual** — cek langsung di browser apakah sidebar daftar bab, breadcrumb "Bab X/Y", dan tombol navigasi prev/next benar-benar tampil sesuai desain `my/Reader.html` (kode backend sudah siap, tinggal pastikan tampilan frontend memakai semua data ini)

---

## 2. Voucher Saya — ✅ Sudah Ada, ⚠️ Masih Ada Data Mock

> File: `resources/js/pages/vouchers/index.tsx`, route `GET /vouchers`

- [x] Halaman sudah ada dengan tab Tersedia/Terpakai/Kadaluarsa, tombol salin kode, redeem
- [x] ⚠️ **Tab "Terpakai" & "Kadaluarsa" sudah dinamis** — dihubungkan ke query `voucher_usages` dari database
- [x] Tombol "Pakai sekarang" otomatis menyimpan kode voucher ke `sessionStorage` dan mem-prefill input voucher pada halaman checkout/order create.

---

## 3. Profil & Akun — Lengkapi Field + Redesign

> File: `resources/js/pages/settings/profile.tsx`
> Desain: `my/Profile.html` (PDF hal. 27-28)

- [ ] **Migration tambah kolom ke tabel `users`** (semua nullable kecuali `username`):
  ```
  username, avatar_url, phone, bio, school, major, grade,
  graduation_year, birth_date, gender, city
  ```
- [ ] Update `App\Models\User` — tambahkan kolom baru ke `#[Fillable(...)]`
- [ ] **Redesign halaman jadi 3 section** (sesuai PDF): Informasi profil, Data sekolah, Data pribadi
- [ ] Tab navigasi kiri: Profil / Keamanan / Notifikasi / Tampilan / Keluar (satukan `settings/security.tsx` & `settings/appearance.tsx` jadi 1 layout tab)
- [ ] Update `Settings/ProfileController` untuk validasi & simpan field baru

---

## 4. Notifikasi — ✅ Sudah Diimplementasikan (Dasar)

> File: `resources/js/pages/notifications/index.tsx`, `app/Http/Controllers/NotificationController.php`

- [x] Halaman list notifikasi + tombol tandai dibaca (per-item & semua) sudah ada
- [x] Bell icon + menu "Notifikasi" di sidebar sudah ada
- [ ] Belum ada tab filter kategori (Semua/Pembayaran/Course/Promo) seperti desain — nice-to-have, prioritas rendah
- [ ] Belum ada grouping waktu (Hari ini/Kemarin/Minggu ini) — nice-to-have, prioritas rendah

---

## 5. Ulasan Course (Review) — Belum Ada Sama Sekali

> Desain: `my/Review.html` (PDF hal. 31)

- [x] Buat migration & model `Review` — `user_id, course_id, rating (1-5), tags (json), comment`
- [x] Buat controller `ReviewController` untuk simpan dan update ulasan
- [x] Tampilkan form ulasan di halaman detail course jika progres sudah mencapai 100%
- [x] Ganti rating statis "4.9 ⭐" di landing page & detail course dengan rata-rata rating ulasan asli dari database
- [x] Auto-scroll halus ke form ulasan dan tunjukkan pesan toast sukses menggunakan `Inertia::flash` saat modul terakhir selesai

---

## 6. Auth Pages — Restyle ke Desain Branded (Prioritas Rendah)

> File: `resources/js/pages/auth/*.tsx`

- [ ] Tambahkan logo "Rakryan Coding" besar di atas card
- [ ] Indikator kekuatan password bertingkat (3 bar) di Register & Reset Password
- [ ] (Opsional, butuh Socialite) Tombol "Lanjut dengan Google/GitHub"

---

## 7. Footer Publik — Rombak Total Sesuai Desain

> File: `resources/js/components/public-footer.tsx`

- [x] Ganti jadi 3 kolom: **PRODUK**, **RAKRYAN**, **BANTUAN** sesuai desain (lihat PDF hal. 6)
- [x] Tambahkan ikon sosial media (Instagram, TikTok SVG resmi, YouTube)
- [x] Ganti copy brand sesuai desain PDF + tagline "Made with ☕ in Malang"

---

## 8. Course Card — Seragamkan Gaya Visual

> File: `resources/js/components/course-card.tsx` vs inline card di `welcome.tsx`

- [ ] Ada 2 gaya berbeda antara landing (ilustrasi warna-warni) dan katalog (foto/thumbnail) — putuskan 1 gaya baku lalu refactor supaya konsisten

---

## 9. Layout Shell Siswa — Navbar Horizontal (✅ Sudah Ada, Tinggal Polish)

> File: `resources/js/components/app-header.tsx` (navbar area siswa — **sudah diimplementasikan**), `resources/js/layouts/app-layout.tsx`
> Referensi: screenshot desain target dari user (match persis `my/Dashboard.html` PDF hal. 20-21)

Setelah ditelusuri, ternyata **arsitekturnya sudah benar**: `AppLayout` otomatis pilih `AppHeaderLayout` (navbar atas) untuk user biasa, dan `AppSidebarLayout` (sidebar gelap) khusus role admin. `AppHeader` sudah punya menu Dashboard/Katalog Courses/Voucher Saya/Pesanan, bell notifikasi dengan badge, toggle tema, avatar dropdown.

- [x] Navbar horizontal area siswa sudah ada di `app-header.tsx` — logo, menu tab, bell notifikasi (badge dari `auth.unread_notifications_count`), toggle dark/light, avatar dropdown
- [x] `dashboard.tsx`, `vouchers/index.tsx`, `notifications/index.tsx`, `orders/index.tsx`, `orders/create.tsx`, `orders/show.tsx`, `courses/contents/show.tsx` (Reader) — semua sudah pakai `AppLayout` dengan benar (double-navbar bug di `orders/create.tsx`/`orders/show.tsx` sudah diperbaiki sesi ini, lihat catatan bug kritis di atas)
- [x] `courses/index.tsx` (Katalog) dan `courses/show.tsx` (Detail Course) — sudah render kondisional: `AppLayout` + breadcrumb kalau login, `PublicNavbar`/`PublicFooter` kalau guest (yang terakhir baru diperbaiki sesi ini)
- [x] Sidebar kiri gelap tetap khusus Admin/Internal panel (`/internal/*`) — sudah benar, tidak diubah
- [x] `welcome.tsx` (Landing) tidak diubah — memang halaman publik, sudah benar
- [ ] ⚠️ **Perlu verifikasi visual di browser** (setelah `npm run dev`/`composer run dev` + hard refresh) untuk pastikan tidak ada sisa masalah rendering, karena analisis di atas berbasis baca kode, bukan screenshot langsung
- [ ] Poles kecil (opsional, prioritas rendah): perbesar & tegaskan card **"Lanjut Belajar"** dengan efek glow/shadow keemasan seperti di referensi (saat ini border-nya relatif tipis/flat)
- [ ] Poles kecil (opsional): cek warna ikon kotak di 4 stat card dashboard — di referensi, ikon "Course dimiliki" pakai warna krem/amber (senada brand), saat ini masih biru generik

---

## 10. Dashboard User — ✅ Data Sudah Dinamis

> File: `resources/js/pages/dashboard.tsx`, `app/Actions/User/GetUserStats.php`

- [x] `streak_days`, `total_chapters_read`, `hasDuplicateCourses` sekarang dikirim dari backend (bukan hardcode lagi)
- [x] `tech_stack`, `read_duration`, `last_read_at` pada course aktif sudah dari data course, bukan string statis
- [x] Kartu course terkunci (🔒 "Belum dibuka" + tombol "Buka Kunci") sebagai teaser di grid "Course milikmu" sudah diimplementasikan — **persis seperti screenshot & desain PDF**
- [ ] Perlu isi data `tech_stack` & `read_duration` di seeder/database course supaya tidak tampil kosong di UI (field-nya sudah ada di frontend, tinggal pastikan backend/kolom course benar-benar terisi)

---

## 11. ⚠️ Temuan dari Screenshot — Dashboard Tampil Tidak Sesuai Kode Sumber

> Screenshot: `rakryan-coding-2.test/dashboard` (8 Jul 2026)

Setelah membandingkan screenshot dengan kode `dashboard.tsx` saat ini, ada **ketidaksesuaian antara apa yang di-render browser dan apa yang seharusnya dihasilkan kode**:

- [ ] **Kartu statistik (Course dimiliki/selesai/streak/bab dibaca) tampil gelap/hitam** di screenshot, padahal class-nya `bg-gradient-to-br from-muted/30 to-background` yang di mode terang seharusnya render nyaris putih. Kemungkinan besar **penyebabnya bukan bug kode**, tapi **aset frontend yang belum di-build ulang** (Vite dev server tidak jalan / build lama masih ke-cache browser)
- [ ] **Judul "Selamat pagi, User👋" dan "Course milikmu" tampil pudar/nyaris tidak kelihatan** — kemungkinan sama, aset CSS lama/stale
- [ ] **Semua angka statistik menunjukkan 0** — ini kemungkinan **valid**, bukan bug, jika akun yang dipakai (`User`) memang belum pernah beli course apa pun. Perlu dicoba pakai akun yang sudah punya transaksi `paid` untuk konfirmasi datanya benar dinamis
- [ ] **Rekomendasi langkah**: jalankan `npm run dev` atau `composer run dev` (sesuai `CLAUDE.md`), lalu hard-refresh browser (Cmd+Shift+R), baru screenshot ulang untuk memastikan apakah masalah tampilan di atas hilang

---

## 12. "Katalog Courses" — Label & Layout (✅ Sudah Beres)

> File: `resources/js/components/app-header.tsx` (label sudah benar), `resources/js/pages/courses/index.tsx` & `courses/show.tsx` (layout kondisional sudah diterapkan)

- [x] Label menu navbar sudah **"Katalog Courses"** di `app-header.tsx` (bukan "Katalog Kelas")
- [x] `courses/index.tsx` sudah render kondisional: breadcrumb **"Dashboard > Katalog Courses"** dalam `AppLayout` kalau login, `PublicNavbar`/`PublicFooter` kalau guest
- [x] `courses/show.tsx` sekarang juga ikut pola yang sama (diperbaiki sesi ini)
- [x] ⚠️ **Bersih-bersih kecil**: `resources/js/components/app-sidebar.tsx` — sudah diperbarui labelnya menjadi "Katalog Courses" agar seragam

---

## 13. Prioritas Pengerjaan (Urutan Rekomendasi, Update)

| # | Task | Prioritas |
|---|------|-----------|
| 1 | **Verifikasi visual di browser** semua halaman yang baru diperbaiki (checkout, katalog, detail course, dashboard) — rebuild aset (`npm run dev`/`composer run dev`) + hard refresh dulu | 🔴 Tertinggi |
| 2 | Voucher Saya — ganti data mock di tab Terpakai/Kadaluarsa jadi data asli | 🔴 Tinggi |
| 3 | Profil & Akun — migration field baru + redesign | 🟡 Sedang |
| 4 | Footer publik — rombak 3 kolom + sosmed | 🟡 Sedang |
| 5 | Bersih-bersih dead code label "Katalog Kelas" di `app-sidebar.tsx` | 🟢 Rendah |
| 6 | Ulasan Course (model + halaman + ganti rating statis) | 🟢 Rendah |
| 7 | Notifikasi — tambah tab filter kategori & grouping waktu | 🟢 Rendah |
| 8 | Course Card — seragamkan gaya visual landing vs katalog | 🟢 Rendah |
| 9 | Restyle halaman Auth sesuai desain branded | 🟢 Rendah |
| 10 | Poles kecil dashboard (glow banner, warna ikon stat card) | 🟢 Rendah |
