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

export async function catalogProductsList(
    filters: ProductListFilters = {},
): Promise<CatalogEnvelope<CatalogPaginator<CatalogProduct>>> {
    const res = await axios.post<CatalogEnvelope<CatalogPaginator<CatalogProduct>>>(
        '/api/v1/catalog/products/list',
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
        '/api/v1/catalog/products/show',
        { slug },
    );

    return res.data;
}

export async function catalogGendersList(): Promise<CatalogEnvelope<CatalogGender[]>> {
    const res = await axios.post<CatalogEnvelope<CatalogGender[]>>(
        '/api/v1/catalog/genders/list',
        {},
    );

    return res.data;
}

export async function catalogBrandsList(): Promise<
    CatalogEnvelope<CatalogPaginator<CatalogBrand>>
> {
    const res = await axios.post<CatalogEnvelope<CatalogPaginator<CatalogBrand>>>(
        '/api/v1/catalog/brands/list',
        { per_page: 100, current_page: 1 },
    );

    return res.data;
}

export async function catalogCategoriesList(): Promise<
    CatalogEnvelope<CatalogCategory[]>
> {
    const res = await axios.post<CatalogEnvelope<CatalogCategory[]>>(
        '/api/v1/catalog/categories/list',
        {},
    );

    return res.data;
}
