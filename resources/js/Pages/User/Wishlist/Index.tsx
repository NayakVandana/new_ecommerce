import { cartStore } from '@/api/cartClient';
import {
    wishlistImageSrc,
    wishlistStore,
    type WishlistLineItem,
    type WishlistPayload,
} from '@/api/wishlistClient';
import { formatStorePrice } from '@/store/productUtils';
import {
    storeBtnPrimary,
    storeBtnSecondary,
    storeCard,
    storeErrorBanner,
    storeMutedText,
    storeWishlistActionBtn,
    storeWishlistActions,
    storeWishlistLine,
    storeWishlistLineBody,
} from '@/store/storeTheme';
import UserPanelLayout from '@/Layouts/User/UserPanelLayout';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export default function Index() {
    const [wishlist, setWishlist] = useState<WishlistPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        wishlistStore
            .list()
            .then((res) => {
                if (res.success && res.data) {
                    setWishlist(res.data);
                    setError(null);
                } else {
                    setError(res.message || 'Could not load wishlist.');
                }
            })
            .catch(() => setError('Could not load wishlist.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
        window.addEventListener('wishlistUpdated', load);

        return () => window.removeEventListener('wishlistUpdated', load);
    }, [load]);

    const removeItem = async (item: WishlistLineItem) => {
        setBusyId(item.id);
        try {
            const res = await wishlistStore.remove(item.id);
            if (res.success && res.data) {
                setWishlist(res.data);
            } else {
                setError(res.message || 'Could not remove item.');
            }
        } catch {
            setError('Could not remove item.');
        } finally {
            setBusyId(null);
        }
    };

    const addToBag = async (item: WishlistLineItem) => {
        if (!item.in_stock) {
            return;
        }

        setBusyId(item.id);
        try {
            const res = await cartStore.add(item.product_variant_id, 1);
            if (!res.success) {
                setError(res.message || 'Could not add to bag.');
            }
        } catch {
            setError('Could not add to bag.');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <UserPanelLayout title="Wishlist">
            <Head title="My wishlist" />

            {error ? <div className={`mb-4 ${storeErrorBanner}`}>{error}</div> : null}

            {loading ? <p className={storeMutedText}>Loading wishlist…</p> : null}

            {!loading && wishlist && wishlist.items.length === 0 ? (
                <div className={storeCard}>
                    <p className={storeMutedText}>Your wishlist is empty.</p>
                    <Link href={route('guest.catalog')} className={`${storeBtnPrimary} mt-4 inline-flex`}>
                        Browse collection
                    </Link>
                </div>
            ) : null}

            {!loading && wishlist && wishlist.items.length > 0 ? (
                <ul className="space-y-4">
                    {wishlist.items.map((item) => {
                        const img = wishlistImageSrc(item.image_path);

                        return (
                            <li key={item.id} className={storeWishlistLine}>
                                <div className={storeWishlistLineBody}>
                                    <Link
                                        href={route('guest.product.show', item.product_slug)}
                                        className="h-20 w-20 shrink-0 overflow-hidden bg-stone-200 sm:h-24 sm:w-24 dark:bg-stone-800"
                                    >
                                        {img ? (
                                            <img
                                                src={img}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="flex h-full items-center justify-center text-xs text-stone-400">
                                                No image
                                            </span>
                                        )}
                                    </Link>
                                    <div className="min-w-0 flex-1 py-0.5">
                                        <Link
                                            href={route('guest.product.show', item.product_slug)}
                                            className="font-medium leading-snug text-stone-900 hover:underline dark:text-stone-50"
                                        >
                                            {item.product_name}
                                        </Link>
                                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                            {item.variant_label}
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-stone-900 dark:text-stone-50">
                                            {formatStorePrice(item.unit_price)}
                                        </p>
                                        {!item.in_stock ? (
                                            <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                                                Out of stock
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                                <div className={storeWishlistActions}>
                                    <button
                                        type="button"
                                        disabled={!item.in_stock || busyId === item.id}
                                        onClick={() => void addToBag(item)}
                                        className={`${storeBtnPrimary} ${storeWishlistActionBtn} disabled:opacity-50`}
                                    >
                                        {busyId === item.id ? 'Adding…' : 'Add to bag'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={busyId === item.id}
                                        onClick={() => void removeItem(item)}
                                        className={`${storeBtnSecondary} ${storeWishlistActionBtn}`}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </UserPanelLayout>
    );
}
