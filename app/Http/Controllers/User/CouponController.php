<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\CouponUsage;
use App\Services\Cart\CartOwnerService;
use App\Services\Order\CouponService;
use App\Support\VariantPricing;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

class CouponController extends Controller
{
    public function __construct(
        protected CartOwnerService $cartOwner,
        protected CouponService $coupons,
    ) {}

    public function postCouponApply(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'code' => ['required', 'string', 'max:64'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $cart = $this->cartOwner->resolve($request);
            $subtotal = $this->cartSubtotal($cart->id);

            if ($subtotal <= 0) {
                return $this->sendJsonResponse(false, 'Your cart is empty.', null, 200);
            }

            $resolved = $this->coupons->resolveForCheckout(
                $request->user(),
                (string) $request->input('code'),
                $subtotal,
            );

            $taxRate = (float) config('checkout.tax_rate', 0);
            $shippingFlat = (float) config('checkout.shipping_flat', 0);
            $discount = $resolved['discount'];
            $taxableSubtotal = round(max(0, $subtotal - $discount), 2);
            $tax = round($taxableSubtotal * $taxRate, 2);
            $grandTotal = round($taxableSubtotal + $shippingFlat + $tax, 2);

            return $this->sendJsonResponse(true, 'Coupon applied.', [
                'code' => $resolved['code'],
                'type' => $resolved['coupon']->type,
                'coupon_discount' => $discount,
                'subtotal' => $subtotal,
                'taxable_subtotal' => $taxableSubtotal,
                'shipping_flat' => $shippingFlat,
                'tax' => $tax,
                'grand_total' => $grandTotal,
                'currency' => $cart->currency ?? 'INR',
            ], 200);
        } catch (RuntimeException $e) {
            return $this->sendJsonResponse(false, $e->getMessage(), null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCouponUsagesList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
                'current_page' => ['nullable', 'integer', 'min:1'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = (int) $request->input('per_page', 10);
            $currentPage = (int) $request->input('current_page', 1);
            $userId = $request->user()->id;

            $paginator = CouponUsage::query()
                ->where('user_id', $userId)
                ->with([
                    'coupon:id,code,type',
                    'order:id,order_number,currency,grand_total,status',
                ])
                ->orderByDesc('used_at')
                ->orderByDesc('id')
                ->paginate($perPage, ['*'], 'page', $currentPage);

            $paginator->getCollection()->transform(function (CouponUsage $row) {
                return [
                    'id' => $row->id,
                    'used_at' => $row->used_at?->toIso8601String(),
                    'amount_saved' => (float) $row->amount_saved,
                    'coupon_code' => $row->coupon?->code,
                    'coupon_type' => $row->coupon?->type,
                    'order_id' => $row->order_id,
                    'order_number' => $row->order?->order_number,
                    'order_status' => $row->order?->status,
                    'order_currency' => $row->order?->currency ?? 'INR',
                    'order_grand_total' => $row->order?->grand_total !== null
                        ? (float) $row->order->grand_total
                        : null,
                ];
            });

            return $this->sendJsonResponse(true, 'Coupon history fetched successfully.', $paginator, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    protected function cartSubtotal(int $cartId): float
    {
        $items = CartItem::query()
            ->where('cart_id', $cartId)
            ->with(['productVariant.product'])
            ->get();

        $subtotal = 0.0;

        foreach ($items as $item) {
            $variant = $item->productVariant;
            $product = $variant?->product;

            if (! $variant || ! $product || $product->status !== 'published') {
                continue;
            }

            $presentation = VariantPricing::presentation(
                $variant->cost !== null ? (float) $variant->cost : null,
                $variant->compare_at_price !== null ? (float) $variant->compare_at_price : null,
                $variant->list_price !== null ? (float) $variant->list_price : null,
                (float) $variant->price,
                $variant->discount_percent !== null ? (float) $variant->discount_percent : null,
                $variant->commission_percent !== null ? (float) $variant->commission_percent : null,
            );

            $subtotal += round($presentation['final_price'] * $item->quantity, 2);
        }

        return round($subtotal, 2);
    }
}
