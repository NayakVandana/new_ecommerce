<?php

use App\Http\Controllers\Admin\AdminWebSessionController;
use Illuminate\Contracts\Auth\MustVerifyEmail;
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

Route::get('/cart', fn () => Inertia::render('Guest/Cart'))->name('guest.cart');

Route::get('/welcome', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

Route::get('/dashboard', fn () => Inertia::render('User/Dashboard'))
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/profile', function () {
    return Inertia::render('User/Profile/Edit', [
        'mustVerifyEmail' => request()->user() instanceof MustVerifyEmail,
        'status' => session('status'),
    ]);
})->middleware('auth')->name('profile.edit');

Route::post('/admin/session/bootstrap', [AdminWebSessionController::class, 'store'])
    ->name('admin.session.bootstrap');
Route::post('/admin/session/logout', [AdminWebSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('admin.session.logout');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', fn () => Inertia::render('Admin/Login'))->name('login');

    Route::middleware(['auth', 'admin'])->group(function () {
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

        Route::get('products', fn () => Inertia::render('Admin/Products/Index'))->name('products.index');
        Route::get('products/create', fn () => Inertia::render('Admin/Products/Form', ['productId' => null]))
            ->name('products.create');
        Route::get('products/{id}/edit', fn (int $id) => Inertia::render('Admin/Products/Form', ['productId' => $id]))
            ->whereNumber('id')
            ->name('products.edit');
    });
});

require __DIR__.'/auth.php';
