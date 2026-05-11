import UserPanelLayout from '@/Layouts/User/UserPanelLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdateAppearanceSettingsForm from './Partials/UpdateAppearanceSettingsForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const TAB_IDS = ['profile', 'appearance', 'password', 'delete'] as const;
type TabId = (typeof TAB_IDS)[number];

function tabFromHash(): TabId {
    if (typeof window === 'undefined') {
        return 'profile';
    }
    const raw = window.location.hash.replace(/^#/, '');
    if (TAB_IDS.includes(raw as TabId)) {
        return raw as TabId;
    }

    return 'profile';
}

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const [tab, setTab] = useState<TabId>(() => tabFromHash());

    useEffect(() => {
        const syncFromHash = (): void => {
            setTab(tabFromHash());
        };
        syncFromHash();
        window.addEventListener('hashchange', syncFromHash);

        return () => window.removeEventListener('hashchange', syncFromHash);
    }, []);

    const selectTab = useCallback((id: TabId) => {
        setTab(id);
        const url = `${window.location.pathname}${window.location.search}#${id}`;
        window.history.replaceState(null, '', url);
    }, []);

    const tabs: { id: TabId; label: string }[] = [
        { id: 'profile', label: 'Profile' },
        { id: 'appearance', label: 'Appearance' },
        { id: 'password', label: 'Password' },
        { id: 'delete', label: 'Delete account' },
    ];

    const tabBtnClass = (active: boolean) =>
        `shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
            active
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-100'
        }`;

    return (
        <UserPanelLayout title="Profile & security">
            <Head title="Profile" />

            <div className="mx-auto max-w-3xl">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div
                        className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/90 dark:border-slate-700 dark:bg-slate-800/40"
                        role="tablist"
                        aria-label="Profile sections"
                    >
                        {tabs.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                id={`tab-${item.id}`}
                                aria-selected={tab === item.id}
                                aria-controls={`panel-${item.id}`}
                                tabIndex={tab === item.id ? 0 : -1}
                                className={tabBtnClass(tab === item.id)}
                                onClick={() => selectTab(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        <div
                            id="panel-profile"
                            role="tabpanel"
                            aria-labelledby="tab-profile"
                            hidden={tab !== 'profile'}
                        >
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>

                        <div
                            id="panel-appearance"
                            role="tabpanel"
                            aria-labelledby="tab-appearance"
                            hidden={tab !== 'appearance'}
                        >
                            <UpdateAppearanceSettingsForm className="max-w-xl" />
                        </div>

                        <div
                            id="panel-password"
                            role="tabpanel"
                            aria-labelledby="tab-password"
                            hidden={tab !== 'password'}
                        >
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>

                        <div
                            id="panel-delete"
                            role="tabpanel"
                            aria-labelledby="tab-delete"
                            hidden={tab !== 'delete'}
                        >
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </UserPanelLayout>
    );
}
