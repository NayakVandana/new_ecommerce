import type { CatalogAppliedFilters } from '@/Pages/Guest/catalogFilterState';
import type { CatalogProduct } from '@/store/catalogTypes';

type CachedPaginator = {
    data: CatalogProduct[];
    current_page: number;
    last_page: number;
    total?: number;
};

let lastKey = '';
let lastPayload: CachedPaginator | null = null;

export function catalogProductsCacheKey(
    filters: CatalogAppliedFilters,
    page: number,
    womenGenderId: number | null,
): string {
    return JSON.stringify({
        keyword: filters.keyword,
        color: filters.color,
        categoryId: filters.categoryId,
        subcategoryId: filters.subcategoryId,
        featuredOnly: filters.featuredOnly,
        page,
        womenGenderId,
    });
}

export function peekCatalogProductsCache(key: string): CachedPaginator | null {
    return key === lastKey ? lastPayload : null;
}

export function setCatalogProductsCache(key: string, payload: CachedPaginator): void {
    lastKey = key;
    lastPayload = payload;
}
