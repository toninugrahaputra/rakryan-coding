# Gap Analysis: Integrasi Pembayaran Xendit

Dokumen ini merangkum apa yang **sudah ada** dan apa yang **masih kurang** dari integrasi Xendit di project ini, berdasarkan audit terhadap `app/Services/XenditService.php`, `app/Http/Controllers/XenditWebhookController.php`, `app/Http/Controllers/OrderController.php`, `config/services.php`, model/migration `Order`, dan test suite terkait.

## Yang Sudah Ada

- Pembuatan invoice via `POST https://api.xendit.co/v2/invoices` (raw HTTP lewat `Http` facade, bukan SDK resmi `xendit/xendit-php`).
- Verifikasi webhook via header `x-callback-token` dibandingkan dengan `XENDIT_CALLBACK_TOKEN` — ini memang mekanisme asli Xendit untuk Invoice API (bukan HMAC signature), jadi pendekatannya sudah benar.
- Webhook menangani status `PAID`/`SETTLED` → memanggil `ApproveOrder` untuk mengaktifkan `UserSubscription`.
- Mode mock/dev: kalau `XENDIT_SECRET_KEY` kosong atau env `testing`, checkout otomatis pakai invoice palsu (`?mock_pay=1`) tanpa memanggil Xendit sama sekali.
- Route webhook (`webhooks/xendit`) sudah dikecualikan dari CSRF di `bootstrap/app.php`.

---

## 1. Kritis — Bisa Menyebabkan Uang/Order "Nyangkut"

### 1.1 `XENDIT_SECRET_KEY` dan `XENDIT_CALLBACK_TOKEN` belum ada di `.env`
Grep ke `.env` tidak menemukan kedua key ini sama sekali (tidak ada juga `.env.example` sebagai referensi). Akibatnya:
- Checkout **selalu** jatuh ke mode mock (`XenditService.php` baris 15: `empty($this->secretKey)` selalu `true`) — belum pernah benar-benar memanggil Xendit di environment manapun sampai key ini diisi.
- Webhook **selalu** menolak dengan 401 (`XenditWebhookController.php` baris 16: `blank($expectedToken)` selalu `true`).

**Perlu:** isi `XENDIT_SECRET_KEY` (secret key sandbox/production dari dashboard Xendit) dan `XENDIT_CALLBACK_TOKEN` (dari Settings → Callbacks di dashboard Xendit) sebelum go-live. Sudah dimasukkan sebagai placeholder di `deploy/env.production.example`.

### 1.2 Invoice yang expired di Xendit tidak pernah tercermin di database
Xendit mengirim webhook dengan status `EXPIRED` saat invoice tidak dibayar dalam batas waktu (default 24 jam), tapi `XenditWebhookController::handle()` hanya menangani `'PAID'` dan `'SETTLED'` — status lain (termasuk `EXPIRED`) jatuh ke `return response()->json(['message' => 'Success'])` tanpa melakukan apa-apa.

Selain itu **tidak ada scheduled job** (`app/Console` bahkan belum ada foldernya) yang mengecek order `pending` yang sudah lewat `valid_until` untuk ditandai `expired`. Kolom `valid_until` sendiri **tidak pernah diisi** (lihat 2.2) dan status enum `expired` di `Order` **tidak pernah dipakai** di seluruh codebase.

**Dampak:** order yang dibuat lalu tidak dibayar akan selamanya berstatus `pending` di database, menumpuk tanpa batas, dan tombol "Lanjutkan pembayaran" di riwayat pesanan akan mengarah ke invoice Xendit yang sebenarnya sudah kedaluwarsa.

### 1.3 Webhook duplikat/retry dari Xendit direspons 500, bukan 200 idempotent
Xendit akan **mengulang pengiriman webhook** kalau tidak menerima HTTP 200. Saat ini:
- Kalau webhook `PAID` datang dua kali (retry normal dari Xendit, atau order sudah dibatalkan duluan oleh user via fitur "Batalkan"), `ApproveOrder::handle()` melempar `ValidationException` karena order sudah tidak berstatus `Pending`.
- `XenditWebhookController` menangkap ini di `catch (\Exception $e)` generik dan mengembalikan **HTTP 500**.
- Karena Xendit menganggap non-200 sebagai "gagal", ia akan **terus mengirim ulang webhook yang sama berkali-kali** — tidak ada perbedaan antara "gagal beneran, tolong retry" vs "sudah diproses sebelumnya, tidak perlu retry".

