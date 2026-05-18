/** Label for order-level promo (coupon) savings in summaries. */
export function couponDiscountLabel(code?: string | null): string {
    const normalized = code?.trim().toUpperCase();

    return normalized ? `Coupon (${normalized})` : 'Coupon discount';
}
