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
import { formatMoney } from '@/store/orderStatus';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type WishlistRow = {
    id: number;
    added_at: string | null;
    user_id: number | null;
    user_name: string | null;
    user_email: string | null;
    product_id: number | null;
    product_name: string | null;
    product_slug: string | null;
    product_sku: string | null;
    product_status: string | null;
    product_variant_id: number | null;
    variant_sku: string | null;
    variant_label: string | null;
    unit_price: number | null;
    stock_quantity: number | null;
    in_stock: boolean | null;
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
        useState<LaravelPaginator<WishlistRow> | null>(null);
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
            adminApiPost<AdminApiEnvelope<LaravelPaginator<WishlistRow>>>(
                '/wishlist/wishlist-items-list',
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
                        setError(res.message || 'Could not load wishlist items.');
                    }
                })
                .catch(() => setError('Could not load wishlist items.'))
                .finally(() => setLoading(false));
        },
        [keyword],
    );

    useEffect(() => {
        load(page);
    }, [page, load]);

    return (
        <>
            <Head title="Admin · Wishlist" />
            <AdminLayout heading="Wishlist">
                <div className={adminListPageWrap}>
                    <p className={`${adminMutedText} mb-4`}>
                        Saved items from signed-in customers (one row per variant).
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
                                        Variant
                                    </th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenMd}`}
                                    >
                                        Price
                                    </th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenMd}`}
                                    >
                                        Stock
                                    </th>
                                    <th className={adminTableTh}>Added</th>
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
                                            No wishlist items yet.
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
                                                <p
                                                    className={`${adminTableMobileMeta} sm:hidden text-slate-500`}
                                                >
                                                    {row.variant_label ?? row.variant_sku ?? '—'}
                                                </p>
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenSm}`}
                                            >
                                                <div>{row.variant_label ?? '—'}</div>
                                                {row.variant_sku ? (
                                                    <p className={adminTableMobileMeta}>
                                                        {row.variant_sku}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenMd}`}
                                            >
                                                {row.unit_price !== null
                                                    ? formatMoney(row.unit_price, 'INR')
                                                    : '—'}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableCellHiddenMd}`}
                                            >
                                                {row.stock_quantity === null ? (
                                                    '—'
                                                ) : row.in_stock ? (
                                                    <span className="text-emerald-600 dark:text-emerald-400">
                                                        {row.stock_quantity} in stock
                                                    </span>
                                                ) : (
                                                    <span className="text-rose-600 dark:text-rose-400">
                                                        Out of stock
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`${adminTableTd} ${adminTableTdMuted}`}>
                                                {formatDateTime(row.added_at)}
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
                                {paginator.total} items
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
