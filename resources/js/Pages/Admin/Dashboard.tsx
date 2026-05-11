import {
    adminMutedText,
    adminErrorBanner,
    adminStatAccent,
    adminStatCard,
} from '@/admin/adminTheme';
import {
    adminApiPost,
    type AdminApiEnvelope,
} from '@/api/adminClient';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Stats = {
    products: number;
    brands: number;
    orders: number;
    customers: number;
};

type StatKey = keyof Stats;

const statMeta: Record<
    StatKey,
    { label: string; hint: string }
> = {
    products: { label: 'Products', hint: 'Live SKUs in catalog' },
    brands: { label: 'Brands', hint: 'Manufacturers & labels' },
    orders: { label: 'Orders', hint: 'All-time volume' },
    customers: { label: 'Customers', hint: 'Registered accounts' },
};

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        adminApiPost<AdminApiEnvelope<Stats>>('/dashboard/stats', {})
            .then((res) => {
                if (cancelled) return;
                if (res.success && res.data) {
                    setStats(res.data);
                    setError(null);
                } else {
                    setError(res.message || 'Could not load stats.');
                }
            })
            .catch(() => {
                if (!cancelled) setError('Could not load stats.');
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            <Head title="Admin dashboard" />
            <AdminLayout heading="Dashboard">
                <div className="mb-8 max-w-2xl">
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        Snapshot of your catalog and customers. Manage inventory from the sidebar —
                        brands, categories, and products stay in sync with the storefront.
                    </p>
                </div>

                {error && (
                    <div className={adminErrorBanner}>{error}</div>
                )}
                {!stats && !error && (
                    <p className={adminMutedText}>Loading…</p>
                )}
                {stats && (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {(
                            [
                                'products',
                                'brands',
                                'orders',
                                'customers',
                            ] as StatKey[]
                        ).map((key) => {
                            const value = stats[key];
                            const { label, hint } = statMeta[key];
                            const accent = adminStatAccent[key];

                            return (
                                <div
                                    key={key}
                                    className={`${adminStatCard} pt-0`}
                                >
                                    <div
                                        className={`mb-5 h-1 w-full rounded-full ${accent}`}
                                        aria-hidden
                                    />
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                {label}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                {hint}
                                            </p>
                                        </div>
                                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                            Live
                                        </span>
                                    </div>
                                    <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
                                        {value.toLocaleString()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
