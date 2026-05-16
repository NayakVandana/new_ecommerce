import UserPanelLayout from '@/Layouts/User/UserPanelLayout';
import {
    storePanel,
    storePanelBody,
    storeTabBtnActive,
    storeTabBtnInactive,
    storeTabList,
} from '@/store/storeTheme';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import UpdateAppearanceSettingsForm from './Partials/UpdateAppearanceSettingsForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

const TAB_IDS = ['profile', 'appearance', 'password'] as const;
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
    ];

    return (
        <UserPanelLayout title="Profile & security">
            <Head title="Profile" />

            <div className="mx-auto w-full max-w-3xl">
                <div className={storePanel}>
                    <div className={storeTabList} role="tablist" aria-label="Profile sections">
                        {tabs.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                id={`tab-${item.id}`}
                                aria-selected={tab === item.id}
                                aria-controls={`panel-${item.id}`}
                                tabIndex={tab === item.id ? 0 : -1}
                                className={
                                    tab === item.id ? storeTabBtnActive : storeTabBtnInactive
                                }
                                onClick={() => selectTab(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className={storePanelBody}>
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
                    </div>
                </div>
            </div>
        </UserPanelLayout>
    );
}
