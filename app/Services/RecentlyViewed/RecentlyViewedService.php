<?php

namespace App\Services\RecentlyViewed;

use App\Models\Product;
use App\Models\RecentlyViewedProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class RecentlyViewedService
{
    public const MAX_ITEMS_PER_USER = 30;

    public function record(Request $request, int $productId): void
    {
        $user = $request->user();

        $product = Product::query()
            ->whereKey($productId)
            ->where('status', 'published')
            ->first();

        if (! $product) {
            return;
        }

        RecentlyViewedProduct::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'product_id' => $product->id,
            ],
            [
                'session_id' => null,
                'viewed_at' => now(),
            ],
        );

        $this->pruneForUser($user->id);
    }

    public function listForUser(int $userId, int $limit = 12): Collection
    {
        return RecentlyViewedProduct::query()
            ->where('user_id', $userId)
            ->with([
                'product' => fn ($q) => $q
                    ->where('status', 'published')
                    ->with([
                        'brand',
                        'subcategory.category',
                        'variants',
                        'images' => fn ($iq) => $iq
                            ->whereNull('product_variant_id')
                            ->orderByDesc('is_primary')
                            ->orderBy('sort_order')
                            ->limit(1),
                    ]),
            ])
            ->orderByDesc('viewed_at')
            ->limit($limit)
            ->get();
    }

    public function clearForUser(int $userId): void
    {
        RecentlyViewedProduct::query()->where('user_id', $userId)->delete();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function formatList(Collection $entries): array
    {
        $rows = [];

        foreach ($entries as $entry) {
            $product = $entry->product;

            if (! $product) {
                continue;
            }

            $variant = $product->variants
                ->sortByDesc(fn ($v) => $v->is_default)
                ->first();

            $image = $product->images->first();

            $rows[] = [
                'id' => $product->id,
                'product_id' => $product->id,
                'viewed_at' => $entry->viewed_at?->toIso8601String(),
                'name' => $product->name,
                'slug' => $product->slug,
                'is_featured' => (bool) $product->is_featured,
                'status' => $product->status,
                'brand' => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                ] : null,
                'subcategory' => $product->subcategory ? [
                    'id' => $product->subcategory->id,
                    'name' => $product->subcategory->name,
                    'category' => $product->subcategory->category ? [
                        'id' => $product->subcategory->category->id,
                        'name' => $product->subcategory->category->name,
                    ] : null,
                ] : null,
                'variants' => $product->variants->map(fn ($v) => [
                    'id' => $v->id,
                    'sku' => $v->sku,
                    'price' => $v->price,
                    'size' => $v->size,
                    'color' => $v->color,
                    'stock_quantity' => $v->stock_quantity,
                    'is_default' => (bool) $v->is_default,
                ])->values()->all(),
                'images' => $image ? [['path' => $image->path]] : [],
                'unit_price' => $variant ? (float) $variant->price : null,
            ];
        }

        return $rows;
    }

    private function pruneForUser(int $userId): void
    {
        $keepIds = RecentlyViewedProduct::query()
            ->where('user_id', $userId)
            ->orderByDesc('viewed_at')
            ->limit(self::MAX_ITEMS_PER_USER)
            ->pluck('id');

        if ($keepIds->isEmpty()) {
            return;
        }

        RecentlyViewedProduct::query()
            ->where('user_id', $userId)
            ->whereNotIn('id', $keepIds)
            ->delete();
    }
}
