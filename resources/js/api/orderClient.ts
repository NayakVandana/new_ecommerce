import { cartStore, type CartPayload } from '@/api/cartClient';
import { clearPersistedCheckoutCoupon } from '@/store/persistedCoupon';
import {
    isUserApiUnauthorized,
    type UserApiEnvelope,
    userApiPost,
} from '@/api/userClient';
import { redirectToLogin } from '@/utils/requireAuth';

export type DeliveryCityOption = {
    name: string;
    state: string;
};

export type CheckoutOptions = {
    payment_methods: { id: string; label: string }[];
    default_payment_method: string;
    delivery_cities: DeliveryCityOption[];
    shipping_flat: number;
    tax_rate: number;
    currency: string;
};

export type ShippingAddressInput = {
    full_name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code?: string;
    country?: string;
};

export type PlacedOrderSummary = {
    id: number;
    order_number: string;
    grand_total: number;
    currency: string;
    status: string;
};

export type CheckoutResult = PlacedOrderSummary & {
    payment_method: string;
    orders_count: number;
    orders: PlacedOrderSummary[];
};

export type AppliedCoupon = {
    code: string;
    type: string;
    coupon_discount: number;
    subtotal: number;
    taxable_subtotal: number;
    shipping_flat: number;
    tax: number;
    grand_total: number;
    currency: string;
};

async function orderPost<T>(path: string, data: Record<string, unknown> = {}): Promise<T> {
    try {
        return await userApiPost<T>(path, data);
    } catch (error) {
        if (isUserApiUnauthorized(error)) {
            redirectToLogin(route('guest.checkout'));
        }

        throw error;
    }
}

export const orderStore = {
    async checkoutOptions(): Promise<UserApiEnvelope<CheckoutOptions>> {
        return orderPost<UserApiEnvelope<CheckoutOptions>>('/checkout/checkout-options', {});
    },

    async applyCoupon(code: string): Promise<UserApiEnvelope<AppliedCoupon>> {
        return orderPost<UserApiEnvelope<AppliedCoupon>>('/checkout/coupon-apply', { code });
    },

    async placeOrder(payload: {
        payment_method: 'cod';
        shipping_address: ShippingAddressInput;
        customer_note?: string;
        save_address?: boolean;
        coupon_code?: string;
    }): Promise<UserApiEnvelope<CheckoutResult>> {
        const res = await orderPost<UserApiEnvelope<CheckoutResult>>('/checkout/checkout-place', {
            ...payload,
        });
        if (res.success) {
            clearPersistedCheckoutCoupon();
            window.dispatchEvent(new Event('cartUpdated'));
        }

        return res;
    },

    async loadCart(): Promise<CartPayload | null> {
        const res = await cartStore.list();
        if (res.success && res.data) {
            return res.data;
        }

        return null;
    },
};

export function estimateCheckoutTotals(
    subtotal: number,
    options: Pick<CheckoutOptions, 'shipping_flat' | 'tax_rate'>,
    couponDiscount = 0,
): {
    shipping: number;
    tax: number;
    grandTotal: number;
    couponDiscount: number;
    taxableSubtotal: number;
} {
    const discount = Math.min(Math.max(0, couponDiscount), subtotal);
    const taxableSubtotal = Math.round((subtotal - discount) * 100) / 100;
    const shipping = options.shipping_flat;
    const tax = Math.round(taxableSubtotal * options.tax_rate * 100) / 100;
    const grandTotal = Math.round((taxableSubtotal + shipping + tax) * 100) / 100;

    return { shipping, tax, grandTotal, couponDiscount: discount, taxableSubtotal };
}
