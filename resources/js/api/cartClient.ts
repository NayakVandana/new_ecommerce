import {
    isUserApiUnauthorized,
    type UserApiEnvelope,
    userApiPost,
} from '@/api/userClient';
import { redirectToLogin } from '@/utils/requireAuth';

export type CartApiEnvelope<T> = UserApiEnvelope<T>;

export type CartPayload = {
    items: CartLineItem[];
    subtotal: number;
    mrp_subtotal: number;
    discount_total: number;
    count: number;
    currency: string;
};

export type CartLineItem = {
    id: number;
    quantity: number;
    unit_price: number;
    compare_at_price: number | null;
    list_price: number;
    discount_percent: number;
    line_total: number;
    line_mrp_total: number;
    line_discount: number;
    product_variant_id: number;
    product_id: number;
    product_name: string;
    variant_label: string;
    sku: string;
    image_path: string | null;
    stock_quantity: number;
};

async function cartPost<T>(
    path: string,
    data: Record<string, unknown> = {},
): Promise<T> {
    try {
        return await userApiPost<T>(path, data);
    } catch (error) {
        if (isUserApiUnauthorized(error)) {
            redirectToLogin();
        }

        throw error;
    }
}

export const cartStore = {
    async list(): Promise<CartApiEnvelope<CartPayload>> {
        return cartPost<CartApiEnvelope<CartPayload>>('/cart/cart-list', {});
    },

    async add(productVariantId: number, quantity = 1): Promise<CartApiEnvelope<CartPayload>> {
        const res = await cartPost<CartApiEnvelope<CartPayload>>('/cart/cart-add', {
            product_variant_id: productVariantId,
            quantity,
        });
        if (res.success && res.data) {
            window.dispatchEvent(new Event('cartUpdated'));
        }

        return res;
    },

    async update(cartItemId: number, quantity: number): Promise<CartApiEnvelope<CartPayload>> {
        const res = await cartPost<CartApiEnvelope<CartPayload>>('/cart/cart-update', {
            cart_item_id: cartItemId,
            quantity,
        });
        if (res.success && res.data) {
            window.dispatchEvent(new Event('cartUpdated'));
        }

        return res;
    },

    async remove(cartItemId: number): Promise<CartApiEnvelope<CartPayload>> {
        const res = await cartPost<CartApiEnvelope<CartPayload>>('/cart/cart-remove', {
            cart_item_id: cartItemId,
        });
        if (res.success && res.data) {
            window.dispatchEvent(new Event('cartUpdated'));
        }

        return res;
    },

    async clear(): Promise<CartApiEnvelope<CartPayload>> {
        const res = await cartPost<CartApiEnvelope<CartPayload>>('/cart/cart-clear', {});
        if (res.success && res.data) {
            window.dispatchEvent(new Event('cartUpdated'));
        }

        return res;
    },
};

export function cartImageSrc(path: string | null | undefined): string {
    if (!path) {
        return '';
    }
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    if (path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
}
