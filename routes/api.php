<?php

use App\Http\Controllers\Guest\AuthController;
use App\Http\Controllers\Guest\CatalogController;
use App\Http\Controllers\Guest\ContactController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/auth-register', [AuthController::class, 'register']);
    Route::post('/auth/auth-login', [AuthController::class, 'login']);

    Route::post('/catalog/genders/genders-list', [CatalogController::class, 'postGendersList']);
    Route::post('/catalog/brands/brands-list', [CatalogController::class, 'postBrandsList']);
    Route::post('/catalog/categories/categories-list', [CatalogController::class, 'postCategoriesList']);
    Route::post('/catalog/colors/colors-list', [CatalogController::class, 'postColorsList']);
    Route::post('/catalog/search/search-suggestions-list', [CatalogController::class, 'postSearchSuggestionsList']);
    Route::post('/catalog/products/products-list', [CatalogController::class, 'postProductsList']);
    Route::post('/catalog/products/product-show', [CatalogController::class, 'postProductShow']);

    Route::post('/contact/contact-submit', [ContactController::class, 'postContactSubmit'])
        ->middleware('throttle:10,1');
});
