<?php

use App\Http\Controllers\User\AuthController;
use App\Http\Controllers\User\CartController;
use App\Http\Controllers\User\OrderController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\User\RecentlyViewedController;
use App\Http\Controllers\User\WishlistController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->prefix('v1/user')->group(function () {
    Route::post('/auth/user-logout', [AuthController::class, 'logout']);
    Route::post('/profile/profile-show', [ProfileController::class, 'postShow']);
    Route::post('/profile/profile-update', [ProfileController::class, 'postUpdate']);
    Route::post('/profile/profile-appearance', [ProfileController::class, 'postAppearanceUpdate']);

    Route::post('/checkout/checkout-options', [OrderController::class, 'postCheckoutOptions']);
    Route::post('/checkout/checkout-place', [OrderController::class, 'postCheckout']);
    Route::post('/orders/orders-list', [OrderController::class, 'postOrdersList']);
    Route::post('/orders/order-show', [OrderController::class, 'postOrderShow']);

    Route::post('/cart/cart-list', [CartController::class, 'postCartList']);
    Route::post('/cart/cart-add', [CartController::class, 'postCartAdd']);
    Route::post('/cart/cart-update', [CartController::class, 'postCartUpdate']);
    Route::post('/cart/cart-remove', [CartController::class, 'postCartRemove']);
    Route::post('/cart/cart-clear', [CartController::class, 'postCartClear']);

    Route::post('/wishlist/wishlist-list', [WishlistController::class, 'postWishlistList']);
    Route::post('/wishlist/wishlist-add', [WishlistController::class, 'postWishlistAdd']);
    Route::post('/wishlist/wishlist-remove', [WishlistController::class, 'postWishlistRemove']);
    Route::post('/wishlist/wishlist-toggle', [WishlistController::class, 'postWishlistToggle']);

    Route::post('/recently-viewed/recently-viewed-record', [RecentlyViewedController::class, 'postRecentlyViewedRecord']);
    Route::post('/recently-viewed/recently-viewed-list', [RecentlyViewedController::class, 'postRecentlyViewedList']);
    Route::post('/recently-viewed/recently-viewed-clear', [RecentlyViewedController::class, 'postRecentlyViewedClear']);
});
