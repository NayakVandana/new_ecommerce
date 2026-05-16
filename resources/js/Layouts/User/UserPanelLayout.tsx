import StoreThemeToggle from '@/Components/StoreThemeToggle';
import AppearanceSync from '@/Components/AppearanceSync';
import {
    storeShell,
    storeUserNavActive,
    storeUserNavInactive,
    storeUserSidebar,
} from '@/store/storeTheme';
import { useAuthUser } from '@/auth/useAuthUser';
import { redirectToLogin } from '@/utils/requireAuth';
import { Link, router } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';

const sidebarLinks: { label: string; href: string; routeMatch: string | string[] }[] = [
    { label: 'Overview', href: route('dashboard'), routeMatch: 'dashboard' },
    { label: 'Orders', href: route('user.orders.index'), routeMatch: ['user.orders.index', 'user.orders.show'] },
    { label: 'Profile & security', href: route('profile.edit'), routeMatch: 'profile.edit' },
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
            <div className="border-b border-slate-100 px-4 py-5 dark:border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    My account
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
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
                    href={route('home')}
                    onClick={() => setMenuOpen(false)}
                    className={`${storeUserNavInactive} mt-2`}
                >
                    ← Guest store
                </Link>
                {'is_admin' in user && user.is_admin ? (
                    <Link
                        href={route('admin.dashboard')}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-amber-950/50"
                    >
                        Admin panel
                    </Link>
                ) : null}
            </nav>
            <div className="border-t border-slate-100 p-2 dark:border-slate-800">
                <button
                    type="button"
                    onClick={() => void logout().then(() => router.visit(route('home')))}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                    Log out
                </button>
            </div>
        </>
    );

    return (
        <div className={storeShell}>
            <AppearanceSync />
            <div className="flex min-h-screen">
                <aside className={storeUserSidebar}>{sidebar}</aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
                        <div className="flex items-center justify-between gap-2 px-4 py-3">
                            <button
                                type="button"
                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                aria-expanded={menuOpen}
                                aria-label="Account menu"
                                onClick={() => setMenuOpen((o) => !o)}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                            <span className="min-w-0 flex-1 truncate font-semibold text-slate-900 dark:text-white">
                                {title ?? 'Account'}
                            </span>
                            <StoreThemeToggle />
                        </div>
                        {menuOpen ? (
                            <div className="max-h-[70vh] overflow-y-auto border-t border-slate-200 dark:border-slate-800">
                                {sidebar}
                            </div>
                        ) : null}
                        <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-3 py-2 dark:border-slate-800">
                            {sidebarLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                                        isActive(item.routeMatch)
                                            ? 'bg-slate-900 text-white dark:bg-indigo-600'
                                            : 'border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </header>

                    <header className="hidden items-center justify-between border-b border-slate-200 bg-white px-8 py-5 dark:border-slate-800 dark:bg-slate-900 lg:flex">
                        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {title ?? 'Account'}
                        </h1>
                        <StoreThemeToggle />
                    </header>

                    <main className="flex-1 p-4 lg:p-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
