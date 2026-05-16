import {
    getAdminApiToken,
    setAdminApiToken,
} from '@/auth/authToken';
import axios from 'axios';

export { getAdminApiToken, setAdminApiToken };

export type AdminApiEnvelope<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type LaravelPaginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

function adminHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    const token = getAdminApiToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Admin API — Bearer token only (no session / CSRF).
 */
export async function adminApiPost<T>(
    path: string,
    data: Record<string, unknown> = {},
): Promise<T> {
    const res = await axios.post<T>(`/api/v1/admin${path}`, data, {
        headers: adminHeaders(),
    });

    return res.data;
}

export async function adminApiPostMultipart<T>(
    path: string,
    formData: FormData,
): Promise<T> {
    const res = await axios.post<T>(`/api/v1/admin${path}`, formData, {
        headers: adminHeaders(),
    });

    return res.data;
}
