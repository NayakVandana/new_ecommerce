import AppearanceSync from '@/Components/AppearanceSync';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { PageProps } from '@/types';

export default function GuestPanelLayout({ children, title }: PropsWithChildren<{ title?: string }>) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const links = [
        { label: 'Home', href: route('home'), routeName: 'home' },
        { label: 'Browse', href: route('guest.catalog'), routeName: 'guest.catalog' },
        { label: 'Cart', href: route('guest.cart'), routeName: 'guest.cart' },
    ] as const;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <AppearanceSync />
            <header className="border-b border-slate-200 bg-white shadow-sm">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
                    <div>
                        <Link href={route('home')} className="text-lg font-bold tracking-tight text-slate-900">
                            Store
                        </Link>
                        <p className="text-xs text-slate-500">Guest panel · browse without signing in</p>
                    </div>
                    <nav className="flex flex-wrap items-center gap-2">
                        {links.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                                    route().current(l.routeName) ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex flex-wrap items-center gap-2">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                            >
                                My account
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                        <Link href={route('admin.login')} className="text-xs font-medium text-slate-400 hover:text-slate-600">
                            Admin
                        </Link>
                    </div>
                </div>
            </header>
            {title ? (
                <div className="border-b border-slate-100 bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-4">
                        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
                    </div>
                </div>
            ) : null}
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
    );
}
