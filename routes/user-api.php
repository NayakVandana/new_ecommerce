<?php

use App\Http\Controllers\User\AuthController;
use App\Http\Controllers\User\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->prefix('v1/user')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/profile/show', [ProfileController::class, 'postShow']);
    Route::post('/profile/update', [ProfileController::class, 'postUpdate']);
    Route::post('/profile/appearance', [ProfileController::class, 'postAppearanceUpdate']);
    Route::post('/profile/destroy', [ProfileController::class, 'postDestroy']);
});
