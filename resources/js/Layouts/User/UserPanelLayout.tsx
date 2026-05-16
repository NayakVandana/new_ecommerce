import FashionLogo from '@/Components/store/FashionLogo';
import StoreThemeToggle from '@/Components/StoreThemeToggle';
import AppearanceSync from '@/Components/AppearanceSync';
import { catalogUrl } from '@/store/fashionBrand';
import {
    storeBtnGhost,
    storeMain,
    storeUserNavActive,
    storeUserNavInactive,
    storeUserShell,
    storeUserSidebar,
    storeUserTopBar,
} from '@/store/storeTheme';
import { useAuthUser } from '@/auth/useAuthUser';
import { redirectToLogin } from '@/utils/requireAuth';
import { Link, router } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';

const sidebarLinks: { label: string; href: string; routeMatch: string | string[] }[] = [
    { label: 'Overview', href: route('dashboard'), routeMatch: 'dashboard' },
    { label: 'My orders', href: route('user.orders.index'), routeMatch: ['user.orders.index', 'user.orders.show'] },
    { label: 'Profile', href: route('profile.edit'), routeMatch: 'profile.edit' },
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

    useEffect(() => {
        if (!loading && !user) {
            redirectToLogin();
        }
    }, [loading, user]);

    if (loading || !user) {
        return null;
    }

    const navClass = (active: boolean) =>
        active ? storeUserNavActive : storeUserNavInactive;

    const sidebar = (
        <>
            <div className="border-b border-stone-100 px-5 py-6 dark:border-stone-800">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
                    Signed in
                </p>
                <p className="mt-2 font-display text-xl text-stone-900 dark:text-stone-50">
                    {user.name}
                </p>
                <p className="truncate text-xs text-stone-500">{user.email}</p>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
                {sidebarLinks.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={navClass(isActive(item.routeMatch))}
                    >
                        {item.label}
                    </Link>
                ))}
                <Link
                    href={route('guest.catalog')}
                    onClick={() => setMenuOpen(false)}
                    className={`${storeUserNavInactive} mt-4`}
                >
                    Continue shopping
                </Link>
                <Link
                    href={catalogUrl({ featured_only: true })}
                    onClick={() => setMenuOpen(false)}
                    className={storeUserNavInactive}
                >
                    New arrivals
                </Link>
                {'is_admin' in user && user.is_admin ? (
                    <Link
                        href={route('admin.dashboard')}
                        onClick={() => setMenuOpen(false)}
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
                    className="w-full py-3 pl-4 text-left text-[11px] font-semibold uppercase tracking-wider text-red-700 dark:text-red-400"
                >
                    Sign out
                </button>
            </div>
        </>
    );

    return (
        <div className={storeUserShell}>
            <AppearanceSync />
            <div className={`${storeUserTopBar} hidden lg:block`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <FashionLogo subline="My account" />
                    <div className="flex items-center gap-6">
                        <Link href={route('guest.catalog')} className={storeBtnGhost}>
                            Shop fashion
                        </Link>
                        <Link href={route('guest.cart')} className={storeBtnGhost}>
                            Bag
                        </Link>
                        <StoreThemeToggle />
                    </div>
                </div>
            </div>
            <div className="flex min-h-screen">
                <aside className={storeUserSidebar}>{sidebar}</aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/95 lg:hidden">
                        <div className="flex items-center justify-between gap-2 px-4 py-3">
                            <button
                                type="button"
                                className="p-2 text-stone-600"
                                aria-expanded={menuOpen}
                                aria-label="Account menu"
                                onClick={() => setMenuOpen((o) => !o)}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                            <span className="font-display text-lg text-stone-900 dark:text-stone-50">
                                {title ?? 'Account'}
                            </span>
                            <StoreThemeToggle />
                        </div>
                        {menuOpen ? (
                            <div className="max-h-[70vh] overflow-y-auto border-t border-stone-200 dark:border-stone-800">
                                {sidebar}
                            </div>
                        ) : null}
                        <nav className="flex gap-2 overflow-x-auto border-t border-stone-100 px-3 py-2 dark:border-stone-800">
                            {sidebarLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`shrink-0 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                                        isActive(item.routeMatch)
                                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                                            : 'text-stone-600'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </header>

                    <header className="hidden border-b border-stone-200 px-8 py-6 dark:border-stone-800 lg:block">
                        <h1 className="font-display text-3xl text-stone-900 dark:text-stone-50">
                            {title ?? 'Account'}
                        </h1>
                    </header>

                    <main className={`flex-1 ${storeMain} !max-w-none lg:py-10`}>{children}</main>
                </div>
            </div>
        </div>
    );
}
