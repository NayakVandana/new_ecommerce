export const PROFILE_SECTION_IDS = ['profile', 'appearance', 'password'] as const;

export type ProfileSectionId = (typeof PROFILE_SECTION_IDS)[number];

export const PROFILE_SECTIONS: {
    id: ProfileSectionId;
    label: string;
    title: string;
}[] = [
    { id: 'profile', label: 'Profile information', title: 'Profile information' },
    { id: 'appearance', label: 'Appearance settings', title: 'Appearance settings' },
    { id: 'password', label: 'Update password', title: 'Update password' },
];

export function profileSectionFromHash(): ProfileSectionId {
    if (typeof window === 'undefined') {
        return 'profile';
    }

    const raw = window.location.hash.replace(/^#/, '');

    if (PROFILE_SECTION_IDS.includes(raw as ProfileSectionId)) {
        return raw as ProfileSectionId;
    }

    return 'profile';
}

export function profileSectionUrl(section: ProfileSectionId = 'profile'): string {
    return `${route('profile.edit')}#${section}`;
}

export function setProfileSection(section: ProfileSectionId): void {
    const url = `${window.location.pathname}${window.location.search}#${section}`;
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function isProfileSectionActive(section: ProfileSectionId): boolean {
    return route().current('profile.edit') && profileSectionFromHash() === section;
}
