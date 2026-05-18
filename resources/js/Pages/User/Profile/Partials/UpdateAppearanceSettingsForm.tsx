import {
    type UserApiEnvelope,
    userApiPost,
} from '@/api/userClient';
import type { AppearancePreference } from '@/utils/appearance';
import { applyAppearancePreference } from '@/utils/appearance';
import { Transition } from '@headlessui/react';
import { clearAuthUserCache, useAuthUser } from '@/auth/useAuthUser';
import type { User } from '@/types';
import { useEffect, useState } from 'react';

const OPTIONS: {
    value: AppearancePreference;
    label: string;
    description: string;
}[] = [
    {
        value: 'light',
        label: 'Light',
        description: 'Light background across the site.',
    },
    {
        value: 'dark',
        label: 'Dark',
        description: 'Dark background, easier on the eyes at night.',
    },
    {
        value: 'system',
        label: 'System',
        description: 'Matches your device light or dark mode.',
    },
];

export default function UpdateAppearanceSettingsForm({
    className = '',
}: {
    className?: string;
}) {
    const { user, refresh } = useAuthUser();

    const [preference, setPreference] = useState<AppearancePreference>(
        user?.theme_preference ?? 'system',
    );
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    useEffect(() => {
        if (
            user?.theme_preference === 'light' ||
            user?.theme_preference === 'dark' ||
            user?.theme_preference === 'system'
        ) {
            setPreference(user.theme_preference);
        }
    }, [user?.theme_preference]);

    const select = async (value: AppearancePreference) => {
        if (processing || value === preference) {
            return;
        }

        const previous = preference;

        setProcessing(true);
        setError(null);
        applyAppearancePreference(value);
        setPreference(value);

        try {
            const res = await userApiPost<UserApiEnvelope<User>>(
                '/profile/profile-appearance',
                { theme_preference: value },
            );

            if (res.success) {
                setRecentlySuccessful(true);
                clearAuthUserCache();
                await refresh();
                window.setTimeout(() => setRecentlySuccessful(false), 2000);
            } else {
                applyAppearancePreference(previous);
                setPreference(previous);
                setError(res.message || 'Could not save appearance.');
            }
        } catch {
            applyAppearancePreference(previous);
            setPreference(previous);
            setError('Could not save appearance.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100">
                    Appearance
                </h2>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    Choose light, dark, or match your device.
                </p>
            </header>

            <div className="mt-6 space-y-3">
                {OPTIONS.map((opt) => {
                    const selected = preference === opt.value;

                    return (
                        <button
                            key={opt.value}
                            type="button"
                            disabled={processing}
                            onClick={() => void select(opt.value)}
                            className={`flex w-full min-h-11 items-start gap-3 border px-4 py-3 text-left transition ${
                                selected
                                    ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900 dark:border-stone-100 dark:bg-stone-900/80 dark:ring-stone-100'
                                    : 'border-stone-200 bg-white hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-500'
                            } disabled:opacity-60`}
                        >
                            <span
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                    selected
                                        ? 'border-stone-900 bg-stone-900 dark:border-stone-100 dark:bg-stone-100'
                                        : 'border-stone-300 dark:border-stone-600'
                                }`}
                            >
                                {selected ? (
                                    <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-stone-900" />
                                ) : null}
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                                    {opt.label}
                                </span>
                                <span className="mt-0.5 block text-xs text-stone-600 dark:text-stone-400">
                                    {opt.description}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            {error ? (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            ) : null}

            <div className="mt-4 flex items-center gap-4">
                <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Saved.
                    </p>
                </Transition>
            </div>
        </section>
    );
}
