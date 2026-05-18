import AdminListToolbar from '@/admin/AdminListToolbar';
import {
    adminErrorBanner,
    adminLinkAction,
    adminListPageWrap,
    adminMutedText,
    adminPaginationBtn,
    adminPaginationRow,
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
import { formatMoney, formatMoneyDeduction } from '@/store/orderStatus';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type CouponUsageRow = {
    id: number;
    used_at: string | null;
    amount_saved: number;
    coupon_id: number;
    coupon_code: string | null;
    coupon_type: string | null;
    user_id: number;
    user_name: string | null;
    user_email: string | null;
    order_id: number | null;
    order_number: string | null;
    order_currency: string;
    order_grand_total: number | null;
};

function formatDateTime(value: string | null): string {
    if (!value) {
        return '—';
    }

    const d = new Date(value);

    return Number.isNaN(d.getTime())
        ? '—'
        : d.toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          });
}

export default function Index() {
    const [page, setPage] = useState(1);
    const [paginator, setPaginator] =
        useState<LaravelPaginator<CouponUsageRow> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [couponIdFilter, setCouponIdFilter] = useState<number | null>(null);
    const [couponCodeFilter, setCouponCodeFilter] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const couponId = params.get('coupon_id');
        const couponCode = params.get('coupon_code');

        if (couponId) {
            const id = Number(couponId);
            if (!Number.isNaN(id)) {
                setCouponIdFilter(id);
            }
        }
        if (couponCode) {
            setCouponCodeFilter(couponCode);
        }
    }, []);

    useEffect(() => {
        const t = window.setTimeout(() => {
            setKeyword(searchInput.trim());
        }, 320);

        return () => window.clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
    }, [keyword, couponIdFilter]);

    const load = useCallback(
        (p: number) => {
            setLoading(true);
            adminApiPost<AdminApiEnvelope<LaravelPaginator<CouponUsageRow>>>(
                '/coupons/coupon-usages-list',
                {
                    per_page: 15,
                    current_page: p,
                    ...(keyword ? { keyword } : {}),
                    ...(couponIdFilter ? { coupon_id: couponIdFilter } : {}),
                },
            )
                .then((res) => {
                    if (res.success && res.data) {
                        setPaginator(res.data);
                        setError(null);
                    } else {
                        setError(res.message || 'Could not load coupon usage history.');
                    }
                })
                .catch(() => setError('Could not load coupon usage history.'))
                .finally(() => setLoading(false));
        },
        [keyword, couponIdFilter],
    );

    useEffect(() => {
        load(page);
    }, [page, load]);

    const clearCouponFilter = () => {
        setCouponIdFilter(null);
        setCouponCodeFilter(null);
        window.history.replaceState({}, '', route('admin.coupon-usages.index'));
    };

    return (
        <>
            <Head title="Admin · Coupon usage" />
            <AdminLayout heading="Coupon usage history">
                <div className={adminListPageWrap}>
                    <p className={`${adminMutedText} mb-4`}>
                        Every time a customer redeems a coupon at checkout, a row is recorded here.
                    </p>

                    {couponIdFilter ? (
                        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-slate-600 dark:text-slate-400">
                                Filtered by coupon:{' '}
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {couponCodeFilter ?? `#${couponIdFilter}`}
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={clearCouponFilter}
                                className={adminLinkAction}
                            >
                                Show all
                            </button>
                        </div>
                    ) : null}

                    <AdminListToolbar
                        searchPlaceholder="Search coupon code, user, or order #…"
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                    />

                    {error ? <div className={adminErrorBanner}>{error}</div> : null}

                    <div className={adminTableWrap}>
                        <table className={adminTable}>
                            <thead className={adminTableHead}>
                                <tr>
                                    <th className={adminTableTh}>Used at</th>
                                    <th className={adminTableTh}>Coupon</th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenSm}`}
                                    >
                                        Customer
                                    </th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenMd}`}
                                    >
                                        Order
                                    </th>
                                    <th className={adminTableTh}>Saved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className={`px-5 py-10 text-center ${adminMutedText}`}
                                        >
                                            Loading…
                                        </td>
                                    </tr>
                                ) : null}
                                {!loading && paginator?.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className={`px-5 py-10 text-center ${adminMutedText}`}
                                        >
                                            No coupon redemptions yet.
                                        </td>
                                    </tr>
                                ) : null}
                                {!loading &&
                                    paginator?.data.map((row) => (
                                        <tr key={row.id} className={adminTableRowHover}>
                                            <td className={`${adminTableTd} ${adminTableTdMuted}`}>
                                                {formatDateTime(row.used_at)}
                                            </td>
                                            <td className={adminTableTd}>
                                                <div className={adminTableTdStrong}>
                                                    {row.coupon_code ?? '—'}
                                                </div>
                                                {row.coupon_type ? (
                                                    <p
                                                        className={`${adminTableMobileMeta} capitalize text-slate-500`}
                                                    >
                                                        {row.coupon_type}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableCellHiddenSm}`}
                                            >
                                                <div className={adminTableTdStrong}>
                                                    {row.user_name ?? '—'}
                                                </div>
                                                <p
                                                    className={`${adminTableMobileMeta} text-slate-600 dark:text-slate-400`}
                                                >
                                                    {row.user_email ?? '—'}
                                                </p>
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableCellHiddenMd}`}
                                            >
                                                {row.order_id ? (
                                                    <Link
                                                        href={route(
                                                            'admin.orders.show',
                                                            row.order_id,
                                                        )}
                                                        className="font-medium text-violet-700 hover:text-violet-900 dark:text-violet-300"
                                                    >
                                                        {row.order_number ?? 'View order'}
                                                    </Link>
                                                ) : (
                                                    <span className={adminTableTdMuted}>—</span>
                                                )}
                                                {row.order_grand_total !== null ? (
                                                    <p className={adminTableMobileMeta}>
                                                        {formatMoney(
                                                            row.order_grand_total,
                                                            row.order_currency,
                                                        )}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className={adminTableTd}>
                                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                                    {formatMoneyDeduction(
                                                        row.amount_saved,
                                                        row.order_currency,
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {paginator && paginator.last_page > 1 ? (
                        <div className={adminPaginationRow}>
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className={adminPaginationBtn}
                            >
                                Previous
                            </button>
                            <span className={adminMutedText}>
                                Page {paginator.current_page} of {paginator.last_page} ·{' '}
                                {paginator.total} records
                            </span>
                            <button
                                type="button"
                                disabled={page >= paginator.last_page}
                                onClick={() => setPage((p) => p + 1)}
                                className={adminPaginationBtn}
                            >
                                Next
                            </button>
                        </div>
                    ) : null}

                    <p className={`mt-6 ${adminMutedText}`}>
                        <Link href={route('admin.coupons.index')} className={adminLinkAction}>
                            ← Manage coupons
                        </Link>
                    </p>
                </div>
            </AdminLayout>
        </>
    );
}
