import axios from 'axios';

export type UserApiEnvelope<T> = {
    success: boolean;
    message: string;
    data: T;
};

export async function userApiPost<T>(
    path: string,
    data: Record<string, unknown> = {},
): Promise<T> {
    await axios.get('/sanctum/csrf-cookie');
    const res = await axios.post<T>(`/api/v1/user${path}`, data);

    return res.data;
}
