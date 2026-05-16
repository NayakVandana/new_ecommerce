import {
    type UserApiEnvelope,
    userApiPost,
} from '@/api/userClient';
import type { User } from '@/types';
import {
    applyAppearancePreference,
    readStoredAppearance,
    type AppearancePreference,
} from '@/utils/appearance';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const OPTIONS: { value: AppearancePreference; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
];

export default function AdminThemeToggle() {
    const user = usePage().props.auth?.user;
    const [value, setValue] = useState<AppearancePreference>(() =>
        readStoredAppearance(),
    );
    const [busy, setBusy] = useState(false);

    const select = async (next: AppearancePreference) => {
        if (busy || next === value) {
            return;
        }

        const previous = value;
        setBusy(true);
        setValue(next);
        applyAppearancePreference(next);

        if (!user) {
            setBusy(false);

            return;
        }

        try {
            const res = await userApiPost<UserApiEnvelope<User>>(
                '/profile/appearance',
                { theme_preference: next },
            );

            if (res.success) {
                router.reload({ only: ['auth', 'appearance'] });
            } else {
                applyAppearancePreference(previous);
                setValue(previous);
            }
        } catch {
            applyAppearancePreference(previous);
            setValue(previous);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800"
            role="group"
            aria-label="Theme"
        >
            {OPTIONS.map((opt) => {
                const active = value === opt.value;

                return (
                    <button
                        key={opt.value}
                        type="button"
                        disabled={busy}
                        onClick={() => void select(opt.value)}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                            active
                                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        } disabled:opacity-50`}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
