import {
    adminMutedText,
    adminTabBtnActive,
    adminTabBtnInactive,
    adminTabList,
} from '@/admin/adminTheme';
import { formatInr } from '@/lib/variantPricing';
import { useEffect, useState } from 'react';

export type AdminVariantPricingItem = {
    id: number;
    sku: string;
    size?: string | null;
    color?: string | null;
    color_hex?: string | null;
    stock_quantity: number | string;
    is_default?: boolean;
    is_active?: boolean;
    cost: number | string;
    mrp?: number | string | null;
    final_price: number | string;
    discount_percent: number | string;
    profit_per_unit: number | string;
    profit_margin: number | string;
};

export function num(value: string | number | null | undefined): number {
    if (value == null || value === '') {
        return 0;
    }
    const n = typeof value === 'string' ? parseFloat(value) : value;

    return Number.isFinite(n) ? n : 0;
}

export function variantLabel(v: AdminVariantPricingItem): string {
    const parts = [v.size, v.color].filter(Boolean);

    return parts.length > 0 ? parts.join(' · ') : v.sku;
}

export function pct(value: string | number | null | undefined): string {
    const n = num(value);

    return n % 1 === 0 ? `${n.toFixed(0)}%` : `${n.toFixed(2)}%`;
}

function VariantPricingDetail({ v }: { v: AdminVariantPricingItem }) {
    return (
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 lg:grid-cols-6">
            <div>
                <p className={adminMutedText}>Cost</p>
                <p className="mt-0.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                    {formatInr(num(v.cost))}
                </p>
            </div>
            <div>
                <p className={adminMutedText}>MRP</p>
                <p className="mt-0.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                    {v.mrp != null && v.mrp !== ''
                        ? formatInr(num(v.mrp))
                        : '—'}
                </p>
            </div>
            <div>
                <p className={adminMutedText}>Disc %</p>
                <p className="mt-0.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                    {pct(v.discount_percent)}
                </p>
            </div>
            <div>
                <p className={adminMutedText}>Final</p>
                <p className="mt-0.5 font-semibold tabular-nums text-violet-700 dark:text-violet-300">
                    {formatInr(num(v.final_price))}
                </p>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50/50 px-2 py-1.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <p className="text-emerald-800/80 dark:text-emerald-300/80">
                    Profit / unit
                </p>
                <p className="mt-0.5 font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {formatInr(num(v.profit_per_unit))}
                </p>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50/50 px-2 py-1.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <p className="text-emerald-800/80 dark:text-emerald-300/80">
                    Margin
                </p>
                <p className="mt-0.5 font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {pct(v.profit_margin)}
                </p>
            </div>
        </div>
    );
}

type Props = {
    variants: AdminVariantPricingItem[];
    showHeader?: boolean;
};

export default function AdminVariantPricingList({
    variants,
    showHeader = true,
}: Props) {
    const [activeId, setActiveId] = useState<number | null>(
        variants[0]?.id ?? null,
    );

    useEffect(() => {
        if (variants.length === 0) {
            setActiveId(null);

            return;
        }

        if (!variants.some((v) => v.id === activeId)) {
            setActiveId(variants[0].id);
        }
    }, [variants, activeId]);

    if (variants.length === 0) {
        return (
            <p className={`${adminMutedText} text-sm`}>
                No variants — add pricing in edit.
            </p>
        );
    }

    const active =
        variants.find((v) => v.id === activeId) ?? variants[0];
    const useTabs = variants.length > 1;

    return (
        <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/90 to-indigo-50/40 p-3 dark:border-sky-900/50 dark:from-slate-900 dark:to-slate-900/80 sm:p-4">
            {showHeader ? (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                        ₹
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Pricing &amp; Profit
                    </p>
                    <span className={`${adminMutedText} text-xs`}>
                        {variants.length} variant
                        {variants.length === 1 ? '' : 's'}
                    </span>
                </div>
            ) : null}

            {useTabs ? (
                <div className={adminTabList} role="tablist">
                    {variants.map((v) => (
                        <button
                            key={v.id}
                            type="button"
                            role="tab"
                            aria-selected={active.id === v.id}
                            onClick={() => setActiveId(v.id)}
                            className={
                                active.id === v.id
                                    ? adminTabBtnActive
                                    : adminTabBtnInactive
                            }
                        >
                            {variantLabel(v)}
                            {!v.is_active ? ' · off' : ''}
                        </button>
                    ))}
                </div>
            ) : null}

            <div
                className={
                    useTabs
                        ? 'mt-3 rounded-lg border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-950'
                        : 'rounded-lg border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-950'
                }
                role="tabpanel"
            >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {variantLabel(active)}
                    </span>
                    {active.color_hex ? (
                        <span
                            className="inline-block h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-600"
                            style={{ backgroundColor: active.color_hex }}
                            title={active.color ?? active.color_hex}
                        />
                    ) : null}
                    {active.is_default ? (
                        <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
                            Default
                        </span>
                    ) : null}
                    {!active.is_active ? (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            Inactive
                        </span>
                    ) : null}
                    <span
                        className={`ml-auto text-xs ${
                            num(active.stock_quantity) > 0
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                        }`}
                    >
                        Stock {num(active.stock_quantity)}
                    </span>
                    <span
                        className={`${adminMutedText} w-full text-xs sm:w-auto`}
                    >
                        SKU {active.sku}
                    </span>
                </div>
                <VariantPricingDetail v={active} />
            </div>
        </div>
    );
}
