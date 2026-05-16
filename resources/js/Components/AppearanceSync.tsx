import {
    applyAppearancePreference,
    resolveAppearancePreference,
} from '@/utils/appearance';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

import type { PageProps } from '@/types';

/**
 * Keeps the document theme in sync when auth props change (e.g. after login / profile update).
 */
export default function AppearanceSync() {
    const { auth, appearance } = usePage<PageProps<{ appearance?: string | null }>>()
        .props;
    const user = auth?.user;

    useEffect(() => {
        const pref = resolveAppearancePreference(
            user?.theme_preference ?? appearance,
        );
        applyAppearancePreference(pref);
    }, [user, user?.theme_preference, appearance]);

    return null;
}
