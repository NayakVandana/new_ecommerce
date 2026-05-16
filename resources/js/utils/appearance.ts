export type AppearancePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'appearance';

function parseAppearance(raw: unknown): AppearancePreference | null {
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
        return raw;
    }

    return null;
}

export function isDarkMode(pref: AppearancePreference): boolean {
    if (pref === 'dark') {
        return true;
    }
    if (pref === 'light') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveInitialAppearance(): AppearancePreference {
    const fromServer = parseAppearance(window.__INITIAL_APPEARANCE__);

    if (fromServer) {
        return fromServer;
    }

    return readStoredAppearance();
}

/** Prefer explicit user/theme prop, then server boot, then localStorage. */
export function resolveAppearancePreference(
    preferred?: string | null,
): AppearancePreference {
    const fromPreferred = parseAppearance(preferred);
    if (fromPreferred) {
        return fromPreferred;
    }

    return resolveInitialAppearance();
}

export function readStoredAppearance(): AppearancePreference {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        return parseAppearance(stored) ?? 'system';
    } catch {
        return 'system';
    }
}

export function applyAppearancePreference(pref: AppearancePreference): void {
    try {
        localStorage.setItem(STORAGE_KEY, pref);
    } catch {
        //
    }

    document.documentElement.classList.toggle('dark', isDarkMode(pref));
}

/** Re-apply when OS theme changes while preference is System. */
export function subscribeSystemThemeChange(): () => void {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (): void => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored && stored !== 'system') {
                return;
            }
        } catch {
            return;
        }

        applyAppearancePreference('system');
    };

    mq.addEventListener('change', onChange);

    return () => mq.removeEventListener('change', onChange);
}
