import type { CatalogProduct, CatalogVariant } from '@/store/catalogTypes';

export function productImageSrc(path: string | null | undefined): string {
    if (!path) {
        return '';
    }
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    if (path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
}

export function pickVariant(product: CatalogProduct): CatalogVariant | null {
    const variants = product.variants ?? [];
    if (variants.length === 0) {
        return null;
    }

    return variants.find((v) => v.is_default) ?? variants[0];
}

export function variantLabel(v: CatalogVariant): string {
    const parts = [v.size, v.color].filter(Boolean);

    return parts.length > 0 ? parts.join(' · ') : v.sku;
}

export function productPrimaryImage(product: CatalogProduct): string {
    const productImg = product.images?.[0]?.path;
    if (productImg) {
        return productImageSrc(productImg);
    }

    const variant = pickVariant(product);
    const variantImg = variant?.images?.[0]?.path;
    if (variantImg) {
        return productImageSrc(variantImg);
    }

    return '';
}

export function formatStorePrice(
    price: string | number,
    currency = 'INR',
): string {
    const n = typeof price === 'string' ? parseFloat(price) : price;
    if (Number.isNaN(n)) {
        return `${price} ${currency}`;
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(n);
}
