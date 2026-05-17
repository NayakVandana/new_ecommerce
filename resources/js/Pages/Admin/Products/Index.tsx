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
    adminPaginationRow,
    adminTabBtnActive,
    adminTabBtnInactive,
    adminTabList,
    adminTableActionLink,
    adminTableActions,
    adminTableCellHiddenLg,
    adminTableHead,
    adminTableMobileMeta,
    adminTableRowHover,
    adminTableTd,
    adminTableTdMuted,
    adminTableTdStrong,
    adminTableTh,
    adminTableWide,
    adminTableWrap,
} from '@/admin/adminTheme';
import {
    adminApiPost,
    type AdminApiEnvelope,
    type LaravelPaginator,
} from '@/api/adminClient';
import AdminVariantPricingList, {
    type AdminVariantPricingItem,
} from '@/Components/admin/AdminVariantPricingList';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type ProductRow = {
    id: number;
    name: string;
    slug: string;
    status: string;
    total_stock?: number;
    thumb_url?: string | null;
    brand?: { name: string } | null;
    subcategory?: {
        name: string;
        category?: { name: string } | null;
    } | null;
    variants?: AdminVariantPricingItem[];
};

type VariantListRow = {
    product: {
        id: number;
        name: string;
        slug: string;
        status: string;
        thumb_url?: string | null;
        brand?: { name: string } | null;
    };
    variant: AdminVariantPricingItem;
};

type ListTab = 'products' | 'variants';

type PaginationProps = {
    paginator: LaravelPaginator<unknown>;
    page: number;
    onPageChange: (page: number) => void;
    label: string;
};

function AdminListPagination({
    paginator,
    page,
    onPageChange,
    label,
}: PaginationProps) {
    const from = paginator.from ?? 0;
    const to = paginator.to ?? 0;
    const total = paginator.total ?? 0;

    return (
        <div className={adminPaginationRow}>
            <button
                type="button"
                disabled={page <= 1 || paginator.current_page <= 1}
                onClick={() => onPageChange(Math.max(1, page - 1))}
                className={adminPaginationBtn}
            >
                Previous
            </button>
            <span className="text-center text-slate-600 dark:text-slate-400">
                Page {paginator.current_page} of {paginator.last_page}
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-500">
                    {from > 0
                        ? `Showing ${from}–${to} of ${total} ${label}`
                        : `No ${label}`}
                </span>
            </span>
            <button
                type="button"
                disabled={
                    page >= paginator.last_page ||
                    paginator.current_page >= paginator.last_page
                }
                onClick={() =>
                    onPageChange(Math.min(paginator.last_page, page + 1))
                }
                className={adminPaginationBtn}
            >
                Next
            </button>
        </div>
    );
}

function formatStock(total: number | undefined): string {
    if (total == null) {
        return '—';
    }

    return total.toLocaleString();
}

function stockClass(total: number | undefined): string {
    if (total == null) {
        return adminTableTdMuted;
    }
    if (total <= 0) {
        return 'font-semibold text-red-600 dark:text-red-400';
    }
    if (total <= 5) {
        return 'font-semibold text-amber-700 dark:text-amber-400';
    }

    return adminTableTdStrong;
}

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

function groupVariantsByProduct(rows: VariantListRow[]) {
    const map = new Map<
        number,
        {
            product: VariantListRow['product'];
            variants: AdminVariantPricingItem[];
        }
    >();

    for (const row of rows) {
        const existing = map.get(row.product.id);
        if (existing) {
            existing.variants.push(row.variant);
        } else {
            map.set(row.product.id, {
                product: row.product,
                variants: [row.variant],
            });
        }
    }

    return [...map.values()];
}

