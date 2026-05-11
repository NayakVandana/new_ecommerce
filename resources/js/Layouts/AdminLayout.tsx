import AppearanceSync from '@/Components/AppearanceSync';
import { adminPageGradient } from '@/admin/adminTheme';
import { adminApiPost, setAdminApiToken } from '@/api/adminClient';
import axios from 'axios';
import { Link, router } from '@inertiajs/react';
import { PropsWithChildren, useState, type ComponentType } from 'react';

function IconGauge({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
        </svg>
    );
}

function IconTag({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
    );
}

function IconFolder({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h6.257c.571 0 1.111.241 1.492.664l2.129 2.428c.381.423.921.664 1.492.664h3.13A2.25 2.25 0 0121.75 15v3.75m-18 0A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25v-3.75"
            />
        </svg>
    );
}

function IconCube({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
    );
}

function IconCart({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
    );
}

function IconMenu({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    );
}

function IconClose({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

function IconListRows({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
        </svg>
    );
}

function IconPlusSm({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}

function CatalogNavGroup({
    title,
    icon: Icon,
    listHref,
    createHref,
    listActive,
    createActive,
    onNavigate,
}: {
    title: string;
    icon: ComponentType<{ className?: string }>;
    listHref: string;
    createHref: string;
    listActive: boolean;
    createActive: boolean;
    onNavigate: () => void;
}) {
    const row = (active: boolean) =>
        `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
            active
                ? 'bg-violet-500/35 font-semibold text-white shadow-inner shadow-violet-950/40 ring-1 ring-violet-400/25'
                : 'text-slate-400 hover:bg-white/8 hover:text-white'
        }`;

    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2 shadow-sm shadow-black/20 ring-1 ring-white/[0.06]">
            <div className="mb-1 flex items-center gap-2 border-b border-white/5 px-2 pb-2 pt-0.5">
                <Icon className="h-4 w-4 shrink-0 text-violet-300/90" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {title}
                </span>
            </div>
            <div className="mt-1 flex flex-col gap-0.5">
                <Link href={listHref} className={row(listActive)} onClick={onNavigate}>
                    <IconListRows className="h-4 w-4 shrink-0 opacity-80" />
                    List all
                </Link>
                <Link href={createHref} className={row(createActive)} onClick={onNavigate}>
                    <IconPlusSm className="h-4 w-4 shrink-0 opacity-80" />
                    Add new
                </Link>
            </div>
        </div>
    );
}

export default function AdminLayout({
    heading,
    children,
}: PropsWithChildren<{ heading?: string }>) {
    const [loggingOut, setLoggingOut] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const logout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await adminApiPost('/auth/logout', {});
            await axios.get('/sanctum/csrf-cookie');
            await axios.post(route('admin.session.logout'));
        } finally {
            setAdminApiToken(null);
            router.visit(route('admin.login'));
        }
    };

    const dashActive = route().current('admin.dashboard') ?? false;

    const brandsListActive =
        route().current('admin.brands.index') ||
        route().current('admin.brands.edit');
    const brandsCreateActive = route().current('admin.brands.create');

    const categoriesListActive =
        route().current('admin.categories.index') ||
        route().current('admin.categories.edit');
    const categoriesCreateActive =
        route().current('admin.categories.create');

    const productsListActive =
        route().current('admin.products.index') ||
        route().current('admin.products.edit');
    const productsCreateActive = route().current('admin.products.create');

    const navPrimary = (active: boolean) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            active
                ? 'bg-white/15 text-white shadow-lg shadow-violet-950/40 ring-1 ring-white/15'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`;

    const sectionLabel =
        'mt-5 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 first:mt-0';

    const closeMobile = () => setMobileOpen(false);

    const SidebarNav = () => (
        <>
            <Link
                href={route('admin.dashboard')}
                className={navPrimary(dashActive)}
                onClick={closeMobile}
            >
                <IconGauge className="h-5 w-5 shrink-0 opacity-90" />
                Dashboard
            </Link>

            <p className={sectionLabel}>Catalog</p>
            <div className="mt-2 flex flex-col gap-2">
                <CatalogNavGroup
                    title="Brands"
                    icon={IconTag}
                    listHref={route('admin.brands.index')}
                    createHref={route('admin.brands.create')}
                    listActive={brandsListActive ?? false}
                    createActive={brandsCreateActive ?? false}
                    onNavigate={closeMobile}
                />
                <CatalogNavGroup
                    title="Categories"
                    icon={IconFolder}
                    listHref={route('admin.categories.index')}
                    createHref={route('admin.categories.create')}
                    listActive={categoriesListActive ?? false}
                    createActive={categoriesCreateActive ?? false}
                    onNavigate={closeMobile}
                />
                <CatalogNavGroup
                    title="Products"
                    icon={IconCube}
                    listHref={route('admin.products.index')}
                    createHref={route('admin.products.create')}
                    listActive={productsListActive ?? false}
                    createActive={productsCreateActive ?? false}
                    onNavigate={closeMobile}
                />
            </div>

            <p className={sectionLabel}>Sales</p>
            <span className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2 text-sm text-slate-600">
                <IconCart className="h-4 w-4 opacity-50" />
                Orders — soon
            </span>
        </>
    );

    return (
        <div className={`${adminPageGradient} text-slate-900 dark:text-slate-100`}>
            <AppearanceSync />

            {/* Mobile overlay */}
            {mobileOpen ? (
                <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            ) : null}

            {/* Mobile drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[min(100%-3rem,18rem)] flex-col border-r border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
                    <span className="bg-gradient-to-r from-white to-violet-200 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                        Store OS
                    </span>
                    <button
                        type="button"
                        className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                        onClick={() => setMobileOpen(false)}
                    >
                        <IconClose className="h-5 w-5" />
                    </button>
                </div>
                <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-4">
                    <SidebarNav />
                </nav>
                <div className="border-t border-white/10 p-4">
                    <Link
                        href={route('home')}
                        className="text-sm font-semibold text-violet-300 transition hover:text-white"
                        onClick={closeMobile}
                    >
                        ← View storefront
                    </Link>
                </div>
            </aside>

            <div className="flex min-h-screen lg:pl-0">
                {/* Desktop sidebar */}
                <aside className="relative hidden w-72 shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 lg:flex">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
                    <div className="relative flex h-[4.5rem] flex-col justify-center border-b border-white/10 px-6">
                        <span className="bg-gradient-to-r from-white via-violet-100 to-indigo-200 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                            Store OS
                        </span>
                        <span className="mt-0.5 text-xs font-medium text-slate-500">
                            Admin console
                        </span>
                    </div>
                    <nav className="relative flex flex-1 flex-col gap-0.5 overflow-y-auto p-4">
                        <SidebarNav />
                    </nav>
                    <div className="relative border-t border-white/10 p-4">
                        <Link
                            href={route('home')}
                            className="flex items-center gap-2 text-sm font-semibold text-violet-300/90 transition hover:text-white"
                        >
                            <span aria-hidden>←</span> Storefront
                        </Link>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/75 px-4 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/75 lg:h-16 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 lg:hidden dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-700 dark:hover:bg-slate-700"
                                onClick={() => setMobileOpen(true)}
                                aria-label="Open menu"
                            >
                                <IconMenu className="h-5 w-5" />
                            </button>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
                                    Admin
                                </p>
                                {heading ? (
                                    <h1 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                                        {heading}
                                    </h1>
                                ) : (
                                    <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Store OS
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => void logout()}
                            disabled={loggingOut}
                            className="shrink-0 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-800 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-950 disabled:opacity-50 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-200 dark:hover:border-red-900 dark:hover:bg-red-950/50 dark:hover:text-red-300"
                        >
                            {loggingOut ? 'Signing out…' : 'Log out'}
                        </button>
                    </header>

                    <main className="flex-1 min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