**Perlu:** tangani kasus "order sudah tidak pending" sebagai sukses idempotent (return 200), bukan error 500.

### 1.4 Pembatalan order lokal tidak membatalkan invoice di sisi Xendit
Fitur "Batalkan" (`CancelOrder` action) hanya mengubah status di database lokal — tidak pernah memanggil endpoint Xendit untuk expire/void invoice. Akibatnya: user bisa membatalkan order di aplikasi, tapi link invoice Xendit-nya **masih hidup dan bisa dibayar**. Kalau benar-benar dibayar setelah dibatalkan, webhook `PAID` akan datang untuk order yang sudah `cancel` — kembali ke masalah 1.3 (500 + retry loop), dan secara bisnis uang customer masuk tapi course tidak pernah ter-provision otomatis.

### 1.5 Webhook tidak memverifikasi jumlah yang dibayar
Payload webhook Xendit membawa field `amount`, tapi `XenditWebhookController` tidak pernah membandingkannya dengan `$order->net_amount`/`total_amount`. Selama `external_id` (order_number) dan status `PAID` cocok, order langsung disetujui — tidak ada pengecekan apakah nominal yang benar-benar dibayar sesuai dengan tagihan.

---

## 2. Data yang Hilang / Tidak Pernah Diisi

Kolom-kolom ini sudah ada di tabel `orders` (dan di `$fillable` model `Order`) tapi **tidak pernah diisi** oleh alur Xendit manapun:

| Kolom | Tujuan (sesuai komentar migrasi) | Kondisi saat ini |
|---|---|---|
| `payment_metadata` | Simpan raw response gateway | `XenditService::createInvoice()` hanya mengembalikan `id`, `invoice_url`, `status` — sisa response Xendit (expiry_date, available_banks, available_ewallets, dll) dibuang, tidak pernah disimpan |
| `valid_until` | Tanggal kedaluwarsa invoice | Tidak pernah di-set dari respons Xendit (`expiry_date`) maupun dihitung manual |
| `payment_fee` | Biaya admin dari gateway | Selalu di-hardcode `0` di `OrderController::store()` |
| `payment_code` | Nomor VA / kode bayar | Tidak pernah diisi di manapun |
| `channel_group`/`channel_code`/`channel_name` | Channel pembayaran aktual (BCA, QRIS, dll) | Selalu string statis `'Xendit'`/`'Invoice'`/`'Xendit Gateway'`, bukan channel asli yang dipilih user di halaman Xendit |
| `provider` | Nama gateway | Selalu `'Manual'` (di-set oleh `CreateOrder`), meski dibayar via Xendit |

Karena `payment_metadata` kosong dan tidak ada endpoint "get invoice" yang pernah dipanggil balik, aplikasi **tidak pernah tahu channel spesifik apa yang benar-benar dipakai customer** untuk membayar — halaman riwayat pesanan (`orders/index.tsx`) menampilkan teks statis "BCA Virtual Account" yang sebenarnya hardcoded UI, bukan data asli.

**Ketidaksesuaian dengan marketing copy:** `resources/js/pages/welcome.tsx` mengklaim mendukung "Virtual Account (BCA, Mandiri, BNI, BRI), QRIS (GoPay, OVO, Dana, ShopeePay), serta e-Wallet" — klaim ini sepenuhnya bergantung pada konfigurasi channel di dashboard Xendit, bukan dikontrol dari kode aplikasi (tidak ada parameter `payment_methods` yang dikirim ke API createInvoice).

---

## 3. Keamanan & Robustness

