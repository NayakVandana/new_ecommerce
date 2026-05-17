<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * Fallback when `public/storage` → `storage/app/public` is missing (e.g. symlink
 * not created). Normally Apache / `php artisan serve` serves these as static files.
 */
Route::get('/storage/{path}', function (string $path) {
    $path = str_replace('\\', '/', $path);
    if (str_contains($path, '..')) {
        abort(404);
    }
    $fullPath = storage_path('app/public/'.$path);
    if (! is_file($fullPath)) {
        abort(404);
    }
    $base = realpath(storage_path('app/public'));
    $real = realpath($fullPath);
    if ($base === false || $real === false) {
        abort(404);
    }
    $baseNorm = str_replace('\\', '/', $base);
    $realNorm = str_replace('\\', '/', $real);
    if ($realNorm !== $baseNorm && ! str_starts_with($realNorm, $baseNorm.'/')) {
        abort(404);
    }

    return response()->file($real);
})->where('path', '.*');

Route::get('/', fn () => Inertia::render('Guest/Home'))->name('home');

Route::get('/catalog', fn () => Inertia::render('Guest/Catalog'))->name('guest.catalog');

Route::get('/products/{slug}', fn (string $slug) => Inertia::render('Guest/ProductShow', ['productSlug' => $slug]))
    ->name('guest.product.show');

Route::get('/cart', fn () => Inertia::render('Guest/Cart'))->name('guest.cart');

Route::get('/checkout', fn () => Inertia::render('Guest/Checkout'))->name('guest.checkout');

Route::get('/welcome', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

Route::get('/dashboard', fn () => Inertia::render('User/Dashboard'))->name('dashboard');

Route::get('/profile', fn () => Inertia::render('User/Profile/Edit', [
    'mustVerifyEmail' => false,
    'status' => null,
]))->name('profile.edit');

Route::prefix('account')->name('user.')->group(function () {
    Route::get('/wishlist', fn () => Inertia::render('User/Wishlist/Index'))->name('wishlist.index');
    Route::get('/orders', fn () => Inertia::render('User/Orders/Index'))->name('orders.index');
    Route::get('/orders/{id}', fn (int $id) => Inertia::render('User/Orders/Show', ['orderId' => $id]))
        ->whereNumber('id')
        ->name('orders.show');
});

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', fn () => Inertia::render('Admin/Login'))->name('login');

    Route::get('/', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');

    Route::get('brands', fn () => Inertia::render('Admin/Brands/Index'))->name('brands.index');
    Route::get('brands/create', fn () => Inertia::render('Admin/Brands/Form', ['brandId' => null]))
        ->name('brands.create');
    Route::get('brands/{id}/edit', fn (int $id) => Inertia::render('Admin/Brands/Form', ['brandId' => $id]))
        ->whereNumber('id')
        ->name('brands.edit');

    Route::get('categories', fn () => Inertia::render('Admin/Categories/Index'))->name('categories.index');
    Route::get('categories/create', fn () => Inertia::render('Admin/Categories/Form', ['categoryId' => null]))
        ->name('categories.create');
    Route::get('categories/{id}/edit', fn (int $id) => Inertia::render('Admin/Categories/Form', ['categoryId' => $id]))
        ->whereNumber('id')
        ->name('categories.edit');

    Route::get('users', fn () => Inertia::render('Admin/Users/Index'))->name('users.index');

    Route::get('orders', fn () => Inertia::render('Admin/Orders/Index'))->name('orders.index');
    Route::get('orders/{id}', fn (int $id) => Inertia::render('Admin/Orders/Show', ['orderId' => $id]))
        ->whereNumber('id')
        ->name('orders.show');

    Route::get('products', fn () => Inertia::render('Admin/Products/Index'))->name('products.index');
    Route::get('products/create', fn () => Inertia::render('Admin/Products/Form', ['productId' => null]))
        ->name('products.create');
    Route::get('products/{id}/edit', fn (int $id) => Inertia::render('Admin/Products/Form', ['productId' => $id]))
        ->whereNumber('id')
        ->name('products.edit');
});

require __DIR__.'/auth.php';
