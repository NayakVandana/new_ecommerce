import { getAdminApiToken } from '@/auth/authToken';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Redirects to admin login when no Bearer token is stored (no web session).
 */
export default function AdminRequireToken() {
    useEffect(() => {
        if (!getAdminApiToken()) {
            router.visit(route('admin.login'));
        }
    }, []);

    if (!getAdminApiToken()) {
        return null;
    }

    return null;
}
