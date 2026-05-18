<?php

namespace App\Services\Order;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\UserAddress;
use App\Support\StoreDelivery;
use App\Support\VariantPricing;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class CheckoutService
{
    public function __construct(
        protected CouponService $coupons,
    ) {}
    /**
     * One order per cart line (each order has a single product line).
     *
     * @param  array{
     *     payment_method: string,
     *     shipping_address: array<string, mixed>,
     *     customer_note?: string|null,
     *     save_address?: bool,
     *     coupon_code?: string|null
     * }  $input
     * @return array{orders: Collection<int, Order>, primary: Order}
     */
    public function placeOrder(User $user, Cart $cart, array $input): array
    {
        $method = $input['payment_method'] ?? '';
        $allowed = array_keys(config('checkout.payment_methods', ['cod' => 'Cash on delivery']));

        if (! in_array($method, $allowed, true)) {
            throw new RuntimeException('Invalid payment method.');
        }

        if ($method !== 'cod') {
            throw new RuntimeException('Only cash on delivery is available.');
        }

        $addressInput = $input['shipping_address'] ?? [];
        $snapshot = $this->normalizeAddress($addressInput);
        $this->assertAddressComplete($snapshot);

        return DB::transaction(function () use ($user, $cart, $input, $snapshot, $method) {
            $lines = $this->resolveCartLines($cart);

            if ($lines === []) {
                throw new RuntimeException('Your cart is empty.');
            }

            $cartSubtotal = round(array_sum(array_column($lines, 'line_total')), 2);
            $shippingFlat = round((float) config('checkout.shipping_flat', 0), 2);
            $taxRate = (float) config('checkout.tax_rate', 0);

            $coupon = null;
            $discount = 0.0;

            if (! empty($input['coupon_code'])) {
                $resolved = $this->coupons->resolveForCheckout(
                    $user,
                    (string) $input['coupon_code'],
                    $cartSubtotal,
                );
                $coupon = $resolved['coupon'];
                $discount = $resolved['discount'];
            }

            $taxableSubtotal = round(max(0, $cartSubtotal - $discount), 2);

            $address = null;
            if (! empty($input['save_address'])) {
                $address = UserAddress::query()->create([
                    'user_id' => $user->id,
                    'label' => 'Shipping',
                    'full_name' => $snapshot['full_name'],
                    'phone' => $snapshot['phone'],
                    'line1' => $snapshot['line1'],
                    'line2' => $snapshot['line2'],
                    'city' => $snapshot['city'],
                    'state' => $snapshot['state'],
                    'postal_code' => $snapshot['postal_code'],
                    'country' => $snapshot['country'],
                    'is_default' => false,
                ]);
            }

            $shippingShares = $this->allocateProportional($shippingFlat, $lines, $cartSubtotal);
            $orders = collect();
            $lineIndex = 0;

            foreach ($lines as $line) {
                $lineSubtotal = round((float) $line['line_total'], 2);
                $lineShipping = $shippingShares[$lineIndex] ?? 0.0;
                $lineShare = $cartSubtotal > 0 ? $lineSubtotal / $cartSubtotal : 0;
                $lineTaxable = round($taxableSubtotal * $lineShare, 2);
                if ($lineIndex === count($lines) - 1) {
                    $priorTaxable = 0.0;
                    for ($i = 0; $i < $lineIndex; $i++) {
                        $share = $cartSubtotal > 0
                            ? ((float) $lines[$i]['line_total'] / $cartSubtotal)
                            : 0;
                        $priorTaxable += round($taxableSubtotal * $share, 2);
                    }
                    $lineTaxable = round(max(0, $taxableSubtotal - $priorTaxable), 2);
                }
                $lineTax = round($lineTaxable * $taxRate, 2);
                $lineDiscount = $lineIndex === 0 ? $discount : 0.0;
                $grandTotal = round($lineTaxable + $lineShipping + $lineTax, 2);

                $order = Order::query()->create([
                    'order_number' => $this->generateOrderNumber(),
                    'user_id' => $user->id,
                    'coupon_id' => $lineIndex === 0 ? $coupon?->id : null,
                    'status' => config('checkout.initial_order_status', 'pending'),
                    'subtotal' => $lineSubtotal,
                    'tax_total' => $lineTax,
                    'shipping_total' => $lineShipping,
                    'discount_total' => $lineDiscount,
                    'grand_total' => $grandTotal,
                    'currency' => $cart->currency ?? 'INR',
                    'customer_note' => $input['customer_note'] ?? null,
                    'address_of_bill_to' => $snapshot,
                    'address_of_ship_to' => $snapshot,
                    'placed_at' => now(),
                ]);

                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'product_variant_id' => $line['product_variant_id'],
                    'product_name' => $line['product_name'],
                    'variant_label' => $line['variant_label'],
                    'sku' => $line['sku'],
                    'unit_price' => $line['unit_price'],
                    'compare_at_price' => $line['compare_at_price'] ?? null,
                    'discount_percent' => $line['discount_percent'] ?? 0,
                    'quantity' => $line['quantity'],
                    'line_total' => $lineSubtotal,
                ]);

                ProductVariant::query()
                    ->whereKey($line['product_variant_id'])
                    ->decrement('stock_quantity', $line['quantity']);

                Payment::query()->create([
                    'order_id' => $order->id,
                    'method' => $method,
                    'status' => config('checkout.cod_payment_status', 'pending'),
                    'amount' => $grandTotal,
                    'currency' => $order->currency,
                ]);

                OrderStatusHistory::query()->create([
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'note' => 'Order placed — cash on delivery.',
                    'created_by' => $user->id,
                ]);

                if ($lineIndex === 0 && $coupon !== null && $discount > 0) {
                    $this->coupons->recordUsage($coupon, $user, $order, $discount);
                }

                $orders->push($order->fresh(['items']));
                $lineIndex++;
            }

            CartItem::query()->where('cart_id', $cart->id)->delete();

            return [
                'orders' => $orders,
                'primary' => $orders->first(),
            ];
        });
    }

    /**
     * @param  array<int, array<string, mixed>>  $lines
     * @return array<int, float>
     */
    protected function allocateProportional(float $total, array $lines, float $cartSubtotal): array
    {
        $count = count($lines);

        if ($count === 0) {
            return [];
        }

        if ($cartSubtotal <= 0) {
            return $this->allocateEven($total, $count);
        }

        $shares = [];
        $allocated = 0.0;

        foreach ($lines as $index => $line) {
            if ($index === $count - 1) {
                $shares[] = round($total - $allocated, 2);

                continue;
            }

            $portion = round($total * ((float) $line['line_total'] / $cartSubtotal), 2);
            $shares[] = $portion;
            $allocated += $portion;
        }

        return $shares;
    }

    /**
     * @return array<int, float>
     */
    protected function allocateEven(float $total, int $count): array
    {
        $shares = [];
        $allocated = 0.0;
        $base = $count > 0 ? round($total / $count, 2) : 0.0;

        for ($i = 0; $i < $count; $i++) {
            if ($i === $count - 1) {
                $shares[] = round($total - $allocated, 2);
            } else {
                $shares[] = $base;
                $allocated += $base;
            }
        }

        return $shares;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function resolveCartLines(Cart $cart): array
    {
        $items = CartItem::query()
            ->where('cart_id', $cart->id)
            ->with(['productVariant.product'])
            ->orderBy('id')
            ->get();

        $lines = [];

        foreach ($items as $item) {
            $variant = $item->productVariant;
            $product = $variant?->product;

            if (! $variant || ! $product || $product->status !== 'published') {
                throw new RuntimeException('A product in your cart is no longer available.');
            }

            if ($variant->stock_quantity < $item->quantity) {
                throw new RuntimeException("Insufficient stock for {$product->name}.");
            }

            $presentation = VariantPricing::presentation(
                $variant->cost !== null ? (float) $variant->cost : null,
                $variant->compare_at_price !== null ? (float) $variant->compare_at_price : null,
                $variant->list_price !== null ? (float) $variant->list_price : null,
                (float) $variant->price,
                $variant->discount_percent !== null ? (float) $variant->discount_percent : null,
                $variant->commission_percent !== null ? (float) $variant->commission_percent : null,
            );

            $unitPrice = $presentation['final_price'];
            $lineTotal = round($unitPrice * $item->quantity, 2);

            $lines[] = [
                'product_variant_id' => $variant->id,
                'product_name' => $product->name,
                'variant_label' => trim(collect([$variant->size, $variant->color])->filter()->implode(' · ')) ?: $variant->sku,
                'sku' => $variant->sku,
                'unit_price' => $unitPrice,
                'compare_at_price' => $presentation['mrp'],
                'discount_percent' => $presentation['discount_percent'],
                'quantity' => $item->quantity,
                'line_total' => $lineTotal,
            ];
        }

        return $lines;
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, string|null>
     */
    protected function normalizeAddress(array $input): array
    {
        return [
            'full_name' => trim((string) ($input['full_name'] ?? '')),
            'phone' => trim((string) ($input['phone'] ?? '')),
            'line1' => trim((string) ($input['line1'] ?? '')),
            'line2' => trim((string) ($input['line2'] ?? '')) ?: null,
            'city' => trim((string) ($input['city'] ?? '')),
            'state' => trim((string) ($input['state'] ?? '')),
            'postal_code' => trim((string) ($input['postal_code'] ?? '')),
            'country' => strtoupper(trim((string) ($input['country'] ?? 'IN'))) ?: 'IN',
        ];
    }

    /**
     * @param  array<string, string|null>  $snapshot
     */
    protected function assertAddressComplete(array $snapshot): void
    {
        foreach (['full_name', 'phone', 'line1', 'city', 'state', 'postal_code'] as $field) {
            if (empty($snapshot[$field])) {
                throw new RuntimeException('Shipping address is incomplete.');
            }
        }

        if (! StoreDelivery::isDeliverableCity((string) $snapshot['city'])) {
            throw new RuntimeException('We only deliver to Vapi and Daman.');
        }

        if (! preg_match('/^\d{6}$/', (string) $snapshot['postal_code'])) {
            throw new RuntimeException('Enter a valid 6-digit PIN code.');
        }

        $digits = preg_replace('/\D+/', '', (string) $snapshot['phone']) ?? '';
        if (! preg_match('/^[6-9]\d{9}$/', substr($digits, -10))) {
            throw new RuntimeException('Enter a valid Indian mobile number.');
        }
    }

    protected function generateOrderNumber(): string
    {
        do {
            $number = 'SUH-'.now()->format('ymd').'-'.strtoupper(Str::random(6));
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }
}
