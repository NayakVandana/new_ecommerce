import {
    storeErrorBanner,
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
import { formatMoney, formatMoneyDeduction } from '@/store/orderStatus';
import {
    isUserApiUnauthorized,
    type UserApiEnvelope,
    userApiPost,
} from '@/api/userClient';
import UserPanelLayout from '@/Layouts/User/UserPanelLayout';
import { redirectToLogin } from '@/utils/requireAuth';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type CouponUsageRow = {
    id: number;
    used_at: string | null;
    amount_saved: number;
    coupon_code: string | null;
    coupon_type: string | null;
    order_id: number | null;
    order_number: string | null;
    order_status: string | null;
    order_currency: string;
    order_grand_total: number | null;
};

type Paginator = {
    data: CouponUsageRow[];
    current_page: number;
    last_page: number;
    total: number;
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
    const [paginator, setPaginator] = useState<Paginator | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback((p: number) => {
        setLoading(true);
        userApiPost<UserApiEnvelope<Paginator>>('/coupons/coupon-usages-list', {
            per_page: 10,
            current_page: p,
        })
            .then((res) => {
                if (res.success && res.data) {
                    setPaginator(res.data);
                    setError(null);
                } else {
                    setError(res.message || 'Could not load coupon history.');
                }
            })
            .catch((err) => {
                if (isUserApiUnauthorized(err)) {
                    redirectToLogin(route('user.coupon-history.index'));

                    return;
                }
                setError('Could not load coupon history.');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load(page);
    }, [page, load]);

    return (
        <UserPanelLayout title="Coupon history">
            <Head title="Coupon history" />

            <p className={`mb-6 ${storeMutedText}`}>
                Coupons you have applied at checkout. Each row is one redemption linked to an
                order.
            </p>

            {error ? <div className={storeErrorBanner}>{error}</div> : null}

            <div className={storeTableWrap}>
                <table className={storeTable}>
                    <thead className={storeTableHead}>
                        <tr>
                            <th className={storeTableTh}>Used on</th>
                            <th className={storeTableTh}>Coupon</th>
                            <th className={storeTableTh}>Order</th>
                            <th className={storeTableTh}>You saved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className={`px-4 py-10 text-center ${storeMutedText}`}
                                >
                                    Loading…
                                </td>
                            </tr>
                        ) : null}
                        {!loading && paginator?.data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className={`px-4 py-10 text-center ${storeMutedText}`}
                                >
                                    You have not used any coupons yet. Apply a code at checkout
                                    to see it here.
                                </td>
                            </tr>
                        ) : null}
                        {!loading &&
                            paginator?.data.map((row) => (
                                <tr key={row.id}>
                                    <td className={`${storeTableTd} text-stone-600 dark:text-stone-400`}>
                                        {formatDateTime(row.used_at)}
                                    </td>
                                    <td className={storeTableTd}>
                                        <span className={storeTableTdStrong}>
                                            {row.coupon_code ?? '—'}
                                        </span>
                                    </td>
                                    <td className={storeTableTd}>
                                        {row.order_id ? (
                                            <Link
                                                href={route('user.orders.show', row.order_id)}
                                                className="font-medium text-stone-900 underline-offset-2 hover:underline dark:text-stone-100"
                                            >
                                                {row.order_number ?? 'View order'}
                                            </Link>
                                        ) : (
                                            '—'
                                        )}
                                        {row.order_grand_total !== null ? (
                                            <p className="mt-0.5 text-xs text-stone-500">
                                                {formatMoney(
                                                    row.order_grand_total,
                                                    row.order_currency,
                                                )}
                                            </p>
                                        ) : null}
                                    </td>
                                    <td className={storeTableTd}>
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
                <div className={storePaginationRow}>
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className={storePaginationBtn}
                    >
                        Previous
                    </button>
                    <span className={storeMutedText}>
                        Page {paginator.current_page} of {paginator.last_page}
                    </span>
                    <button
                        type="button"
                        disabled={page >= paginator.last_page}
                        onClick={() => setPage((p) => p + 1)}
                        className={storePaginationBtn}
                    >
                        Next
                    </button>
                </div>
            ) : null}
        </UserPanelLayout>
    );
}
