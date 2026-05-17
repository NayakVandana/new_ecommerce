import { wishlistStore } from '@/api/wishlistClient';
import { useAuthUser } from '@/auth/useAuthUser';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';

type WishlistContextValue = {
    variantIds: Set<number>;
    count: number;
    ready: boolean;
    isSaved: (productVariantId: number) => boolean;
    refresh: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: PropsWithChildren) {
    const { user } = useAuthUser();
    const [variantIds, setVariantIds] = useState<Set<number>>(new Set());
    const [count, setCount] = useState(0);
    const [ready, setReady] = useState(false);

    const refresh = useCallback(() => {
        if (!user) {
            setVariantIds(new Set());
            setCount(0);
            setReady(true);

            return;
        }

        void wishlistStore.list().then((res) => {
            if (res.success && res.data) {
                setVariantIds(new Set(res.data.variant_ids));
                setCount(res.data.count);
            }
            setReady(true);
        });
    }, [user]);

    useEffect(() => {
        setReady(false);
        refresh();
        window.addEventListener('wishlistUpdated', refresh);

        return () => window.removeEventListener('wishlistUpdated', refresh);
    }, [refresh]);

    const value = useMemo(
        () => ({
            variantIds,
            count,
            ready,
            isSaved: (productVariantId: number) => variantIds.has(productVariantId),
            refresh,
        }),
        [variantIds, count, ready, refresh],
    );

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
    const context = useContext(WishlistContext);

    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }

    return context;
}
