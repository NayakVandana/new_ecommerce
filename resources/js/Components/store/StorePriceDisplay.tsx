import {
    formatStorePrice,
    variantPriceDisplay,
} from '@/store/productUtils';
import type { CatalogVariant } from '@/store/catalogTypes';

type Props = {
    variant: CatalogVariant;
    className?: string;
    size?: 'md' | 'lg';
};

export default function StorePriceDisplay({
    variant,
    className = '',
    size = 'md',
}: Props) {
    const display = variantPriceDisplay(variant);
    const finalClass =
        size === 'lg'
            ? 'text-2xl font-bold text-slate-900 dark:text-white'
            : 'text-base font-bold text-slate-900 dark:text-white';

    return (
        <div className={className}>
            <div className="flex flex-wrap items-baseline gap-2">
                <span className={finalClass}>
                    {formatStorePrice(display.finalPrice)}
                </span>
                {display.hasDiscount && display.mrp != null ? (
                    <span className="text-sm text-slate-500 line-through dark:text-slate-400">
                        {formatStorePrice(display.mrp)}
                    </span>
                ) : null}
                {display.hasDiscount && display.discountPercent > 0 ? (
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                        {display.discountPercent % 1 === 0
                            ? display.discountPercent.toFixed(0)
                            : display.discountPercent.toFixed(1)}
                        % off
                    </span>
                ) : null}
            </div>
        </div>
    );
}
