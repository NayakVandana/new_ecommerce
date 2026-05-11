import {
    adminBadgeNeutral,
    adminDangerText,
    adminErrorBanner,
    adminLinkAction,
    adminMutedText,
    adminPaginationBtn,
    adminPrimaryBtn,
    adminTable,
    adminTableHead,
    adminTableRowHover,
    adminTableTdMuted,
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

type ProductRow = {
    id: number;
    name: string;
    slug: string;
    status: string;
    brand?: { name: string } | null;
    subcategory?: {
        name: string;
        category?: { name: string } | null;
    } | null;
    variants?: unknown[];
};

export default function Index() {
    const [page, setPage] = useState(1);
    const [paginator, setPaginator] =
        useState<LaravelPaginator<ProductRow> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback((p: number) => {
        setLoading(true);
        adminApiPost<AdminApiEnvelope<LaravelPaginator<ProductRow>>>(
            '/products/list',
            { per_page: 15, current_page: p },
        )
            .then((res) => {
                if (res.success && res.data) {
                    setPaginator(res.data);
                    setError(null);
                } else {
                    setError(res.message || 'Failed to load products.');
                }
            })
            .catch(() => setError('Failed to load products.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load(page);
    }, [page, load]);

    const destroy = async (id: number) => {
        if (!confirm('Archive this product?')) return;
        try {
            const res = await adminApiPost<AdminApiEnvelope<unknown>>(
                '/products/destroy',
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
            <Head title="Admin products" />
            <AdminLayout heading="Products">
                <div className="mb-4 flex justify-end">
                    <Link
                        href={route('admin.products.create')}
                        className={adminPrimaryBtn}
                    >
                        Add product
                    </Link>
                </div>
                {error && <div className={adminErrorBanner}>{error}</div>}
                <div className={adminTableWrap}>
                    <table className={adminTable}>
                        <thead className={adminTableHead}>
                            <tr>
                                <th className={adminTableTh}>Product</th>
                                <th className={adminTableTh}>Brand</th>
                                <th className={adminTableTh}>Category</th>
                                <th className={adminTableTh}>Status</th>
                                <th className={adminTableTh}>Variants</th>
                                <th className={`${adminTableTh} text-right`}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className={`px-4 py-8 text-center ${adminMutedText}`}
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
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">
                                                {row.name}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {row.slug}
                                            </div>
                                        </td>
                                        <td
                                            className={`px-4 py-3 ${adminTableTdMuted}`}
                                        >
                                            {row.brand?.name ?? '—'}
                                        </td>
                                        <td
                                            className={`px-4 py-3 ${adminTableTdMuted}`}
                                        >
                                            {row.subcategory?.category?.name ??
                                                '—'}
                                            {row.subcategory && (
                                                <span className="block text-xs text-slate-400 dark:text-slate-500">
                                                    {row.subcategory.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={adminBadgeNeutral}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td
                                            className={`px-4 py-3 ${adminTableTdMuted}`}
                                        >
                                            {Array.isArray(row.variants)
                                                ? row.variants.length
                                                : 0}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <Link
                                                href={route(
                                                    'admin.products.edit',
                                                    row.id,
                                                )}
                                                className={adminLinkAction}
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => void destroy(row.id)}
                                                className={`ml-3 ${adminDangerText}`}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            {!loading &&
                                paginator &&
                                paginator.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className={`px-4 py-8 text-center ${adminMutedText}`}
                                        >
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
                {paginator && paginator.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className={adminPaginationBtn}
                        >
                            Previous
                        </button>
                        <span className="text-slate-600 dark:text-slate-400">
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
            </AdminLayout>
        </>
    );
}
