export type CatalogColorOption = {
    value: string;
    label: string;
    hex?: string | null;
};

export type CatalogVariant = {
    id: number;
    sku: string;
    price: string | number;
    size?: string | null;
    color?: string | null;
    stock_quantity: number;
    is_default?: boolean;
    images?: { path: string }[];
};

export type CatalogImage = {
    path: string;
    alt_text?: string | null;
    is_primary?: boolean;
};

export type CatalogProduct = {
    id: number;
    name: string;
    slug: string;
    summary?: string | null;
    description?: string | null;
    status: string;
    is_featured: boolean;
    brand?: { id: number; name: string; slug?: string } | null;
    gender?: { id: number; name: string; slug?: string } | null;
    subcategory?: {
        id: number;
        name: string;
        category?: { id: number; name: string } | null;
    } | null;
    variants?: CatalogVariant[];
    images?: CatalogImage[];
};

export type CatalogBrand = {
    id: number;
    name: string;
    slug: string;
};

export type CatalogGender = {
    id: number;
    name: string;
    slug: string;
};

export type CatalogSubcategory = {
    id: number;
    name: string;
    slug: string;
};

export type CatalogCategory = {
    id: number;
    name: string;
    slug: string;
    subcategories?: CatalogSubcategory[];
};

export type CatalogPaginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total?: number;
};

export type CatalogEnvelope<T> = {
    success: boolean;
    message: string;
    data: T;
};
