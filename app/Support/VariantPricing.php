<?php

namespace App\Support;

class VariantPricing
{
    public static function round(float $value): float
    {
        return round($value, 2);
    }

    public static function commissionAmount(float $finalPrice, float $commissionPercent): float
    {
        return self::round($finalPrice * max(0, $commissionPercent) / 100);
    }

    public static function totalCost(float $cost, float $commissionAmount): float
    {
        return self::round($cost + $commissionAmount);
    }

    public static function discountPercentFromPrices(float $mrp, float $finalPrice): float
    {
        if ($mrp <= 0) {
            return 0;
        }

        return self::round(max(0, min(100, (($mrp - $finalPrice) / $mrp) * 100)));
    }

    public static function finalPriceFromDiscount(float $mrp, float $discountPercent): float
    {
        $pct = max(0, min(100, $discountPercent));

        return self::round($mrp * (1 - $pct / 100));
    }

    public static function resolveListPrice(?float $listPrice, float $mrp, float $finalPrice): float
    {
        if ($listPrice !== null && $listPrice > 0) {
            return self::round($listPrice);
        }

        if ($mrp > 0) {
            return self::round($mrp);
        }

        return self::round($finalPrice);
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    public static function normalizeIncomingRow(array $row): array
    {
        $cost = (float) ($row['cost'] ?? $row['cost_price'] ?? 0);
        $mrp = (float) ($row['compare_at_price'] ?? $row['mrp'] ?? 0);
        $discount = (float) ($row['discount_percent'] ?? 0);
        $final = $mrp > 0
            ? self::finalPriceFromDiscount($mrp, $discount)
            : (float) ($row['price'] ?? $row['final_price'] ?? 0);

        if ($mrp > 0 && $final <= 0) {
            $final = $mrp;
            $discount = 0;
        }

        return [
            'cost' => self::round(max(0, $cost)),
            'compare_at_price' => $mrp > 0 ? self::round($mrp) : null,
            'list_price' => $mrp > 0 ? self::round($mrp) : null,
            'price' => self::round(max(0, $final)),
            'discount_percent' => self::round(max(0, min(100, $discount))),
            'commission_percent' => 0,
        ];
    }

    /**
     * @return array{
     *     cost: float,
     *     mrp: float|null,
     *     list_price: float,
     *     final_price: float,
     *     discount_percent: float,
     *     commission_percent: float,
     *     commission_amount: float,
     *     total: float
     * }
     */
    public static function presentation(
        ?float $cost,
        ?float $mrp,
        ?float $listPrice,
        float $finalPrice,
        ?float $discountPercent,
        ?float $commissionPercent,
    ): array {
        $costVal = self::round((float) ($cost ?? 0));
        $mrpVal = $mrp !== null && $mrp > 0 ? self::round($mrp) : null;
        $final = self::round($finalPrice);
        $list = self::resolveListPrice($listPrice, $mrpVal ?? 0, $final);
        if ($discountPercent !== null) {
            $discount = self::round(max(0, min(100, $discountPercent)));
        } elseif ($mrpVal) {
            $discount = self::discountPercentFromPrices($mrpVal, $final);
        } else {
            $discount = 0;
        }

        $commissionPct = self::round(max(0, min(100, (float) ($commissionPercent ?? 0))));
        $commissionAmount = self::commissionAmount($final, $commissionPct);

        return [
            'cost' => $costVal,
            'mrp' => $mrpVal,
            'list_price' => $list,
            'final_price' => $final,
            'discount_percent' => $discount,
            'commission_percent' => $commissionPct,
            'commission_amount' => $commissionAmount,
            'total' => self::totalCost($costVal, $commissionAmount),
        ];
    }
}
