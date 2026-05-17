import { cartStore } from '@/api/cartClient';
import { catalogProductShow } from '@/api/catalogClient';
import type { CatalogProduct, CatalogVariant } from '@/store/catalogTypes';
import {
    formatStorePrice,
    pickVariant,
    productImageSrc,
    productPrimaryImage,
    variantLabel,
} from '@/store/productUtils';
import {
    storeBtnPrimary,
    storeBtnSecondary,
    storeCard,
    storeErrorBanner,
    storeHeroBtn,
    storeInput,
    storeLabel,
    storeMutedText,
} from '@/store/storeTheme';
import WishlistToggleButton from '@/Components/store/WishlistToggleButton';
import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import { redirectToLogin } from '@/utils/requireAuth';
import { useAuthUser } from '@/auth/useAuthUser';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function ProductShow({ productSlug }: { productSlug: string }) {
    const { isLoggedIn } = useAuthUser();
    const [product, setProduct] = useState<CatalogProduct | null>(null);
    const [variantId, setVariantId] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        catalogProductShow(productSlug)
            .then((res) => {
                if (!res.success || !res.data) {
                    setError(res.message || 'Product not found');
                    setProduct(null);

                    return;
                }
                setProduct(res.data);
                const v = pickVariant(res.data);
                if (v) {
                    setVariantId(v.id);
                }
            })
            .catch(() => setError('Could not load product.'))
            .finally(() => setLoading(false));
    }, [productSlug]);

    const variants = product?.variants ?? [];
    const activeVariant: CatalogVariant | null =
        variants.find((v) => v.id === variantId) ?? (product ? pickVariant(product) : null);
    const gallery =
        product?.images?.map((img) => productImageSrc(img.path)).filter(Boolean) ?? [];
    const heroImage = gallery[0] || (product ? productPrimaryImage(product) : '');
    const outOfStock = !activeVariant || activeVariant.stock_quantity < 1;

    const addToCart = async (goCheckout: boolean) => {
        if (!isLoggedIn) {
            redirectToLogin(
                goCheckout ? route('guest.cart') : route('guest.product.show', productSlug),
            );

            return;
        }

        if (!activeVariant) {
            return;
        }

        setAdding(true);
        setToast(null);
        try {
            const res = await cartStore.add(activeVariant.id, 1);
            if (!res.success) {
                setToast(res.message || 'Could not add to cart.');

                return;
            }
            setToast('Added to cart.');
            if (goCheckout) {
                router.visit(route('guest.cart'));
            }
        } catch {
            setToast('Could not add to cart.');
        } finally {
            setAdding(false);
        }
    };

    return (
        <GuestPanelLayout title={product?.name ?? 'Product'}>
            <Head title={product ? `Suhaag · ${product.name}` : 'Suhaag · Product'} />

            <p className="mb-4 text-sm sm:mb-6">
                <Link
                    href={route('guest.catalog')}
                    className="font-medium text-stone-700 underline-offset-4 hover:underline dark:text-stone-300"
                >
                    ← Back to browse
                </Link>
            </p>

            {error ? <div className={storeErrorBanner}>{error}</div> : null}
            {loading ? <p className={storeMutedText}>Loading product…</p> : null}

            {!loading && product ? (
                <div className="grid gap-6 sm:gap-10 lg:grid-cols-2">
                    <div className="space-y-3">
                        <div className="relative aspect-[3/4] overflow-hidden bg-stone-200 sm:aspect-square dark:bg-stone-800">
                            {activeVariant ? (
                                <WishlistToggleButton
                                    productVariantId={activeVariant.id}
                                    overlay
                                />
                            ) : null}
                            {heroImage ? (
                                <img
                                    src={heroImage}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-400">
                                    No image
                                </div>
                            )}
                        </div>
                        {gallery.length > 1 ? (
                            <div className="flex gap-2 overflow-x-auto">
                                {gallery.map((src) => (
                                    <img
                                        key={src}
                                        src={src}
                                        alt=""
                                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div>
                        {product.brand ? (
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {product.brand.name}
                            </p>
                        ) : null}
                        <h1 className="mt-1 font-display text-2xl font-medium text-stone-900 dark:text-stone-50 sm:text-3xl lg:text-4xl">
                            {product.name}
                        </h1>
                        {product.subcategory?.category ? (
                            <p className={`mt-2 ${storeMutedText}`}>
                                {product.subcategory.category.name} · {product.subcategory.name}
                            </p>
                        ) : null}
                        {activeVariant ? (
                            <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                                {formatStorePrice(activeVariant.price)}
                            </p>
                        ) : null}

                        {product.summary ? (
                            <p className={`mt-4 ${storeMutedText}`}>{product.summary}</p>
                        ) : null}

                        {variants.length > 0 ? (
                            <label className="mt-6 block">
                                <span className={storeLabel}>Variant</span>
                                <select
                                    value={variantId}
                                    onChange={(e) => setVariantId(Number(e.target.value))}
                                    className={`${storeInput} mt-2 max-w-md`}
                                >
                                    {variants.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {variantLabel(v)} — {formatStorePrice(v.price)}
                                            {v.stock_quantity < 1 ? ' (out of stock)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : null}

                        {toast ? (
                            <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                {toast}
                            </p>
                        ) : null}

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <button
                                type="button"
                                disabled={outOfStock || adding}
                                onClick={() => void addToCart(false)}
                                className={`${storeBtnPrimary} ${storeHeroBtn} disabled:opacity-50`}
                            >
                                {adding ? 'Adding…' : outOfStock ? 'Out of stock' : 'Add to cart'}
                            </button>
                            <button
                                type="button"
                                disabled={outOfStock || adding}
                                onClick={() => void addToCart(true)}
                                className={`${storeBtnSecondary} ${storeHeroBtn} disabled:opacity-50`}
                            >
                                Buy now
                            </button>
                        </div>

                        {product.description ? (
                            <div className={`${storeCard} mt-8`}>
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Description
                                </h2>
                                <p className={`mt-3 whitespace-pre-line ${storeMutedText}`}>
                                    {product.description}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </GuestPanelLayout>
    );
}
