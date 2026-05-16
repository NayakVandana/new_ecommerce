import {
    storeCard,
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
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type OrderRow = {
    id: number;
    order_number: string;
    status: string;
    grand_total: string | number;
    currency: string;
    placed_at: string | null;
    created_at: string;
    items_count: number;
};

type Paginator = {
    data: OrderRow[];
    current_page: number;
    last_page: number;
};

export default function Index() {
    const [page, setPage] = useState(1);
    const [paginator, setPaginator] = useState<Paginator | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('');

    const load = useCallback(
        (p: number) => {
            setLoading(true);
            userApiPost<UserApiEnvelope<Paginator>>('/orders/list', {
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
            <Head title="My orders" />
            <div className="mx-auto max-w-4xl space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className={storeMutedText}>
                        View order history and track status.
                    </p>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`${storeInput} sm:max-w-[12rem]`}
                        aria-label="Filter by status"
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {error ? <div className={storeErrorBanner}>{error}</div> : null}

                <div className={storeTableWrap}>
                    <table className={storeTable}>
                        <thead className={storeTableHead}>
                            <tr>
                                <th className={storeTableTh}>Order</th>
                                <th className={storeTableTh}>Status</th>
                                <th className={storeTableTh}>Total</th>
                                <th className={storeTableTh}>Date</th>
                                <th className={`${storeTableTh} text-right`}> </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className={`${storeTableTd} text-center`}>
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
                                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                                {row.items_count} item
                                                {row.items_count === 1 ? '' : 's'}
                                            </p>
                                        </td>
                                        <td className={storeTableTd}>
                                            <span className={orderStatusBadgeClass(row.status)}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className={storeTableTd}>
                                            {formatMoney(row.grand_total, row.currency)}
                                        </td>
                                        <td className={storeTableTd}>
                                            {formatOrderDate(row.placed_at ?? row.created_at)}
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
                                        <td colSpan={5} className={`${storeTableTd} text-center`}>
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
