import {
    cartImageSrc,
    cartStore,
    type CartLineItem,
    type CartPayload,
} from '@/api/cartClient';
import { formatMoney } from '@/store/orderStatus';
import {
    storeBtnPrimary,
    storeBtnSecondary,
    storeCard,
    storeCartLine,
    storeCartLineBody,
    storeErrorBanner,
    storeInput,
    storeMutedText,
} from '@/store/storeTheme';
import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import { useAuthUser } from '@/auth/useAuthUser';
import { redirectToLogin } from '@/utils/requireAuth';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export default function Cart() {
    const { user, loading: authLoading } = useAuthUser();
    const [cart, setCart] = useState<CartPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        cartStore
            .list()
            .then((res) => {
                if (res.success && res.data) {
                    setCart(res.data);
                    setError(null);
                } else {
                    setError(res.message || 'Could not load cart.');
                }
            })
            .catch(() => setError('Could not load cart.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            redirectToLogin(route('guest.cart'));

            return;
        }
        if (!user) {
            return;
        }
        load();
        window.addEventListener('cartUpdated', load);

        return () => window.removeEventListener('cartUpdated', load);
    }, [load, user, authLoading]);

    const updateQty = async (item: CartLineItem, quantity: number) => {
        if (quantity < 1) {
            return;
        }
        setBusyId(item.id);
        try {
            const res = await cartStore.update(item.id, quantity);
            if (res.success && res.data) {
                setCart(res.data);
            } else {
                setError(res.message || 'Could not update quantity.');
            }
        } catch {
            setError('Could not update quantity.');
        } finally {
            setBusyId(null);
        }
    };

    const removeItem = async (item: CartLineItem) => {
        setBusyId(item.id);
        try {
            const res = await cartStore.remove(item.id);
            if (res.success && res.data) {
                setCart(res.data);
            } else {
                setError(res.message || 'Could not remove item.');
            }
        } catch {
            setError('Could not remove item.');
        } finally {
            setBusyId(null);
        }
    };

    const clearCart = async () => {
        if (!confirm('Clear all items from your cart?')) {
            return;
        }
        setLoading(true);
        try {
            const res = await cartStore.clear();
            if (res.success && res.data) {
                setCart(res.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const items = cart?.items ?? [];

    return (
        <GuestPanelLayout title="Shopping bag">
            <Head title="Suhaag · Bag" />

            {error ? <div className={`mb-6 ${storeErrorBanner}`}>{error}</div> : null}

            {loading ? (
                <p className={storeMutedText}>Loading cart…</p>
            ) : items.length === 0 ? (
                <div className={`${storeCard} mx-auto max-w-lg text-center`}>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Your cart is empty
                    </h2>
                    <p className={`mt-2 ${storeMutedText}`}>
                        Browse the catalog and add items to your cart.
                    </p>
                    <Link href={route('guest.catalog')} className={`${storeBtnPrimary} mt-6 inline-flex`}>
                        Browse products
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                    <ul className="space-y-4">
                        {items.map((item) => {
                            const src = cartImageSrc(item.image_path);

                            return (
                                <li key={item.id} className={storeCartLine}>
                                    <div className={storeCartLineBody}>
                                        <Link
                                            href={route('guest.catalog')}
                                            className="h-20 w-20 shrink-0 overflow-hidden bg-stone-200 sm:h-24 sm:w-24 dark:bg-stone-800"
                                        >
                                        {src ? (
                                            <img
                                                src={src}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                No image
                                            </div>
                                        )}
                                    </Link>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-stone-900 dark:text-stone-50">
                                                {item.product_name}
                                            </p>
                                            <p className="text-xs text-stone-500">{item.variant_label}</p>
                                            <p className="mt-1 text-sm font-medium text-stone-800 dark:text-stone-200">
                                                {formatMoney(item.unit_price, cart?.currency ?? 'INR')}
                                            </p>
                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <span className="text-stone-500">Qty</span>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={item.stock_quantity}
                                                        value={item.quantity}
                                                        disabled={busyId === item.id}
                                                        onChange={(e) =>
                                                            void updateQty(
                                                                item,
                                                                Number(e.target.value),
                                                            )
                                                        }
                                                        className={`${storeInput} w-20 py-1`}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    disabled={busyId === item.id}
                                                    onClick={() => void removeItem(item)}
                                                    className="min-h-10 text-sm font-medium text-red-600 dark:text-red-400"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-stone-900 sm:text-right dark:text-stone-50">
                                        {formatMoney(item.line_total, cart?.currency ?? 'INR')}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>

                    <aside className={`${storeCard} h-fit lg:sticky lg:top-24`}>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Order summary
                        </h2>
                        <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Items ({cart?.count ?? 0})</dt>
                                <dd className="font-medium text-slate-900 dark:text-white">
                                    {formatMoney(cart?.subtotal ?? 0, cart?.currency ?? 'INR')}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Shipping</dt>
                                <dd className="text-slate-600 dark:text-slate-400">Calculated at checkout</dd>
                            </div>
                        </dl>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                            <span className="font-semibold text-slate-900 dark:text-white">Subtotal</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                {formatMoney(cart?.subtotal ?? 0, cart?.currency ?? 'INR')}
                            </span>
                        </div>
                        <p className={`mt-2 ${storeMutedText}`}>
                            Tax and shipping calculated at checkout.
                        </p>
                        <div className="mt-6 flex flex-col gap-3">
                            <span className={`${storeBtnPrimary} cursor-not-allowed text-center opacity-60`}>
                                Checkout (coming soon)
                            </span>
                            <Link href={route('guest.catalog')} className={`${storeBtnSecondary} text-center`}>
                                Continue shopping
                            </Link>
                            <button
                                type="button"
                                onClick={() => void clearCart()}
                                className="text-sm font-medium text-red-600 dark:text-red-400"
                            >
                                Clear cart
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </GuestPanelLayout>
    );
}
