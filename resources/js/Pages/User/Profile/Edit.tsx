import UserPanelLayout from '@/Layouts/User/UserPanelLayout';
import {
    profileSectionFromHash,
    PROFILE_SECTIONS,
    type ProfileSectionId,
} from '@/Pages/User/Profile/profileSections';
import { storePanel, storePanelBody } from '@/store/storeTheme';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import UpdateAppearanceSettingsForm from './Partials/UpdateAppearanceSettingsForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const [section, setSection] = useState<ProfileSectionId>(() => profileSectionFromHash());

    useEffect(() => {
        const sync = (): void => setSection(profileSectionFromHash());
        sync();
        window.addEventListener('hashchange', sync);

        return () => window.removeEventListener('hashchange', sync);
    }, []);

    const active = PROFILE_SECTIONS.find((s) => s.id === section) ?? PROFILE_SECTIONS[0];

    return (
        <UserPanelLayout title={active.title}>
            <Head title={active.title} />

            <div className="mx-auto w-full max-w-3xl">
                <div className={storePanel}>
                    <div className={storePanelBody}>
                        {section === 'profile' ? (
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        ) : null}

                        {section === 'appearance' ? (
                            <UpdateAppearanceSettingsForm className="max-w-xl" />
                        ) : null}

                        {section === 'password' ? (
                            <UpdatePasswordForm className="max-w-xl" />
                        ) : null}
                    </div>
                </div>
            </div>
        </UserPanelLayout>
    );
}
