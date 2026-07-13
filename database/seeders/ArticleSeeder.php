<?php

namespace Database\Seeders;

use App\Models\Article;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $articles = [
            [
                'title' => 'Cara Menangani Error dengan Tenang (Bukan Panik)',
                'excerpt' => 'Error itu bagian normal dari ngoding. Ini cara sistematis baca pesan error, cari sumber masalah, dan nyari solusinya tanpa buang waktu.',
                'blocks' => [
                    ['type' => 'header', 'data' => ['text' => 'Error Bukan Musuh', 'level' => 2]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Setiap programmer, sejago apa pun, pasti ketemu error setiap hari. Bedanya programmer berpengalaman sama pemula bukan soal siapa yang lebih jarang error, tapi siapa yang lebih cepat <strong>membaca dan memahami</strong> pesan errornya.']],
                    ['type' => 'header', 'data' => ['text' => '1. Baca Pesan Error dari Bawah ke Atas', 'level' => 3]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Stack trace biasanya panjang, tapi baris paling bawah biasanya nunjukin akar masalah paling relevan sama kode kamu sendiri (bukan kode library).']],
                    ['type' => 'code', 'data' => ['code' => "Uncaught TypeError: Cannot read properties of undefined (reading 'name')\n    at UserCard (UserCard.jsx:12)"]],
                    ['type' => 'header', 'data' => ['text' => '2. Copy Pesan Error, Cari Kata Kuncinya', 'level' => 3]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Jangan copy seluruh stack trace ke search engine. Ambil bagian intinya saja, misalnya "Cannot read properties of undefined", supaya hasil pencarian lebih relevan.']],
                    ['type' => 'list', 'data' => ['style' => 'unordered', 'items' => [
                        'Cek apakah variabel/objek yang diakses benar-benar ada isinya',
                        'Tambahkan console.log() sebelum baris yang error untuk cek nilai variabel',
                        'Perhatikan penulisan nama variabel — typo adalah penyebab error paling umum',
                    ]]],
                    ['type' => 'quote', 'data' => ['text' => 'Error message adalah teman, bukan musuh. Dia selalu kasih tahu di mana dan kenapa kodemu berhenti.', 'caption' => '']],
                ],
            ],
            [
                'title' => 'Penjelasan HTML: Struktur Dasar yang Wajib Kamu Paham',
                'excerpt' => 'Sebelum lanjut ke CSS dan JavaScript, pastikan kamu benar-benar paham struktur dasar HTML dan kenapa urutannya penting.',
                'blocks' => [
                    ['type' => 'header', 'data' => ['text' => 'HTML Itu Kerangka, Bukan Tampilan', 'level' => 2]],
                    ['type' => 'paragraph', 'data' => ['text' => 'HTML (HyperText Markup Language) bertugas mendefinisikan <strong>struktur dan konten</strong> sebuah halaman web. Tampilan visualnya nanti diatur CSS, dan interaksinya diatur JavaScript.']],
                    ['type' => 'header', 'data' => ['text' => 'Struktur Dasar Dokumen HTML', 'level' => 3]],
                    ['type' => 'code', 'data' => ['code' => "<!DOCTYPE html>\n<html lang=\"id\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Judul Halaman</title>\n</head>\n<body>\n  <h1>Halo, Dunia!</h1>\n  <p>Ini paragraf pertama saya.</p>\n</body>\n</html>"]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Beberapa tag penting yang wajib kamu kenal:']],
                    ['type' => 'list', 'data' => ['style' => 'unordered', 'items' => [
                        '<code>&lt;head&gt;</code> — berisi metadata, judul tab, link CSS',
                        '<code>&lt;body&gt;</code> — berisi semua konten yang terlihat di halaman',
                        '<code>&lt;div&gt;</code> dan <code>&lt;span&gt;</code> — kontainer generik untuk mengelompokkan elemen',
                        '<code>&lt;h1&gt;</code> sampai <code>&lt;h6&gt;</code> — heading, urutkan sesuai hierarki, bukan sekadar ukuran font',
                    ]]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Tips: gunakan tag semantik seperti <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, dan <code>&lt;footer&gt;</code> supaya struktur halamanmu lebih mudah dibaca browser maupun sesama developer.']],
                ],
            ],
            [
                'title' => 'Kenapa console.log() Adalah Sahabat Terbaikmu',
                'excerpt' => 'Sebelum ribet pakai debugger, console.log() sudah cukup buat 90% kebutuhan debugging sehari-hari. Ini cara pakainya yang efektif.',
                'blocks' => [
                    ['type' => 'header', 'data' => ['text' => 'Debugging Level Dasar', 'level' => 2]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Sebelum belajar tools debugger yang canggih, kuasai dulu teknik paling sederhana: menaruh <code>console.log()</code> di titik-titik strategis kodemu.']],
                    ['type' => 'code', 'data' => ['code' => "function hitungTotal(items) {\n  console.log('items diterima:', items);\n  const total = items.reduce((sum, item) => sum + item.price, 0);\n  console.log('total dihitung:', total);\n  return total;\n}"]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Dengan menaruh log sebelum dan sesudah proses penting, kamu bisa lihat persis di titik mana nilai datanya mulai tidak sesuai ekspektasi.']],
                    ['type' => 'list', 'data' => ['style' => 'ordered', 'items' => [
                        'Log input yang diterima function',
                        'Log hasil setelah setiap proses/transformasi penting',
                        'Hapus semua console.log() sebelum push kode ke production',
                    ]]],
                ],
            ],
            [
                'title' => 'Git untuk Pemula: Commit, Push, dan Pull Tanpa Bingung',
                'excerpt' => 'Git kelihatan ribet di awal, padahal cuma butuh paham 4 perintah dasar ini buat mulai kerja bareng tim.',
                'blocks' => [
                    ['type' => 'header', 'data' => ['text' => '4 Perintah yang Wajib Kamu Hafal', 'level' => 2]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Git bisa terasa menakutkan karena banyak istilah baru. Tapi buat kerja harian, kamu cuma perlu paham alur kerja dasar berikut ini.']],
                    ['type' => 'code', 'data' => ['code' => "git add .\ngit commit -m \"menambahkan fitur login\"\ngit pull origin main\ngit push origin main"]],
                    ['type' => 'list', 'data' => ['style' => 'unordered', 'items' => [
                        '<code>git add</code> — menandai perubahan file yang mau disimpan',
                        '<code>git commit</code> — menyimpan perubahan itu dengan pesan yang jelas',
                        '<code>git pull</code> — mengambil perubahan terbaru dari tim sebelum kerja',
                        '<code>git push</code> — mengirim perubahanmu ke repository bersama',
                    ]]],
                    ['type' => 'quote', 'data' => ['text' => 'Commit sesering mungkin dengan pesan yang jelas — dirimu di masa depan akan berterima kasih.', 'caption' => '']],
                ],
            ],
            [
                'title' => 'Flexbox untuk Pemula: Bikin Layout Tanpa Pusing',
                'excerpt' => 'Sebelum ada Flexbox, bikin layout sejajar itu ribet banget. Ini konsep dasar Flexbox yang bakal sering kamu pakai sehari-hari.',
                'blocks' => [
                    ['type' => 'header', 'data' => ['text' => 'Kenapa Flexbox Mengubah Cara Kita Nge-layout', 'level' => 2]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Flexbox adalah sistem layout CSS satu dimensi yang bikin elemen bisa sejajar, rata tengah, atau menyebar secara otomatis tanpa perlu <code>float</code> atau perhitungan manual.']],
                    ['type' => 'header', 'data' => ['text' => 'Dua Properti Kunci yang Wajib Dihafal', 'level' => 3]],
                    ['type' => 'code', 'data' => ['code' => ".container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}"]],
                    ['type' => 'paragraph', 'data' => ['text' => '<code>justify-content</code> mengatur posisi horizontal (sepanjang garis utama), sedangkan <code>align-items</code> mengatur posisi vertikal (garis silang).']],
                    ['type' => 'list', 'data' => ['style' => 'unordered', 'items' => [
                        '<code>justify-content: center</code> — bikin elemen rata tengah horizontal',
                        '<code>align-items: center</code> — bikin elemen rata tengah vertikal',
                        '<code>flex-wrap: wrap</code> — biar elemen turun ke baris baru kalau kepenuhan',
                        '<code>gap</code> — jarak antar elemen tanpa perlu margin manual',
                    ]]],
                    ['type' => 'quote', 'data' => ['text' => 'Kalau bingung nge-center sesuatu di CSS, coba display: flex dulu — 90% kasus kelar cuma dengan itu.', 'caption' => '']],
                ],
            ],
            [
                'title' => 'let, const, atau var? Ini Bedanya di JavaScript',
                'excerpt' => 'Ketiganya sama-sama buat deklarasi variabel, tapi punya aturan scope dan reassignment yang beda. Salah pilih bisa bikin bug yang susah dilacak.',
                'blocks' => [
                    ['type' => 'header', 'data' => ['text' => 'Tiga Cara Deklarasi Variabel', 'level' => 2]],
                    ['type' => 'paragraph', 'data' => ['text' => 'JavaScript punya tiga keyword untuk deklarasi variabel: <code>var</code>, <code>let</code>, dan <code>const</code>. Modern JavaScript hampir selalu pakai <code>let</code> dan <code>const</code>, jarang <code>var</code>.']],
                    ['type' => 'code', 'data' => ['code' => "var nama = 'Andi';   // function-scoped, bisa di-redeclare\nlet umur = 20;        // block-scoped, bisa diubah nilainya\nconst PI = 3.14;      // block-scoped, tidak bisa diubah"]],
                    ['type' => 'list', 'data' => ['style' => 'unordered', 'items' => [
                        '<code>const</code> — dipakai secara default untuk nilai yang tidak akan berubah',
                        '<code>let</code> — dipakai kalau nilainya memang akan berubah, misalnya counter',
                        '<code>var</code> — sebaiknya dihindari, scope-nya bisa bikin bug tak terduga',
                    ]]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Aturan praktis: mulai selalu dari <code>const</code>. Kalau ternyata perlu diubah nilainya, baru ganti ke <code>let</code>.']],
                ],
            ],
            [
                'title' => 'Cara Kerja API dan fetch() untuk Pemula',
                'excerpt' => 'API terdengar rumit, padahal konsepnya simpel: kirim permintaan, terima balasan. Ini cara pakai fetch() buat ambil data dari server.',
                'blocks' => [
                    ['type' => 'header', 'data' => ['text' => 'API Itu Cuma "Obrolan" Antar Aplikasi', 'level' => 2]],
                    ['type' => 'paragraph', 'data' => ['text' => 'API (Application Programming Interface) adalah cara dua aplikasi saling bertukar data. Browser kamu kirim permintaan (request) ke server, server balas dengan data (response), biasanya dalam format JSON.']],
                    ['type' => 'header', 'data' => ['text' => 'Contoh Pakai fetch()', 'level' => 3]],
                    ['type' => 'code', 'data' => ['code' => "fetch('https://api.example.com/users')\n  .then((response) => response.json())\n  .then((data) => console.log(data))\n  .catch((error) => console.error('Gagal ambil data:', error));"]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Versi lebih modern pakai <code>async/await</code> supaya kodenya lebih gampang dibaca urutannya:']],
                    ['type' => 'code', 'data' => ['code' => "async function getUsers() {\n  try {\n    const response = await fetch('https://api.example.com/users');\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error('Gagal ambil data:', error);\n  }\n}"]],
                    ['type' => 'quote', 'data' => ['text' => 'Selalu tangani kemungkinan gagal (try/catch atau .catch()) — koneksi internet nggak selalu mulus.', 'caption' => '']],
                ],
            ],
            [
                'title' => '5 Extension VS Code yang Wajib Dipasang Programmer Pemula',
                'excerpt' => 'Visual Studio Code sudah bagus dari sananya, tapi beberapa extension ini bikin proses belajar dan nulis kode jauh lebih nyaman.',
                'blocks' => [
                    ['type' => 'header', 'data' => ['text' => 'Bikin Editor Kamu Lebih Produktif', 'level' => 2]],
                    ['type' => 'paragraph', 'data' => ['text' => 'VS Code jadi favorit banyak developer karena gratis, ringan, dan didukung ribuan extension. Berikut lima yang paling worth-it dipasang sejak awal belajar.']],
                    ['type' => 'list', 'data' => ['style' => 'ordered', 'items' => [
                        '<strong>Prettier</strong> — otomatis rapikan format kode setiap kali disimpan',
                        '<strong>ESLint</strong> — kasih peringatan kalau ada potensi bug atau gaya penulisan yang tidak konsisten',
                        '<strong>Live Server</strong> — jalankan halaman HTML langsung di browser dengan auto-refresh',
                        '<strong>GitLens</strong> — lihat riwayat perubahan kode (git blame) langsung di editor',
                        '<strong>Auto Rename Tag</strong> — ganti tag HTML pembuka otomatis ikut berubah dengan tag penutup',
                    ]]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Nggak perlu pasang semua extension yang kamu temu — makin banyak extension aktif, editor bisa makin berat. Mulai dari lima ini dulu, tambahkan sesuai kebutuhan.']],
                ],
            ],
            [
                'title' => 'Apa Itu Responsive Design dan Kenapa Penting',
                'excerpt' => 'Website yang bagus harus enak dilihat di HP, tablet, maupun laptop. Ini konsep dasar responsive design yang wajib dikuasai.',
                'blocks' => [
                    ['type' => 'header', 'data' => ['text' => 'Satu Website, Banyak Ukuran Layar', 'level' => 2]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Responsive design adalah pendekatan bikin website yang tampilannya otomatis menyesuaikan ukuran layar perangkat — dari HP kecil sampai monitor besar — tanpa perlu bikin versi terpisah.']],
                    ['type' => 'header', 'data' => ['text' => 'Media Query, Kunci Utamanya', 'level' => 3]],
                    ['type' => 'code', 'data' => ['code' => ".container {\n  width: 100%;\n}\n\n@media (min-width: 768px) {\n  .container {\n    width: 750px;\n    margin: 0 auto;\n  }\n}"]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Kode di atas artinya: di layar kecil, container lebar penuh. Begitu layar minimal 768px (tablet ke atas), lebar container berubah jadi 750px dan rata tengah.']],
                    ['type' => 'list', 'data' => ['style' => 'unordered', 'items' => [
                        'Gunakan satuan relatif seperti <code>%</code> atau <code>rem</code>, bukan <code>px</code> tetap',
                        'Selalu tambahkan meta tag <code>viewport</code> di HTML',
                        'Desain dari layar terkecil dulu (mobile-first), baru sesuaikan ke layar besar',
                    ]]],
                ],
            ],
            [
                'title' => 'Kenalan dengan Dasar Pengembangan Aplikasi Android',
                'excerpt' => 'Mau mulai belajar bikin aplikasi Android? Ini gambaran dasar tools, bahasa, dan konsep yang perlu kamu pahami sebelum mulai coding.',
                'blocks' => [
                    ['type' => 'header', 'data' => ['text' => 'Dari Mana Mulainya?', 'level' => 2]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Pengembangan aplikasi Android modern umumnya pakai bahasa <strong>Kotlin</strong> (resmi direkomendasikan Google) dengan IDE bernama <strong>Android Studio</strong>, yang gratis dan sudah lengkap dengan emulator buat nge-test aplikasi tanpa HP fisik.']],
                    ['type' => 'header', 'data' => ['text' => 'Konsep Dasar yang Perlu Dipahami', 'level' => 3]],
                    ['type' => 'list', 'data' => ['style' => 'unordered', 'items' => [
                        '<strong>Activity</strong> — satu layar/halaman dalam aplikasi Android',
                        '<strong>Layout XML</strong> — file yang mengatur tampilan visual tiap Activity',
                        '<strong>Intent</strong> — cara berpindah dari satu Activity ke Activity lain',
                        '<strong>Gradle</strong> — sistem build yang mengelola dependency dan kompilasi aplikasi',
                    ]]],
                    ['type' => 'code', 'data' => ['code' => "class MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_main)\n    }\n}"]],
                    ['type' => 'paragraph', 'data' => ['text' => 'Kalau kamu sudah familier dengan konsep dasar pemrograman (variabel, fungsi, kondisi), transisi ke Kotlin dan Android Studio relatif cepat dikuasai.']],
                ],
            ],
        ];

        foreach ($articles as $article) {
            Article::firstOrCreate(
                ['slug' => Str::slug($article['title'])],
                [
                    'title' => $article['title'],
                    'excerpt' => $article['excerpt'],
                    'content' => [
                        'time' => now()->timestamp,
                        'blocks' => $article['blocks'],
                        'version' => '2.29.0',
                    ],
                    'thumbnail' => null,
                    'is_published' => true,
                ],
            );
        }
    }
}
