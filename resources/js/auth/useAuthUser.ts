import { userApiPost, type UserApiEnvelope } from '@/api/userClient';
import { getUserApiToken, setUserApiToken } from '@/auth/authToken';
import type { User } from '@/types';
import { useCallback, useEffect, useState } from 'react';

let cachedUser: User | null = null;
let inflight: Promise<User | null> | null = null;

export function clearAuthUserCache(): void {
    cachedUser = null;
    inflight = null;
}

async function fetchProfile(): Promise<User | null> {
    const token = getUserApiToken();
    if (!token) {
        cachedUser = null;

        return null;
    }

    try {
        const res = await userApiPost<UserApiEnvelope<User>>('/profile/profile-show', {});

        if (res.success && res.data) {
            cachedUser = res.data as User;

            return cachedUser;
        }
    } catch {
        setUserApiToken(null);
        cachedUser = null;
    }

    return null;
}

export function useAuthUser() {
    const [user, setUser] = useState<User | null>(cachedUser);
    const [loading, setLoading] = useState(
        () => Boolean(getUserApiToken()) && !cachedUser,
    );

    const refresh = useCallback(async () => {
        if (!getUserApiToken()) {
            cachedUser = null;
            setUser(null);
            setLoading(false);

            return null;
        }

        setLoading(true);
        inflight = fetchProfile();
        const next = await inflight;
        inflight = null;
        setUser(next);
        setLoading(false);

        return next;
    }, []);

    useEffect(() => {
        if (!getUserApiToken()) {
            cachedUser = null;
            setUser(null);
            setLoading(false);

            return;
        }

        if (cachedUser) {
            setUser(cachedUser);
            setLoading(false);

            return;
        }

        void refresh();
    }, [refresh]);

    const logout = useCallback(async () => {
        try {
            if (getUserApiToken()) {
                await userApiPost('/auth/user-logout', {});
            }
        } catch {
            // ignore
        } finally {
            setUserApiToken(null);
            clearAuthUserCache();
            setUser(null);
        }
    }, []);

    return {
        user,
        loading,
        isLoggedIn: Boolean(user),
        refresh,
        logout,
    };
}
