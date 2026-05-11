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
    adminTable,
    adminTableCellHiddenSm,
    adminTableHead,
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

type SubcategoryRow = {
    id: number;
    name: string;
    slug: string;
};

type CategoryRow = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    subcategories_count: number;
    subcategories?: SubcategoryRow[];
};

export default function Index() {
    const [page, setPage] = useState(1);
    const [paginator, setPaginator] =
        useState<LaravelPaginator<CategoryRow> | null>(null);
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
            adminApiPost<AdminApiEnvelope<LaravelPaginator<CategoryRow>>>(
                '/categories/list',
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
                        setError(res.message || 'Failed to load categories.');
                    }
                })
                .catch(() => setError('Failed to load categories.'))
                .finally(() => setLoading(false));
        },
        [keyword],
    );

    useEffect(() => {
        load(page);
    }, [page, load]);

    const destroy = async (id: number) => {
        if (!confirm('Delete this category and all its subcategories?')) return;
        try {
            const res = await adminApiPost<AdminApiEnvelope<unknown>>(
                '/categories/destroy',
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
            <Head title="Admin categories" />
            <AdminLayout heading="Categories">
                <div className={adminListPageWrap}>
                    <AdminListToolbar
                        description="Top-level groups and subcategory counts. Search filters by name or slug."
                        addHref={route('admin.categories.create')}
                        addLabel="Add category"
                        searchPlaceholder="Search categories…"
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                    />

                    {error && <div className={adminErrorBanner}>{error}</div>}
                    <div className={adminTableWrap}>
                        <table className={adminTable}>
                            <thead className={adminTableHead}>
                                <tr>
                                    <th className={adminTableTh}>Name</th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenSm}`}
                                    >
                                        Slug
                                    </th>
                                    <th className={adminTableTh}>
                                        Subcategories
                                    </th>
                                    <th className={adminTableTh}>Active</th>
                                    <th className={`${adminTableTh} text-right`}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan={5}
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
                                            <td
                                                className={`${adminTableTd} ${adminTableTdStrong}`}
                                            >
                                                {row.name}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenSm}`}
                                            >
                                                {row.slug}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted}`}
                                            >
                                                {row.subcategories_count}
                                                {row.subcategories &&
                                                    row.subcategories.length >
                                                        0 && (
                                                        <span className="mt-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                                                            {row.subcategories
                                                                .map(
                                                                    (s) =>
                                                                        s.name,
                                                                )
                                                                .join(', ')}
                                                        </span>
                                                    )}
                                            </td>
                                            <td className={adminTableTd}>
                                                {row.is_active ? (
                                                    <span
                                                        className={adminBadgeYes}
                                                    >
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={adminBadgeNo}
                                                    >
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className={`${adminTableTd} text-right text-sm`}
                                            >
                                                <Link
                                                    href={route(
                                                        'admin.categories.edit',
                                                        row.id,
                                                    )}
                                                    className={adminLinkAction}
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void destroy(row.id)
                                                    }
                                                    className={`ml-3 inline-flex rounded-lg px-1.5 py-0.5 transition hover:bg-red-50 dark:hover:bg-red-950/40 ${adminDangerText}`}
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
                                                className={`px-5 py-10 text-center ${adminMutedText}`}
                                            >
                                                No categories found.
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                    {paginator && paginator.last_page > 1 && (
                        <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
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
