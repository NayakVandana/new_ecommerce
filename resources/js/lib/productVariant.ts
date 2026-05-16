import { normalizeVariantSizeForApi } from '@/constants/fashionSizes';
import { normalizeColorHexForApi } from '@/lib/variantColor';

/** Stable key for duplicate size + color checks across variant rows. */
export function variantSizeColorKey(
    size: string,
    color: string,
    colorHex: string,
): string {
    const sizeKey = normalizeVariantSizeForApi(size) ?? '';
    const hex = normalizeColorHexForApi(colorHex);
    const colorKey = hex ?? color.trim().toLowerCase();

    return `${sizeKey}\u0000${colorKey}`;
}

export function variantHasSize(size: string): boolean {
    return normalizeVariantSizeForApi(size) !== null;
}

export function variantHasColor(color: string, colorHex: string): boolean {
    return (
        normalizeColorHexForApi(colorHex) !== null || color.trim().length > 0
    );
}

export function variantHasImage(images: { path: string }[]): boolean {
    return images.some((img) => img.path.trim() !== '');
}
