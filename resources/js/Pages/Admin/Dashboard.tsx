import { ADMIN_BRAND, ADMIN_TAGLINE } from '@/admin/adminBrand';
import {
    adminDashboardHero,
    adminDashboardHeroBtnGhost,
    adminDashboardHeroBtnPrimary,
    adminDashboardKpiGrid,
    adminDashboardKpiMetrics,
    adminDashboardMetricCountCell,
    adminDashboardMetricCountLabel,
    adminDashboardMetricCounts,
    adminDashboardMetricCountValue,
    adminDashboardMetricCountValueToday,
    adminDashboardMetricList,
    adminDashboardMetricRow,
    adminDashboardMetricRowToday,
    adminDashboardPanel,
    adminDashboardStatLink,
    adminDashboardStatLinkToday,
    adminDashboardTwoCol,
    adminErrorBanner,
    adminFormSection,
    adminFormSectionTitle,
    adminListPageWrap,
    adminMutedText,
    adminTableCellHiddenMd,
    adminTableCellHiddenSm,
    adminTable,
    adminTableHead,
    adminTableRowHover,
    adminTableTd,
    adminTableTh,
    adminTableWrap,
} from '@/admin/adminTheme';
import {
    adminApiPost,
    type AdminApiEnvelope,
} from '@/api/adminClient';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    formatMoney,
    formatOrderDate,
    formatStatusLabel,
    orderStatusBadgeClass,
} from '@/store/orderStatus';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type ModuleRow = {
    key: string;
    label: string;
    today: number;
    total: number;
};

type OrderStatusRow = {
    status: string;
    label: string;
    today: number;
    total: number;
};

type RecentOrder = {
    id: number;
    order_number: string;
    status: string;
    grand_total: number;
    currency: string;
    placed_at: string | null;
    created_at: string;
    customer_name?: string | null;
    products?: { id: number; name: string }[];
};

type DashboardData = {
    date_label: string;
    summary: {
        orders_today: number;
        orders_total: number;
        revenue_today: number;
        revenue_total: number;
        customers_today: number;
        customers_total: number;
    };
    modules: ModuleRow[];
    orders_by_status: OrderStatusRow[];
    recent_orders: RecentOrder[];
};

const MODULE_ROUTES: Record<string, string> = {
    orders: 'admin.orders.index',
    products: 'admin.products.index',
    customers: 'admin.users.index',
    brands: 'admin.brands.index',
    categories: 'admin.categories.index',
    subcategories: 'admin.categories.index',
    wishlist: 'admin.wishlist.index',
    recently_viewed: 'admin.recently-viewed.index',
};

function ordersFilterUrl(status: string): string {
    return `${route('admin.orders.index')}?status=${encodeURIComponent(status)}`;
}

function moduleHref(key: string): string {
    const name = MODULE_ROUTES[key];
    return name ? route(name) : route('admin.dashboard');
}

function metricRowClass(today: number): string {
    return today > 0 ? adminDashboardMetricRowToday : adminDashboardMetricRow;
}

function OrderProductLinks({
    products,
}: {
    products: { id: number; name: string }[];
}) {
    if (products.length === 0) {
        return <span className={adminMutedText}>—</span>;
    }

    return (
        <p className="line-clamp-2 text-sm leading-relaxed">
            {products.map((product, index) => (
                <span key={product.id}>
                    {index > 0 ? <span className="text-slate-400">, </span> : null}
                    <Link
                        href={route('admin.products.edit', product.id)}
                        className="font-medium text-violet-600 hover:underline dark:text-violet-400"
                    >
                        {product.name}
                    </Link>
                </span>
            ))}
        </p>
    );
}

