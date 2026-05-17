import CatalogFiltersSidebar from '@/Components/store/CatalogFiltersSidebar';
import CatalogProductResults from '@/Components/store/CatalogProductResults';
import { useWomenStore } from '@/hooks/useWomenStore';
import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import {
    catalogFiltersEqual,
    emptyCatalogFilters,
    readCatalogFiltersFromUrl,
    syncCatalogFiltersToUrl,
    type CatalogAppliedFilters,
} from '@/Pages/Guest/catalogFilterState';
import { Head, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export default function Catalog() {
    return (
        <GuestPanelLayout title="Shop ethnic wear">
            <CatalogContent />
        </GuestPanelLayout>
    );
}

function CatalogContent() {
    const { url } = usePage();
    const { womenGenderId, shopCategories, ready } = useWomenStore();
    const [filters, setFilters] = useState<CatalogAppliedFilters>(readCatalogFiltersFromUrl);
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        const fromUrl = readCatalogFiltersFromUrl();
        setFilters((prev) => (catalogFiltersEqual(prev, fromUrl) ? prev : fromUrl));
        setPage(1);
    }, [url]);

    useEffect(() => {
        syncCatalogFiltersToUrl(filters);
    }, [filters]);

    const applyFilters = useCallback((next: CatalogAppliedFilters) => {
        setFilters(next);
        setPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(emptyCatalogFilters);
        setPage(1);
    }, []);

    const onCategorySelect = useCallback((categoryId: string) => {
        setFilters((prev) => ({
            ...prev,
            categoryId,
            subcategoryId: '',
            color: '',
        }));
        setPage(1);
    }, []);

    return (
        <>
            <Head title="Suhaag · Shop" />

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                <CatalogFiltersSidebar
                    categories={shopCategories}
                    womenGenderId={womenGenderId}
                    applied={filters}
                    onApply={applyFilters}
                    filtersOpen={filtersOpen}
                    onFiltersOpenChange={setFiltersOpen}
                />

                <CatalogProductResults
                    filters={filters}
                    page={page}
                    onPageChange={setPage}
                    womenGenderId={womenGenderId}
                    ready={ready}
                    categories={shopCategories}
                    onClearFilters={clearFilters}
                    onCategorySelect={onCategorySelect}
                />
            </div>
        </>
    );
}
