import { cartStore } from '@/api/cartClient';
import {
    storeBtnPrimary,
    storeBtnSecondary,
    storeCard,
    storeErrorBanner,
    storeInput,
    storeMutedText,
    storePaginationBtn,
    storePaginationRow,
} from '@/store/storeTheme';
import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import { useAuthUser } from '@/auth/useAuthUser';
import { redirectToLogin } from '@/utils/requireAuth';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

type VariantRow = {
    id: number;
    sku: string;
    price: string | number;
    size?: string | null;
    color?: string | null;
    stock_quantity: number;
    is_default?: boolean;
};

type ProductRow = {
    id: number;
    name: string;
    slug: string;
    status: string;
    is_featured: boolean;
    brand?: { name: string } | null;
    variants?: VariantRow[];
};

type PaginatorPayload = {
    data: ProductRow[];
    current_page: number;
    last_page: number;
};

type ApiListResponse = {
    success: boolean;
    message: string;
    data: PaginatorPayload;
};

function pickVariant(product: ProductRow): VariantRow | null {
    const variants = product.variants ?? [];
    if (variants.length === 0) {
        return null;
    }

    return variants.find((v) => v.is_default) ?? variants[0];
}

function variantLabel(v: VariantRow): string {
    const parts = [v.size, v.color].filter(Boolean);

    return parts.length > 0 ? parts.join(' · ') : v.sku;
}

export default function Catalog() {
    const { isLoggedIn } = useAuthUser();

    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [payload, setPayload] = useState<PaginatorPayload | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<Record<number, number>>({});
    const [addingId, setAddingId] = useState<number | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const load = async (p: number, kw: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await window.axios.post<ApiListResponse>('/api/v1/catalog/products/list', {
                per_page: 12,
                current_page: p,
                keyword: kw || undefined,
                status: 'published',
            });
            if (!res.data.success || !res.data.data) {
                setError(res.data.message || 'Could not load catalog');
                setPayload(null);

                return;
            }
            setPayload(res.data.data);
            const defaults: Record<number, number> = {};
            for (const product of res.data.data.data) {
                const v = pickVariant(product);
                if (v) {
                    defaults[product.id] = v.id;
                }
            }
            setSelectedVariant(defaults);
        } catch {
            setError('Network error loading catalog.');
            setPayload(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load(1, '');
    }, []);

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        setPage(1);
        void load(1, keyword);
    };

    const goPage = (p: number) => {
        setPage(p);
        void load(p, keyword);
    };

    const addToCart = async (product: ProductRow, goCheckout = false) => {
        if (!isLoggedIn) {
            redirectToLogin(goCheckout ? route('guest.cart') : undefined);

            return;
        }

        const variantId = selectedVariant[product.id] ?? pickVariant(product)?.id;
        if (!variantId) {
            setToast('No variant available for this product.');

            return;
        }

        setAddingId(product.id);
        setToast(null);
        try {
            const res = await cartStore.add(variantId, 1);
            if (!res.success) {
                setToast(res.message || 'Could not add to cart.');

                return;
            }
            setToast(`${product.name} added to cart.`);
            if (goCheckout) {
                router.visit(route('guest.cart'));
            }
        } catch {
            setToast('Could not add to cart.');
        } finally {
            setAddingId(null);
        }
    };

    return (
        <GuestPanelLayout title="Browse">
            <Head title="Store · Browse" />
            <form onSubmit={onSearch} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search products"
                    className={`${storeInput} max-w-md`}
                />
                <button type="submit" className={storeBtnPrimary}>
                    Search
                </button>
            </form>

            {toast ? (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                    {toast}
                </div>
            ) : null}

            {error ? <div className={`mb-4 ${storeErrorBanner}`}>{error}</div> : null}

            {loading ? (
                <p className={storeMutedText}>Loading products…</p>
            ) : payload && payload.data.length === 0 ? (
                <p className={storeMutedText}>No products found. Try another search or seed the database.</p>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {payload?.data.map((product) => {
                            const variants = product.variants ?? [];
                            const activeVariantId =
                                selectedVariant[product.id] ?? pickVariant(product)?.id;
                            const activeVariant =
                                variants.find((v) => v.id === activeVariantId) ??
                                pickVariant(product);
                            const price = activeVariant?.price;
                            const outOfStock =
                                !activeVariant || activeVariant.stock_quantity < 1;

                            return (
                                <article
                                    key={product.id}
                                    className={`${storeCard} flex flex-col`}
                                >
                                    {product.is_featured ? (
                                        <span className="mb-2 w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                            Featured
                                        </span>
                                    ) : null}
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {product.name}
                                    </h2>
                                    {product.brand ? (
                                        <p className="text-xs font-medium uppercase text-slate-500">
                                            {product.brand.name}
                                        </p>
                                    ) : null}
                                    {variants.length > 1 ? (
                                        <label className="mt-3 block">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                                Variant
                                            </span>
                                            <select
                                                value={activeVariantId ?? ''}
                                                onChange={(e) =>
                                                    setSelectedVariant((prev) => ({
                                                        ...prev,
                                                        [product.id]: Number(e.target.value),
                                                    }))
                                                }
                                                className={`${storeInput} mt-1`}
                                            >
                                                {variants.map((v) => (
                                                    <option key={v.id} value={v.id}>
                                                        {variantLabel(v)} — {v.price}
                                                        {v.stock_quantity < 1
                                                            ? ' (out of stock)'
                                                            : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    ) : activeVariant ? (
                                        <p className="mt-2 text-xs text-slate-500">
                                            {variantLabel(activeVariant)}
                                        </p>
                                    ) : null}
                                    {price !== undefined ? (
                                        <p className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                                            {price} INR
                                        </p>
                                    ) : (
                                        <p className="mt-4 text-sm text-slate-400">
                                            No variant price
                                        </p>
                                    )}
                                    <div className="mt-auto flex flex-col gap-2 pt-4">
                                        <button
                                            type="button"
                                            disabled={outOfStock || addingId === product.id}
                                            onClick={() => void addToCart(product, false)}
                                            className={`${storeBtnPrimary} w-full disabled:opacity-50`}
                                        >
                                            {addingId === product.id
                                                ? 'Adding…'
                                                : outOfStock
                                                  ? 'Out of stock'
                                                  : 'Add to cart'}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={outOfStock || addingId === product.id}
                                            onClick={() => void addToCart(product, true)}
                                            className={`${storeBtnSecondary} w-full disabled:opacity-50`}
                                        >
                                            Buy now
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    {payload && payload.last_page > 1 ? (
                        <div className={storePaginationRow}>
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => goPage(page - 1)}
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
                                onClick={() => goPage(page + 1)}
                                className={storePaginationBtn}
                            >
                                Next
                            </button>
                        </div>
                    ) : null}
                </>
            )}
        </GuestPanelLayout>
    );
}
