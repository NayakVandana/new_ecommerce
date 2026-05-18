import AdminListToolbar from '@/admin/AdminListToolbar';
import {
    adminErrorBanner,
    adminListPageWrap,
    adminMutedText,
    adminPaginationBtn,
    adminPaginationRow,
    adminSearchInput,
    adminTable,
    adminTableCellHiddenMd,
    adminTableCellHiddenSm,
    adminTableHead,
    adminTableMobileMeta,
    adminTableRowHover,
    adminTableTd,
    adminTableTdMuted,
    adminTableTdStrong,
    adminTableTh,
    adminTableWrap,
} from '@/admin/adminTheme';
import {
    adminApiPost,
    type AdminApiEnvelope,
    type LaravelPaginator,
} from '@/api/adminClient';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatMoney, formatOrderDate, orderStatusBadgeClass } from '@/store/orderStatus';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type OrderUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
};

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
    user?: OrderUser | null;
};

type StatusOption = { id: string; label: string };

export default function Index() {
    const [page, setPage] = useState(1);
    const [paginator, setPaginator] =
        useState<LaravelPaginator<OrderRow> | null>(null);
    const [statuses, setStatuses] = useState<StatusOption[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const t = window.setTimeout(() => {
            setKeyword(searchInput.trim());
        }, 320);

        return () => window.clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
    }, [keyword, statusFilter]);

    useEffect(() => {
        const fromUrl = new URLSearchParams(window.location.search).get('status');
        if (fromUrl) {
            setStatusFilter(fromUrl);
        }
    }, []);

    useEffect(() => {
        adminApiPost<AdminApiEnvelope<{ statuses: StatusOption[] }>>(
            '/orders/orders-meta',
            {},
        )
            .then((res) => {
                if (res.success && res.data?.statuses) {
                    setStatuses(res.data.statuses);
                }
            })
            .catch(() => {});
    }, []);

    const load = useCallback(
        (p: number) => {
            setLoading(true);
            adminApiPost<AdminApiEnvelope<LaravelPaginator<OrderRow>>>(
                '/orders/orders-list',
                {
                    per_page: 15,
                    current_page: p,
                    ...(keyword ? { keyword } : {}),
                    ...(statusFilter ? { status: statusFilter } : {}),
                },
            )
                .then((res) => {
                    if (res.success && res.data) {
                        setPaginator(res.data);
                        setError(null);
                    } else {
                        setError(res.message || 'Failed to load orders.');
                    }
                })
                .catch(() => setError('Failed to load orders.'))
                .finally(() => setLoading(false));
        },
        [keyword, statusFilter],
    );

    useEffect(() => {
        load(page);
    }, [page, load]);

    return (
        <>
            <Head title="Admin orders" />
            <AdminLayout heading="Orders">
                <div className={adminListPageWrap}>
                    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <AdminListToolbar
                            searchPlaceholder="Search order #, name, email, phone…"
                            searchValue={searchInput}
                            onSearchChange={setSearchInput}
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`${adminSearchInput} w-full md:w-auto md:min-w-[10rem]`}
                            aria-label="Filter by status"
                        >
                            <option value="">All statuses</option>
                            {statuses.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && <div className={adminErrorBanner}>{error}</div>}

                    <div className={adminTableWrap}>
                        <table className={adminTable}>
                            <thead className={adminTableHead}>
                                <tr>
                                    <th className={adminTableTh}>Order</th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenSm}`}
                                    >
                                        Customer
                                    </th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenMd}`}
                                    >
                                        Qty
                                    </th>
                                    <th className={adminTableTh}>Total</th>
                                    <th className={adminTableTh}>Status</th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenSm}`}
                                    >
                                        Placed
                                    </th>
                                    <th className={adminTableTh}>
                                        <span className="sr-only">View</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className={`px-5 py-10 text-center ${adminMutedText}`}
                                        >
                                            Loading…
                                        </td>
                                    </tr>
                                )}
                                {!loading &&
                                    paginator?.data.map((row) => (
                                        <tr
                                            key={row.id}
                                            className={adminTableRowHover}
                                        >
                                            <td className={adminTableTd}>
                                                <p
                                                    className={
                                                        adminTableTdStrong
                                                    }
                                                >
                                                    {row.order_number}
                                                </p>
                                                <p
                                                    className={`${adminTableMobileMeta} sm:hidden`}
                                                >
                                                    {row.user?.name ?? '—'}
                                                </p>
                                                <p
                                                    className={`${adminTableMobileMeta} sm:hidden text-slate-500`}
                                                >
                                                    Qty {row.items_sum_quantity ?? 0}
                                                </p>
                                                <p className="mt-1 sm:hidden">
                                                    <span
                                                        className={orderStatusBadgeClass(
                                                            row.status,
                                                        )}
                                                    >
                                                        {row.status}
                                                    </span>
                                                </p>
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableCellHiddenSm}`}
                                            >
                                                <p className={adminTableTdStrong}>
                                                    {row.user?.name ?? '—'}
                                                </p>
                                                <p
                                                    className={`${adminTableMobileMeta} text-slate-600 dark:text-slate-400`}
                                                >
                                                    {row.user?.email ?? '—'}
                                                </p>
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenMd}`}
                                            >
                                                {row.items_sum_quantity ?? 0}
                                                {row.items_count > 1 ? (
                                                    <p
                                                        className={`${adminTableMobileMeta} text-slate-500`}
                                                    >
                                                        {row.items_count} lines
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdStrong}`}
                                            >
                                                {formatMoney(
                                                    row.grand_total,
                                                    row.currency,
                                                )}
                                            </td>
                                            <td className={`${adminTableTd} hidden sm:table-cell`}>
                                                <span
                                                    className={orderStatusBadgeClass(
                                                        row.status,
                                                    )}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenSm}`}
                                            >
                                                {formatOrderDate(
                                                    row.placed_at ?? row.created_at,
                                                )}
                                            </td>
                                            <td className={adminTableTd}>
                                                <Link
                                                    href={route(
                                                        'admin.orders.show',
                                                        row.id,
                                                    )}
                                                    className="text-sm font-medium text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-200"
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
                                            <td
                                                colSpan={7}
                                                className={`px-5 py-10 text-center ${adminMutedText}`}
                                            >
                                                No orders found.
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>

                    {paginator && paginator.last_page > 1 && (
                        <div className={adminPaginationRow}>
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                className={adminPaginationBtn}
                            >
                                Previous
                            </button>
                            <span className="text-center text-slate-600 dark:text-slate-400">
                                Page {paginator.current_page} of{' '}
                                {paginator.last_page}
                            </span>
                            <button
                                type="button"
                                disabled={page >= paginator.last_page}
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(paginator.last_page, p + 1),
                                    )
                                }
                                className={adminPaginationBtn}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
