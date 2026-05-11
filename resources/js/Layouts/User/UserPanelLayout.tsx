import AppearanceSync from '@/Components/AppearanceSync';
import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { PageProps } from '@/types';

const sidebarLinks: { label: string; href: string; routeMatch: string }[] = [
    { label: 'Overview', href: route('dashboard'), routeMatch: 'dashboard' },
    { label: 'Profile & security', href: route('profile.edit'), routeMatch: 'profile.edit' },
];

function isActive(routeMatch: string): boolean {
    return route().current(routeMatch) === true;
}

export default function UserPanelLayout({ children, title }: PropsWithChildren<{ title?: string }>) {
    const page = usePage<PageProps>();
    const user = page.props.auth.user;

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
            <AppearanceSync />
            <div className="flex min-h-screen">
                <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
                    <div className="border-b border-slate-100 px-4 py-5 dark:border-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            My account
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    <nav className="flex flex-1 flex-col gap-0.5 p-2">
                        {sidebarLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                    isActive(item.routeMatch)
                                        ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-100'
                                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            href={route('home')}
                            className="mt-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            ← Guest store
                        </Link>
                        {'is_admin' in user && user.is_admin ? (
                            <Link
                                href={route('admin.dashboard')}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-amber-950/50"
                            >
                                Admin panel
                            </Link>
                        ) : null}
                    </nav>
                    <div className="border-t border-slate-100 p-2 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => router.post(route('logout'))}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                            Log out
                        </button>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden">
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">Account</span>
                            <button
                                type="button"
                                onClick={() => router.post(route('logout'))}
                                className="text-sm text-red-600 dark:text-red-400"
                            >
                                Log out
                            </button>
                        </div>
                        <nav className="flex gap-2 overflow-x-auto px-3 pb-3">
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
                            <Link
                                href={route('home')}
                                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
                            >
                                Store
                            </Link>
                        </nav>
                    </header>
                    <header className="hidden border-b border-slate-200 bg-white px-8 py-5 dark:border-slate-800 dark:bg-slate-900 lg:block">
                        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title ?? 'Account'}</h1>
                    </header>
                    <main className="flex-1 p-4 lg:p-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
