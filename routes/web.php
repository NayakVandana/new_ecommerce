<?php

use App\Http\Controllers\Admin\AdminWebSessionController;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Gender;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
        Route::get('brands/create', fn () => Inertia::render('Admin/Brands/Form', ['brand' => null]))
            ->name('brands.create');
        Route::get('brands/{brand}/edit', fn (Brand $brand) => Inertia::render('Admin/Brands/Form', [
            'brand' => $brand,
        ]))->name('brands.edit');

        Route::get('categories', fn () => Inertia::render('Admin/Categories/Index'))->name('categories.index');
        Route::get('categories/create', fn () => Inertia::render('Admin/Categories/Form', ['category' => null]))
            ->name('categories.create');
        Route::get('categories/{category}/edit', fn (Category $category) => Inertia::render('Admin/Categories/Form', [
            'category' => $category->load(['subcategories' => fn ($q) => $q->orderBy('sort_order')->orderBy('name')]),
        ]))->name('categories.edit');

        Route::get('products', fn () => Inertia::render('Admin/Products/Index'))->name('products.index');
        Route::get('products/create', function () {
            return Inertia::render('Admin/Products/Form', [
                'product' => null,
                'meta' => [
                    'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
                    'subcategories' => Subcategory::query()
                        ->with(['category:id,name'])
                        ->orderBy('name')
                        ->get(['id', 'category_id', 'name']),
                    'genders' => Gender::query()->where('is_active', true)->orderBy('sort_order')->get(['id', 'name']),
                ],
            ]);
        })->name('products.create');
        Route::get('products/{product}/edit', function (Product $product) {
            return Inertia::render('Admin/Products/Form', [
                'product' => $product->load([
                    'brand',
                    'subcategory.category',
                    'variants' => fn ($q) => $q->orderByDesc('is_default')->orderBy('id'),
                ]),
                'meta' => [
                    'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
                    'subcategories' => Subcategory::query()
                        ->with(['category:id,name'])
                        ->orderBy('name')
                        ->get(['id', 'category_id', 'name']),
                    'genders' => Gender::query()->where('is_active', true)->orderBy('sort_order')->get(['id', 'name']),
                ],
            ]);
        })->name('products.edit');
    });
});

require __DIR__.'/auth.php';
