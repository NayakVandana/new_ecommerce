<?php

use App\Http\Controllers\Admin\AdminAuthApiController;
use App\Http\Controllers\Admin\AdminMediaUploadController;
use App\Http\Controllers\Admin\BrandApiController;
use App\Http\Controllers\Admin\CategoryApiController;
use App\Http\Controllers\Admin\DashboardApiController;
use App\Http\Controllers\Admin\OrderApiController;
use App\Http\Controllers\Admin\OrderInvoiceController;
use App\Http\Controllers\Admin\ProductApiController;
use App\Http\Controllers\Admin\RecentlyViewedApiController;
use App\Http\Controllers\Admin\WishlistApiController;
use App\Http\Controllers\Admin\SubcategoryApiController;
use App\Http\Controllers\Admin\UserApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/admin')->group(function () {
    Route::post('/auth/admin-login', [AdminAuthApiController::class, 'login']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('v1/admin')->group(function () {
    Route::post('/auth/admin-logout', [AdminAuthApiController::class, 'logout']);
    Route::post('/dashboard/dashboard-stats', [DashboardApiController::class, 'postStats']);

    Route::post('/products/products-list', [ProductApiController::class, 'postProductsList']);
    Route::post('/products/product-variants-list', [ProductApiController::class, 'postProductVariantsList']);
    Route::post('/products/form-meta', [ProductApiController::class, 'postProductFormMeta']);
    Route::post('/products/product-show', [ProductApiController::class, 'postProductShow']);
    Route::post('/products/product-store', [ProductApiController::class, 'postProductStore']);
    Route::post('/products/product-update', [ProductApiController::class, 'postProductUpdate']);
    Route::post('/products/product-destroy', [ProductApiController::class, 'postProductDestroy']);

    Route::post('/media/upload-product-image', [AdminMediaUploadController::class, 'postUploadProductImage']);
    Route::post('/media/upload-product-video', [AdminMediaUploadController::class, 'postUploadProductVideo']);

    Route::post('/brands/brands-list', [BrandApiController::class, 'postBrandsList']);
    Route::post('/brands/brand-show', [BrandApiController::class, 'postBrandShow']);
    Route::post('/brands/brand-store', [BrandApiController::class, 'postBrandStore']);
    Route::post('/brands/brand-update', [BrandApiController::class, 'postBrandUpdate']);
    Route::post('/brands/brand-destroy', [BrandApiController::class, 'postBrandDestroy']);

    Route::post('/categories/categories-list', [CategoryApiController::class, 'postCategoriesList']);
    Route::post('/categories/category-show', [CategoryApiController::class, 'postCategoryShow']);
    Route::post('/categories/category-store', [CategoryApiController::class, 'postCategoryStore']);
    Route::post('/categories/category-update', [CategoryApiController::class, 'postCategoryUpdate']);
    Route::post('/categories/category-destroy', [CategoryApiController::class, 'postCategoryDestroy']);

    Route::post('/subcategories/subcategory-store', [SubcategoryApiController::class, 'postSubcategoryStore']);
    Route::post('/subcategories/subcategory-update', [SubcategoryApiController::class, 'postSubcategoryUpdate']);
    Route::post('/subcategories/subcategory-destroy', [SubcategoryApiController::class, 'postSubcategoryDestroy']);

    Route::post('/users/users-list', [UserApiController::class, 'postUsersList']);

    Route::post('/recently-viewed/recently-viewed-list', [RecentlyViewedApiController::class, 'postRecentlyViewedList']);

    Route::post('/wishlist/wishlist-items-list', [WishlistApiController::class, 'postWishlistItemsList']);

    Route::post('/orders/orders-meta', [OrderApiController::class, 'postOrdersMeta']);
    Route::post('/orders/orders-list', [OrderApiController::class, 'postOrdersList']);
    Route::post('/orders/order-show', [OrderApiController::class, 'postOrderShow']);
    Route::post('/orders/order-invoice-download', [OrderInvoiceController::class, 'download']);
    Route::post('/orders/update-status', [OrderApiController::class, 'postOrderUpdateStatus']);
});
