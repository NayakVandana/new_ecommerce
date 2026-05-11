import {
    adminMutedText,
    adminErrorBanner,
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
                                ['Products', stats.products],
                                ['Brands', stats.brands],
                                ['Orders', stats.orders],
                                ['Customers', stats.customers],
                            ] as const
                        ).map(([label, value]) => (
                            <div key={label} className={adminStatCard}>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {label}
                                </p>
                                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
