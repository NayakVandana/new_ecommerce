import ProductCard from '@/Components/store/ProductCard';
import { catalogProductsList } from '@/api/catalogClient';
import type { CatalogAppliedFilters } from '@/Pages/Guest/catalogFilterState';
import {
    catalogProductsCacheKey,
    peekCatalogProductsCache,
    setCatalogProductsCache,
} from '@/store/catalogProductCache';
import type { CatalogCategory, CatalogProduct } from '@/store/catalogTypes';
import {
    storeChip,
    storeChipActive,
    storeErrorBanner,
    storeMutedText,
    storePaginationBtn,
    storePaginationRow,
    storeProductGrid,
    storeSectionEyebrow,
    storeSectionTitle,
} from '@/store/storeTheme';
import { Link } from '@inertiajs/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

type Paginator = {
    data: CatalogProduct[];
    current_page: number;
    last_page: number;
    total?: number;
};

type CatalogProductResultsProps = {
    filters: CatalogAppliedFilters;
    page: number;
    onPageChange: (page: number) => void;
    womenGenderId: number | null;
    ready: boolean;
    categories: CatalogCategory[];
    onClearFilters: () => void;
    onCategorySelect: (categoryId: string) => void;
};

function CatalogProductResultsInner({
    filters,
    page,
    onPageChange,
    womenGenderId,
    ready,
    categories,
    onClearFilters,
    onCategorySelect,
}: CatalogProductResultsProps) {
    const cacheKey = catalogProductsCacheKey(filters, page, womenGenderId);
    const cachedPayload = peekCatalogProductsCache(cacheKey);

    const [productsLoading, setProductsLoading] = useState(!cachedPayload);
    const [error, setError] = useState<string | null>(null);
    const [payload, setPayload] = useState<Paginator | null>(cachedPayload);
    const fetchIdRef = useRef(0);

    const loadProducts = useCallback(
        async (p: number) => {
            const fetchId = ++fetchIdRef.current;
            setProductsLoading(true);
            setError(null);

            try {
                const res = await catalogProductsList({
                    per_page: 12,
                    current_page: p,
                    keyword: filters.keyword || undefined,
                    color: filters.color || undefined,
                    category_id: filters.categoryId ? Number(filters.categoryId) : undefined,
                    subcategory_id: filters.subcategoryId
                        ? Number(filters.subcategoryId)
                        : undefined,
                    gender_id: womenGenderId ?? undefined,
                    featured_only: filters.featuredOnly || undefined,
                });

                if (fetchId !== fetchIdRef.current) {
                    return;
                }

                if (!res.success || !res.data) {
                    setError(res.message || 'Could not load catalog');
                    setPayload(null);

                    return;
                }

                setPayload(res.data);
                setCatalogProductsCache(
                    catalogProductsCacheKey(filters, p, womenGenderId),
                    res.data,
                );
            } catch {
                if (fetchId !== fetchIdRef.current) {
                    return;
                }
                setError('Network error loading catalog.');
                setPayload(null);
            } finally {
                if (fetchId === fetchIdRef.current) {
                    setProductsLoading(false);
                }
            }
        },
        [filters, womenGenderId],
    );

    useEffect(() => {
        const cached = peekCatalogProductsCache(cacheKey);
        if (cached) {
            setPayload(cached);
            setProductsLoading(false);
        }
    }, [cacheKey]);

    useEffect(() => {
        if (!ready) {
            return;
        }

        void loadProducts(page);
    }, [loadProducts, page, ready]);

    const hasActiveFilters =
        filters.keyword ||
        filters.color ||
        filters.categoryId ||
        filters.subcategoryId ||
        filters.featuredOnly;

    const showEmpty = !productsLoading && payload && payload.data.length === 0;
    const showGrid = payload && payload.data.length > 0;

    return (
        <div className="min-w-0 flex-1">
            <div className="flex min-h-[4.5rem] flex-wrap items-center gap-2">
                <div>
                    <p className={storeSectionEyebrow}>Collection</p>
                    <h2 className={storeSectionTitle}>
                        {payload?.total != null
                            ? `${payload.total} pieces`
                            : 'All fashion'}
                    </h2>
                </div>
                <div className="min-h-9">
                    {hasActiveFilters ? (
                        <button type="button" onClick={onClearFilters} className={storeChip}>
                            Clear all
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="mt-3 flex min-h-10 flex-wrap gap-2 lg:hidden">
                {categories.slice(0, 6).map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => onCategorySelect(String(c.id))}
                        className={
                            String(c.id) === filters.categoryId ? storeChipActive : storeChip
                        }
                    >
                        {c.name}
                    </button>
                ))}
            </div>

            {error ? <div className={`mt-4 ${storeErrorBanner}`}>{error}</div> : null}

            <div className="relative mt-6 min-h-[28rem]">
                {productsLoading && payload ? (
                    <div
                        className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-16 dark:bg-stone-950/50"
                        aria-hidden
                    >
                        <p className={storeMutedText}>Updating results…</p>
                    </div>
                ) : null}

                {showEmpty ? (
                    <p className={storeMutedText}>
                        No products match your filters.{' '}
                        <Link href={route('guest.catalog')} className="font-medium text-indigo-600">
                            Reset
                        </Link>
                    </p>
                ) : null}

                {showGrid ? (
                    <>
                        <div
                            className={`${storeProductGrid} transition-opacity duration-200 ${
                                productsLoading ? 'opacity-45' : 'opacity-100'
                            }`}
                        >
                            {payload.data.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        {payload.last_page > 1 ? (
                            <div
                                className={`${storePaginationRow} transition-opacity duration-200 ${
                                    productsLoading ? 'opacity-45' : 'opacity-100'
                                }`}
                            >
                                <button
                                    type="button"
                                    disabled={page <= 1 || productsLoading}
                                    onClick={() => onPageChange(page - 1)}
                                    className={storePaginationBtn}
                                >
                                    Previous
                                </button>
                                <span className={storeMutedText}>
                                    Page {payload.current_page} of {payload.last_page}
                                </span>
                                <button
                                    type="button"
                                    disabled={page >= payload.last_page || productsLoading}
                                    onClick={() => onPageChange(page + 1)}
                                    className={storePaginationBtn}
                                >
                                    Next
                                </button>
                            </div>
                        ) : null}
                    </>
                ) : null}

                {productsLoading && !payload ? (
                    <p className={storeMutedText}>Loading products…</p>
                ) : null}
            </div>
        </div>
    );
}

export default memo(CatalogProductResultsInner);
