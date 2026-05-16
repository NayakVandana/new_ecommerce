import CartBadge from '@/Components/CartBadge';
import FashionAnnouncementBar from '@/Components/store/FashionAnnouncementBar';
import FashionLogo from '@/Components/store/FashionLogo';
import StoreFooter from '@/Components/store/StoreFooter';
import StoreThemeToggle from '@/Components/StoreThemeToggle';
import AppearanceSync from '@/Components/AppearanceSync';
import { useWomenStore } from '@/hooks/useWomenStore';
import { catalogUrl, catalogUrlForCategory } from '@/store/fashionBrand';
import {
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

function navClass(active: boolean) {
    return active ? storeNavActive : storeNavInactive;
}

export default function GuestPanelLayout({
    children,
    title,
}: PropsWithChildren<{ title?: string }>) {
    const { user } = useAuthUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const { shopCategories } = useWomenStore();

    return (
        <div className={storeShell}>
            <AppearanceSync />
            <FashionAnnouncementBar />
            <header className={storeHeader}>
                <div className={storeHeaderInner}>
                    <FashionLogo
                        subline={
                            user
                                ? `Welcome, ${user.name.split(' ')[0]}`
                                : 'Sarees · Kurtas · Tunics'
                        }
                    />

                    <nav className="hidden items-center gap-5 lg:flex">
                        <Link
                            href={route('home')}
                            className={navClass(route().current('home') === true)}
                        >
                            Home
                        </Link>
                        {shopCategories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={catalogUrlForCategory(cat.id)}
                                className={navClass(false)}
                            >
                                {cat.name}
                            </Link>
                        ))}
                        <Link href={catalogUrl({ featured_only: true })} className={navClass(false)}>
                            New in
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <CartBadge />
                        <StoreThemeToggle />
                        {user ? (
                            <Link href={route('dashboard')} className={storeBtnPrimary}>
                                Account
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="hidden text-[11px] font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 sm:inline dark:text-stone-400"
                                >
                                    Sign in
                                </Link>
                                <Link href={route('register')} className={storeBtnPrimary}>
                                    Join
                                </Link>
                            </>
                        )}
                        <button
                            type="button"
                            className="p-2 text-stone-600 lg:hidden dark:text-stone-400"
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
                    <nav className="flex flex-col gap-1 border-t border-stone-200 px-4 py-4 lg:hidden dark:border-stone-800">
                        <Link href={route('home')} onClick={() => setMenuOpen(false)} className={storeNavInactive}>
                            Home
                        </Link>
                        {shopCategories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={catalogUrlForCategory(cat.id)}
                                onClick={() => setMenuOpen(false)}
                                className={storeNavInactive}
                            >
                                {cat.name}
                            </Link>
                        ))}
                        <Link
                            href={catalogUrl({ featured_only: true })}
                            onClick={() => setMenuOpen(false)}
                            className={storeNavInactive}
                        >
                            New in
                        </Link>
                        <Link
                            href={route('guest.cart')}
                            onClick={() => setMenuOpen(false)}
                            className={storeNavInactive}
                        >
                            Bag
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
            <StoreFooter />
        </div>
    );
}
