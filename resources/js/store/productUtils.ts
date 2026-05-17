import {
    storefrontPriceDisplay,
    type StorefrontPriceDisplay,
} from '@/lib/variantPricing';
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

export type GalleryImage = {
    key: string;
    src: string;
    alt: string;
};

function sortCatalogImages(
    images: { path: string; alt_text?: string | null; is_primary?: boolean }[],
): GalleryImage[] {
    return images
        .slice()
        .sort((a, b) => {
            if (a.is_primary && !b.is_primary) {
                return -1;
            }
            if (!a.is_primary && b.is_primary) {
                return 1;
            }

            return 0;
        })
        .map((img, index) => {
            const src = productImageSrc(img.path);

            return {
                key: `${img.path}-${index}`,
                src,
                alt: img.alt_text?.trim() || '',
            };
        })
        .filter((img) => img.src !== '');
}

/** Images for the active variant, falling back to product-level gallery. */
export function variantGalleryImages(
    product: CatalogProduct,
    variant: CatalogVariant | null,
): GalleryImage[] {
    const variantImages = sortCatalogImages(variant?.images ?? []);
    if (variantImages.length > 0) {
        return variantImages;
    }

    return sortCatalogImages(product.images ?? []);
}

export function variantThumbSrc(
    product: CatalogProduct,
    variant: CatalogVariant,
): string {
    const gallery = variantGalleryImages(product, variant);

    return gallery[0]?.src ?? '';
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

export function variantPriceDisplay(
    variant: CatalogVariant,
): StorefrontPriceDisplay {
    const final =
        typeof variant.price === 'string'
            ? parseFloat(variant.price)
            : variant.price;
    const mrpRaw = variant.compare_at_price;
    const mrp =
        mrpRaw == null
            ? null
            : typeof mrpRaw === 'string'
              ? parseFloat(mrpRaw)
              : mrpRaw;
    const discountRaw = variant.discount_percent;
    const discount =
        discountRaw == null
            ? null
            : typeof discountRaw === 'string'
              ? parseFloat(discountRaw)
              : discountRaw;

    return storefrontPriceDisplay(final, mrp, discount);
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
