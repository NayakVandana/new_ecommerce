import type { CatalogProduct, CatalogVariant } from '@/store/catalogTypes';
import StorePriceDisplay from '@/Components/store/StorePriceDisplay';
import {
    formatStorePrice,
    variantGalleryImages,
    variantLabel,
    variantPriceDisplay,
    variantThumbSrc,
} from '@/store/productUtils';
import { storeLabel, storeMutedText } from '@/store/storeTheme';

type Props = {
    product: CatalogProduct;
    variants: CatalogVariant[];
    activeVariant: CatalogVariant | null;
    variantId: number;
    onSelect: (id: number) => void;
};

export default function VariantPicker({
    product,
    variants,
    activeVariant,
    variantId,
    onSelect,
}: Props) {
    if (variants.length === 0) {
        return null;
    }

    const useCards = variants.length <= 8;

    return (
        <div className="mt-6 space-y-4">
            <div>
                <p className={storeLabel}>Choose variant</p>
                <p className={`mt-1 ${storeMutedText}`}>
                    Price, stock, and photos update for each size / colour.
                </p>
            </div>

            {useCards ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                    {variants.map((v) => {
                        const selected = v.id === variantId;
                        const thumb = variantThumbSrc(product, v);
                        const inStock = v.stock_quantity > 0;
                        const pricing = variantPriceDisplay(v);
                        const imageCount = variantGalleryImages(product, v).length;

                        return (
                            <li key={v.id}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(v.id)}
                                    className={`flex w-full gap-3 rounded-xl border p-2.5 text-left transition ${
                                        selected
                                            ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900 dark:border-stone-100 dark:bg-stone-900 dark:ring-stone-100'
                                            : 'border-stone-200 bg-white hover:border-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:hover:border-stone-500'
                                    }`}
                                >
                                    <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
                                        {thumb ? (
                                            <img
                                                src={thumb}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="flex h-full items-center justify-center text-[10px] text-stone-400">
                                                No img
                                            </span>
                                        )}
                                        {imageCount > 1 ? (
                                            <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[9px] font-medium text-white">
                                                {imageCount}
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium text-stone-900 dark:text-stone-50">
                                                {variantLabel(v)}
                                            </span>
                                            {v.color_hex ? (
                                                <span
                                                    className="inline-block h-4 w-4 rounded-full border border-stone-300 dark:border-stone-600"
                                                    style={{
                                                        backgroundColor: v.color_hex,
                                                    }}
                                                    title={v.color ?? v.color_hex}
                                                />
                                            ) : null}
                                        </span>
                                        <span className="mt-0.5 block text-sm font-semibold text-stone-800 dark:text-stone-200">
                                            {formatStorePrice(pricing.finalPrice)}
                                        </span>
                                        <span
                                            className={`mt-0.5 block text-xs ${
                                                inStock
                                                    ? 'text-emerald-700 dark:text-emerald-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}
                                        >
                                            {inStock
                                                ? `${v.stock_quantity} in stock`
                                                : 'Out of stock'}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <label className="block">
                    <span className="sr-only">Variant</span>
                    <select
                        value={variantId}
                        onChange={(e) => onSelect(Number(e.target.value))}
                        className="mt-1 block w-full max-w-md rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm dark:border-stone-600 dark:bg-stone-900"
                    >
                        {variants.map((v) => {
                            const pricing = variantPriceDisplay(v);

                            return (
                                <option key={v.id} value={v.id}>
                                    {variantLabel(v)} —{' '}
                                    {formatStorePrice(pricing.finalPrice)}
                                    {v.stock_quantity < 1 ? ' (out of stock)' : ''}
                                </option>
                            );
                        })}
                    </select>
                </label>
            )}

            {activeVariant ? (
                <StorePriceDisplay variant={activeVariant} className="border-t border-stone-200 pt-4 dark:border-stone-800" />
            ) : null}
        </div>
    );
}
