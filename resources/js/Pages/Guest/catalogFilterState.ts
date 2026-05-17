export type CatalogAppliedFilters = {
    keyword: string;
    color: string;
    categoryId: string;
    subcategoryId: string;
    featuredOnly: boolean;
};

export function readCatalogFiltersFromUrl(): CatalogAppliedFilters {
    if (typeof window === 'undefined') {
        return {
            keyword: '',
            color: '',
            categoryId: '',
            subcategoryId: '',
            featuredOnly: false,
        };
    }

    const p = new URLSearchParams(window.location.search);

    return {
        keyword: p.get('keyword') ?? '',
        color: p.get('color') ?? '',
        categoryId: p.get('category_id') ?? '',
        subcategoryId: p.get('subcategory_id') ?? '',
        featuredOnly: p.get('featured_only') === 'true',
    };
}

export function syncCatalogFiltersToUrl(filters: CatalogAppliedFilters): void {
    if (typeof window === 'undefined') {
        return;
    }

    const p = new URLSearchParams();

    if (filters.keyword) {
        p.set('keyword', filters.keyword);
    }
    if (filters.color) {
        p.set('color', filters.color);
    }
    if (filters.categoryId) {
        p.set('category_id', filters.categoryId);
    }
    if (filters.subcategoryId) {
        p.set('subcategory_id', filters.subcategoryId);
    }
    if (filters.featuredOnly) {
        p.set('featured_only', 'true');
    }

    const qs = p.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    const current = `${window.location.pathname}${window.location.search}`;

    if (next !== current) {
        window.history.replaceState(null, '', next);
    }
}

export const emptyCatalogFilters: CatalogAppliedFilters = {
    keyword: '',
    color: '',
    categoryId: '',
    subcategoryId: '',
    featuredOnly: false,
};

export function catalogFiltersEqual(
    a: CatalogAppliedFilters,
    b: CatalogAppliedFilters,
): boolean {
    return (
        a.keyword === b.keyword &&
        a.color === b.color &&
        a.categoryId === b.categoryId &&
        a.subcategoryId === b.subcategoryId &&
        a.featuredOnly === b.featuredOnly
    );
}
