import { getAdminApiToken } from '@/api/adminClient';
import axios from 'axios';

export type UserApiEnvelope<T> = {
    success: boolean;
    message: string;
    data: T;
};

/**
 * User API — session cookie (Sanctum stateful) plus optional Bearer token
 * (same personal-access token stored after admin API login).
 */
export async function userApiPost<T>(
    path: string,
    data: Record<string, unknown> = {},
): Promise<T> {
    await axios.get('/sanctum/csrf-cookie');

    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    const bearer = getAdminApiToken();
    if (bearer) {
        headers.Authorization = `Bearer ${bearer}`;
    }

    const res = await axios.post<T>(`/api/v1/user${path}`, data, { headers });

    return res.data;
}
