import { cartStore, type CartPayload } from '@/api/cartClient';
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

export type CheckoutResult = {
    id: number;
    order_number: string;
    grand_total: number;
    currency: string;
    status: string;
    payment_method: string;
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
        return orderPost<UserApiEnvelope<CheckoutOptions>>('/checkout/options', {});
    },

    async placeOrder(payload: {
        payment_method: 'cod';
        shipping_address: ShippingAddressInput;
        customer_note?: string;
        save_address?: boolean;
    }): Promise<UserApiEnvelope<CheckoutResult>> {
        const res = await orderPost<UserApiEnvelope<CheckoutResult>>('/checkout/place', {
            ...payload,
        });
        if (res.success) {
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
): { shipping: number; tax: number; grandTotal: number } {
    const shipping = options.shipping_flat;
    const tax = Math.round(subtotal * options.tax_rate * 100) / 100;
    const grandTotal = Math.round((subtotal + shipping + tax) * 100) / 100;

    return { shipping, tax, grandTotal };
}
