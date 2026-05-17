export type VariantFieldErrors = {
    sku?: string;
    price?: string;
    size?: string;
    color?: string;
    color_hex?: string;
    combination?: string;
    images?: string;
    media?: string;
};

export type ProductFormErrors = {
    form?: string;
    name?: string;
    slug?: string;
    base_sku?: string;
    summary?: string;
    description?: string;
    meta_title?: string;
    meta_description?: string;
    subcategory_id?: string;
    gender_id?: string;
    brand_id?: string;
    status?: string;
    variants?: Record<number, VariantFieldErrors>;
};

const TOP_LEVEL_KEYS = new Set([
    'name',
    'slug',
    'base_sku',
    'summary',
    'description',
    'meta_title',
    'meta_description',
    'subcategory_id',
    'gender_id',
    'brand_id',
    'status',
]);

export function emptyProductFormErrors(): ProductFormErrors {
    return {};
}

export function isValidationErrorData(
    data: unknown,
): data is Record<string, string[]> {
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        return false;
    }

    return Object.values(data as Record<string, unknown>).every(
        (v) =>
            Array.isArray(v) &&
            v.every((item) => typeof item === 'string'),
    );
}

function ensureVariant(
    errors: ProductFormErrors,
    index: number,
): ProductFormErrors {
    const variants: Record<number, VariantFieldErrors> = {
        ...(errors.variants ?? {}),
    };
    variants[index] = { ...(variants[index] ?? {}) };

    return { ...errors, variants };
}

export function setVariantFieldError(
    errors: ProductFormErrors,
    index: number,
    field: keyof VariantFieldErrors,
    message: string,
): ProductFormErrors {
    const next = ensureVariant(errors, index);
    next.variants![index][field] = message;

    return next;
}

export function applyLaravelValidationMessages(
    errors: ProductFormErrors,
    data: Record<string, string[]> | null | undefined,
): ProductFormErrors {
    if (!data) {
        return errors;
    }

    let next: ProductFormErrors = {
        ...errors,
        variants: { ...(errors.variants ?? {}) },
    };

    for (const [key, messages] of Object.entries(data)) {
        const msg = messages[0];
        if (!msg) {
            continue;
        }

        const variantMatch = key.match(/^variants\.(\d+)\.(\w+)$/);
        if (variantMatch) {
            const index = Number(variantMatch[1]);
            const field = variantMatch[2] as keyof VariantFieldErrors;
            next = setVariantFieldError(next, index, field, msg);
            continue;
        }

        if (TOP_LEVEL_KEYS.has(key)) {
            next = { ...next, [key]: msg };
        } else {
            next = { ...next, form: next.form ?? msg };
        }
    }

    return next;
}

export function applyApiMessageToErrors(
    errors: ProductFormErrors,
    message: string,
    variants: { sku: string }[],
): ProductFormErrors {
    let next = { ...errors };

    const subcategoryHint =
        /subcategory/i.test(message) &&
        (/required|select/i.test(message) || /field is required/i.test(message));
    const genderHint =
        /gender/i.test(message) &&
        (/required|select/i.test(message) || /field is required/i.test(message));

    if (subcategoryHint) {
        next.subcategory_id = /required/i.test(message)
            ? 'Subcategory is required.'
            : message;

        return next;
    }

    if (genderHint) {
        next.gender_id = /required/i.test(message)
            ? 'Gender is required.'
            : message;

        return next;
    }

    const variantSizeMatch = message.match(/variant\s+(\d+):\s*select a size/i);
    if (variantSizeMatch) {
        return setVariantFieldError(
            next,
            Number(variantSizeMatch[1]) - 1,
            'size',
            message,
        );
    }

    const variantColorMatch = message.match(
        /variant\s+(\d+):\s*set a color/i,
    );
    if (variantColorMatch) {
        return setVariantFieldError(
            next,
            Number(variantColorMatch[1]) - 1,
            'color',
            message,
        );
    }

    const dupMatch = message.match(/variants?\s+(\d+)\s+and\s+(\d+)/i);
    if (dupMatch && /size and color|same size and color/i.test(message)) {
        const a = Number(dupMatch[1]) - 1;
        const b = Number(dupMatch[2]) - 1;
        next = setVariantFieldError(next, a, 'combination', message);
        next = setVariantFieldError(next, b, 'combination', message);

        return next;
    }

    if (/duplicate variant.*size and color/i.test(message)) {
        next = { ...next, form: message };

        return next;
    }

    const skuInUse = message.match(/SKU\s+"([^"]+)"\s+is already in use/i);
    if (skuInUse) {
        const sku = skuInUse[1];
        const index = variants.findIndex((v) => v.sku.trim() === sku);
        if (index >= 0) {
            return setVariantFieldError(next, index, 'sku', message);
        }
    }

    if (/duplicate sku/i.test(message)) {
        next = { ...next, form: message };

        return next;
    }

    if (/each variant needs a sku/i.test(message)) {
        variants.forEach((v, index) => {
            if (!v.sku.trim()) {
                next = setVariantFieldError(
                    next,
                    index,
                    'sku',
                    'SKU is required.',
                );
            }
        });

        return next;
    }

    if (/each variant must have a size/i.test(message)) {
        variants.forEach((_, index) => {
            next = setVariantFieldError(
                next,
                index,
                'size',
                'Size is required.',
            );
        });

        return next;
    }

    if (/each variant must have a color/i.test(message)) {
        variants.forEach((_, index) => {
            next = setVariantFieldError(
                next,
                index,
                'color',
                'Color is required.',
            );
        });

        return next;
    }

    if (/image/i.test(message) && /required|at least one/i.test(message)) {
        variants.forEach((_, index) => {
            next = setVariantFieldError(
                next,
                index,
                'images',
                'Image file is required.',
            );
        });

        return next;
    }

    const invalidPrice = message.match(/invalid price for sku\s+"([^"]+)"/i);
    if (invalidPrice) {
        const sku = invalidPrice[1];
        const index = variants.findIndex((v) => v.sku.trim() === sku);
        if (index >= 0) {
            return setVariantFieldError(next, index, 'price', message);
        }
    }

    if (TOP_LEVEL_KEYS.has(message)) {
        return { ...next, [message]: message };
    }

    if (!next.form) {
        next.form = message;
    }

    return next;
}

