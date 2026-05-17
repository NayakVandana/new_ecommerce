<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use App\Services\Wishlist\WishlistOwnerService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WishlistController extends Controller
{
    public function __construct(
        protected WishlistOwnerService $wishlistOwner,
    ) {}

    public function postWishlistList(Request $request)
    {
        try {
            $wishlist = $this->wishlistOwner->resolve($request);

            return $this->sendJsonResponse(true, 'Wishlist fetched successfully.', $this->formatWishlist($wishlist), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postWishlistAdd(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $variant = ProductVariant::query()
                ->with('product')
                ->find($request->input('product_variant_id'));

            if (! $variant || ! $variant->product || $variant->product->status !== 'published') {
                return $this->sendJsonResponse(false, 'Product is not available.', null, 200);
            }

            $wishlist = $this->wishlistOwner->resolve($request);

            WishlistItem::query()->firstOrCreate([
                'wishlist_id' => $wishlist->id,
                'product_variant_id' => $variant->id,
            ]);

            return $this->sendJsonResponse(true, 'Added to wishlist.', $this->formatWishlist($wishlist->fresh()), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postWishlistRemove(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'wishlist_item_id' => ['required_without:product_variant_id', 'integer', 'exists:wishlist_items,id'],
                'product_variant_id' => ['required_without:wishlist_item_id', 'integer', 'exists:product_variants,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $wishlist = $this->wishlistOwner->resolve($request);

            $query = WishlistItem::query()->where('wishlist_id', $wishlist->id);

            if ($request->filled('wishlist_item_id')) {
                $query->whereKey($request->input('wishlist_item_id'));
            } else {
                $query->where('product_variant_id', $request->input('product_variant_id'));
            }

            $query->delete();

            return $this->sendJsonResponse(true, 'Removed from wishlist.', $this->formatWishlist($wishlist->fresh()), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postWishlistToggle(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $variant = ProductVariant::query()
                ->with('product')
                ->find($request->input('product_variant_id'));

            if (! $variant || ! $variant->product || $variant->product->status !== 'published') {
                return $this->sendJsonResponse(false, 'Product is not available.', null, 200);
            }

            $wishlist = $this->wishlistOwner->resolve($request);

            $existing = WishlistItem::query()
                ->where('wishlist_id', $wishlist->id)
                ->where('product_variant_id', $variant->id)
                ->first();

            if ($existing) {
                $existing->delete();
                $message = 'Removed from wishlist.';
                $saved = false;
            } else {
                WishlistItem::query()->create([
                    'wishlist_id' => $wishlist->id,
                    'product_variant_id' => $variant->id,
                ]);
                $message = 'Added to wishlist.';
                $saved = true;
            }

            $payload = $this->formatWishlist($wishlist->fresh());
            $payload['saved'] = $saved;

            return $this->sendJsonResponse(true, $message, $payload, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    /**
     * @return array{items: array<int, array<string, mixed>>, count: int, variant_ids: array<int, int>}
     */
    protected function formatWishlist(Wishlist $wishlist): array
    {
        $items = WishlistItem::query()
            ->where('wishlist_id', $wishlist->id)
            ->with([
                'productVariant.product' => fn ($q) => $q->with([
                    'images' => fn ($iq) => $iq
                        ->whereNull('product_variant_id')
                        ->orderByDesc('is_primary')
                        ->orderBy('sort_order')
                        ->limit(1),
                ]),
                'productVariant.images' => fn ($q) => $q
                    ->orderByDesc('is_primary')
                    ->orderBy('sort_order')
                    ->limit(1),
            ])
            ->orderByDesc('created_at')
            ->get();

        $rows = [];
        $variantIds = [];

        foreach ($items as $item) {
            $variant = $item->productVariant;
            $product = $variant?->product;

            if (! $variant || ! $product || $product->status !== 'published') {
                continue;
            }

            $variantIds[] = $variant->id;

            $image = $variant->images->first() ?? $product->images->first();
            $unitPrice = (float) $variant->price;

            $rows[] = [
                'id' => $item->id,
                'product_variant_id' => $variant->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_slug' => $product->slug,
                'variant_label' => trim(collect([$variant->size, $variant->color])->filter()->implode(' · ')) ?: $variant->sku,
                'sku' => $variant->sku,
                'unit_price' => $unitPrice,
                'image_path' => $image?->path,
                'stock_quantity' => $variant->stock_quantity,
                'in_stock' => $variant->stock_quantity > 0,
            ];
        }

        return [
            'items' => $rows,
            'count' => count($rows),
            'variant_ids' => $variantIds,
        ];
    }
}
