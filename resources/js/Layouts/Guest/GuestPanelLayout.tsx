import CartBadge from '@/Components/CartBadge';
import WishlistBadge from '@/Components/WishlistBadge';
import AccountHeaderButton from '@/Components/store/AccountHeaderButton';
import FashionAnnouncementBar from '@/Components/store/FashionAnnouncementBar';
import HeaderCatalogSearch from '@/Components/store/HeaderCatalogSearch';
import FashionLogo from '@/Components/store/FashionLogo';
import StoreFixedHeader from '@/Components/store/StoreFixedHeader';
import StoreFooter from '@/Components/store/StoreFooter';
import AppearanceSync from '@/Components/AppearanceSync';
import { useWomenStore, WomenStoreProvider } from '@/hooks/useWomenStore';
import { WishlistProvider } from '@/hooks/useWishlist';
import { catalogUrl, catalogUrlForCategory } from '@/store/fashionBrand';
import {
    storeBtnCompact,
    storeBtnPrimary,
    storeChip,
    storeChipActive,
    storeHeader,
    storeHeaderActions,
    storeHeaderInner,
    storeMain,
    storeMobileCategoryScroll,
    storeMobileCategoryStrip,
    storeMobileNavLink,
    storeNavActive,
    storeNavInactive,
    storePageTitle,
    storePageTitleBar,
    storePageTitleInner,
    storeShell,
} from '@/store/storeTheme';
import { useAuthUser } from '@/auth/useAuthUser';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';

function navClass(active: boolean) {
    return active ? storeNavActive : storeNavInactive;
}

function categoryChipClass(active: boolean) {
    return `${active ? storeChipActive : storeChip} shrink-0 whitespace-nowrap`;
}

/** Avoid remounting the catalog page when switching header categories. */
const catalogCategoryLinkProps = {
    preserveState: true,
    preserveScroll: true,
    only: [] as string[],
};

function isGuestCatalogRoute(): boolean {
    try {
        return route().current('guest.catalog') === true;
    } catch {
        return false;
    }
}

export default function GuestPanelLayout({
    children,
    title,
}: PropsWithChildren<{ title?: string }>) {
    return (
        <WomenStoreProvider>
            <WishlistProvider>
                <GuestPanelLayoutContent title={title}>{children}</GuestPanelLayoutContent>
            </WishlistProvider>
        </WomenStoreProvider>
    );
}

function GuestPanelLayoutContent({
    children,
    title,
}: PropsWithChildren<{ title?: string }>) {
    const { user } = useAuthUser();
    const [menuOpen, setMenuOpen] = useState(false);
    const { shopCategories } = useWomenStore();
    const onCatalog = isGuestCatalogRoute();
    const catalogLinkExtra = onCatalog ? catalogCategoryLinkProps : {};

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

    return (
        <div className={`${storeShell} flex min-h-screen flex-col`}>
            <AppearanceSync />

            <StoreFixedHeader>
                <FashionAnnouncementBar />
                <header className={`${storeHeader} relative`}>
                    <div className={storeHeaderInner}>
                        <FashionLogo hideSublineOnMobile />

                        <HeaderCatalogSearch className="col-span-2 w-full lg:col-span-1 lg:max-w-xl lg:justify-self-center" />

                        <div className={`${storeHeaderActions} justify-self-end`}>
                            <WishlistBadge />
                            <CartBadge />
                            {user ? (
                                <AccountHeaderButton name={user.name} />
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="hidden min-h-10 items-center px-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600 sm:flex dark:text-stone-400"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className={`${storeBtnPrimary} ${storeBtnCompact}`}
                                    >
                                        Join
                                    </Link>
                                </>
                            )}
                            <button
                                type="button"
                                className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-200/80 lg:hidden dark:text-stone-300 dark:hover:bg-stone-800"
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
                        </div>
                    </div>

                    {shopCategories.length > 0 ? (
                        <div className={storeMobileCategoryStrip}>
                            <div className={storeMobileCategoryScroll}>
                                <Link href={route('home')} className={categoryChipClass(route().current('home') === true)}>
                                    Home
                                </Link>
                                {shopCategories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={catalogUrlForCategory(cat.id)}
                                        className={categoryChipClass(false)}
                                        {...catalogLinkExtra}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                                <Link
                                    href={catalogUrl({ featured_only: true })}
                                    className={categoryChipClass(false)}
                                    {...catalogLinkExtra}
                                >
                                    New in
                                </Link>
                            </div>
                        </div>
                    ) : null}

                    <nav className="hidden items-center justify-center gap-4 border-t border-stone-100 px-4 py-3 dark:border-stone-800 lg:flex xl:gap-6 xl:px-6">
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
                                {...catalogLinkExtra}
                            >
                                {cat.name}
                            </Link>
                        ))}
                        <Link
                            href={catalogUrl({ featured_only: true })}
                            className={navClass(false)}
                            {...catalogLinkExtra}
                        >
                            New in
                        </Link>
                    </nav>

                    {menuOpen ? (
                        <nav className="max-h-[min(70dvh,28rem)] overflow-y-auto border-t border-stone-200 bg-stone-50 px-3 py-4 shadow-lg dark:border-stone-800 dark:bg-stone-950 lg:hidden">
                            <Link
                                href={route('home')}
                                onClick={() => setMenuOpen(false)}
                                className={`${storeMobileNavLink} ${storeNavInactive}`}
                            >
                                Home
                            </Link>
                            {shopCategories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={catalogUrlForCategory(cat.id)}
                                    onClick={() => setMenuOpen(false)}
                                    className={`${storeMobileNavLink} ${storeNavInactive}`}
                                    {...catalogLinkExtra}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                            <Link
                                href={catalogUrl({ featured_only: true })}
                                onClick={() => setMenuOpen(false)}
                                className={`${storeMobileNavLink} ${storeNavInactive}`}
                                {...catalogLinkExtra}
                            >
                                New in
                            </Link>
                            <Link
                                href={route('guest.cart')}
                                onClick={() => setMenuOpen(false)}
                                className={`${storeMobileNavLink} ${storeNavInactive}`}
                            >
                                Shopping bag
                            </Link>
                            {!user ? (
                                <>
                                    <Link
                                        href={route('login')}
                                        onClick={() => setMenuOpen(false)}
                                        className={`${storeMobileNavLink} ${storeNavInactive}`}
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        onClick={() => setMenuOpen(false)}
                                        className={`${storeMobileNavLink} ${storeBtnPrimary} mt-2 justify-center`}
                                    >
                                        Create account
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href={route('dashboard')}
                                    onClick={() => setMenuOpen(false)}
                                    className={`${storeMobileNavLink} ${storeBtnPrimary} mt-2 justify-center`}
                                >
                                    My account
                                </Link>
                            )}
                        </nav>
                    ) : null}
                </header>
            </StoreFixedHeader>

            {title ? (
                <div className={storePageTitleBar}>
                    <div className={storePageTitleInner}>
                        <h1 className={storePageTitle}>{title}</h1>
                    </div>
                </div>
            ) : null}

            <main className={`${storeMain} flex-1`}>{children}</main>
            <StoreFooter />
        </div>
    );
}
