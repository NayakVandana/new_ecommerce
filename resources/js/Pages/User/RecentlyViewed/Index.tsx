import ProductCard from '@/Components/store/ProductCard';
import { recentlyViewedStore, type RecentlyViewedItem } from '@/api/recentlyViewedClient';
import {
    storeBtnPrimary,
    storeBtnSecondary,
    storeCard,
    storeErrorBanner,
    storeMutedText,
    storeProductGrid,
} from '@/store/storeTheme';
import UserPanelLayout from '@/Layouts/User/UserPanelLayout';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export default function Index() {
    const [items, setItems] = useState<RecentlyViewedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clearing, setClearing] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        recentlyViewedStore
            .list(24)
            .then((res) => {
                if (res.success && res.data) {
                    setItems(res.data.items);
                    setError(null);
                } else {
                    setError(res.message || 'Could not load recently viewed.');
                }
            })
            .catch(() => setError('Could not load recently viewed.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const clearAll = async () => {
        if (!confirm('Clear your recently viewed history?')) {
            return;
        }

        setClearing(true);
        try {
            const res = await recentlyViewedStore.clear();
            if (res.success) {
                setItems([]);
            } else {
                setError(res.message || 'Could not clear history.');
            }
        } catch {
            setError('Could not clear history.');
        } finally {
            setClearing(false);
        }
    };

    return (
        <UserPanelLayout title="Recently viewed">
            <Head title="Recently viewed" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className={storeMutedText}>
                    Products you opened while signed in. Guests are not tracked.
                </p>
                {items.length > 0 ? (
                    <button
                        type="button"
                        disabled={clearing}
                        onClick={() => void clearAll()}
                        className={storeBtnSecondary}
                    >
                        {clearing ? 'Clearing…' : 'Clear history'}
                    </button>
                ) : null}
            </div>

            {error ? <div className={`mb-4 ${storeErrorBanner}`}>{error}</div> : null}

            {loading ? <p className={storeMutedText}>Loading…</p> : null}

            {!loading && items.length === 0 ? (
                <div className={storeCard}>
                    <p className={storeMutedText}>You have not viewed any products yet.</p>
                    <Link href={route('guest.catalog')} className={`${storeBtnPrimary} mt-4 inline-flex`}>
                        Browse collection
                    </Link>
                </div>
            ) : null}

            {!loading && items.length > 0 ? (
                <div className={storeProductGrid}>
                    {items.map((item) => (
                        <ProductCard key={item.product_id} product={item} compact />
                    ))}
                </div>
            ) : null}
        </UserPanelLayout>
    );
}
