import { catalogColorsList } from '@/api/catalogClient';
import type { CatalogAppliedFilters } from '@/Pages/Guest/catalogFilterState';
import { emptyCatalogFilters } from '@/Pages/Guest/catalogFilterState';
import type { CatalogCategory, CatalogColorOption } from '@/store/catalogTypes';
import {
    storeFilterToggle,
    storeInput,
    storeLabel,
    storeSectionEyebrow,
    storeSidebar,
} from '@/store/storeTheme';
import { FormEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type CatalogFiltersSidebarProps = {
    categories: CatalogCategory[];
    womenGenderId: number | null;
    applied: CatalogAppliedFilters;
    onApply: (next: CatalogAppliedFilters) => void;
    filtersOpen: boolean;
    onFiltersOpenChange: (open: boolean) => void;
};

function CatalogFiltersSidebarInner({
    categories,
    womenGenderId,
    applied,
    onApply,
    filtersOpen,
    onFiltersOpenChange,
}: CatalogFiltersSidebarProps) {
    const [keywordDraft, setKeywordDraft] = useState(applied.keyword);
    const [colors, setColors] = useState<CatalogColorOption[]>([]);
    const [colorsLoading, setColorsLoading] = useState(false);
    const colorsScopeRef = useRef('');

    useEffect(() => {
        setKeywordDraft(applied.keyword);
    }, [applied.keyword]);

    const activeCategory = useMemo(
        () => categories.find((c) => String(c.id) === applied.categoryId),
        [categories, applied.categoryId],
    );
    const subcategories = activeCategory?.subcategories ?? [];

    const colorScope = useMemo(
        () => ({
            category_id: applied.categoryId ? Number(applied.categoryId) : undefined,
            subcategory_id: applied.subcategoryId ? Number(applied.subcategoryId) : undefined,
            gender_id: womenGenderId ?? undefined,
        }),
        [applied.categoryId, applied.subcategoryId, womenGenderId],
    );

    const colorScopeKey = useMemo(() => JSON.stringify(colorScope), [colorScope]);

    useEffect(() => {
        if (colorsScopeRef.current === colorScopeKey) {
            return;
        }
        colorsScopeRef.current = colorScopeKey;

        let cancelled = false;
        setColorsLoading(true);

        void catalogColorsList(colorScope)
            .then((res) => {
                if (cancelled) {
                    return;
                }
                setColors(res.success && res.data ? res.data : []);
            })
            .catch(() => {
                if (!cancelled) {
                    setColors([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setColorsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [colorScope, colorScopeKey]);

    const patch = useCallback(
        (partial: Partial<CatalogAppliedFilters>) => {
            onApply({ ...applied, ...partial });
        },
        [applied, onApply],
    );

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        patch({ keyword: keywordDraft.trim() });
    };

    const clearFilters = () => {
        setKeywordDraft('');
        onApply(emptyCatalogFilters);
    };

    const hasSubcategories = subcategories.length > 0;

    return (
        <div className="w-full shrink-0 lg:w-64 lg:self-start">
            <button
                type="button"
                className={storeFilterToggle}
                aria-expanded={filtersOpen}
                onClick={() => onFiltersOpenChange(!filtersOpen)}
            >
                {filtersOpen ? 'Hide filters' : 'Show filters'}
                <svg
                    className={`h-4 w-4 transition ${filtersOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>
            <aside
                className={`${storeSidebar} ${
                    filtersOpen ? 'mt-4 block' : 'mt-4 hidden lg:mt-0 lg:block'
                }`}
            >
                <p className={storeSectionEyebrow}>Refine</p>
                <h2 className="mt-1 font-display text-xl text-stone-900 dark:text-stone-50">
                    Filters
                </h2>
                <form onSubmit={onSearch} className="mt-6 space-y-5">
                    <label className="block">
                        <span className={storeLabel}>Search</span>
                        <input
                            value={keywordDraft}
                            onChange={(e) => setKeywordDraft(e.target.value)}
                            placeholder="Name or SKU"
                            className={`${storeInput} mt-1`}
                        />
                    </label>
                    <label className="block">
                        <span className={storeLabel}>Color</span>
                        <select
                            value={applied.color}
                            onChange={(e) => patch({ color: e.target.value })}
                            disabled={colorsLoading}
                            className={`${storeInput} mt-1`}
                        >
                            <option value="">
                                {colorsLoading ? 'Loading colors…' : 'All colors'}
                            </option>
                            {colors.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block">
                        <span className={storeLabel}>Category</span>
                        <select
                            value={applied.categoryId}
                            onChange={(e) =>
                                patch({
                                    categoryId: e.target.value,
                                    subcategoryId: '',
                                    color: '',
                                })
                            }
                            className={`${storeInput} mt-1`}
                        >
                            <option value="">All categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label
                        className={`block ${hasSubcategories ? '' : 'pointer-events-none opacity-40'}`}
                    >
                        <span className="text-xs font-medium text-slate-500">Subcategory</span>
                        <select
                            value={applied.subcategoryId}
                            onChange={(e) =>
                                patch({ subcategoryId: e.target.value, color: '' })
                            }
                            disabled={!hasSubcategories}
                            className={`${storeInput} mt-1`}
                        >
                            <option value="">
                                {hasSubcategories ? 'All' : 'Select a category first'}
                            </option>
                            {subcategories.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={applied.featuredOnly}
                            onChange={(e) => patch({ featuredOnly: e.target.checked })}
                            className="rounded border-stone-300"
                        />
                        <span className={storeLabel}>New in only</span>
                    </label>
                    <button
                        type="submit"
                        className="w-full bg-stone-900 py-3 text-[11px] font-semibold uppercase tracking-widest text-white dark:bg-stone-100 dark:text-stone-900"
                    >
                        Apply search
                    </button>
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="w-full text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                        Clear filters
                    </button>
                </form>
            </aside>
        </div>
    );
}

function filtersEqual(a: CatalogAppliedFilters, b: CatalogAppliedFilters): boolean {
    return (
        a.keyword === b.keyword &&
        a.color === b.color &&
        a.categoryId === b.categoryId &&
        a.subcategoryId === b.subcategoryId &&
        a.featuredOnly === b.featuredOnly
    );
}

export default memo(CatalogFiltersSidebarInner, (prev, next) => {
    return (
        prev.filtersOpen === next.filtersOpen &&
        prev.womenGenderId === next.womenGenderId &&
        prev.categories === next.categories &&
        filtersEqual(prev.applied, next.applied) &&
        prev.onApply === next.onApply &&
        prev.onFiltersOpenChange === next.onFiltersOpenChange
    );
});
