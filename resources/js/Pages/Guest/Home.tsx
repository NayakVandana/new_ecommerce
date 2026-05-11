import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import { Head, Link } from '@inertiajs/react';

export default function Home() {
    return (
        <GuestPanelLayout title="Welcome">
            <Head title="Store · Home" />
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Guest panel</p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Shop as a guest</h2>
                    <p className="mt-3 text-slate-600">
                        Browse the catalog and build a cart without creating an account. Sign in any time to open the{' '}
                        <strong>user panel</strong> for profile and orders (API-ready).
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href={route('guest.catalog')}
                            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Browse products
                        </Link>
                        <Link
                            href={route('guest.cart')}
                            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-slate-400"
                        >
                            View cart
                        </Link>
                    </div>
                </div>
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">API (mobile / SPA)</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li>
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">POST /api/v1/catalog/products/list</code>
                        </li>
                        <li>
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">POST /api/v1/catalog/brands/list</code>
                        </li>
                        <li>
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">POST /api/v1/catalog/categories/list</code>
                        </li>
                    </ul>
                    <p className="text-xs text-slate-500">Authenticated users: Sanctum routes under <code className="text-slate-700">/api/v1/user/*</code>.</p>
                </div>
            </div>
        </GuestPanelLayout>
    );
}
