<?php

namespace App\Services\Admin;

use App\Models\Product;

class ProductFormLoaderService
{
    public function loadForForm(Product $product): Product
    {
        return $product->load([
            'brand',
            'subcategory.category',
            'variants' => fn ($q) => $q->orderByDesc('is_default')->orderBy('id')->with([
                'images' => fn ($iq) => $iq->orderBy('sort_order')->orderBy('id'),
                'videos' => fn ($vq) => $vq->orderBy('sort_order')->orderBy('id'),
            ]),
            'images' => fn ($q) => $q
                ->whereNull('product_variant_id')
                ->orderBy('sort_order')
                ->orderBy('id'),
            'videos' => fn ($q) => $q
                ->whereNull('product_variant_id')
                ->orderBy('sort_order')
                ->orderBy('id'),
        ]);
    }
}