- **Perbandingan token pakai `!==`, bukan `hash_equals()`** — celah timing-attack yang kecil tapi mudah diperbaiki, mengingat ini adalah shared-secret comparison.
- **Tidak ada rate limiting** di route `webhooks/xendit`.
- **Pesan error mentah ditampilkan ke user**: kalau `createInvoice()` gagal, `OrderController::store()` menampilkan `$e->getMessage()` langsung sebagai flash message — berpotensi membocorkan detail teknis/response gateway ke end user.
- **Tidak ada database transaction**: pembuatan `Order`, redeem voucher (`RedeemVoucher`), dan pemanggilan Xendit terjadi berurutan tanpa transaction. Kalau `createInvoice()` gagal (exception), order yang sudah dibuat dan voucher yang sudah "dipakai" **tidak di-rollback** — customer kehilangan kuota vouchernya padahal pembayaran belum pernah dimulai.
- **Redirect sukses dan gagal identik**: `success_redirect_url` dan `failure_redirect_url` yang dikirim ke Xendit sama-sama mengarah ke `orders.show` — tidak ada halaman/state berbeda untuk pembayaran yang dibatalkan/gagal di sisi Xendit.

---

## 4. Testing

Test yang **sudah ada** (`tests/Feature/UserPurchaseTest.php`): webhook sukses (status `PAID`), token salah/kosong, mock-pay bypass di local/testing vs production.

Yang **belum ada test-nya sama sekali**:
- Webhook dengan status `EXPIRED` (karena memang belum ditangani — lihat 1.2).
- Webhook duplikat/retry (memverifikasi respons idempotent, bukan 500 — lihat 1.3).
- Validasi amount pada payload webhook (lihat 1.5).
- Kondisi `XENDIT_CALLBACK_TOKEN` benar-benar kosong (bukan cuma di-set salah).
- **Jalur HTTP asli `XenditService`** — semua test lewat cabang mock karena `app()->environment('testing')` selalu true di test suite; error-handling asli (baris try/catch saat `Http::post` ke `api.xendit.co`) tidak pernah tereksekusi/tercover. Idealnya pakai `Http::fake()` untuk menguji jalur ini.
- Perilaku `OrderController::store()` saat Xendit gagal (order yang orphan, voucher yang tidak ter-rollback — lihat bagian 3).

---

## 5. Lain-lain (Production-readiness)

- **Tidak ada SDK resmi** (`xendit/xendit-php`) — integrasi murni pakai `Http` facade manual. Tidak salah, tapi berarti tidak dapat update otomatis dari perubahan API Xendit maupun helper bawaan SDK (verifikasi signature, tipe data, dsb).
- **Tidak ada currency handling** — request ke Xendit tidak mengirim `currency`, jadi diam-diam berasumsi IDR (default Xendit). Tidak masalah selama app cuma untuk pasar Indonesia, tapi tidak didokumentasikan sebagai asumsi eksplisit.
- **Tidak ada toggle sandbox/production yang eksplisit** — pembedaan mock vs real hanya berdasar prefix string `mock_` di secret key, bukan mekanisme resmi Xendit (Xendit sendiri membedakan lewat secret key test vs live, jadi ini sebenarnya sudah cukup sejalan, tapi tidak ada dokumentasi/config eksplisit yang menyatakan environment saat ini).

---

## Rekomendasi Urutan Perbaikan

1. **Isi `XENDIT_SECRET_KEY` & `XENDIT_CALLBACK_TOKEN`** di environment yang akan dipakai (sandbox dulu untuk uji coba, baru production) — tanpa ini seluruh integrasi belum pernah benar-benar diuji end-to-end.
2. **Perbaiki respons webhook untuk kasus duplikat/order-sudah-tidak-pending** agar mengembalikan 200 (bukan 500), supaya Xendit berhenti retry.
3. **Tangani status `EXPIRED`** dari webhook dan/atau tambahkan scheduled command yang menandai order `pending` yang sudah lewat `valid_until` sebagai `expired`.
4. **Isi `payment_metadata` dengan raw response Xendit** saat createInvoice, supaya data channel/expiry tidak hilang begitu saja — ini juga jadi prasyarat untuk perbaikan 3 dan tampilan channel asli di riwayat pesanan.
5. **Bungkus order + voucher redemption + createInvoice dalam DB transaction**, supaya kegagalan Xendit tidak meninggalkan order/voucher yang orphan.
6. **Tambah validasi amount** pada payload webhook sebelum meng-approve order.
7. Tambah test untuk semua skenario di bagian 4, terutama jalur HTTP asli `XenditService` via `Http::fake()`.
