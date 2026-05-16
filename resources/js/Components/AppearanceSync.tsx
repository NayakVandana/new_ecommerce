import { useAuthUser } from '@/auth/useAuthUser';
import {
    applyAppearancePreference,
    resolveAppearancePreference,
    readStoredAppearance,
} from '@/utils/appearance';
import { useEffect } from 'react';

/**
 * Keeps the document theme in sync (token user profile or local storage).
 */
export default function AppearanceSync() {
    const { user } = useAuthUser();

    useEffect(() => {
        const pref = resolveAppearancePreference(
            user?.theme_preference ?? readStoredAppearance(),
        );
        applyAppearancePreference(pref);
    }, [user, user?.theme_preference]);

    return null;
}
