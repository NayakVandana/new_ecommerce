import ProductCard from '@/Components/store/ProductCard';
import { catalogBrandsList, catalogProductsList } from '@/api/catalogClient';
import type { CatalogBrand, CatalogCategory, CatalogProduct } from '@/store/catalogTypes';
import { useWomenStore } from '@/hooks/useWomenStore';
import {
    storeChip,
    storeChipActive,
    storeErrorBanner,
    storeInput,
    storeMutedText,
    storePaginationBtn,
    storePaginationRow,
    storeProductGrid,
    storeLabel,
    storeSectionEyebrow,
    storeSectionTitle,
    storeFilterToggle,
    storeSidebar,
} from '@/store/storeTheme';
import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import { Head, Link } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useState } from 'react';

type Paginator = {
    data: CatalogProduct[];
    current_page: number;
    last_page: number;
    total?: number;
};

function readFiltersFromUrl() {
    if (typeof window === 'undefined') {
        return { keyword: '', brandId: '', categoryId: '', subcategoryId: '', genderId: '', featuredOnly: false };
    }
    const p = new URLSearchParams(window.location.search);

    return {
        keyword: p.get('keyword') ?? '',
        brandId: p.get('brand_id') ?? '',
        categoryId: p.get('category_id') ?? '',
        subcategoryId: p.get('subcategory_id') ?? '',
        genderId: p.get('gender_id') ?? '',
        featuredOnly: p.get('featured_only') === 'true',
    };
}

export default function Catalog() {
    return (
        <GuestPanelLayout title="Shop ethnic wear">
            <CatalogContent />
        </GuestPanelLayout>
    );
}

