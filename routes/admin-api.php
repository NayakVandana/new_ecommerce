<?php

use App\Http\Controllers\Admin\AdminAuthApiController;
use App\Http\Controllers\Admin\BrandApiController;
use App\Http\Controllers\Admin\CategoryApiController;
use App\Http\Controllers\Admin\DashboardApiController;
use App\Http\Controllers\Admin\ProductApiController;
use App\Http\Controllers\Admin\SubcategoryApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/admin')->group(function () {
    Route::post('/auth/login', [AdminAuthApiController::class, 'login']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('v1/admin')->group(function () {
    Route::post('/auth/logout', [AdminAuthApiController::class, 'logout']);
    Route::post('/dashboard/stats', [DashboardApiController::class, 'postStats']);

    Route::post('/products/list', [ProductApiController::class, 'postProductsList']);
    Route::post('/products/store', [ProductApiController::class, 'postProductStore']);
    Route::post('/products/update', [ProductApiController::class, 'postProductUpdate']);
    Route::post('/products/destroy', [ProductApiController::class, 'postProductDestroy']);

    Route::post('/brands/list', [BrandApiController::class, 'postBrandsList']);
    Route::post('/brands/store', [BrandApiController::class, 'postBrandStore']);
    Route::post('/brands/update', [BrandApiController::class, 'postBrandUpdate']);
    Route::post('/brands/destroy', [BrandApiController::class, 'postBrandDestroy']);

    Route::post('/categories/list', [CategoryApiController::class, 'postCategoriesList']);
    Route::post('/categories/store', [CategoryApiController::class, 'postCategoryStore']);
    Route::post('/categories/update', [CategoryApiController::class, 'postCategoryUpdate']);
    Route::post('/categories/destroy', [CategoryApiController::class, 'postCategoryDestroy']);

    Route::post('/subcategories/store', [SubcategoryApiController::class, 'postSubcategoryStore']);
    Route::post('/subcategories/update', [SubcategoryApiController::class, 'postSubcategoryUpdate']);
    Route::post('/subcategories/destroy', [SubcategoryApiController::class, 'postSubcategoryDestroy']);
});
