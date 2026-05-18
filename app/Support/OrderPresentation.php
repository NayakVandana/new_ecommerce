<?php

namespace App\Support;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;

class OrderPresentation
{
    /**
     * @return array{
     *     items: array<int, array<string, mixed>>,
     *     mrp_subtotal: float,
     *     product_discount_total: float,
     *     item_count: int
     * }
     */
    public static function summarize(Order $order): array
    {
        $order->loadMissing([
            'items' => fn ($q) => $q->orderBy('id'),
            'items.productVariant',
        ]);

        $items = [];
        $mrpSubtotal = 0.0;
        $productDiscountTotal = 0.0;
        $itemCount = 0;

        foreach ($order->items as $item) {
            $formatted = self::formatItem($item);
            $items[] = $formatted;
            $mrpSubtotal += $formatted['line_mrp_total'];
            $productDiscountTotal += $formatted['line_discount'];
            $itemCount += $item->quantity;
        }

        return [
            'items' => $items,
            'mrp_subtotal' => round($mrpSubtotal, 2),
            'product_discount_total' => round($productDiscountTotal, 2),
            'item_count' => $itemCount,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function formatForUser(Order $order): array
    {
        $order->loadMissing([
            'statusHistories' => fn ($q) => $q->orderBy('created_at'),
            'payments' => fn ($q) => $q->orderBy('id'),
        ]);

        $summary = self::summarize($order);
        $payload = $order->toArray();
        $payload = array_merge($payload, $summary);
        $payload['placed_at'] = $order->placed_at?->toIso8601String();
        $payload['created_at'] = $order->created_at?->toIso8601String();

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    public static function formatForAdmin(Order $order): array
    {
        $order->loadMissing([
            'user:id,name,email,phone',
            'statusHistories' => fn ($q) => $q->orderByDesc('created_at'),
            'statusHistories.creator:id,name',
            'payments' => fn ($q) => $q->orderBy('id'),
        ]);

        $summary = self::summarize($order);
        $payload = $order->toArray();
        $payload = array_merge($payload, $summary);
        $payload['placed_at'] = $order->placed_at?->toIso8601String();
        $payload['created_at'] = $order->created_at?->toIso8601String();

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    public static function formatItem(OrderItem $item): array
    {
        $unitPrice = (float) $item->unit_price;
        $quantity = (int) $item->quantity;
        $lineTotal = (float) $item->line_total;

        $compareAt = $item->compare_at_price !== null
            ? (float) $item->compare_at_price
            : self::compareAtFromVariant($item->productVariant, $unitPrice);

        $discountPercent = $item->discount_percent !== null
            ? (float) $item->discount_percent
            : ($compareAt !== null && $compareAt > $unitPrice + 0.009
                ? VariantPricing::discountPercentFromPrices($compareAt, $unitPrice)
                : 0.0);

        $unitMrp = $compareAt ?? $unitPrice;
        $lineMrpTotal = round($unitMrp * $quantity, 2);
        $lineDiscount = round(max(0, $lineMrpTotal - $lineTotal), 2);

        return [
            'id' => $item->id,
            'product_name' => $item->product_name,
            'variant_label' => $item->variant_label,
            'sku' => $item->sku,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'compare_at_price' => $compareAt,
            'discount_percent' => $discountPercent,
            'line_total' => $lineTotal,
            'line_mrp_total' => $lineMrpTotal,
            'line_discount' => $lineDiscount,
        ];
    }

    protected static function compareAtFromVariant(?ProductVariant $variant, float $unitPrice): ?float
    {
        if (! $variant) {
            return null;
        }

        $presentation = VariantPricing::presentation(
            $variant->cost !== null ? (float) $variant->cost : null,
            $variant->compare_at_price !== null ? (float) $variant->compare_at_price : null,
            $variant->list_price !== null ? (float) $variant->list_price : null,
            (float) $variant->price,
            $variant->discount_percent !== null ? (float) $variant->discount_percent : null,
            $variant->commission_percent !== null ? (float) $variant->commission_percent : null,
        );

        $mrp = $presentation['mrp'];

        return $mrp !== null && $mrp > $unitPrice + 0.009 ? $mrp : null;
    }
}
