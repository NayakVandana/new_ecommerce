import { catalogCategoriesList, catalogGendersList } from '@/api/catalogClient';
import type { CatalogCategory, CatalogGender } from '@/store/catalogTypes';
import { SHOP_CATEGORY_SLUGS } from '@/store/fashionBrand';
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
    const [womenGenderId, setWomenGenderId] = useState<number | null>(null);
    const [shopCategories, setShopCategories] = useState<CatalogCategory[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        void Promise.all([catalogGendersList(), catalogCategoriesList()]).then(
            ([gendersRes, categoriesRes]) => {
                if (cancelled) {
                    return;
                }

                if (gendersRes.success && gendersRes.data?.length) {
                    const women =
                        gendersRes.data.find((g: CatalogGender) => g.slug === 'women') ??
                        gendersRes.data[0];
                    setWomenGenderId(women.id);
                }

                if (categoriesRes.success && categoriesRes.data) {
                    const ordered = SHOP_CATEGORY_SLUGS.map((slug) =>
                        categoriesRes.data.find((c) => c.slug === slug),
                    ).filter((c): c is CatalogCategory => c != null);
                    setShopCategories(ordered);
                }

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
