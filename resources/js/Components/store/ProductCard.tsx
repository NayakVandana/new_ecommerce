import { cartStore } from '@/api/cartClient';
import type { CatalogProduct } from '@/store/catalogTypes';
import StorePriceDisplay from '@/Components/store/StorePriceDisplay';
import {
    pickVariant,
    productPrimaryImage,
    variantLabel,
} from '@/store/productUtils';
import WishlistToggleButton from '@/Components/store/WishlistToggleButton';
import {
    storeBtnPrimary,
    storeBtnSecondary,
    storeProductCard,
    storeProductImageWrap,
} from '@/store/storeTheme';
import { redirectToLogin } from '@/utils/requireAuth';
import { useAuthUser } from '@/auth/useAuthUser';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Props = {
    product: CatalogProduct;
    compact?: boolean;
};

export default function ProductCard({ product, compact = false }: Props) {
    const { isLoggedIn } = useAuthUser();
    const variants = product.variants ?? [];
    const defaultVariant = pickVariant(product);
    const [variantId, setVariantId] = useState(defaultVariant?.id ?? 0);
    const [adding, setAdding] = useState(false);

    const activeVariant =
        variants.find((v) => v.id === variantId) ?? defaultVariant;
    const imageSrc = productPrimaryImage(product);
    const outOfStock = !activeVariant || activeVariant.stock_quantity < 1;

    const addToCart = async (goCheckout: boolean) => {
        if (!isLoggedIn) {
            redirectToLogin(
                goCheckout ? route('guest.cart') : route('guest.product.show', product.slug),
            );

            return;
        }

        const id = variantId || defaultVariant?.id;
        if (!id) {
            return;
        }

        setAdding(true);
        try {
            const res = await cartStore.add(id, 1);
            if (res.success && goCheckout) {
                router.visit(route('guest.cart'));
            }
        } finally {
            setAdding(false);
        }
    };

    return (
        <article className={storeProductCard}>
            <Link
                href={route('guest.product.show', product.slug)}
                className={`${storeProductImageWrap} relative`}
            >
                {activeVariant ? (
                    <WishlistToggleButton
                        productVariantId={activeVariant.id}
                        overlay
                    />
                ) : null}
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        No image
                    </div>
                )}
                {product.is_featured ? (
                    <span className="absolute left-0 top-3 bg-stone-900 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
                        New
                    </span>
                ) : null}
            </Link>

            <div className={`flex flex-1 flex-col ${compact ? 'p-3' : 'p-4'}`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                    {[
                        product.subcategory?.category?.name,
                        product.brand?.name,
                    ]
                        .filter(Boolean)
                        .join(' · ') || 'Ethnic wear'}
                </p>
                <Link
                    href={route('guest.product.show', product.slug)}
                    className="mt-1 font-display text-lg leading-snug text-stone-900 hover:underline dark:text-stone-50"
                >
                    {product.name}
                </Link>
                {activeVariant ? (
                    <StorePriceDisplay
                        variant={activeVariant}
                        className="mt-2"
                    />
                ) : null}

                {!compact && variants.length > 1 ? (
                    <label className="mt-3 block">
                        <span className="text-xs font-medium text-slate-500">Variant</span>
                        <select
                            value={variantId}
                            onChange={(e) => setVariantId(Number(e.target.value))}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
                        >
                            {variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {variantLabel(v)}
                                    {v.stock_quantity < 1 ? ' (out of stock)' : ''}
                                </option>
                            ))}
                        </select>
                    </label>
                ) : null}

                <div className="mt-auto flex flex-col gap-2 pt-4">
                    <button
                        type="button"
                        disabled={outOfStock || adding}
                        onClick={() => void addToCart(false)}
                        className={`${storeBtnPrimary} w-full disabled:opacity-50`}
                    >
                        {adding ? 'Adding…' : outOfStock ? 'Sold out' : 'Add to bag'}
                    </button>
                    {!compact ? (
                        <button
                            type="button"
                            disabled={outOfStock || adding}
                            onClick={() => void addToCart(true)}
                            className={`${storeBtnSecondary} w-full disabled:opacity-50`}
                        >
                            Buy now
                        </button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
