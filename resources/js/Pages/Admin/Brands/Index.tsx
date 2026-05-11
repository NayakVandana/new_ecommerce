import {
    adminBadgeNo,
    adminBadgeYes,
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

type BrandRow = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    sort_order: number;
};

export default function Index() {
    const [page, setPage] = useState(1);
    const [paginator, setPaginator] =
        useState<LaravelPaginator<BrandRow> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback((p: number) => {
        setLoading(true);
        adminApiPost<AdminApiEnvelope<LaravelPaginator<BrandRow>>>(
            '/brands/list',
            { per_page: 15, current_page: p },
        )
            .then((res) => {
                if (res.success && res.data) {
                    setPaginator(res.data);
                    setError(null);
                } else {
                    setError(res.message || 'Failed to load brands.');
                }
            })
            .catch(() => setError('Failed to load brands.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load(page);
    }, [page, load]);

    const destroy = async (id: number) => {
        if (!confirm('Delete this brand?')) return;
        try {
            const res = await adminApiPost<AdminApiEnvelope<unknown>>(
                '/brands/destroy',
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
            <Head title="Admin brands" />
            <AdminLayout heading="Brands">
                <div className="mb-4 flex justify-end">
                    <Link
                        href={route('admin.brands.create')}
                        className={adminPrimaryBtn}
                    >
                        Add brand
                    </Link>
                </div>
                {error && <div className={adminErrorBanner}>{error}</div>}
                <div className={adminTableWrap}>
                    <table className={adminTable}>
                        <thead className={adminTableHead}>
                            <tr>
                                <th className={adminTableTh}>Name</th>
                                <th className={adminTableTh}>Slug</th>
                                <th className={adminTableTh}>Active</th>
                                <th className={adminTableTh}>Sort</th>
                                <th className={`${adminTableTh} text-right`}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={5}
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
                                        <td
                                            className={`px-4 py-3 ${adminTableTdStrong}`}
                                        >
                                            {row.name}
                                        </td>
                                        <td
                                            className={`px-4 py-3 ${adminTableTdMuted}`}
                                        >
                                            {row.slug}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.is_active ? (
                                                <span className={adminBadgeYes}>
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className={adminBadgeNo}>
                                                    No
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            className={`px-4 py-3 ${adminTableTdMuted}`}
                                        >
                                            {row.sort_order}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <Link
                                                href={route(
                                                    'admin.brands.edit',
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
                                            colSpan={5}
                                            className={`px-4 py-8 text-center ${adminMutedText}`}
                                        >
                                            No brands found.
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
