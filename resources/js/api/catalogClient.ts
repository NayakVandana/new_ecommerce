import type {
    CatalogBrand,
    CatalogCategory,
    CatalogEnvelope,
    CatalogGender,
    CatalogPaginator,
    CatalogProduct,
} from '@/store/catalogTypes';
import axios from 'axios';

export type ProductListFilters = {
    per_page?: number;
    current_page?: number;
    keyword?: string;
    brand_id?: number;
    category_id?: number;
    subcategory_id?: number;
    gender_id?: number;
    featured_only?: boolean;
    status?: string;
};

function catalogRequestCache<T>() {
    let cached: T | null = null;
    let inflight: Promise<T> | null = null;

    return (fetcher: () => Promise<T>): Promise<T> => {
        if (cached) {
            return Promise.resolve(cached);
        }

        if (inflight) {
            return inflight;
        }

        inflight = fetcher()
            .then((data) => {
                cached = data;
                inflight = null;

                return data;
            })
            .catch((error) => {
                inflight = null;

                throw error;
            });

        return inflight;
    };
}

const gendersCache = catalogRequestCache<CatalogEnvelope<CatalogGender[]>>();
const categoriesCache = catalogRequestCache<CatalogEnvelope<CatalogCategory[]>>();
const brandsCache = catalogRequestCache<
    CatalogEnvelope<CatalogPaginator<CatalogBrand>>
>();

export async function catalogProductsList(
    filters: ProductListFilters = {},
): Promise<CatalogEnvelope<CatalogPaginator<CatalogProduct>>> {
    const res = await axios.post<CatalogEnvelope<CatalogPaginator<CatalogProduct>>>(
        '/api/v1/catalog/products/products-list',
        {
            status: 'published',
            ...filters,
        },
    );

    return res.data;
}

export async function catalogProductShow(
    slug: string,
): Promise<CatalogEnvelope<CatalogProduct>> {
    const res = await axios.post<CatalogEnvelope<CatalogProduct>>(
        '/api/v1/catalog/products/product-show',
        { slug },
    );

    return res.data;
}

export async function catalogGendersList(): Promise<CatalogEnvelope<CatalogGender[]>> {
    return gendersCache(async () => {
        const res = await axios.post<CatalogEnvelope<CatalogGender[]>>(
            '/api/v1/catalog/genders/genders-list',
            {},
        );

        return res.data;
    });
}

export async function catalogBrandsList(): Promise<
    CatalogEnvelope<CatalogPaginator<CatalogBrand>>
> {
    return brandsCache(async () => {
        const res = await axios.post<CatalogEnvelope<CatalogPaginator<CatalogBrand>>>(
            '/api/v1/catalog/brands/brands-list',
            { per_page: 100, current_page: 1 },
        );

        return res.data;
    });
}

export async function catalogCategoriesList(): Promise<
    CatalogEnvelope<CatalogCategory[]>
> {
    return categoriesCache(async () => {
        const res = await axios.post<CatalogEnvelope<CatalogCategory[]>>(
            '/api/v1/catalog/categories/categories-list',
            {},
        );

        return res.data;
    });
}
