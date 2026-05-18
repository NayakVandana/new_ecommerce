import type { CartPayload } from '@/api/cartClient';

const COUPON_CODE_KEY = 'checkout_coupon';

/** Used to re-validate coupon when lines or subtotal change. */
export function cartCouponTotalsKey(cart: CartPayload): string {
    const lines = cart.items
        .map((item) => `${item.product_variant_id}x${item.quantity}`)
        .sort()
        .join('|');

    return `${cart.subtotal}|${lines}`;
}

export function persistCheckoutCoupon(code: string): void {
    sessionStorage.setItem(COUPON_CODE_KEY, code.trim().toUpperCase());
}

export function clearPersistedCheckoutCoupon(): void {
    sessionStorage.removeItem(COUPON_CODE_KEY);
}

/** Saved code while the bag has items; cleared when the bag is empty. */
export function getPersistedCheckoutCouponCode(
    cart: CartPayload | null | undefined,
): string | null {
    if (!cart || cart.items.length === 0) {
        clearPersistedCheckoutCoupon();

        return null;
    }

    const code = sessionStorage.getItem(COUPON_CODE_KEY);

    return code?.trim() ? code : null;
}
