<?php

use App\Http\Controllers\User\AuthController;
use App\Http\Controllers\User\CartController;
use App\Http\Controllers\User\OrderController;
use App\Http\Controllers\User\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->prefix('v1/user')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/profile/show', [ProfileController::class, 'postShow']);
    Route::post('/profile/update', [ProfileController::class, 'postUpdate']);
    Route::post('/profile/appearance', [ProfileController::class, 'postAppearanceUpdate']);

    Route::post('/checkout/options', [OrderController::class, 'postCheckoutOptions']);
    Route::post('/checkout/place', [OrderController::class, 'postCheckout']);
    Route::post('/orders/list', [OrderController::class, 'postOrdersList']);
    Route::post('/orders/show', [OrderController::class, 'postOrderShow']);

    Route::post('/cart/list', [CartController::class, 'postCartList']);
    Route::post('/cart/add', [CartController::class, 'postCartAdd']);
    Route::post('/cart/update', [CartController::class, 'postCartUpdate']);
    Route::post('/cart/remove', [CartController::class, 'postCartRemove']);
    Route::post('/cart/clear', [CartController::class, 'postCartClear']);
});
