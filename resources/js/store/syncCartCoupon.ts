import type { AppliedCoupon } from '@/api/orderClient';
import { orderStore } from '@/api/orderClient';
import type { CartPayload } from '@/api/cartClient';
import {
    clearPersistedCheckoutCoupon,
    getPersistedCheckoutCouponCode,
    persistCheckoutCoupon,
} from '@/store/persistedCoupon';

/** Re-apply a saved coupon against the current cart (e.g. after qty change or line removed). */
export async function refreshCouponForCart(
    cart: CartPayload,
    options?: { code?: string | null; current?: AppliedCoupon | null },
): Promise<AppliedCoupon | null> {
    const code = options?.code ?? options?.current?.code ?? getPersistedCheckoutCouponCode(cart);

    if (!code) {
        return null;
    }

    if (
        options?.current &&
        options.current.code === code &&
        Math.abs(options.current.subtotal - cart.subtotal) < 0.01
    ) {
        return options.current;
    }

    const res = await orderStore.applyCoupon(code);

    if (res.success && res.data) {
        persistCheckoutCoupon(res.data.code);

        return res.data;
    }

    clearPersistedCheckoutCoupon();

    return null;
}
