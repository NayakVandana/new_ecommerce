import { getUserApiToken } from '@/auth/authToken';
import axios, { isAxiosError } from 'axios';

export type UserApiEnvelope<T> = {
    success: boolean;
    message: string;
    data: T;
};

function userHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    const token = getUserApiToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

/**
 * User API — Bearer token only (no session / CSRF).
 */
export async function userApiPost<T>(
    path: string,
    data: Record<string, unknown> = {},
): Promise<T> {
    const res = await axios.post<T>(`/api/v1/user${path}`, data, {
        headers: userHeaders(),
    });

    return res.data;
}

export function isUserApiUnauthorized(error: unknown): boolean {
    return isAxiosError(error) && error.response?.status === 401;
}
