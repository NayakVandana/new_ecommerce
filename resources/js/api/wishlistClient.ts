import {
    isUserApiUnauthorized,
    type UserApiEnvelope,
    userApiPost,
} from '@/api/userClient';
import { redirectToLogin } from '@/utils/requireAuth';

export type WishlistApiEnvelope<T> = UserApiEnvelope<T>;

export type WishlistLineItem = {
    id: number;
    product_variant_id: number;
    product_id: number;
    product_name: string;
    product_slug: string;
    variant_label: string;
    sku: string;
    unit_price: number;
    image_path: string | null;
    stock_quantity: number;
    in_stock: boolean;
};

export type WishlistPayload = {
    items: WishlistLineItem[];
    count: number;
    variant_ids: number[];
    saved?: boolean;
};

async function wishlistPost<T>(
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

function dispatchWishlistUpdated(): void {
    window.dispatchEvent(new Event('wishlistUpdated'));
}

export const wishlistStore = {
    async list(): Promise<WishlistApiEnvelope<WishlistPayload>> {
        return wishlistPost<WishlistApiEnvelope<WishlistPayload>>('/wishlist/wishlist-list', {});
    },

    async add(productVariantId: number): Promise<WishlistApiEnvelope<WishlistPayload>> {
        const res = await wishlistPost<WishlistApiEnvelope<WishlistPayload>>('/wishlist/wishlist-add', {
            product_variant_id: productVariantId,
        });
        if (res.success) {
            dispatchWishlistUpdated();
        }

        return res;
    },

    async removeByVariant(productVariantId: number): Promise<WishlistApiEnvelope<WishlistPayload>> {
        const res = await wishlistPost<WishlistApiEnvelope<WishlistPayload>>(
            '/wishlist/wishlist-remove',
            { product_variant_id: productVariantId },
        );
        if (res.success) {
            dispatchWishlistUpdated();
        }

        return res;
    },

    async remove(wishlistItemId: number): Promise<WishlistApiEnvelope<WishlistPayload>> {
        const res = await wishlistPost<WishlistApiEnvelope<WishlistPayload>>(
            '/wishlist/wishlist-remove',
            { wishlist_item_id: wishlistItemId },
        );
        if (res.success) {
            dispatchWishlistUpdated();
        }

        return res;
    },

    async toggle(productVariantId: number): Promise<WishlistApiEnvelope<WishlistPayload>> {
        const res = await wishlistPost<WishlistApiEnvelope<WishlistPayload>>(
            '/wishlist/wishlist-toggle',
            { product_variant_id: productVariantId },
        );
        if (res.success) {
            dispatchWishlistUpdated();
        }

        return res;
    },
};

export function wishlistImageSrc(path: string | null | undefined): string {
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