function CountPair({ today, total }: { today: number; total: number }) {
    const hasToday = today > 0;
    return (
        <div className={adminDashboardMetricCounts}>
            <div className={adminDashboardMetricCountCell}>
                <p className={adminDashboardMetricCountLabel}>Today</p>
                <p
                    className={
                        hasToday
                            ? adminDashboardMetricCountValueToday
                            : adminDashboardMetricCountValue
                    }
                >
                    {today.toLocaleString()}
                </p>
            </div>
            <div className={adminDashboardMetricCountCell}>
                <p className={adminDashboardMetricCountLabel}>Total</p>
                <p className={`${adminDashboardMetricCountValue} text-violet-700 dark:text-violet-300`}>
                    {total.toLocaleString()}
                </p>
            </div>
        </div>
    );
}

function KpiCard({
    href,
    label,
    today,
    total,
    hasTodayActivity = false,
}: {
    href: string;
    label: string;
    today: number | string;
    total: number | string;
    hasTodayActivity?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`${hasTodayActivity ? adminDashboardStatLinkToday : adminDashboardStatLink} group`}
        >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 transition group-hover:text-violet-600 dark:text-slate-400 dark:group-hover:text-violet-400">
                {label} →
            </p>
            <div className={adminDashboardKpiMetrics}>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                        Today
                    </p>
                    <p
                        className={`mt-0.5 text-xl font-semibold tabular-nums sm:text-2xl ${
                            hasTodayActivity
                                ? 'text-violet-700 dark:text-violet-300'
                                : 'text-slate-900 dark:text-white'
                        }`}
                    >
                        {today}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Total
                    </p>
                    <p className="mt-0.5 text-xl font-semibold tabular-nums text-slate-700 sm:text-2xl dark:text-slate-200">
                        {total}
                    </p>
                </div>
            </div>
        </Link>
    );
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        adminApiPost<AdminApiEnvelope<DashboardData>>('/dashboard/dashboard-stats', {})
            .then((res) => {
                if (cancelled) return;
                if (res.success && res.data) {
                    setData(res.data);
                    setError(null);
                } else {
                    setError(res.message || 'Could not load dashboard.');
                }
            })
            .catch(() => {
                if (!cancelled) setError('Could not load dashboard.');
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const summary = data?.summary;

    return (
        <>
            <Head title={`${ADMIN_BRAND} · Dashboard`} />
            <AdminLayout heading="Dashboard">
                <div className={`${adminListPageWrap} space-y-4`}>
                    {error ? <div className={adminErrorBanner}>{error}</div> : null}

                    <section className={adminDashboardHero}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-200">
                                    {ADMIN_TAGLINE}
                                </p>
                                <h2 className="mt-0.5 text-lg font-semibold leading-tight sm:text-xl">
                                    {ADMIN_BRAND} admin
                                </h2>
                                {data?.date_label ? (
                                    <p className="mt-0.5 text-sm text-violet-200/90">{data.date_label}</p>
                                ) : null}
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                                <Link href={route('home')} className={adminDashboardHeroBtnPrimary}>
                                    Storefront
                                </Link>
                                <Link
                                    href={route('admin.products.create')}
                                    className={adminDashboardHeroBtnGhost}
                                >
                                    New product
                                </Link>
                                <Link
                                    href={route('admin.orders.index')}
                                    className={adminDashboardHeroBtnGhost}
                                >
                                    All orders
                                </Link>
                            </div>
                        </div>
                    </section>

                    {!data && !error ? (
                        <p className={adminMutedText}>Loading…</p>
                    ) : null}

                    {summary ? (
                        <>
                            <div className={adminDashboardKpiGrid}>
                                <KpiCard
                                    href={route('admin.orders.index')}
                                    label="Orders"
                                    today={summary.orders_today.toLocaleString()}
                                    total={summary.orders_total.toLocaleString()}
                                    hasTodayActivity={summary.orders_today > 0}
                                />
                                <KpiCard
                                    href={route('admin.orders.index')}
                                    label="Revenue (COD)"
                                    today={formatMoney(summary.revenue_today, 'INR')}
                                    total={formatMoney(summary.revenue_total, 'INR')}
                                    hasTodayActivity={summary.revenue_today > 0}
                                />
                                <KpiCard
                                    href={route('admin.users.index')}
                                    label="Customers"
                                    today={summary.customers_today.toLocaleString()}
                                    total={summary.customers_total.toLocaleString()}
                                    hasTodayActivity={summary.customers_today > 0}
                                />
                            </div>

                            <div className={adminDashboardTwoCol}>
                                <section className={adminDashboardPanel}>
                                    <h2 className={adminFormSectionTitle}>All sections</h2>
                                    <p className={`mt-1 text-sm ${adminMutedText}`}>
                                        Click a name to open — today vs total.
                                    </p>
                                    <ul className={adminDashboardMetricList}>
                                        {(data?.modules ?? []).map((row) => (
                                            <li key={row.key} className={metricRowClass(row.today)}>
                                                <Link
                                                    href={moduleHref(row.key)}
                                                    className="min-w-0 flex-1 truncate font-semibold text-violet-600 hover:underline dark:text-violet-400"
                                                >
                                                    {row.label}
                                                </Link>
                                                <CountPair today={row.today} total={row.total} />
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className={adminDashboardPanel}>
                                    <h2 className={adminFormSectionTitle}>Orders by status</h2>
                                    <p className={`mt-1 text-sm ${adminMutedText}`}>
                                        Click a status for filtered orders.
                                    </p>
                                    <ul className={adminDashboardMetricList}>
                                        {(data?.orders_by_status ?? []).map((row) => (
                                            <li key={row.status} className={metricRowClass(row.today)}>
                                                <Link
                                                    href={ordersFilterUrl(row.status)}
                                                    className="min-w-0 shrink"
                                                >
                                                    <span className={orderStatusBadgeClass(row.status)}>
                                                        {row.label}
                                                    </span>
                                                </Link>
                                                <CountPair today={row.today} total={row.total} />
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>

                            {(data?.recent_orders?.length ?? 0) > 0 ? (
                                <section className={adminFormSection}>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h2 className={adminFormSectionTitle}>Recent orders</h2>
                                        <Link
                                            href={route('admin.orders.index')}
                                            className="text-sm font-semibold text-violet-600 dark:text-violet-400"
                                        >
                                            All orders →
                                        </Link>
                                    </div>
                                    <div className={`${adminTableWrap} mt-4`}>
                                        <table className={adminTable}>
                                            <thead className={adminTableHead}>
                                                <tr>
                                                    <th className={adminTableTh}>Products</th>
                                                    <th className={adminTableTh}>Order</th>
                                                    <th className={`${adminTableTh} ${adminTableCellHiddenSm}`}>
                                                        Name
                                                    </th>
                                                    <th className={adminTableTh}>Status</th>
                                                    <th className={adminTableTh}>Total</th>
                                                    <th className={`${adminTableTh} ${adminTableCellHiddenMd}`}>
                                                        Placed
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data!.recent_orders.map((order) => (
                                                    <tr key={order.id} className={adminTableRowHover}>
                                                        <td className={`${adminTableTd} min-w-0 max-w-[12rem] sm:max-w-none`}>
                                                            <OrderProductLinks
                                                                products={order.products ?? []}
                                                            />
                                                        </td>
                                                        <td className={`${adminTableTd} font-medium text-slate-900 dark:text-white`}>
                                                            {order.order_number}
                                                        </td>
                                                        <td className={`${adminTableTd} ${adminTableCellHiddenSm}`}>
                                                            <p className="font-medium text-slate-900 dark:text-white">
                                                                {order.customer_name ?? '—'}
                                                            </p>
                                                        </td>
                                                        <td className={adminTableTd}>
                                                            <span className={orderStatusBadgeClass(order.status)}>
                                                                {formatStatusLabel(order.status)}
                                                            </span>
                                                        </td>
                                                        <td className={adminTableTd}>
                                                            {formatMoney(order.grand_total, order.currency)}
                                                        </td>
                                                        <td className={`${adminTableTd} ${adminTableCellHiddenMd}`}>
                                                            {formatOrderDate(
                                                                order.placed_at ?? order.created_at,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            ) : null}
                        </>
                    ) : null}
                </div>
            </AdminLayout>
        </>
    );
}
