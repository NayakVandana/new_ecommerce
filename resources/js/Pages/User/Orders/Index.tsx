import {
    storeErrorBanner,
    storeInput,
    storeMutedText,
    storePaginationBtn,
    storePaginationRow,
    storeTable,
    storeTableHead,
    storeTableTd,
    storeTableTdStrong,
    storeTableTh,
    storeTableWrap,
} from '@/store/storeTheme';
import { formatMoney, formatOrderDate, orderStatusBadgeClass } from '@/store/orderStatus';
import {
    type UserApiEnvelope,
    userApiPost,
} from '@/api/userClient';
import UserPanelLayout from '@/Layouts/User/UserPanelLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type OrderRow = {
    id: number;
    order_number: string;
    status: string;
    grand_total: string | number;
    currency: string;
    placed_at: string | null;
    created_at: string;
    items_count: number;
    items_sum_quantity: number | null;
};

type Paginator = {
    data: OrderRow[];
    current_page: number;
    last_page: number;
    total: number;
};

const STATUS_OPTIONS = [
    { id: '', label: 'All statuses' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
] as const;

export default function Index() {
    const { url } = usePage();
    const placedCount = useMemo(() => {
        const n = new URL(url, window.location.origin).searchParams.get('placed');

        return n ? Number.parseInt(n, 10) : 0;
    }, [url]);

    const [page, setPage] = useState(1);
    const [paginator, setPaginator] = useState<Paginator | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('');

    const load = useCallback(
        (p: number) => {
            setLoading(true);
            userApiPost<UserApiEnvelope<Paginator>>('/orders/orders-list', {
                per_page: 10,
                current_page: p,
                ...(statusFilter ? { status: statusFilter } : {}),
            })
                .then((res) => {
                    if (res.success && res.data) {
                        setPaginator(res.data);
                        setError(null);
                    } else {
                        setError(res.message || 'Could not load orders.');
                    }
                })
                .catch(() => setError('Could not load orders.'))
                .finally(() => setLoading(false));
        },
        [statusFilter],
    );

    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    useEffect(() => {
        load(page);
    }, [page, load]);

    return (
        <UserPanelLayout title="Orders">
            <Head title="Orders" />
            <div className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <p className={`max-w-2xl ${storeMutedText}`}>
                        Each row is one order. Open an order to see its product and billing
                        details.
                    </p>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`${storeInput} w-full shrink-0 sm:w-44`}
                        aria-label="Filter by status"
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.id || 'all'} value={s.id}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>

                {placedCount > 1 ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
                        {placedCount} orders were placed — one per item in your
                        cart. Shipping and tax were split across them.
                    </div>
                ) : null}

                {error ? <div className={storeErrorBanner}>{error}</div> : null}

                <div className={storeTableWrap}>
                    <table className={storeTable}>
                        <thead className={storeTableHead}>
                            <tr>
                                <th className={storeTableTh}>Order</th>
                                <th className={storeTableTh}>Status</th>
                                <th className={`${storeTableTh} hidden sm:table-cell`}>
                                    Qty
                                </th>
                                <th className={storeTableTh}>Total</th>
                                <th className={`${storeTableTh} hidden md:table-cell`}>
                                    Placed
                                </th>
                                <th className={`${storeTableTh} text-right`}> </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className={`${storeTableTd} text-center`}>
                                        <span className={storeMutedText}>Loading…</span>
                                    </td>
                                </tr>
                            ) : null}
                            {!loading &&
                                paginator?.data.map((row) => (
                                    <tr key={row.id}>
                                        <td className={storeTableTd}>
                                            <p className={storeTableTdStrong}>
                                                {row.order_number}
                                            </p>
                                            <p className="text-xs text-stone-500 sm:hidden">
                                                Qty {row.items_sum_quantity ?? 0}
                                            </p>
                                        </td>
                                        <td className={storeTableTd}>
                                            <span className={orderStatusBadgeClass(row.status)}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td
                                            className={`${storeTableTd} hidden text-stone-600 sm:table-cell dark:text-stone-400`}
                                        >
                                            {row.items_sum_quantity ?? 0}
                                        </td>
                                        <td className={storeTableTd}>
                                            {formatMoney(row.grand_total, row.currency)}
                                        </td>
                                        <td
                                            className={`${storeTableTd} hidden text-stone-500 md:table-cell`}
                                        >
                                            {formatOrderDate(
                                                row.placed_at ?? row.created_at,
                                            )}
                                        </td>
                                        <td className={`${storeTableTd} text-right`}>
                                            <Link
                                                href={route('user.orders.show', row.id)}
                                                className="text-sm font-semibold text-stone-900 underline-offset-4 hover:underline dark:text-stone-100"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            {!loading &&
                                paginator &&
                                paginator.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className={`${storeTableTd} text-center`}>
                                            <p className={storeMutedText}>No orders yet.</p>
                                            <Link
                                                href={route('guest.catalog')}
                                                className="mt-2 inline-block text-sm font-semibold text-stone-900 underline-offset-4 hover:underline dark:text-stone-100"
                                            >
                                                Browse products →
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>

                {paginator && paginator.last_page > 1 ? (
                    <div className={storePaginationRow}>
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className={storePaginationBtn}
                        >
                            Previous
                        </button>
                        <span className={`text-center ${storeMutedText}`}>
                            Page {paginator.current_page} of {paginator.last_page}
                            {paginator.total > 0
                                ? ` · ${paginator.total} orders`
                                : ''}
                        </span>
                        <button
                            type="button"
                            disabled={page >= paginator.last_page}
                            onClick={() =>
                                setPage((p) => Math.min(paginator.last_page, p + 1))
                            }
                            className={storePaginationBtn}
                        >
                            Next
                        </button>
                    </div>
                ) : null}
            </div>
        </UserPanelLayout>
    );
}
