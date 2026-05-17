<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Services\Cart\CartOwnerService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    public function __construct(
        protected CartOwnerService $cartOwner,
    ) {}

    public function postCartList(Request $request)
    {
        try {
            $cart = $this->cartOwner->resolve($request);

            return $this->sendJsonResponse(true, 'Cart fetched successfully.', $this->formatCart($cart), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCartAdd(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'product_variant_id' => ['required', 'integer', 'exists:product_variants,id'],
                'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $variant = ProductVariant::query()
                ->with('product')
                ->find($request->input('product_variant_id'));

            if (
                ! $variant
                || ! $variant->is_active
                || ! $variant->product
                || $variant->product->status !== 'published'
            ) {
                return $this->sendJsonResponse(false, 'Product is not available.', null, 200);
            }

            $quantity = (int) $request->input('quantity', 1);

            if ($variant->stock_quantity < $quantity) {
                return $this->sendJsonResponse(false, 'Insufficient stock.', null, 200);
            }

            $cart = $this->cartOwner->resolve($request);

            DB::transaction(function () use ($cart, $variant, $quantity) {
                $item = CartItem::query()->firstOrNew([
                    'cart_id' => $cart->id,
                    'product_variant_id' => $variant->id,
                ]);

                $newQty = ($item->exists ? $item->quantity : 0) + $quantity;

                if ($variant->stock_quantity < $newQty) {
                    throw new \RuntimeException('Insufficient stock.');
                }

                $item->quantity = $newQty;
                $item->save();
            });

            return $this->sendJsonResponse(true, 'Added to cart.', $this->formatCart($cart->refresh()), 200);
        } catch (\RuntimeException $e) {
            return $this->sendJsonResponse(false, $e->getMessage(), null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCartUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'cart_item_id' => ['required', 'integer', 'exists:cart_items,id'],
                'quantity' => ['required', 'integer', 'min:1', 'max:99'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $cart = $this->cartOwner->resolve($request);

            $item = CartItem::query()
                ->where('cart_id', $cart->id)
                ->with('productVariant')
                ->find($request->input('cart_item_id'));

            if (! $item || ! $item->productVariant) {
                return $this->sendJsonResponse(false, 'Cart item not found.', null, 200);
            }

            $quantity = (int) $request->input('quantity');

            if ($item->productVariant->stock_quantity < $quantity) {
                return $this->sendJsonResponse(false, 'Insufficient stock.', null, 200);
            }

            $item->quantity = $quantity;
            $item->save();

            return $this->sendJsonResponse(true, 'Cart updated.', $this->formatCart($cart->fresh()), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCartRemove(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'cart_item_id' => ['required', 'integer', 'exists:cart_items,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $cart = $this->cartOwner->resolve($request);

            CartItem::query()
                ->where('cart_id', $cart->id)
                ->whereKey($request->input('cart_item_id'))
                ->delete();

            return $this->sendJsonResponse(true, 'Item removed.', $this->formatCart($cart->fresh()), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCartClear(Request $request)
    {
        try {
            $cart = $this->cartOwner->resolve($request);

            CartItem::query()->where('cart_id', $cart->id)->delete();

            return $this->sendJsonResponse(true, 'Cart cleared.', $this->formatCart($cart->fresh()), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    /**
     * @return array{items: array<int, array<string, mixed>>, subtotal: float, count: int, currency: string}
     */
    protected function formatCart(Cart $cart): array
    {
        $items = CartItem::query()
            ->where('cart_id', $cart->id)
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
            ->orderBy('id')
            ->get();

        $rows = [];
        $subtotal = 0.0;
        $count = 0;

        foreach ($items as $item) {
            $variant = $item->productVariant;
            $product = $variant?->product;

            if (! $variant || ! $product) {
                continue;
            }

            $unitPrice = (float) $variant->price;
            $lineTotal = $unitPrice * $item->quantity;
            $subtotal += $lineTotal;
            $count += $item->quantity;

            $image = $variant->images->first() ?? $product->images()->orderByDesc('is_primary')->first();

            $rows[] = [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'unit_price' => $unitPrice,
                'line_total' => $lineTotal,
                'product_variant_id' => $variant->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'variant_label' => trim(collect([$variant->size, $variant->color])->filter()->implode(' · ')) ?: $variant->sku,
                'sku' => $variant->sku,
                'image_path' => $image?->path,
                'stock_quantity' => $variant->stock_quantity,
            ];
        }

        return [
            'items' => $rows,
            'subtotal' => round($subtotal, 2),
            'count' => $count,
            'currency' => $cart->currency,
        ];
    }
}