export function mergeApiFailure(
    message: string,
    data: unknown,
    variants: { sku: string }[],
): ProductFormErrors {
    let errors = emptyProductFormErrors();
    errors = applyLaravelValidationMessages(
        errors,
        isValidationErrorData(data) ? data : null,
    );
    errors = applyApiMessageToErrors(errors, message, variants);

    return errors;
}

export function hasAnyFieldErrors(errors: ProductFormErrors): boolean {
    if (errors.form) {
        return true;
    }

    for (const key of TOP_LEVEL_KEYS) {
        if (errors[key as keyof ProductFormErrors]) {
            return true;
        }
    }

    if (errors.variants) {
        return Object.values(errors.variants).some((v) =>
            Object.values(v).some(Boolean),
        );
    }

    return false;
}

/** Client-side validation before submit — returns field-keyed errors. */
export function validateProductFormClient(input: {
    subcategoryId: number | null;
    genderId: number | null;
    name: string;
    variants: {
        sku: string;
        finalPrice: string;
        size: string;
        color: string;
        color_hex: string;
        images: { path: string }[];
    }[];
    variantHasImage: (images: { path: string }[]) => boolean;
    variantHasSize: (size: string) => boolean;
    variantHasColor: (color: string, colorHex: string) => boolean;
    variantSizeColorKey: (
        size: string,
        color: string,
        colorHex: string,
    ) => string;
}): ProductFormErrors {
    let errors = emptyProductFormErrors();

    if (!input.name.trim()) {
        errors.name = 'Name is required.';
    }

    if (input.subcategoryId == null) {
        errors.subcategory_id = 'Subcategory is required.';
    }

    if (input.genderId == null) {
        errors.gender_id = 'Gender is required.';
    }

    const sizeColorSeen = new Map<string, number>();

    input.variants.forEach((row, index) => {
        if (!row.sku.trim()) {
            errors = setVariantFieldError(
                errors,
                index,
                'sku',
                'SKU is required.',
            );
        }

        const priceNum = Number(row.finalPrice);
        if (!String(row.finalPrice).trim()) {
            errors = setVariantFieldError(
                errors,
                index,
                'price',
                'Final price is required.',
            );
        } else if (Number.isNaN(priceNum) || priceNum < 0) {
            errors = setVariantFieldError(
                errors,
                index,
                'price',
                'Enter a valid final price.',
            );
        }

        if (!input.variantHasSize(row.size)) {
            errors = setVariantFieldError(
                errors,
                index,
                'size',
                'Size is required.',
            );
        }

        if (!input.variantHasColor(row.color, row.color_hex)) {
            errors = setVariantFieldError(
                errors,
                index,
                'color',
                'Color is required.',
            );
        }

        if (!input.variantHasImage(row.images)) {
            errors = setVariantFieldError(
                errors,
                index,
                'images',
                'Image file is required.',
            );
        }

        if (
            input.variantHasSize(row.size) &&
            input.variantHasColor(row.color, row.color_hex)
        ) {
            const optionKey = input.variantSizeColorKey(
                row.size,
                row.color,
                row.color_hex,
            );
            const duplicateAt = sizeColorSeen.get(optionKey);
            if (duplicateAt !== undefined) {
                const msg =
                    'This size and color combination is already used.';
                errors = setVariantFieldError(
                    errors,
                    duplicateAt,
                    'combination',
                    msg,
                );
                errors = setVariantFieldError(
                    errors,
                    index,
                    'combination',
                    msg,
                );
            } else {
                sizeColorSeen.set(optionKey, index);
            }
        }
    });

    return errors;
}

export function scrollToFirstProductError(errors: ProductFormErrors): void {
    const order: string[] = [
        'form',
        'name',
        'subcategory_id',
        'gender_id',
        'brand_id',
        'status',
    ];

    for (const field of order) {
        if (field === 'form' && errors.form) {
            document
                .querySelector('[data-error-anchor="form"]')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });

            return;
        }

        if (errors[field as keyof ProductFormErrors]) {
            document
                .querySelector(`[data-error-field="${field}"]`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });

            return;
        }
    }

    if (errors.variants) {
        const indices = Object.keys(errors.variants)
            .map(Number)
            .sort((a, b) => a - b);

        for (const index of indices) {
            const v = errors.variants[index];
            if (!v) {
                continue;
            }

            const variantField = (
                [
                    'combination',
                    'sku',
                    'price',
                    'size',
                    'color',
                    'images',
                    'media',
                ] as const
            ).find((f) => v[f]);

            if (variantField) {
                document
                    .querySelector(
                        `[data-error-field="variant-${index}-${variantField}"]`,
                    )
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });

                return;
            }
        }
    }
}