export default function Index() {
    const [listTab, setListTab] = useState<ListTab>('products');
    const [productPage, setProductPage] = useState(1);
    const [variantPage, setVariantPage] = useState(1);
    const [productPaginator, setProductPaginator] =
        useState<LaravelPaginator<ProductRow> | null>(null);
    const [variantPaginator, setVariantPaginator] =
        useState<LaravelPaginator<VariantListRow> | null>(null);
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
        setProductPage(1);
        setVariantPage(1);
    }, [keyword]);

    const loadProducts = useCallback(
        (p: number) => {
            setLoading(true);
            adminApiPost<AdminApiEnvelope<LaravelPaginator<ProductRow>>>(
                '/products/products-list',
                {
                    per_page: 15,
                    current_page: p,
                    ...(keyword ? { keyword } : {}),
                },
            )
                .then((res) => {
                    if (res.success && res.data) {
                        setProductPaginator(res.data);
                        setProductPage(res.data.current_page);
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

    const loadVariants = useCallback(
        (p: number) => {
            setLoading(true);
            adminApiPost<AdminApiEnvelope<LaravelPaginator<VariantListRow>>>(
                '/products/product-variants-list',
                {
                    per_page: 20,
                    current_page: p,
                    ...(keyword ? { keyword } : {}),
                },
            )
                .then((res) => {
                    if (res.success && res.data) {
                        setVariantPaginator(res.data);
                        setVariantPage(res.data.current_page);
                        setError(null);
                    } else {
                        setError(res.message || 'Failed to load variants.');
                    }
                })
                .catch(() => setError('Failed to load variants.'))
                .finally(() => setLoading(false));
        },
        [keyword],
    );

    useEffect(() => {
        if (listTab === 'products') {
            loadProducts(productPage);
        } else {
            loadVariants(variantPage);
        }
    }, [listTab, productPage, variantPage, loadProducts, loadVariants]);

    const groupedVariants = useMemo(
        () => groupVariantsByProduct(variantPaginator?.data ?? []),
        [variantPaginator],
    );

    const activePaginator =
        listTab === 'products' ? productPaginator : variantPaginator;
    const activePage = listTab === 'products' ? productPage : variantPage;
    const setActivePage =
        listTab === 'products' ? setProductPage : setVariantPage;
    const paginationLabel = listTab === 'products' ? 'products' : 'variants';

    const destroy = async (id: number) => {
        if (!confirm('Archive this product?')) return;
        try {
            const res = await adminApiPost<AdminApiEnvelope<unknown>>(
                '/products/product-destroy',
                { id },
            );
            if (res.success) {
                if (listTab === 'products') {
                    loadProducts(productPage);
                } else {
                    loadVariants(variantPage);
                }
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
                        addHref={route('admin.products.create')}
                        addLabel="Add product"
                        searchPlaceholder="Search products…"
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                    />

                    <div
                        className={`${adminTabList} mb-4 max-w-md`}
                        role="tablist"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={listTab === 'products'}
                            onClick={() => setListTab('products')}
                            className={
                                listTab === 'products'
                                    ? adminTabBtnActive
                                    : adminTabBtnInactive
                            }
                        >
                            Products
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={listTab === 'variants'}
                            onClick={() => setListTab('variants')}
                            className={
                                listTab === 'variants'
                                    ? adminTabBtnActive
                                    : adminTabBtnInactive
                            }
                        >
                            Variants &amp; pricing
                        </button>
                    </div>

                    {error && <div className={adminErrorBanner}>{error}</div>}

                    {activePaginator && !loading && activePaginator.total > 0 ? (
                        <AdminListPagination
                            paginator={activePaginator}
                            page={activePage}
                            onPageChange={setActivePage}
                            label={paginationLabel}
                        />
                    ) : null}

                    {listTab === 'products' ? (
                        <div className={adminTableWrap}>
                            <table className={adminTableWide}>
                                <thead className={adminTableHead}>
                                    <tr>
                                        <th className={adminTableTh}>Product</th>
                                        <th
                                            className={`${adminTableTh} ${adminTableCellHiddenLg}`}
                                        >
                                            Brand
                                        </th>
                                        <th
                                            className={`${adminTableTh} ${adminTableCellHiddenLg}`}
                                        >
                                            Category
                                        </th>
                                        <th className={adminTableTh}>Status</th>
                                        <th className={adminTableTh}>Stock</th>
                                        <th className={adminTableTh}>Variants</th>
                                        <th
                                            className={`${adminTableTh} text-right`}
                                        >
                                            Actions
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
                                        productPaginator?.data.map((row) => {
                                            const variantCount = Array.isArray(
                                                row.variants,
                                            )
                                                ? row.variants.length
                                                : 0;

                                            return (
                                                <tr
                                                    key={row.id}
                                                    className={
                                                        adminTableRowHover
                                                    }
                                                >
                                                    <td className={adminTableTd}>
                                                        <div className="flex gap-3">
                                                            <ProductThumb
                                                                src={
                                                                    row.thumb_url
                                                                }
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
                                                                <p
                                                                    className={`${adminTableMobileMeta} lg:hidden`}
                                                                >
                                                                    {row.brand
                                                                        ?.name ??
                                                                        'No brand'}
                                                                    {' · '}
                                                                    {row
                                                                        .subcategory
                                                                        ?.category
                                                                        ?.name ??
                                                                        'No category'}
                                                                    {' · '}
                                                                    {formatStock(
                                                                        row.total_stock,
                                                                    )}{' '}
                                                                    in stock
                                                                </p>
                                                            </div>
                                                            </div>
                                                    </td>
                                                    <td
                                                        className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenLg}`}
                                                    >
                                                        {row.brand?.name ?? '—'}
                                                    </td>
                                                    <td
                                                        className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenLg}`}
                                                    >
                                                        {row.subcategory?.category
                                                            ?.name ?? '—'}
                                                        {row.subcategory && (
                                                            <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                                                                {
                                                                    row
                                                                        .subcategory
                                                                        .name
                                                                }
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
                                                        className={`${adminTableTd} ${stockClass(row.total_stock)}`}
                                                    >
                                                        {formatStock(
                                                            row.total_stock,
                                                        )}
                                                    </td>
                                                    <td
                                                        className={`${adminTableTd} ${adminTableTdMuted}`}
                                                    >
                                                        {variantCount}
                                                    </td>
                                                    <td className={adminTableTd}>
                                                        <div
                                                            className={
                                                                adminTableActions
                                                            }
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'admin.products.edit',
                                                                    row.id,
                                                                )}
                                                                className={`${adminLinkAction} ${adminTableActionLink}`}
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void destroy(
                                                                        row.id,
                                                                    )
                                                                }
                                                                className={`${adminDangerText} ${adminTableActionLink} hover:bg-red-50 dark:hover:bg-red-950/40`}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    {!loading &&
                                        productPaginator &&
                                        productPaginator.data.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className={`px-5 py-10 text-center ${adminMutedText}`}
                                                >
                                                    No products found.
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="space-y-4" role="tabpanel">
                            {loading && (
                                <p
                                    className={`rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm ${adminMutedText} dark:border-slate-700 dark:bg-slate-900`}
                                >
                                    Loading…
                                </p>
                            )}
                            {!loading && groupedVariants.length === 0 && (
                                <p
                                    className={`rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm ${adminMutedText} dark:border-slate-700 dark:bg-slate-900`}
                                >
                                    No variants found.
                                </p>
                            )}
                            {!loading &&
                                groupedVariants.map(({ product, variants }) => (
                                    <section
                                        key={product.id}
                                        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <div className="mb-3 flex flex-wrap items-center gap-3">
                                            <ProductThumb
                                                src={product.thumb_url}
                                                name={product.name}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {product.name}
                                                </p>
                                                <p
                                                    className={`${adminMutedText} text-xs`}
                                                >
                                                    {product.slug}
                                                    {product.brand?.name
                                                        ? ` · ${product.brand.name}`
                                                        : ''}
                                                </p>
                                            </div>
                                            <span
                                                className={statusBadgeClass(
                                                    product.status,
                                                )}
                                            >
                                                {product.status}
                                            </span>
                                            <Link
                                                href={route(
                                                    'admin.products.edit',
                                                    product.id,
                                                )}
                                                className="text-sm font-semibold text-violet-700 hover:underline dark:text-violet-300"
                                            >
                                                Edit product
                                            </Link>
                                        </div>
                                        <AdminVariantPricingList
                                            variants={variants}
                                            showHeader={false}
                                        />
                                    </section>
                                ))}
                        </div>
                    )}

                    {activePaginator && !loading && activePaginator.total > 0 ? (
                        <AdminListPagination
                            paginator={activePaginator}
                            page={activePage}
                            onPageChange={setActivePage}
                            label={paginationLabel}
                        />
                    ) : null}
                </div>
            </AdminLayout>
        </>
    );
}
