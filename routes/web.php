<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CourseContentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseSearchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\XenditWebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, '__invoke'])->name('home');
Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show');
Route::get('search/courses', CourseSearchController::class)->name('courses.search');
Route::get('articles', [ArticleController::class, 'index'])->name('articles.index');
Route::get('articles/{article}', [ArticleController::class, 'show'])->name('articles.show');

// Guest bisa mengakses preview modul gratis (3 modul pertama course gratis) tanpa login.
Route::get('courses/{course}/contents/{content}', [CourseContentController::class, 'show'])->name('courses.contents.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('courses/{course}/contents/{content}/complete', [CourseContentController::class, 'complete'])->name('courses.contents.complete');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('orders/apply-voucher', [OrderController::class, 'applyVoucher'])->name('orders.apply-voucher');

    // User Voucher & Notification routes
    Route::get('vouchers', [VoucherController::class, 'index'])->name('vouchers.index');
    Route::post('vouchers/redeem', [VoucherController::class, 'redeem'])->name('vouchers.redeem');
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');

    // Course Review store route
    Route::post('courses/{course}/reviews', [ReviewController::class, 'store'])->name('courses.reviews.store');
});

// Xendit Webhook Callback
Route::post('webhooks/xendit', [XenditWebhookController::class, 'handle'])->name('webhooks.xendit');

require __DIR__.'/settings.php';
require __DIR__.'/internal.php';
