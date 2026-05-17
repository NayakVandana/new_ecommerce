import {
    isUserApiUnauthorized,
    type UserApiEnvelope,
    userApiPost,
} from '@/api/userClient';
import type { CatalogProduct } from '@/store/catalogTypes';
import { redirectToLogin } from '@/utils/requireAuth';

export type RecentlyViewedItem = CatalogProduct & {
    product_id: number;
    viewed_at?: string | null;
};

export type RecentlyViewedPayload = {
    items: RecentlyViewedItem[];
    count: number;
};

async function recentlyViewedPost<T>(
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

export const recentlyViewedStore = {
    async record(productId: number): Promise<UserApiEnvelope<null>> {
        return recentlyViewedPost<UserApiEnvelope<null>>('/recently-viewed/recently-viewed-record', {
            product_id: productId,
        });
    },

    async list(limit = 12): Promise<UserApiEnvelope<RecentlyViewedPayload>> {
        return recentlyViewedPost<UserApiEnvelope<RecentlyViewedPayload>>(
            '/recently-viewed/recently-viewed-list',
            { limit },
        );
    },

    async clear(): Promise<UserApiEnvelope<RecentlyViewedPayload>> {
        return recentlyViewedPost<UserApiEnvelope<RecentlyViewedPayload>>(
            '/recently-viewed/recently-viewed-clear',
            {},
        );
    },
};
