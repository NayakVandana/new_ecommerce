import CartBadge from '@/Components/CartBadge';
import AccountHeaderButton from '@/Components/store/AccountHeaderButton';
import FashionLogo from '@/Components/store/FashionLogo';
import StoreFixedHeader from '@/Components/store/StoreFixedHeader';
import AppearanceSync from '@/Components/AppearanceSync';
import { catalogUrl } from '@/store/fashionBrand';
import {
    storeBtnGhost,
    storeMobileNavLink,
    storeUserMain,
    storeUserMobileHeader,
    storeUserMobileHeaderRow,
    storeUserMobileMenu,
    storeUserMobileTabActive,
    storeUserMobileTabInactive,
    storeUserMobileTabs,
    storeUserNavActive,
    storeUserNavInactive,
    storeUserPageTitle,
    storeUserShell,
    storeUserSidebar,
    storeUserTopBar,
    storeUserTopBarInner,
} from '@/store/storeTheme';
import {
    isProfileSectionActive,
    PROFILE_SECTIONS,
    profileSectionUrl,
} from '@/Pages/User/Profile/profileSections';
import { useAuthUser } from '@/auth/useAuthUser';
import { redirectToLogin } from '@/utils/requireAuth';
import { Link, router } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';

const mainSidebarLinks: { label: string; href: string; routeMatch: string | string[] }[] = [
    { label: 'Overview', href: route('dashboard'), routeMatch: 'dashboard' },
    { label: 'My orders', href: route('user.orders.index'), routeMatch: ['user.orders.index', 'user.orders.show'] },
];

function isActive(routeMatch: string | string[]): boolean {
    const names = Array.isArray(routeMatch) ? routeMatch : [routeMatch];

    return names.some((name) => route().current(name) === true);
}

export default function UserPanelLayout({
    children,
    title,
}: PropsWithChildren<{ title?: string }>) {
    const { user, loading, logout } = useAuthUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const [, setHashTick] = useState(0);

    useEffect(() => {
        const onHashChange = (): void => setHashTick((n) => n + 1);
        window.addEventListener('hashchange', onHashChange);

        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            redirectToLogin();
        }
    }, [loading, user]);

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    if (loading || !user) {
        return null;
    }

    const navClass = (active: boolean) =>
        active ? storeUserNavActive : storeUserNavInactive;

    const desktopSidebar = (
        <>
            <div className="border-b border-stone-100 px-5 py-6 dark:border-stone-800">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
                    Signed in
                </p>
                <p className="mt-2 truncate font-display text-xl text-stone-900 dark:text-stone-50">
                    {user.name}
                </p>
                <p className="truncate text-xs text-stone-500">{user.email}</p>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
                {mainSidebarLinks.map((item) => (
                    <Link key={item.href} href={item.href} className={navClass(isActive(item.routeMatch))}>
                        {item.label}
                    </Link>
                ))}
                <p className="mt-4 px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500">
                    Account
                </p>
                {PROFILE_SECTIONS.map((item) => (
                    <Link
                        key={item.id}
                        href={profileSectionUrl(item.id)}
                        className={navClass(isProfileSectionActive(item.id))}
                    >
                        {item.label}
                    </Link>
                ))}
                <Link href={route('guest.catalog')} className={`${storeUserNavInactive} mt-4`}>
                    Continue shopping
                </Link>
                <Link href={catalogUrl({ featured_only: true })} className={storeUserNavInactive}>
                    New arrivals
                </Link>
                {'is_admin' in user && user.is_admin ? (
                    <Link
                        href={route('admin.dashboard')}
                        className="mt-2 py-3 pl-4 text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200"
                    >
                        Admin
                    </Link>
                ) : null}
            </nav>
            <div className="border-t border-stone-100 p-3 dark:border-stone-800">
                <button
                    type="button"
                    onClick={() => void logout().then(() => router.visit(route('home')))}
                    className="w-full min-h-11 py-3 pl-4 text-left text-[11px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-400"
                >
                    Sign out
                </button>
            </div>
        </>
    );

    const mobileMenuExtras = (
        <nav className={`${storeUserMobileMenu} px-3 py-3`}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
                More
            </p>
            <Link
                href={route('guest.catalog')}
                onClick={() => setMenuOpen(false)}
                className={`${storeMobileNavLink} ${storeUserNavInactive}`}
            >
                Continue shopping
            </Link>
            <Link
                href={catalogUrl({ featured_only: true })}
                onClick={() => setMenuOpen(false)}
                className={`${storeMobileNavLink} ${storeUserNavInactive}`}
            >
                New arrivals
            </Link>
            {'is_admin' in user && user.is_admin ? (
                <Link
                    href={route('admin.dashboard')}
                    onClick={() => setMenuOpen(false)}
                    className={`${storeMobileNavLink} text-amber-800 dark:text-amber-200`}
                >
                    Admin
                </Link>
            ) : null}
            <button
                type="button"
                onClick={() => {
                    setMenuOpen(false);
                    void logout().then(() => router.visit(route('home')));
                }}
                className={`${storeMobileNavLink} w-full text-left text-red-700 dark:text-red-400`}
            >
                Sign out
            </button>
        </nav>
    );

    return (
        <div className={`${storeUserShell} min-h-screen`}>
            <AppearanceSync />

            <StoreFixedHeader>
                <header className={`${storeUserTopBar} hidden lg:block`}>
                    <div className={storeUserTopBarInner}>
                        <FashionLogo subline="My account" />
                        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                            <Link href={route('guest.catalog')} className={storeBtnGhost}>
                                Shop
                            </Link>
                            <CartBadge />
                            <AccountHeaderButton name={user.name} />
                        </div>
                    </div>
                </header>

                <header className={`${storeUserMobileHeader} lg:hidden`}>
                    <div className={storeUserMobileHeaderRow}>
                        <button
                            type="button"
                            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-200/80 dark:hover:bg-stone-800"
                            aria-expanded={menuOpen}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            onClick={() => setMenuOpen((o) => !o)}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {menuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                )}
                            </svg>
                        </button>
                        <span className="min-w-0 flex-1 truncate text-center font-display text-base text-stone-900 sm:text-lg dark:text-stone-50">
                            {title ?? 'Account'}
                        </span>
                        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                            <CartBadge />
                            <AccountHeaderButton name={user.name} />
                        </div>
                    </div>
                    <nav className={storeUserMobileTabs} aria-label="Account sections">
                        {mainSidebarLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className={
                                    isActive(item.routeMatch)
                                        ? storeUserMobileTabActive
                                        : storeUserMobileTabInactive
                                }
                            >
                                {item.label}
                            </Link>
                        ))}
                        {PROFILE_SECTIONS.map((item) => (
                            <Link
                                key={item.id}
                                href={profileSectionUrl(item.id)}
                                onClick={() => setMenuOpen(false)}
                                className={
                                    isProfileSectionActive(item.id)
                                        ? storeUserMobileTabActive
                                        : storeUserMobileTabInactive
                                }
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    {menuOpen ? mobileMenuExtras : null}
                </header>
            </StoreFixedHeader>

            <div className="flex w-full min-h-0 flex-1 flex-col lg:flex-row">
                <aside className={storeUserSidebar}>{desktopSidebar}</aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <h1 className={`${storeUserPageTitle} px-3 sm:px-6 lg:px-8`}>{title ?? 'Account'}</h1>
                    <main className={storeUserMain}>{children}</main>
                </div>
            </div>
        </div>
    );
}
