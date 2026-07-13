<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseSearchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, '__invoke'])->name('home');
Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show');
Route::get('search/courses', CourseSearchController::class)->name('courses.search');
Route::get('articles', [ArticleController::class, 'index'])->name('articles.index');
Route::get('articles/{article}', [ArticleController::class, 'show'])->name('articles.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('courses/{course}/contents/{content}', [App\Http\Controllers\CourseContentController::class, 'show'])->name('courses.contents.show');
    Route::post('courses/{course}/contents/{content}/complete', [App\Http\Controllers\CourseContentController::class, 'complete'])->name('courses.contents.complete');

    Route::get('orders', [App\Http\Controllers\OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/create', [App\Http\Controllers\OrderController::class, 'create'])->name('orders.create');
    Route::post('orders', [App\Http\Controllers\OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/{order}', [App\Http\Controllers\OrderController::class, 'show'])->name('orders.show');
    Route::post('orders/apply-voucher', [App\Http\Controllers\OrderController::class, 'applyVoucher'])->name('orders.apply-voucher');

    // User Voucher & Notification routes
    Route::get('vouchers', [App\Http\Controllers\VoucherController::class, 'index'])->name('vouchers.index');
    Route::post('vouchers/redeem', [App\Http\Controllers\VoucherController::class, 'redeem'])->name('vouchers.redeem');
    Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [App\Http\Controllers\NotificationController::class, 'read'])->name('notifications.read');
    Route::post('notifications/read-all', [App\Http\Controllers\NotificationController::class, 'readAll'])->name('notifications.read-all');

    // Course Review store route
    Route::post('courses/{course}/reviews', [App\Http\Controllers\ReviewController::class, 'store'])->name('courses.reviews.store');
});

// Xendit Webhook Callback
Route::post('webhooks/xendit', [App\Http\Controllers\XenditWebhookController::class, 'handle'])->name('webhooks.xendit');

require __DIR__.'/settings.php';
require __DIR__.'/internal.php';