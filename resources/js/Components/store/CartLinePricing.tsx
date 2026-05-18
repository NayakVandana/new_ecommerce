import { formatMoney } from '@/store/orderStatus';

export type PricingLineItem = {
    unit_price: number;
    compare_at_price: number | null;
    discount_percent: number;
    line_discount: number;
    sku: string;
};

export default function CartLinePricing({
    item,
    currency,
}: {
    item: PricingLineItem;
    currency: string;
}) {
    const mrp = item.compare_at_price;
    const hasDiscount =
        mrp != null && mrp > item.unit_price + 0.009 && item.discount_percent > 0;

    return (
        <div className="mt-1 space-y-1">
            <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                    {formatMoney(item.unit_price, currency)}
                </span>
                {hasDiscount && mrp != null ? (
                    <span className="text-xs text-stone-500 line-through dark:text-stone-400">
                        {formatMoney(mrp, currency)}
                    </span>
                ) : null}
                {hasDiscount ? (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                        {item.discount_percent % 1 === 0
                            ? item.discount_percent.toFixed(0)
                            : item.discount_percent.toFixed(1)}
                        % off
                    </span>
                ) : null}
            </div>
            {item.line_discount > 0.009 ? (
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    You save {formatMoney(item.line_discount, currency)} on this line
                </p>
            ) : null}
            <p className="text-xs text-stone-500">SKU {item.sku}</p>
        </div>
    );
}
