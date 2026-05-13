/**
 * Standard fashion / apparel sizes for variant rows (admin + storefront).
 * Extend this list as needed; values are stored on `product_variants.size`.
 */

export const FASHION_LETTER_SIZES = [
    'XXS',
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '3XL',
    '4XL',
    '5XL',
] as const;

/** Common EU-style numeric (waist / dress), even numbers */
export const FASHION_NUMERIC_SIZES = [
    '28',
    '30',
    '32',
    '34',
    '36',
    '38',
    '40',
    '42',
    '44',
    '46',
    '48',
    '50',
] as const;

export const FASHION_SPECIAL_SIZES = ['One size', 'Free size'] as const;

export const FASHION_SIZE_OPTION_GROUPS: ReadonlyArray<{
    label: string;
    options: readonly string[];
}> = [
    { label: 'Letter sizes', options: FASHION_LETTER_SIZES },
    { label: 'Numeric (EU-style)', options: FASHION_NUMERIC_SIZES },
    { label: 'Other', options: FASHION_SPECIAL_SIZES },
];

const combined = [
    ...FASHION_LETTER_SIZES,
    ...FASHION_NUMERIC_SIZES,
    ...FASHION_SPECIAL_SIZES,
];

export const FASHION_SIZE_OPTIONS: readonly string[] = combined;

/** Select sentinel: open custom size field */
export const FASHION_SIZE_OTHER = '__other__' as const;

/** In-memory only: user chose "Other" but has not typed yet (not sent to API). */
export const FASHION_SIZE_FORM_OTHER = '__form_size_other__' as const;

export function fashionSizeSelectValue(
    size: string,
): string | typeof FASHION_SIZE_OTHER {
    if (size === FASHION_SIZE_FORM_OTHER) {
        return FASHION_SIZE_OTHER;
    }
    if (size === '' || FASHION_SIZE_OPTIONS.includes(size)) {
        return size;
    }

    return FASHION_SIZE_OTHER;
}

/** True when size is a non-list value (typed custom). */
export function isCustomFashionSize(value: string): boolean {
    if (value === '' || value === FASHION_SIZE_FORM_OTHER) {
        return false;
    }

    return !FASHION_SIZE_OPTIONS.includes(value);
}

/** Value shown in the custom text field when "Other" is selected. */
export function fashionCustomSizeInputValue(size: string): string {
    if (size === FASHION_SIZE_FORM_OTHER) {
        return '';
    }
    if (isCustomFashionSize(size)) {
        return size;
    }

    return '';
}

/** Normalize variant size for API (strip form sentinel). */
export function normalizeVariantSizeForApi(size: string): string | null {
    const t = size.trim();
    if (t === '' || t === FASHION_SIZE_FORM_OTHER) {
        return null;
    }

    return t;
}
