import { adminInput, adminLabel, adminMutedText } from '@/admin/adminTheme';
import {
    computeVariantPricing,
    formatInr,
    finalFromDiscount,
    type VariantPricingInput,
} from '@/lib/variantPricing';

export type VariantPricingRow = {
    cost: string;
    mrp: string;
    discountPercent: string;
    finalPrice: string;
    is_active: boolean;
    stock: number;
};

type Props = {
    row: VariantPricingRow;
    onChange: (next: VariantPricingRow) => void;
    priceError?: string;
};

function FieldHelp({ children }: { children: string }) {
    return (
        <p className={`mt-1.5 ${adminMutedText} text-xs leading-snug`}>
            {children}
        </p>
    );
}

function SummaryCard({
    label,
    value,
    tone = 'default',
}: {
    label: string;
    value: string;
    tone?: 'default' | 'primary' | 'profit';
}) {
    const valueClass =
        tone === 'primary'
            ? 'text-violet-700 dark:text-violet-300'
            : tone === 'profit'
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-slate-900 dark:text-white';

    const wrapClass =
        tone === 'profit'
            ? 'border-emerald-200 bg-white dark:border-emerald-800/60 dark:bg-slate-900'
            : 'border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900';

    return (
        <div
            className={`rounded-xl border px-4 py-3 shadow-sm ${wrapClass}`}
        >
            <p className={`${adminMutedText} text-xs font-medium`}>{label}</p>
            <p className={`mt-1 text-lg font-bold tabular-nums ${valueClass}`}>
                {value}
            </p>
        </div>
    );
}

export default function VariantPricingGrid({
    row,
    onChange,
    priceError,
}: Props) {
    const computed = computeVariantPricing(row as VariantPricingInput);

    const syncFinal = (
        next: Partial<VariantPricingRow>,
    ): VariantPricingRow => {
        const merged = { ...row, ...next };
        const mrp = parseFloat(merged.mrp) || 0;
        const discount = parseFloat(merged.discountPercent) || 0;

        return {
            ...merged,
            finalPrice:
                mrp > 0
                    ? String(finalFromDiscount(mrp, discount))
                    : merged.finalPrice,
        };
    };

    return (
        <div className="mt-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/90 to-indigo-50/50 p-4 sm:p-5 dark:border-sky-900/40 dark:from-slate-900 dark:to-slate-900/80">
            <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                    ₹
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Pricing &amp; Profit
                </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className={adminLabel}>
                        Cost Price (Purchase Price){' '}
                        <span className="text-red-600 dark:text-red-400">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min={0}
                        required
                        value={row.cost}
                        onChange={(e) =>
                            onChange(syncFinal({ cost: e.target.value }))
                        }
                        className={adminInput}
                        placeholder="250.00"
                    />
                    <FieldHelp>
                        What you paid to purchase this product
                    </FieldHelp>
                </div>

                <div>
                    <label className={adminLabel}>
                        MRP (Selling Price){' '}
                        <span className="text-red-600 dark:text-red-400">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min={0}
                        required
                        value={row.mrp}
                        onChange={(e) =>
                            onChange(syncFinal({ mrp: e.target.value }))
                        }
                        className={adminInput}
                        placeholder="400.00"
                    />
                    <FieldHelp>
                        Maximum Retail Price (what you sell it for)
                    </FieldHelp>
                </div>

                <div>
                    <label className={adminLabel}>Discount Percent (%)</label>
                    <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        value={row.discountPercent}
                        onChange={(e) =>
                            onChange(
                                syncFinal({
                                    discountPercent: e.target.value,
                                }),
                            )
                        }
                        className={adminInput}
                        placeholder="25.00"
                    />
                    <FieldHelp>Optional discount applied to MRP</FieldHelp>
                </div>

                <div>
                    <label className={adminLabel}>Final Selling Price</label>
                    <div
                        className="flex min-h-11 items-center rounded-lg border border-slate-200 bg-slate-100/80 px-4 py-2.5 text-base font-semibold tabular-nums text-slate-800 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
                        aria-live="polite"
                    >
                        {computed.mrp > 0 || computed.finalPrice > 0
                            ? formatInr(computed.finalPrice)
                            : '—'}
                    </div>
                    <FieldHelp>
                        MRP − Discount (calculated automatically)
                    </FieldHelp>
                    {priceError ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {priceError}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    label="Cost Price"
                    value={formatInr(computed.cost)}
                />
                <SummaryCard
                    label="Final Selling Price"
                    value={formatInr(computed.finalPrice)}
                    tone="primary"
                />
                <SummaryCard
                    label="Profit per Unit"
                    value={formatInr(computed.profitPerUnit)}
                    tone="profit"
                />
                <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
                    <p className={`${adminMutedText} text-xs font-medium`}>
                        Profit Margin
                    </p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                        {computed.profitMargin % 1 === 0
                            ? computed.profitMargin.toFixed(0)
                            : computed.profitMargin.toFixed(2)}
                        %
                    </p>
                    <p className={`${adminMutedText} mt-0.5 text-xs`}>
                        of selling price
                    </p>
                </div>
            </div>

            <div className="mt-4 grid gap-4 border-t border-sky-100/80 pt-4 sm:grid-cols-2 dark:border-slate-700">
                <div>
                    <label className={adminLabel}>Variant status</label>
                    <select
                        value={row.is_active ? 'active' : 'inactive'}
                        onChange={(e) =>
                            onChange({
                                ...row,
                                is_active: e.target.value === 'active',
                            })
                        }
                        className={adminInput}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div>
                    <label className={adminLabel}>Stock</label>
                    <input
                        type="number"
                        min={0}
                        value={row.stock}
                        onChange={(e) =>
                            onChange({
                                ...row,
                                stock: Number(e.target.value),
                            })
                        }
                        className={adminInput}
                    />
                </div>
            </div>
        </div>
    );
}
