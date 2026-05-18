import CartBadge from '@/Components/CartBadge';
import WishlistBadge from '@/Components/WishlistBadge';
import AdminHeaderLink from '@/Components/store/AdminHeaderLink';
import UserAccountMenu from '@/Components/store/UserAccountMenu';
import { userInitials } from '@/Components/store/StoreHeaderIcons';
import FashionLogo from '@/Components/store/FashionLogo';
import StoreFixedHeader from '@/Components/store/StoreFixedHeader';
import AppearanceSync from '@/Components/AppearanceSync';
import { catalogUrl } from '@/store/fashionBrand';
import {
    storeBtnGhost,
    storeUserBody,
    storeUserMain,
    storeUserMainColumn,
    storeUserMobileHeader,
    storeUserMobileHeaderRow,
    storeUserMobileMenu,
    storeUserNavActive,
    storeUserNavInactive,
    storeUserNavSection,
    storeUserPageHeader,
    storeUserPageTitle,
    storeUserShell,
    storeUserSidebar,
    storeUserSidebarAvatar,
    storeUserSidebarUser,
    storeUserTopBar,
    storeUserTopBarInner,
} from '@/store/storeTheme';
import {
    isProfileSectionActive,
    PROFILE_SECTIONS,
    profileSectionUrl,
} from '@/Pages/User/Profile/profileSections';
import { WishlistProvider } from '@/hooks/useWishlist';
import { useAuthUser } from '@/auth/useAuthUser';
import { redirectToLogin } from '@/utils/requireAuth';
import { Link, router } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';

const navLinks: { label: string; href: string; routeMatch: string | string[] }[] = [
    { label: 'Overview', href: route('dashboard'), routeMatch: 'dashboard' },
    { label: 'Orders', href: route('user.orders.index'), routeMatch: ['user.orders.index', 'user.orders.show'] },
    { label: 'Wishlist', href: route('user.wishlist.index'), routeMatch: 'user.wishlist.index' },
    {
        label: 'Recently viewed',
        href: route('user.recently-viewed.index'),
        routeMatch: 'user.recently-viewed.index',
    },
];

function isActive(routeMatch: string | string[]): boolean {
    const names = Array.isArray(routeMatch) ? routeMatch : [routeMatch];

    return names.some((name) => route().current(name) === true);
}

function navClass(active: boolean) {
    return active ? storeUserNavActive : storeUserNavInactive;
}

function SidebarNav({
    onNavigate,
    user,
    onLogout,
}: {
    onNavigate?: () => void;
    user: { name: string; email: string; is_admin?: boolean };
    onLogout: () => void;
}) {
    const [, setHashTick] = useState(0);

    useEffect(() => {
        const onHashChange = (): void => setHashTick((n) => n + 1);
        window.addEventListener('hashchange', onHashChange);

        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    return (
        <>
            <div className={storeUserSidebarUser}>
                <span className={storeUserSidebarAvatar} aria-hidden>
                    {userInitials(user.name)}
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
                        {user.name}
                    </p>
                    <p className="truncate text-xs text-stone-500">{user.email}</p>
                </div>
            </div>

            <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Account">
                <p className={storeUserNavSection}>Menu</p>
                {navLinks.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={navClass(isActive(item.routeMatch))}
                    >
                        {item.label}
                    </Link>
                ))}

                <p className={storeUserNavSection}>Account</p>
                {PROFILE_SECTIONS.map((item) => (
                    <Link
                        key={item.id}
                        href={profileSectionUrl(item.id)}
                        onClick={onNavigate}
                        className={navClass(isProfileSectionActive(item.id))}
                    >
                        {item.label}
                    </Link>
                ))}

                <p className={storeUserNavSection}>Shop</p>
                <Link
                    href={route('guest.catalog')}
                    onClick={onNavigate}
                    className={storeUserNavInactive}
                >
                    Browse catalog
                </Link>
                <Link
                    href={catalogUrl({ featured_only: true })}
                    onClick={onNavigate}
                    className={storeUserNavInactive}
                >
                    New arrivals
                </Link>

                {user.is_admin ? (
                    <>
                        <p className={storeUserNavSection}>Admin</p>
                        <Link
                            href={route('admin.dashboard')}
                            onClick={onNavigate}
                            className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-amber-800 transition hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-amber-950/40"
                        >
                            Admin console
                        </Link>
                    </>
                ) : null}
            </nav>

            <div className="border-t border-stone-100 p-3 dark:border-stone-800">
                <button
                    type="button"
                    onClick={() => {
                        onNavigate?.();
                        void onLogout();
                    }}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                    Sign out
                </button>
            </div>
        </>
    );
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

    const handleLogout = () => void logout().then(() => router.visit(route('home')));
    const pageTitle = title ?? 'Account';

    const mobileMenu = menuOpen ? (
        <div className={`${storeUserMobileMenu} max-h-[min(70dvh,28rem)] overflow-y-auto`}>
            <SidebarNav user={user} onLogout={handleLogout} onNavigate={() => setMenuOpen(false)} />
        </div>
    ) : null;

    return (
        <WishlistProvider>
            <div className={`${storeUserShell} flex min-h-screen flex-col`}>
                <AppearanceSync />

                <StoreFixedHeader>
                    <header className={`${storeUserTopBar} hidden lg:block`}>
                        <div className={storeUserTopBarInner}>
                            <FashionLogo subline="My account" />
                            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                                <Link href={route('guest.catalog')} className={storeBtnGhost}>
                                    Shop
                                </Link>
                                {user.is_admin ? <AdminHeaderLink /> : null}
                                <WishlistBadge />
                                <CartBadge />
                                <UserAccountMenu name={user.name} onLogout={handleLogout} />
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
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                        />
                                    )}
                                </svg>
                            </button>
                            <Link
                                href={route('dashboard')}
                                className="min-w-0 flex-1 truncate text-center font-display text-base text-stone-900 sm:text-lg dark:text-stone-50"
                            >
                                My account
                            </Link>
                            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                                <WishlistBadge />
                                <CartBadge />
                                <UserAccountMenu name={user.name} onLogout={handleLogout} />
                            </div>
                        </div>
                        {mobileMenu}
                    </header>
                </StoreFixedHeader>

                <div className={storeUserBody}>
                    <aside className={storeUserSidebar}>
                        <SidebarNav user={user} onLogout={handleLogout} />
                    </aside>

                    <div className={storeUserMainColumn}>
                        <header className={storeUserPageHeader}>
                            <h1 className={storeUserPageTitle}>{pageTitle}</h1>
                        </header>
                        <main className={storeUserMain}>{children}</main>
                    </div>
                </div>
            </div>
        </WishlistProvider>
    );
}
