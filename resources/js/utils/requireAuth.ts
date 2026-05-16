import { getUserApiToken } from '@/auth/authToken';
import { router } from '@inertiajs/react';

const DEFAULT_FALLBACK = '/dashboard';

/**
 * Normalize a return URL to a same-origin path (pathname + search).
 * Accepts `/cart`, or full URLs from Ziggy `route()`.
 */
export function normalizeReturnPath(value: string | null | undefined): string | null {
    if (value == null) {
        return null;
    }

    let path = value.trim();
    if (path === '') {
        return null;
    }

    if (/^https?:\/\//i.test(path)) {
        try {
            const url = new URL(path);
            if (
                typeof window !== 'undefined' &&
                url.origin !== window.location.origin
            ) {
                return null;
            }
            path = url.pathname + url.search;
        } catch {
            return null;
        }
    }

    if (!path.startsWith('/') || path.startsWith('//')) {
        return null;
    }

    return path;
}

/**
 * Safe path to visit after login/register (blocks open redirects).
 */
export function getPostAuthRedirect(
    redirect: string | null | undefined,
    fallback = DEFAULT_FALLBACK,
): string {
    return (
        normalizeReturnPath(redirect) ??
        normalizeReturnPath(fallback) ??
        DEFAULT_FALLBACK
    );
}

function resolveReturnTo(returnTo?: string): string {
    if (returnTo !== undefined) {
        return normalizeReturnPath(returnTo) ?? DEFAULT_FALLBACK;
    }

    if (typeof window !== 'undefined') {
        return window.location.pathname + window.location.search;
    }

    return DEFAULT_FALLBACK;
}

/**
 * Redirect guests to login when no Bearer token is stored.
 */
export function redirectToLogin(returnTo?: string): void {
    if (getUserApiToken()) {
        return;
    }

    const path = resolveReturnTo(returnTo);
    router.visit(`${route('login')}?redirect=${encodeURIComponent(path)}`);
}

export function loginUrl(returnTo?: string): string {
    const path = resolveReturnTo(returnTo);

    return `${route('login')}?redirect=${encodeURIComponent(path)}`;
}

export function registerUrl(returnTo?: string): string {
    const path = resolveReturnTo(returnTo);

    return `${route('register')}?redirect=${encodeURIComponent(path)}`;
}
