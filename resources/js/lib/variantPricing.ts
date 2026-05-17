export type VariantPricingInput = {
    cost: string | number;
    mrp: string | number;
    discountPercent: string | number;
    /** Kept for API payload; derived from MRP − discount when MRP &gt; 0. */
    finalPrice?: string | number;
    listPrice?: string | number;
    commissionPercent?: string | number;
};

export type VariantPricingComputed = {
    cost: number;
    mrp: number;
    discountPercent: number;
    finalPrice: number;
    profitPerUnit: number;
    profitMargin: number;
    listPrice: number;
    commissionPercent: number;
};

function num(value: string | number | undefined): number {
    if (value === undefined || value === '') {
        return 0;
    }
    const n = typeof value === 'string' ? parseFloat(value) : value;

    return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

export function discountFromPrices(mrp: number, finalPrice: number): number {
    if (mrp <= 0) {
        return 0;
    }

    return round2(
        Math.max(0, Math.min(100, ((mrp - finalPrice) / mrp) * 100)),
    );
}

export function finalFromDiscount(mrp: number, discountPercent: number): number {
    const pct = Math.max(0, Math.min(100, discountPercent));

    return round2(mrp * (1 - pct / 100));
}

export function profitPerUnit(cost: number, finalPrice: number): number {
    return round2(finalPrice - cost);
}

export function profitMarginPercent(
    profit: number,
    finalPrice: number,
): number {
    if (finalPrice <= 0) {
        return 0;
    }

    return round2((profit / finalPrice) * 100);
}

export function computeVariantPricing(
    input: VariantPricingInput,
): VariantPricingComputed {
    const cost = round2(Math.max(0, num(input.cost)));
    const mrp = round2(Math.max(0, num(input.mrp)));
    const discountPercent = round2(
        Math.max(0, Math.min(100, num(input.discountPercent))),
    );

    let finalPrice =
        mrp > 0
            ? finalFromDiscount(mrp, discountPercent)
            : round2(Math.max(0, num(input.finalPrice)));

    if (mrp > 0) {
        finalPrice = finalFromDiscount(mrp, discountPercent);
    }

    const profit = profitPerUnit(cost, finalPrice);
    const margin = profitMarginPercent(profit, finalPrice);

    return {
        cost,
        mrp,
        discountPercent,
        finalPrice,
        profitPerUnit: profit,
        profitMargin: margin,
        listPrice: mrp > 0 ? mrp : finalPrice,
        commissionPercent: 0,
    };
}

export function formatInr(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export type StorefrontPriceDisplay = {
    finalPrice: number;
    mrp: number | null;
    discountPercent: number;
    hasDiscount: boolean;
};

export function storefrontPriceDisplay(
    finalPrice: number,
    mrp: number | null | undefined,
    discountPercent: number | null | undefined,
): StorefrontPriceDisplay {
    const final = round2(finalPrice);
    const mrpVal =
        mrp != null && mrp > final ? round2(mrp) : null;
    const discount =
        discountPercent != null && discountPercent > 0
            ? round2(discountPercent)
            : mrpVal
              ? discountFromPrices(mrpVal, final)
              : 0;

    return {
        finalPrice: final,
        mrp: mrpVal,
        discountPercent: discount,
        hasDiscount: Boolean(mrpVal && mrpVal > final),
    };
}
