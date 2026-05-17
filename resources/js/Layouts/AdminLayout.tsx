import { ADMIN_BRAND, ADMIN_CONSOLE_LABEL } from '@/admin/adminBrand';
import AdminThemeToggle from '@/admin/AdminThemeToggle';
import AdminRequireToken from '@/auth/AdminRequireToken';
import AppearanceSync from '@/Components/AppearanceSync';
import {
    adminLayoutHeader,
    adminLayoutMain,
    adminLayoutShell,
    adminLayoutSidebar,
    adminMobilePageTitle,
    adminNavActive,
    adminNavInactive,
    adminPageTitle,
} from '@/admin/adminTheme';
import { adminApiPost, setAdminApiToken } from '@/api/adminClient';
import { Link, router } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState, type ComponentType } from 'react';

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

function IconUsers({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
        </svg>
    );
}

function IconReceipt({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
            />
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

function NavLink({
    href,
    active,
    icon: Icon,
    children,
    onClick,
}: {
    href: string;
    active: boolean;
    icon: ComponentType<{ className?: string }>;
    children: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={active ? adminNavActive : adminNavInactive}
        >
            <Icon className="h-[18px] w-[18px] shrink-0 opacity-80" />
            <span className="truncate">{children}</span>
        </Link>
    );
}

function routeMatches(...names: string[]): boolean {
    return names.some((name) => route().current(name));
}

function SidebarContent({
    onNavigate,
    loggingOut,
    onLogout,
}: {
    onNavigate: () => void;
    loggingOut: boolean;
    onLogout: () => void;
}) {
    return (
        <>
            <Link
                href={route('admin.dashboard')}
                onClick={onNavigate}
                className="mb-8 flex items-center gap-2.5 px-1"
            >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-800 text-sm font-bold text-white">
                    S
                </div>
                <span className="text-[15px] font-semibold text-slate-900 dark:text-white">
                    {ADMIN_BRAND} {ADMIN_CONSOLE_LABEL}
                </span>
            </Link>

            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
                <NavLink
                    href={route('admin.dashboard')}
                    active={route().current('admin.dashboard') ?? false}
                    icon={IconGauge}
                    onClick={onNavigate}
                >
                    Dashboard
                </NavLink>
                <NavLink
                    href={route('admin.brands.index')}
                    active={routeMatches(
                        'admin.brands.index',
                        'admin.brands.create',
                        'admin.brands.edit',
                    )}
                    icon={IconTag}
                    onClick={onNavigate}
                >
                    Brands
                </NavLink>
                <NavLink
                    href={route('admin.categories.index')}
                    active={routeMatches(
                        'admin.categories.index',
                        'admin.categories.create',
                        'admin.categories.edit',
                    )}
                    icon={IconFolder}
                    onClick={onNavigate}
                >
                    Categories
                </NavLink>
                <NavLink
                    href={route('admin.products.index')}
                    active={routeMatches(
                        'admin.products.index',
                        'admin.products.create',
                        'admin.products.edit',
                    )}
                    icon={IconCube}
                    onClick={onNavigate}
                >
                    Products
                </NavLink>
                <NavLink
                    href={route('admin.orders.index')}
                    active={routeMatches(
                        'admin.orders.index',
                        'admin.orders.show',
                    )}
                    icon={IconReceipt}
                    onClick={onNavigate}
                >
                    Orders
                </NavLink>
                <NavLink
                    href={route('admin.users.index')}
                    active={route().current('admin.users.index') ?? false}
                    icon={IconUsers}
                    onClick={onNavigate}
                >
                    Users
                </NavLink>
            </nav>

            <div className="mt-6 space-y-1 border-t border-slate-200 pt-4 dark:border-slate-800">
                <Link
                    href={route('home')}
                    onClick={onNavigate}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                    Suhaag storefront
                </Link>
                <button
                    type="button"
                    onClick={onLogout}
                    disabled={loggingOut}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400"
                >
                    {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
            </div>
        </>
    );
}

function AdminLayout({
    heading,
    children,
}: PropsWithChildren<{ heading?: string }>) {
    const [loggingOut, setLoggingOut] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const logout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await adminApiPost('/auth/admin-logout', {});
        } finally {
            setAdminApiToken(null);
            router.visit(route('admin.login'));
        }
    };

    const closeMobile = () => setMobileOpen(false);

    useEffect(() => {
        if (!mobileOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [mobileOpen]);

    return (
        <div className={adminLayoutShell}>
            <AdminRequireToken />
            <AppearanceSync />

            {mobileOpen ? (
                <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            ) : null}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw,17.5rem)] flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] transition-transform duration-200 lg:hidden ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                } ${adminLayoutSidebar}`}
            >
                <button
                    type="button"
                    className="mb-3 ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                >
                    <IconClose className="h-5 w-5" />
                </button>
                <SidebarContent
                    onNavigate={closeMobile}
                    loggingOut={loggingOut}
                    onLogout={() => void logout()}
                />
            </aside>

            <div className="flex min-h-screen lg:pl-56">
                <aside
                    className={`fixed inset-y-0 left-0 z-20 hidden w-56 flex-col px-4 py-6 lg:flex ${adminLayoutSidebar}`}
                >
                    <SidebarContent
                        onNavigate={closeMobile}
                        loggingOut={loggingOut}
                        onLogout={() => void logout()}
                    />
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className={adminLayoutHeader}>
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <button
                                type="button"
                                className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                onClick={() => setMobileOpen(true)}
                                aria-label="Open menu"
                            >
                                <IconMenu className="h-6 w-6" />
                            </button>
                            {heading ? (
                                <h1 className={adminMobilePageTitle}>{heading}</h1>
                            ) : (
                                <span className={adminMobilePageTitle}>Admin</span>
                            )}
                        </div>
                        <AdminThemeToggle />
                    </header>

                    <main className={adminLayoutMain}>
                        {heading ? (
                            <h1 className={`${adminPageTitle} hidden sm:block`}>
                                {heading}
                            </h1>
                        ) : null}
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
export default AdminLayout;

