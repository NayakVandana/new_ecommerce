import AdminListToolbar from '@/admin/AdminListToolbar';
import {
    adminBadgeArchived,
    adminBadgeDraft,
    adminBadgeNeutral,
    adminBadgePublished,
    adminDangerText,
    adminErrorBanner,
    adminLinkAction,
    adminListPageWrap,
    adminMutedText,
    adminPaginationBtn,
    adminTable,
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

type ProductRow = {
    id: number;
    name: string;
    slug: string;
    status: string;
    thumb_url?: string | null;
    brand?: { name: string } | null;
    subcategory?: {
        name: string;
        category?: { name: string } | null;
    } | null;
    variants?: unknown[];
};

function statusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
        case 'published':
            return adminBadgePublished;
        case 'draft':
            return adminBadgeDraft;
        case 'archived':
            return adminBadgeArchived;
        default:
            return adminBadgeNeutral;
    }
}

function ProductThumb({
    src,
    name,
}: {
    src: string | null | undefined;
    name: string;
}) {
    return (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200/90 bg-gradient-to-br from-violet-100 to-indigo-100 shadow-sm ring-1 ring-white dark:border-slate-600 dark:from-slate-800 dark:to-slate-900 dark:ring-slate-700">
            {src ? (
                <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
            ) : (
                <span
                    className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-wide text-violet-700/90 dark:text-violet-300/90"
                    aria-hidden
                >
                    {name.trim().slice(0, 2) || '—'}
                </span>
            )}
        </div>
    );
}

export default function Index() {
    const [page, setPage] = useState(1);
    const [paginator, setPaginator] =
        useState<LaravelPaginator<ProductRow> | null>(null);
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
            adminApiPost<AdminApiEnvelope<LaravelPaginator<ProductRow>>>(
                '/products/list',
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
                        setError(res.message || 'Failed to load products.');
                    }
                })
                .catch(() => setError('Failed to load products.'))
                .finally(() => setLoading(false));
        },
        [keyword],
    );

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
                <div className={adminListPageWrap}>
                    <AdminListToolbar
                        description="SKUs, variants, and catalog placement. Search matches name, slug, or base SKU."
                        addHref={route('admin.products.create')}
                        addLabel="Add product"
                        searchPlaceholder="Search products…"
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                    />

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
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan={6}
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
                                                <div className="flex gap-3">
                                                    <ProductThumb
                                                        src={row.thumb_url}
                                                        name={row.name}
                                                    />
                                                    <div className="min-w-0">
                                                        <div
                                                            className={`font-semibold ${adminTableTdStrong}`}
                                                        >
                                                            {row.name}
                                                        </div>
                                                        <div className="mt-0.5 truncate text-xs font-medium text-slate-600 dark:text-slate-400">
                                                            {row.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted}`}
                                            >
                                                {row.brand?.name ?? '—'}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted}`}
                                            >
                                                {row.subcategory?.category
                                                    ?.name ?? '—'}
                                                {row.subcategory && (
                                                    <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                                                        {row.subcategory.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className={adminTableTd}>
                                                <span
                                                    className={statusBadgeClass(
                                                        row.status,
                                                    )}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted}`}
                                            >
                                                {Array.isArray(row.variants)
                                                    ? row.variants.length
                                                    : 0}
                                            </td>
                                            <td
                                                className={`${adminTableTd} text-right text-sm`}
                                            >
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
                                                colSpan={6}
                                                className={`px-5 py-10 text-center ${adminMutedText}`}
                                            >
                                                No products found.
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
