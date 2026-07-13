<?php

use App\Http\Controllers\Internal\ArticleController;
use App\Http\Controllers\Internal\CategoryController;
use App\Http\Controllers\Internal\CourseContentController;
use App\Http\Controllers\Internal\CourseController;
use App\Http\Controllers\Internal\DashboardController;
use App\Http\Controllers\Internal\EditorImageController;
use App\Http\Controllers\Internal\OrderController;
use App\Http\Controllers\Internal\ProductController;
use App\Http\Controllers\Internal\UserController;
use App\Http\Controllers\Internal\VoucherController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('internal')
    ->name('internal.')
    ->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');

        // Users
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::match(['put', 'patch'], 'users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        // Categories
        Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('categories/create', [CategoryController::class, 'create'])->name('categories.create');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::match(['put', 'patch'], 'categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        // Articles
        Route::get('articles', [ArticleController::class, 'index'])->name('articles.index');
        Route::get('articles/create', [ArticleController::class, 'create'])->name('articles.create');
        Route::post('articles', [ArticleController::class, 'store'])->name('articles.store');
        Route::get('articles/{article}/edit', [ArticleController::class, 'edit'])->name('articles.edit');
        Route::match(['put', 'patch'], 'articles/{article}', [ArticleController::class, 'update'])->name('articles.update');
        Route::delete('articles/{article}', [ArticleController::class, 'destroy'])->name('articles.destroy');

        // Orders
        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
        Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::get('orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
        Route::match(['put', 'patch'], 'orders/{order}', [OrderController::class, 'update'])->name('orders.update');
        Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
        Route::patch('orders/{order}/approve', [OrderController::class, 'approve'])->name('orders.approve');
        Route::patch('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');

        // Products
        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::match(['put', 'patch'], 'products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        // Vouchers
        Route::get('vouchers', [VoucherController::class, 'index'])->name('vouchers.index');
        Route::get('vouchers/create', [VoucherController::class, 'create'])->name('vouchers.create');
        Route::post('vouchers', [VoucherController::class, 'store'])->name('vouchers.store');
        Route::get('vouchers/{voucher}/edit', [VoucherController::class, 'edit'])->name('vouchers.edit');
        Route::match(['put', 'patch'], 'vouchers/{voucher}', [VoucherController::class, 'update'])->name('vouchers.update');
        Route::delete('vouchers/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy');

        // Courses
        Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
        Route::get('courses/create', [CourseController::class, 'create'])->name('courses.create');
        Route::post('courses', [CourseController::class, 'store'])->name('courses.store');
        Route::get('courses/{course}/edit', [CourseController::class, 'edit'])->name('courses.edit');
        Route::match(['put', 'patch'], 'courses/{course}', [CourseController::class, 'update'])->name('courses.update');
        Route::delete('courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');
        Route::post('editor-image/{context}/{identifier}', [EditorImageController::class, 'store'])->where('identifier', '.+')->name('editor-image.store');

        // Course Contents
        Route::get('courses/{course}/contents', [CourseContentController::class, 'index'])->name('courses.contents.index');
        Route::get('courses/{course}/contents/create', [CourseContentController::class, 'create'])->name('courses.contents.create');
        Route::post('courses/{course}/contents', [CourseContentController::class, 'store'])->name('courses.contents.store');
        Route::get('courses/{course}/contents/{content}/edit', [CourseContentController::class, 'edit'])->name('courses.contents.edit');
        Route::match(['put', 'patch'], 'courses/{course}/contents/{content}', [CourseContentController::class, 'update'])->name('courses.contents.update');
        Route::delete('courses/{course}/contents/{content}', [CourseContentController::class, 'destroy'])->name('courses.contents.destroy');

        Route::redirect('settings', '/internal/settings/profile')->name('settings');
        Route::get('settings/profile', [ProfileController::class, 'edit'])->name('settings.profile');
        Route::get('settings/security', [SecurityController::class, 'edit'])
            ->middleware(RequirePassword::class)
            ->name('settings.security');
        Route::get('settings/appearance', fn () => Inertia::render('settings/appearance'))->name('settings.appearance');
    });
