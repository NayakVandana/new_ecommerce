import axios from 'axios';

export const ADMIN_API_TOKEN_KEY = 'admin_api_token';

/**
 * Sanctum `statefulApi()` runs CSRF on /api for first-party hosts. Keep the
 * XSRF-TOKEN cookie aligned with the session (e.g. after `session()->regenerate()`
 * in admin session bootstrap).
 */
async function refreshSanctumCsrfCookie(): Promise<void> {
    await axios.get('/sanctum/csrf-cookie');
}

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

export function setAdminApiToken(token: string | null): void {
    if (token === null || token === '') {
        sessionStorage.removeItem(ADMIN_API_TOKEN_KEY);

        return;
    }
    sessionStorage.setItem(ADMIN_API_TOKEN_KEY, token);
}

export function getAdminApiToken(): string | null {
    return sessionStorage.getItem(ADMIN_API_TOKEN_KEY);
}

/**
 * Authenticated admin API calls — uses Bearer token (no session on /api routes).
 */
export async function adminApiPost<T>(
    path: string,
    data: Record<string, unknown> = {},
): Promise<T> {
    await refreshSanctumCsrfCookie();

    const token = getAdminApiToken();
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await axios.post<T>(`/api/v1/admin${path}`, data, { headers });

    return res.data;
}

/**
 * Multipart admin API (e.g. media upload). Do not set Content-Type manually.
 */
export async function adminApiPostMultipart<T>(
    path: string,
    formData: FormData,
): Promise<T> {
    await refreshSanctumCsrfCookie();

    const token = getAdminApiToken();
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await axios.post<T>(`/api/v1/admin${path}`, formData, {
        headers,
    });

    return res.data;
}
