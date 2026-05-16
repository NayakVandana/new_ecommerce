<?php

use App\Http\Controllers\Guest\AuthController;
use App\Http\Controllers\Guest\CatalogController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::post('/catalog/genders/list', [CatalogController::class, 'postGendersList']);
    Route::post('/catalog/brands/list', [CatalogController::class, 'postBrandsList']);
    Route::post('/catalog/categories/list', [CatalogController::class, 'postCategoriesList']);
    Route::post('/catalog/products/list', [CatalogController::class, 'postProductsList']);
    Route::post('/catalog/products/show', [CatalogController::class, 'postProductShow']);
});