function CatalogContent() {
    const { womenGenderId, shopCategories } = useWomenStore();
    const initial = readFiltersFromUrl();
    const [keyword, setKeyword] = useState(initial.keyword);
    const [brandId, setBrandId] = useState(initial.brandId);
    const [categoryId, setCategoryId] = useState(initial.categoryId);
    const [subcategoryId, setSubcategoryId] = useState(initial.subcategoryId);
    const [featuredOnly, setFeaturedOnly] = useState(initial.featuredOnly);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [payload, setPayload] = useState<Paginator | null>(null);
    const [brands, setBrands] = useState<CatalogBrand[]>([]);
    const [categories, setCategories] = useState<CatalogCategory[]>([]);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const loadProducts = useCallback(
        async (p: number) => {
            setLoading(true);
            setError(null);
            try {
                const res = await catalogProductsList({
                    per_page: 12,
                    current_page: p,
                    keyword: keyword || undefined,
                    brand_id: brandId ? Number(brandId) : undefined,
                    category_id: categoryId ? Number(categoryId) : undefined,
                    subcategory_id: subcategoryId ? Number(subcategoryId) : undefined,
                    gender_id: womenGenderId ?? undefined,
                    featured_only: featuredOnly || undefined,
                });
                if (!res.success || !res.data) {
                    setError(res.message || 'Could not load catalog');
                    setPayload(null);

                    return;
                }
                setPayload(res.data);
            } catch {
                setError('Network error loading catalog.');
                setPayload(null);
            } finally {
                setLoading(false);
            }
        },
        [keyword, brandId, categoryId, subcategoryId, womenGenderId, featuredOnly],
    );

    useEffect(() => {
        void catalogBrandsList().then((brandsRes) => {
            if (brandsRes.success && brandsRes.data) {
                setBrands(brandsRes.data.data);
            }
        });
    }, []);

    useEffect(() => {
        if (shopCategories.length > 0) {
            setCategories(shopCategories);
        }
    }, [shopCategories]);

    useEffect(() => {
        void loadProducts(page);
    }, [loadProducts, page]);

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        setPage(1);
        void loadProducts(1);
    };

    const clearFilters = () => {
        setKeyword('');
        setBrandId('');
        setCategoryId('');
        setSubcategoryId('');
        setFeaturedOnly(false);
        setPage(1);
    };

    const activeCategory = categories.find((c) => String(c.id) === categoryId);
    const subcategories = activeCategory?.subcategories ?? [];

    return (
        <>
            <Head title="Suhaag · Shop" />

            <div className="flex flex-col gap-8 lg:flex-row">
                <button
                    type="button"
                    className={storeFilterToggle}
                    aria-expanded={filtersOpen}
                    onClick={() => setFiltersOpen((o) => !o)}
                >
                    {filtersOpen ? 'Hide filters' : 'Show filters'}
                    <svg
                        className={`h-4 w-4 transition ${filtersOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <aside
                    className={`${storeSidebar} w-full lg:w-64 ${
                        filtersOpen ? 'block' : 'hidden lg:block'
                    }`}
                >
                    <p className={storeSectionEyebrow}>Refine</p>
                    <h2 className="mt-1 font-display text-xl text-stone-900 dark:text-stone-50">
                        Filters
                    </h2>
                    <form onSubmit={onSearch} className="mt-6 space-y-5">
                        <label className="block">
                            <span className={storeLabel}>Search</span>
                            <input
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Name or SKU"
                                className={`${storeInput} mt-1`}
                            />
                        </label>
                        <label className="block">
                            <span className={storeLabel}>Brand</span>
                            <select
                                value={brandId}
                                onChange={(e) => {
                                    setBrandId(e.target.value);
                                    setPage(1);
                                }}
                                className={`${storeInput} mt-1`}
                            >
                                <option value="">All brands</option>
                                {brands.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className={storeLabel}>Category</span>
                            <select
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value);
                                    setSubcategoryId('');
                                    setPage(1);
                                }}
                                className={`${storeInput} mt-1`}
                            >
                                <option value="">All categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {subcategories.length > 0 ? (
                            <label className="block">
                                <span className="text-xs font-medium text-slate-500">
                                    Subcategory
                                </span>
                                <select
                                    value={subcategoryId}
                                    onChange={(e) => {
                                        setSubcategoryId(e.target.value);
                                        setPage(1);
                                    }}
                                    className={`${storeInput} mt-1`}
                                >
                                    <option value="">All</option>
                                    {subcategories.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : null}
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={featuredOnly}
                                onChange={(e) => {
                                    setFeaturedOnly(e.target.checked);
                                    setPage(1);
                                }}
                                className="rounded border-stone-300"
                            />
                            <span className={storeLabel}>New in only</span>
                        </label>
                        <button type="submit" className="w-full bg-stone-900 py-3 text-[11px] font-semibold uppercase tracking-widest text-white dark:bg-stone-100 dark:text-stone-900">
                            Apply
                        </button>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="w-full text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                            Clear filters
                        </button>
                    </form>
                </aside>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <div>
                            <p className={storeSectionEyebrow}>Collection</p>
                            <h2 className={storeSectionTitle}>
                                {payload?.total != null
                                    ? `${payload.total} pieces`
                                    : 'All fashion'}
                            </h2>
                        </div>
                        {brandId || categoryId || keyword ? (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className={storeChip}
                            >
                                Clear all
                            </button>
                        ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
                        {categories.slice(0, 6).map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                    setCategoryId(String(c.id));
                                    setPage(1);
                                }}
                                className={
                                    String(c.id) === categoryId ? storeChipActive : storeChip
                                }
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>

                    {error ? <div className={`mt-4 ${storeErrorBanner}`}>{error}</div> : null}

                    {loading ? (
                        <p className={`mt-8 ${storeMutedText}`}>Loading products…</p>
                    ) : payload && payload.data.length === 0 ? (
                        <p className={`mt-8 ${storeMutedText}`}>
                            No products match your filters.{' '}
                            <Link href={route('guest.catalog')} className="font-medium text-indigo-600">
                                Reset
                            </Link>
                        </p>
                    ) : (
                        <>
                            <div className={`mt-6 ${storeProductGrid}`}>
                                {payload?.data.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            {payload && payload.last_page > 1 ? (
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
                                        Page {payload.current_page} of {payload.last_page}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={page >= payload.last_page}
                                        onClick={() => setPage((p) => p + 1)}
                                        className={storePaginationBtn}
                                    >
                                        Next
                                    </button>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
