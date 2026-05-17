import AdminListToolbar from '@/admin/AdminListToolbar';
import {
    adminErrorBanner,
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
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type RecentlyViewedRow = {
    id: number;
    viewed_at: string | null;
    user_id: number;
    user_name: string | null;
    user_email: string | null;
    product_id: number;
    product_name: string | null;
    product_slug: string | null;
    product_sku: string | null;
    product_status: string | null;
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
        useState<LaravelPaginator<RecentlyViewedRow> | null>(null);
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
            adminApiPost<AdminApiEnvelope<LaravelPaginator<RecentlyViewedRow>>>(
                '/recently-viewed/recently-viewed-list',
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
                        setError(res.message || 'Could not load recently viewed.');
                    }
                })
                .catch(() => setError('Could not load recently viewed.'))
                .finally(() => setLoading(false));
        },
        [keyword],
    );

    useEffect(() => {
        load(page);
    }, [page, load]);

    return (
        <>
            <Head title="Admin · Recently viewed" />
            <AdminLayout heading="Recently viewed">
                <div className={adminListPageWrap}>
                    <p className={`${adminMutedText} mb-4`}>
                        Signed-in customer product views (guest session views are not stored).
                    </p>

                    <AdminListToolbar
                        searchPlaceholder="Search user, product, or SKU…"
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                    />

                    {error ? <div className={adminErrorBanner}>{error}</div> : null}

                    <div className={adminTableWrap}>
                        <table className={adminTable}>
                            <thead className={adminTableHead}>
                                <tr>
                                    <th className={adminTableTh}>User</th>
                                    <th className={adminTableTh}>Product</th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenSm}`}
                                    >
                                        SKU
                                    </th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenMd}`}
                                    >
                                        Status
                                    </th>
                                    <th className={adminTableTh}>Viewed at</th>
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
                                            No recently viewed records yet.
                                        </td>
                                    </tr>
                                ) : null}
                                {!loading &&
                                    paginator?.data.map((row) => (
                                        <tr key={row.id} className={adminTableRowHover}>
                                            <td className={adminTableTd}>
                                                <div className={adminTableTdStrong}>
                                                    {row.user_name ?? '—'}
                                                </div>
                                                <p
                                                    className={`${adminTableMobileMeta} text-slate-600 dark:text-slate-400`}
                                                >
                                                    {row.user_email ?? '—'}
                                                </p>
                                            </td>
                                            <td className={adminTableTd}>
                                                {row.product_id ? (
                                                    <Link
                                                        href={route(
                                                            'admin.products.edit',
                                                            row.product_id,
                                                        )}
                                                        className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                                    >
                                                        {row.product_name ?? '—'}
                                                    </Link>
                                                ) : (
                                                    <span className={adminTableTdStrong}>
                                                        {row.product_name ?? '—'}
                                                    </span>
                                                )}
                                                {row.product_slug ? (
                                                    <p
                                                        className={`${adminTableMobileMeta} text-slate-500`}
                                                    >
                                                        {row.product_slug}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenSm}`}
                                            >
                                                {row.product_sku ?? '—'}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} capitalize ${adminTableCellHiddenMd}`}
                                            >
                                                {row.product_status ?? '—'}
                                            </td>
                                            <td className={`${adminTableTd} ${adminTableTdMuted}`}>
                                                {formatDateTime(row.viewed_at)}
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
                </div>
            </AdminLayout>
        </>
    );
}
