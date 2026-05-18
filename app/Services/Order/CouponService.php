<?php

namespace App\Services\Order;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\User;
use RuntimeException;

class CouponService
{
    public function normalizeCode(string $code): string
    {
        return strtoupper(trim($code));
    }

    /**
     * @return array{coupon: Coupon, discount: float, code: string}
     */
    public function resolveForCheckout(User $user, string $code, float $cartSubtotal): array
    {
        $normalized = $this->normalizeCode($code);

        if ($normalized === '') {
            throw new RuntimeException('Enter a coupon code.');
        }

        $coupon = Coupon::query()
            ->whereRaw('UPPER(code) = ?', [$normalized])
            ->first();

        if (! $coupon) {
            throw new RuntimeException('This coupon code is not valid.');
        }

        $this->assertCouponUsable($coupon, $user, $cartSubtotal);
        $discount = $this->calculateDiscount($coupon, $cartSubtotal);

        if ($discount <= 0) {
            throw new RuntimeException('This coupon does not apply to your order total.');
        }

        return [
            'coupon' => $coupon,
            'discount' => $discount,
            'code' => $coupon->code,
        ];
    }

    public function calculateDiscount(Coupon $coupon, float $subtotal): float
    {
        $subtotal = max(0, round($subtotal, 2));

        if ($subtotal <= 0) {
            return 0.0;
        }

        if ($coupon->type === 'fixed') {
            return min(round((float) $coupon->value, 2), $subtotal);
        }

        $percent = min(100, max(0, (float) $coupon->value));

        return min($subtotal, round($subtotal * $percent / 100, 2));
    }

    public function recordUsage(Coupon $coupon, User $user, Order $order, float $amountSaved): void
    {
        CouponUsage::query()->create([
            'coupon_id' => $coupon->id,
            'user_id' => $user->id,
            'order_id' => $order->id,
            'amount_saved' => round($amountSaved, 2),
            'used_at' => now(),
        ]);

        $coupon->increment('used_count');
    }

    protected function assertCouponUsable(Coupon $coupon, User $user, float $cartSubtotal): void
    {
        if (! $coupon->is_active) {
            throw new RuntimeException('This coupon is not active.');
        }

        $now = now();

        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            throw new RuntimeException('This coupon is not valid yet.');
        }

        if ($coupon->ends_at && $coupon->ends_at->isPast()) {
            throw new RuntimeException('This coupon has expired.');
        }

        if ($coupon->min_order_amount !== null && $cartSubtotal < (float) $coupon->min_order_amount) {
            throw new RuntimeException(
                'Minimum order amount is Rs. '.number_format((float) $coupon->min_order_amount, 2).' for this coupon.',
            );
        }

        if ($coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses) {
            throw new RuntimeException('This coupon has reached its usage limit.');
        }

        if ($coupon->per_user_limit !== null) {
            $userUses = CouponUsage::query()
                ->where('coupon_id', $coupon->id)
                ->where('user_id', $user->id)
                ->count();

            if ($userUses >= $coupon->per_user_limit) {
                throw new RuntimeException('You have already used this coupon the maximum number of times.');
            }
        }
    }
}
