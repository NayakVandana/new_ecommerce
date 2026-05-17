<?php

namespace App\Services\Wishlist;

use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistOwnerService
{
    public function resolve(Request $request): Wishlist
    {
        $user = $request->user();

        return Wishlist::query()->firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Default'],
        );
    }
}
