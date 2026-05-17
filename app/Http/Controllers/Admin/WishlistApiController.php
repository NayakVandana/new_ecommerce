<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WishlistItem;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WishlistApiController extends Controller
{
    public function postWishlistItemsList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
                'current_page' => ['nullable', 'integer', 'min:1'],
                'keyword' => ['nullable', 'string', 'max:120'],
                'user_id' => ['nullable', 'integer', 'exists:users,id'],
                'product_id' => ['nullable', 'integer', 'exists:products,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = (int) $request->input('per_page', 15);
            $currentPage = (int) $request->input('current_page', 1);

            $query = WishlistItem::query()
                ->with([
                    'wishlist.user:id,name,email',
                    'productVariant:id,product_id,sku,size,color,price,stock_quantity',
                    'productVariant.product:id,name,slug,base_sku,status',
                ])
                ->whereHas('wishlist', fn ($q) => $q->whereNotNull('user_id'))
                ->orderByDesc('created_at');

            if ($request->filled('user_id')) {
                $query->whereHas('wishlist', fn ($q) => $q->where('user_id', $request->input('user_id')));
            }

            if ($request->filled('product_id')) {
                $query->whereHas('productVariant', fn ($q) => $q->where('product_id', $request->input('product_id')));
            }

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->whereHas('wishlist.user', function ($uq) use ($keyword) {
                        $uq->where('name', 'like', '%'.$keyword.'%')
                            ->orWhere('email', 'like', '%'.$keyword.'%');
                    })->orWhereHas('productVariant', function ($vq) use ($keyword) {
                        $vq->where('sku', 'like', '%'.$keyword.'%')
                            ->orWhereHas('product', function ($pq) use ($keyword) {
                                $pq->where('name', 'like', '%'.$keyword.'%')
                                    ->orWhere('slug', 'like', '%'.$keyword.'%')
                                    ->orWhere('base_sku', 'like', '%'.$keyword.'%');
                            });
                    });
                });
            }

            $paginator = $query->paginate($perPage, ['*'], 'page', $currentPage);

            $paginator->getCollection()->transform(function (WishlistItem $row) {
                $user = $row->wishlist?->user;
                $variant = $row->productVariant;
                $product = $variant?->product;
                $variantLabel = trim(collect([$variant?->size, $variant?->color])->filter()->implode(' · '));

                return [
                    'id' => $row->id,
                    'added_at' => $row->created_at?->toIso8601String(),
                    'user_id' => $user?->id,
                    'user_name' => $user?->name,
                    'user_email' => $user?->email,
                    'product_id' => $product?->id,
                    'product_name' => $product?->name,
                    'product_slug' => $product?->slug,
                    'product_sku' => $product?->base_sku,
                    'product_status' => $product?->status,
                    'product_variant_id' => $variant?->id,
                    'variant_sku' => $variant?->sku,
                    'variant_label' => $variantLabel !== '' ? $variantLabel : $variant?->sku,
                    'unit_price' => $variant?->price !== null ? (float) $variant->price : null,
                    'stock_quantity' => $variant?->stock_quantity,
                    'in_stock' => $variant ? $variant->stock_quantity > 0 : null,
                ];
            });

            return $this->sendJsonResponse(true, 'Wishlist items fetched successfully.', $paginator, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
