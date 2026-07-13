<?php

namespace Database\Seeders;

use App\Enums\ProductType;
use App\Models\Category;
use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Kategori
        $categories = [
            'Web Dev' => Category::firstOrCreate(['name' => 'Web Dev', 'slug' => 'web-dev']),
            'Android Dev' => Category::firstOrCreate(['name' => 'Android Dev', 'slug' => 'android-dev']),
            'Backend & API' => Category::firstOrCreate(['name' => 'Backend & API', 'slug' => 'backend-api']),
            'Fundamental' => Category::firstOrCreate(['name' => 'Fundamental', 'slug' => 'fundamental']),
            'UI/UX' => Category::firstOrCreate(['name' => 'UI/UX', 'slug' => 'ui-ux']),
        ];

        // Helper untuk membuat Course & Ketengan Product
        $createCourse = function ($title, $categoryName, $desc, $price, $strike = null, $techStack = null, $readDuration = null) use ($categories) {
            $slug = Str::slug($title);
            $course = Course::create([
                'category_id' => $categories[$categoryName]->id,
                'title' => $title,
                'slug' => $slug,
                'description' => $desc,
                'is_published' => true,
                'tech_stack' => $techStack,
                'read_duration' => $readDuration,
            ]);

            // Tambahkan Bab/Modul Konten Dummy
            for ($i = 1; $i <= 5; $i++) {
                CourseContent::create([
                    'course_id' => $course->id,
                    'title' => "Modul 0{$i} — Pembahasan Utama {$i}",
                    'slug' => "modul-0{$i}",
                    'content' => [
                        'time' => time() * 1000,
                        'blocks' => [
                            [
                                'id' => "block-{$i}",
                                'type' => 'paragraph',
                                'data' => [
                                    'text' => "Ini adalah isi konten lengkap untuk Modul 0{$i} dari kelas <strong>{$title}</strong>. Konsep dibahas secara komprehensif, dilengkapi potongan kode dan petunjuk praktis bagi siswa SMK RPL.",
                                ],
                            ],
                        ],
                        'version' => '2.29.0',
                    ],
                    'order' => $i,
                    'is_published' => true,
                ]);
            }

            // Ketengan Product (Single Product)
            $product = Product::create([
                'title' => $title,
                'slug' => "ketengan-{$slug}",
                'description' => "Pembelian ketengan (satuan) untuk course {$title}",
                'type' => ProductType::Single,
                'price' => $price,
                'price_strikethrough' => $strike,
                'is_published' => true,
            ]);

            $product->courses()->attach($course->id);

            return $course;
        };

        // 2. Buat Course Satuan
        $tokoOnline = $createCourse('Toko Online dengan Laravel', 'Web Dev', 'Studi kasus end-to-end: produk, keranjang, checkout, pembayaran.', 149000, 249000, 'Laravel · MySQL', '±14 mnt baca');
        $todoAndroid = $createCourse('Aplikasi To-Do List Android', 'Android Dev', 'Kotlin + Jetpack Compose dari dasar sampai konek ke API.', 129000, 199000, 'Kotlin · Jetpack Compose', '±12 mnt baca');
        $portfolioWeb = $createCourse('Personal Portfolio Website', 'Web Dev', 'Bikin portfolio siap dipajang saat PKL or interview kerja.', 99000, 169000, 'HTML · CSS · Tailwind', '±8 mnt baca');
        $restApi = $createCourse('REST API untuk Pemula', 'Backend & API', 'Buat REST API lengkap dari CRUD, middleware, sampai JWT auth.', 139000, 219000, 'Node.js · Express', '±10 mnt baca');
        $gitGithub = $createCourse('Git & GitHub untuk Pemula', 'Fundamental', 'Kuasai git init, commit, push origin main dan kolaborasi tim.', 0, null, 'Git · GitHub', '±6 mnt baca');
        $authRole = $createCourse('Autentikasi & Role-Based Access', 'Backend & API', 'Sistem registrasi, login, dan hak akses (role) yang aman — fondasi tiap aplikasi web.', 151500, 250000, 'Laravel · PHP', '±10 mnt baca');

        // 3. Buat Paket Bundle
        // Paket Jago Web Dev
        $paketWeb = Product::create([
            'title' => 'Paket Jago Web Dev',
            'slug' => 'paket-jago-web-dev',
            'description' => 'Dari HTML & CSS sampai full-stack Laravel. Cocok buat PKL dan lomba LKS.',
            'type' => ProductType::Bundle,
            'price' => 549000,
            'price_strikethrough' => 1100000,
            'is_published' => true,
            'is_favourite' => true,
        ]);
        $paketWeb->courses()->attach([$tokoOnline->id, $portfolioWeb->id, $gitGithub->id]);

        // Paket Jago Android Dev
        $paketAndroid = Product::create([
            'title' => 'Paket Jago Android Dev',
            'slug' => 'paket-jago-android-dev',
            'description' => 'Kotlin + Jetpack Compose dari dasar sampai konek ke API.',
            'type' => ProductType::Bundle,
            'price' => 449000,
            'price_strikethrough' => 800000,
            'is_published' => true,
            'is_favourite' => true,
        ]);
        $paketAndroid->courses()->attach([$todoAndroid->id]);

        // Paket Backend & API
        $paketBackend = Product::create([
            'title' => 'Paket Backend & API',
            'slug' => 'paket-backend-api',
            'description' => 'Node.js, Express, MySQL, dan autentikasi JWT end-to-end.',
            'type' => ProductType::Bundle,
            'price' => 349000,
            'price_strikethrough' => 650000,
            'is_published' => true,
            'is_favourite' => true,
        ]);
        $paketBackend->courses()->attach([$restApi->id, $authRole->id]);
    }
}
