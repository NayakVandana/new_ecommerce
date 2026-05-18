import AdminListToolbar from '@/admin/AdminListToolbar';
import {
    adminBadgeNo,
    adminBadgeYes,
    adminDangerText,
    adminErrorBanner,
    adminLinkAction,
    adminListPageWrap,
    adminMutedText,
    adminPaginationBtn,
    adminPaginationRow,
    adminTable,
    adminTableActionLink,
    adminTableActions,
    adminTableCellHiddenMd,
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
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type CouponRow = {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount: number | null;
    max_uses: number | null;
    used_count: number;
    per_user_limit: number | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
};

function formatValue(row: CouponRow): string {
    if (row.type === 'percentage') {
        return `${row.value}%`;
    }

    return `Rs. ${row.value.toFixed(2)}`;
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    const d = new Date(value);

    return Number.isNaN(d.getTime())
        ? '—'
        : d.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          });
}

export default function Index() {
    const [page, setPage] = useState(1);
    const [paginator, setPaginator] =
        useState<LaravelPaginator<CouponRow> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        const t = window.setTimeout(() => {
            setKeyword(searchInput.trim());
        }, 320);

        return () => window.clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
    }, [keyword]);

    const load = useCallback(
        (p: number) => {
            setLoading(true);
            adminApiPost<AdminApiEnvelope<LaravelPaginator<CouponRow>>>(
                '/coupons/coupons-list',
                {
                    per_page: 15,
                    current_page: p,
                    ...(keyword ? { keyword } : {}),
                },
            )
                .then((res) => {
                    if (res.success && res.data) {
                        setPaginator(res.data);
                        setError(null);
                    } else {
                        setError(res.message || 'Failed to load coupons.');
                    }
                })
                .catch(() => setError('Failed to load coupons.'))
                .finally(() => setLoading(false));
        },
        [keyword],
    );

    useEffect(() => {
        load(page);
    }, [page, load]);

    const destroy = async (id: number) => {
        if (!confirm('Delete this coupon?')) {
            return;
        }

        try {
            const res = await adminApiPost<AdminApiEnvelope<unknown>>(
                '/coupons/coupon-destroy',
                { id },
            );
            if (res.success) {
                load(page);
            } else {
                setError(res.message || 'Could not delete.');
            }
        } catch {
            setError('Could not delete.');
        }
    };

    return (
        <>
            <Head title="Admin coupons" />
            <AdminLayout heading="Coupons">
                <div className={adminListPageWrap}>
                    <AdminListToolbar
                        addHref={route('admin.coupons.create')}
                        addLabel="Add coupon"
                        searchPlaceholder="Search coupon code…"
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                    />

                    <p className={`mb-4 ${adminMutedText}`}>
                        <Link
                            href={route('admin.coupon-usages.index')}
                            className={adminLinkAction}
                        >
                            View all coupon usage history →
                        </Link>
                    </p>

                    {error ? <div className={adminErrorBanner}>{error}</div> : null}

                    <div className={adminTableWrap}>
                        <table className={adminTable}>
                            <thead className={adminTableHead}>
                                <tr>
                                    <th className={adminTableTh}>Code</th>
                                    <th className={adminTableTh}>Discount</th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenMd}`}
                                    >
                                        Uses
                                    </th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenMd}`}
                                    >
                                        Validity
                                    </th>
                                    <th className={adminTableTh}>Active</th>
                                    <th className={adminTableTh}>
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className={`px-5 py-10 text-center ${adminMutedText}`}
                                        >
                                            Loading…
                                        </td>
                                    </tr>
                                ) : null}
                                {!loading && paginator?.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className={`px-5 py-10 text-center ${adminMutedText}`}
                                        >
                                            No coupons yet.
                                        </td>
                                    </tr>
                                ) : null}
                                {!loading &&
                                    paginator?.data.map((row) => (
                                        <tr key={row.id} className={adminTableRowHover}>
                                            <td className={adminTableTd}>
                                                <div className={adminTableTdStrong}>
                                                    {row.code}
                                                </div>
                                                {row.min_order_amount !== null ? (
                                                    <p
                                                        className={`${adminTableMobileMeta} text-slate-500`}
                                                    >
                                                        Min order Rs.{' '}
                                                        {row.min_order_amount.toFixed(2)}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className={adminTableTd}>
                                                <div className={adminTableTdStrong}>
                                                    {formatValue(row)}
                                                </div>
                                                <p
                                                    className={`${adminTableMobileMeta} capitalize text-slate-500`}
                                                >
                                                    {row.type}
                                                </p>
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenMd}`}
                                            >
                                                {row.used_count}
                                                {row.max_uses !== null
                                                    ? ` / ${row.max_uses}`
                                                    : ''}
                                                {row.per_user_limit !== null ? (
                                                    <p className={adminTableMobileMeta}>
                                                        {row.per_user_limit} per user
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenMd}`}
                                            >
                                                <div>{formatDate(row.starts_at)}</div>
                                                <p className={adminTableMobileMeta}>
                                                    to {formatDate(row.ends_at)}
                                                </p>
                                            </td>
                                            <td className={adminTableTd}>
                                                <span
                                                    className={
                                                        row.is_active
                                                            ? adminBadgeYes
                                                            : adminBadgeNo
                                                    }
                                                >
                                                    {row.is_active ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className={adminTableTd}>
                                                <div className={adminTableActions}>
                                                    <Link
                                                        href={route(
                                                            'admin.coupons.edit',
                                                            row.id,
                                                        )}
                                                        className={adminTableActionLink}
                                                    >
                                                        Edit
                                                    </Link>
                                                    <Link
                                                        href={`${route('admin.coupon-usages.index')}?coupon_id=${row.id}&coupon_code=${encodeURIComponent(row.code)}`}
                                                        className={adminTableActionLink}
                                                    >
                                                        Usage
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => void destroy(row.id)}
                                                        className={adminDangerText}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
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
                                Page {paginator.current_page} of {paginator.last_page}
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
                </div>
            </AdminLayout>
        </>
    );
}
