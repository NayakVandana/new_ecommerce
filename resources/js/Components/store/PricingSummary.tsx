import { couponDiscountLabel } from '@/store/pricingLabels';
import { formatMoney, formatMoneyDeduction } from '@/store/orderStatus';

function SummaryRow({
    label,
    value,
    emphasize = false,
    savings = false,
}: {
    label: string;
    value: string;
    emphasize?: boolean;
    savings?: boolean;
}) {
    return (
        <div className="flex justify-between gap-4 text-sm">
            <dt className={emphasize ? 'font-semibold text-stone-900 dark:text-stone-50' : 'text-stone-500'}>
                {label}
            </dt>
            <dd
                className={
                    savings
                        ? 'font-medium text-emerald-700 dark:text-emerald-400'
                        : emphasize
                          ? 'text-lg font-bold text-stone-900 dark:text-stone-50'
                          : 'font-medium text-stone-900 dark:text-stone-50'
                }
            >
                {value}
            </dd>
        </div>
    );
}

export type PricingSummaryProps = {
    currency: string;
    itemCount: number;
    mrpSubtotal: number;
    productDiscountTotal: number;
    subtotal: number;
    shippingTotal: number;
    taxTotal: number;
    discountTotal: number;
    /** e.g. "Coupon (SUMMER20)" — defaults to "Coupon discount" when omitted. */
    orderDiscountLabel?: string;
    grandTotal: number;
    title?: string;
    footerNote?: string | null;
};

export default function PricingSummary({
    currency,
    itemCount,
    mrpSubtotal,
    productDiscountTotal,
    subtotal,
    shippingTotal,
    taxTotal,
    discountTotal,
    orderDiscountLabel,
    grandTotal,
    title = 'Order summary',
    footerNote = null,
}: PricingSummaryProps) {
    const promoLabel = orderDiscountLabel ?? couponDiscountLabel();
    const hasProductDiscount = productDiscountTotal > 0.009;
    const hasOrderDiscount = Number(discountTotal) > 0.009;

    return (
        <>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h2>
            <dl className="mt-4 space-y-2.5">
                <SummaryRow
                    label={`Items (${itemCount})`}
                    value={formatMoney(mrpSubtotal, currency)}
                />
                {hasProductDiscount ? (
                    <SummaryRow
                        label="Discount on MRP"
                        value={formatMoneyDeduction(productDiscountTotal, currency)}
                        savings
                    />
                ) : null}
                <SummaryRow label="Subtotal" value={formatMoney(subtotal, currency)} />
                <SummaryRow
                    label="Shipping"
                    value={shippingTotal > 0 ? formatMoney(shippingTotal, currency) : 'Free'}
                />
                {taxTotal > 0.009 ? (
                    <SummaryRow label="Tax" value={formatMoney(taxTotal, currency)} />
                ) : null}
                {hasOrderDiscount ? (
                    <SummaryRow
                        label={promoLabel}
                        value={formatMoneyDeduction(discountTotal, currency)}
                        savings
                    />
                ) : null}
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4 dark:border-stone-800">
                <span className="font-semibold text-stone-900 dark:text-stone-50">Total paid</span>
                <span className="text-lg font-bold text-stone-900 dark:text-stone-50">
                    {formatMoney(grandTotal, currency)}
                </span>
            </div>
            {footerNote ? <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">{footerNote}</p> : null}
        </>
    );
}
