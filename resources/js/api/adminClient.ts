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

/**
 * Download a binary file (e.g. PDF invoice) from the admin API.
 */
export async function adminApiDownload(
    path: string,
    data: Record<string, unknown>,
    filename: string,
): Promise<void> {
    const res = await axios.post<Blob>(`/api/v1/admin${path}`, data, {
        headers: {
            ...adminHeaders(),
            Accept: 'application/pdf',
        },
        responseType: 'blob',
    });

    const contentType = String(res.headers['content-type'] ?? '');

    if (contentType.includes('application/json')) {
        const text = await res.data.text();
        let message = 'Download failed.';
        try {
            const json = JSON.parse(text) as { message?: string };
            if (json.message) {
                message = json.message;
            }
        } catch {
            /* ignore */
        }
        throw new Error(message);
    }

    const blob = new Blob([res.data], {
        type: contentType || 'application/pdf',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

export async function adminApiDownloadOrderInvoice(
    orderId: number,
    orderNumber: string,
): Promise<void> {
    const safeNumber = orderNumber.replace(/[^\w.-]+/g, '_');

    await adminApiDownload(
        '/orders/order-invoice-download',
        { id: orderId },
        `invoice-${safeNumber}.pdf`,
    );
}
