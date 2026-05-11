import type { AppearancePreference } from '@/utils/appearance';
import {
    applyAppearancePreference,
    resolveInitialAppearance,
} from '@/utils/appearance';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

function isAppearancePreference(v: unknown): v is AppearancePreference {
    return v === 'light' || v === 'dark' || v === 'system';
}

/**
 * Keeps the document theme in sync when auth props change (e.g. after login / profile update).
 */
export default function AppearanceSync() {
    const user = usePage().props.auth?.user;

    useEffect(() => {
        if (user && isAppearancePreference(user.theme_preference)) {
            applyAppearancePreference(user.theme_preference);
        } else {
            applyAppearancePreference(resolveInitialAppearance());
        }
    }, [user, user?.theme_preference]);

    return null;
}
