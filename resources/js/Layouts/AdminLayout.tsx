import AppearanceSync from '@/Components/AppearanceSync';
import { adminApiPost, setAdminApiToken } from '@/api/adminClient';
import axios from 'axios';
import { Link, router } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

export default function AdminLayout({
    heading,
    children,
}: PropsWithChildren<{ heading: string }>) {
    const [loggingOut, setLoggingOut] = useState(false);

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

    const navClass = (active: boolean) =>
        `rounded-lg px-3 py-2 text-sm font-medium ${
            active
                ? 'bg-slate-800 text-white dark:bg-slate-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white dark:text-slate-400 dark:hover:bg-slate-800'
        }`;

    const subNavClass = (active: boolean) =>
        `ml-2 block rounded-lg py-1.5 pl-7 pr-3 text-sm ${
            active
                ? 'bg-slate-800 font-medium text-white dark:bg-slate-700'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-white dark:text-slate-500 dark:hover:bg-slate-800/80'
        }`;

    const brandsListActive =
        route().current('admin.brands.index') ||
        route().current('admin.brands.edit');
    const brandsAddActive = route().current('admin.brands.create');

    const categoriesListActive =
        route().current('admin.categories.index') ||
        route().current('admin.categories.edit');
    const categoriesAddActive = route().current('admin.categories.create');

    const productsListActive =
        route().current('admin.products.index') ||
        route().current('admin.products.edit');
    const productsAddActive = route().current('admin.products.create');

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <AppearanceSync />
            <div className="flex min-h-screen">
                <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-transparent bg-slate-900 text-slate-100 dark:border-slate-800 dark:bg-black lg:flex">
                    <div className="flex h-16 items-center border-b border-slate-800 px-6">
                        <span className="text-lg font-semibold tracking-tight text-white">
                            Admin
                        </span>
                    </div>
                    <nav className="flex flex-1 flex-col gap-1 p-4">
                        <Link
                            href={route('admin.dashboard')}
                            className={navClass(
                                route().current('admin.dashboard') ?? false,
                            )}
                        >
                            Dashboard
                        </Link>
                        <div className="mt-1">
                            <span className="block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                                Brands
                            </span>
                            <Link
                                href={route('admin.brands.index')}
                                className={subNavClass(brandsListActive ?? false)}
                            >
                                List
                            </Link>
                            <Link
                                href={route('admin.brands.create')}
                                className={subNavClass(brandsAddActive ?? false)}
                            >
                                Add
                            </Link>
                        </div>
                        <div className="mt-2">
                            <span className="block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                                Categories
                            </span>
                            <Link
                                href={route('admin.categories.index')}
                                className={subNavClass(
                                    categoriesListActive ?? false,
                                )}
                            >
                                List
                            </Link>
                            <Link
                                href={route('admin.categories.create')}
                                className={subNavClass(
                                    categoriesAddActive ?? false,
                                )}
                            >
                                Add
                            </Link>
                        </div>
                        <div className="mt-2">
                            <span className="block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                                Products
                            </span>
                            <Link
                                href={route('admin.products.index')}
                                className={subNavClass(productsListActive ?? false)}
                            >
                                List
                            </Link>
                            <Link
                                href={route('admin.products.create')}
                                className={subNavClass(productsAddActive ?? false)}
                            >
                                Add
                            </Link>
                        </div>
                        <span className="mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                            Orders
                        </span>
                        <span className="cursor-not-allowed rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-600">
                            Coming soon
                        </span>
                    </nav>
                    <div className="border-t border-slate-800 p-4 text-xs text-slate-500 dark:text-slate-500">
                        <Link
                            href={route('home')}
                            className="font-medium text-indigo-400 hover:text-indigo-300"
                        >
                            Storefront
                        </Link>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:px-8">
                        <h1 className="truncate text-lg font-semibold dark:text-slate-100">
                            {heading}
                        </h1>
                        <button
                            type="button"
                            onClick={() => void logout()}
                            disabled={loggingOut}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                        >
                            {loggingOut ? 'Logging out…' : 'Log out'}
                        </button>
                    </header>
                    <main className="flex-1 p-4 lg:p-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
