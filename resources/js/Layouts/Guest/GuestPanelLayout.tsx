import CartBadge from '@/Components/CartBadge';
import StoreThemeToggle from '@/Components/StoreThemeToggle';
import AppearanceSync from '@/Components/AppearanceSync';
import {
    storeBrand,
    storeBrandSub,
    storeBtnPrimary,
    storeHeader,
    storeHeaderInner,
    storeMain,
    storeNavActive,
    storeNavInactive,
    storePageTitle,
    storePageTitleBar,
    storePageTitleInner,
    storeShell,
} from '@/store/storeTheme';
import { useAuthUser } from '@/auth/useAuthUser';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

const navLinks = [
    { label: 'Home', href: route('home'), routeName: 'home' },
    { label: 'Browse', href: route('guest.catalog'), routeName: 'guest.catalog' },
] as const;

export default function GuestPanelLayout({
    children,
    title,
}: PropsWithChildren<{ title?: string }>) {
    const { user } = useAuthUser();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className={storeShell}>
            <AppearanceSync />
            <header className={storeHeader}>
                <div className={storeHeaderInner}>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Link href={route('home')} className="min-w-0">
                            <span className={storeBrand}>Store</span>
                            <span className={`${storeBrandSub} hidden sm:block`}>
                                Shop as guest
                            </span>
                        </Link>
                    </div>

                    <nav className="hidden items-center gap-1 md:flex">
                        {navLinks.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={
                                    route().current(l.routeName)
                                        ? storeNavActive
                                        : storeNavInactive
                                }
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <CartBadge />
                        <StoreThemeToggle />
                        {user ? (
                            <Link href={route('dashboard')} className={storeBtnPrimary}>
                                My account
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sm:inline"
                                >
                                    Log in
                                </Link>
                                <Link href={route('register')} className={storeBtnPrimary}>
                                    Register
                                </Link>
                            </>
                        )}
                        <button
                            type="button"
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
                            aria-expanded={menuOpen}
                            aria-label="Menu"
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
                    </div>
                </div>

                {menuOpen ? (
                    <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800">
                        {navLinks.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setMenuOpen(false)}
                                className={
                                    route().current(l.routeName)
                                        ? storeNavActive
                                        : storeNavInactive
                                }
                            >
                                {l.label}
                            </Link>
                        ))}
                        {!user ? (
                            <Link
                                href={route('login')}
                                onClick={() => setMenuOpen(false)}
                                className={storeNavInactive}
                            >
                                Log in
                            </Link>
                        ) : null}
                        <Link
                            href={route('admin.login')}
                            onClick={() => setMenuOpen(false)}
                            className="px-3 py-1.5 text-xs text-slate-400"
                        >
                            Admin
                        </Link>
                    </nav>
                ) : null}
            </header>

            {title ? (
                <div className={storePageTitleBar}>
                    <div className={storePageTitleInner}>
                        <h1 className={storePageTitle}>{title}</h1>
                    </div>
                </div>
            ) : null}

            <main className={storeMain}>{children}</main>
        </div>
    );
}
