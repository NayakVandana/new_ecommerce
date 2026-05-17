import { ADMIN_BRAND } from '@/admin/adminBrand';
import {
    adminErrorBanner,
    adminListPageWrap,
    adminMutedText,
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

const statLabels: Record<StatKey, string> = {
    products: 'Ethnic pieces',
    brands: 'Labels',
    orders: 'Orders',
    customers: 'Shoppers',
};

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        adminApiPost<AdminApiEnvelope<Stats>>('/dashboard/dashboard-stats', {})
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
            <Head title={`${ADMIN_BRAND} · Admin`} />
            <AdminLayout heading="Women catalog">
                <div className={adminListPageWrap}>
                    {error && (
                        <div className={adminErrorBanner}>{error}</div>
                    )}
                    {!stats && !error && (
                        <p className={adminMutedText}>Loading…</p>
                    )}
                    {stats && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                            {(
                                [
                                    'products',
                                    'brands',
                                    'orders',
                                    'customers',
                                ] as StatKey[]
                            ).map((key) => (
                                <div key={key} className={adminStatCard}>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {statLabels[key]}
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
                                        {stats[key].toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
