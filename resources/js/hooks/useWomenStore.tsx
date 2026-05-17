import { catalogCategoriesList, catalogGendersList } from '@/api/catalogClient';
import type { CatalogCategory, CatalogGender } from '@/store/catalogTypes';
import { SHOP_CATEGORY_SLUGS } from '@/store/fashionBrand';
import { womenStoreCache } from '@/store/womenStoreCache';
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';

type WomenStoreValue = {
    ready: boolean;
    womenGenderId: number | null;
    shopCategories: CatalogCategory[];
    defaultProductFilters: { gender_id?: number };
};

const WomenStoreContext = createContext<WomenStoreValue | null>(null);

export function WomenStoreProvider({ children }: PropsWithChildren) {
    const [womenGenderId, setWomenGenderId] = useState<number | null>(
        womenStoreCache.womenGenderId,
    );
    const [shopCategories, setShopCategories] = useState<CatalogCategory[]>(
        womenStoreCache.shopCategories,
    );
    const [ready, setReady] = useState(womenStoreCache.ready);

    useEffect(() => {
        if (womenStoreCache.ready) {
            return;
        }

        let cancelled = false;

        void Promise.all([catalogGendersList(), catalogCategoriesList()]).then(
            ([gendersRes, categoriesRes]) => {
                if (cancelled) {
                    return;
                }

                let nextWomenId = womenStoreCache.womenGenderId;
                let nextCategories = womenStoreCache.shopCategories;

                if (gendersRes.success && gendersRes.data?.length) {
                    const women =
                        gendersRes.data.find((g: CatalogGender) => g.slug === 'women') ??
                        gendersRes.data[0];
                    nextWomenId = women.id;
                    setWomenGenderId(women.id);
                }

                if (categoriesRes.success && categoriesRes.data) {
                    const ordered = SHOP_CATEGORY_SLUGS.map((slug) =>
                        categoriesRes.data.find((c) => c.slug === slug),
                    ).filter((c): c is CatalogCategory => c != null);
                    nextCategories = ordered;
                    setShopCategories(ordered);
                }

                womenStoreCache.ready = true;
                womenStoreCache.womenGenderId = nextWomenId;
                womenStoreCache.shopCategories = nextCategories;
                setReady(true);
            },
        );

        return () => {
            cancelled = true;
        };
    }, []);

    const defaultProductFilters = useMemo(
        () => (womenGenderId ? { gender_id: womenGenderId } : {}),
        [womenGenderId],
    );

    const value = useMemo(
        () => ({
            ready,
            womenGenderId,
            shopCategories,
            defaultProductFilters,
        }),
        [ready, womenGenderId, shopCategories, defaultProductFilters],
    );

    return (
        <WomenStoreContext.Provider value={value}>{children}</WomenStoreContext.Provider>
    );
}

export function useWomenStore(): WomenStoreValue {
    const context = useContext(WomenStoreContext);

    if (!context) {
        throw new Error('useWomenStore must be used within WomenStoreProvider');
    }

    return context;
}
