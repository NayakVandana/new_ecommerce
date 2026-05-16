<?php

namespace App\Services\Cart;

use App\Models\Cart;
use Illuminate\Http\Request;

class CartOwnerService
{
    public function resolve(Request $request): Cart
    {
        $user = $request->user();

        return Cart::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['currency' => 'INR'],
        );
    }
}
