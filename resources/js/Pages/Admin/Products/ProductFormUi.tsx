import {
    adminCancelBtn,
    adminFieldError,
    adminFormSection,
    adminFormSectionDesc,
    adminFormSectionTitle,
    adminInput,
    adminLabel,
    adminMutedText,
    adminPrimaryBtn,
} from '@/admin/adminTheme';
import { VARIANT_COLOR_PRESET_SWATCHES, VARIANT_PRESET_HEX_SET } from '@/constants/variantColorPresets';
import {
    colorPickerInputValue,
    normalizeHexColor6,
} from '@/lib/variantColor';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

/** Red helper text shown directly under an input (matches creditor-form style). */
export function AdminFieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className={adminFieldError}>{message}</p>;
}

/** Keeps default input chrome; errors are shown as text below the field. */
export function adminInputErrorClass(_hasError: boolean, base: string): string {
    return base;
}

export function AdminFormField({
    id,
    label,
    required,
    error,
    dataErrorField,
    children,
}: PropsWithChildren<{
    id?: string;
    label: ReactNode;
    required?: boolean;
    error?: string;
    dataErrorField?: string;
}>) {
    return (
        <div data-error-field={dataErrorField}>
            <label htmlFor={id} className={adminLabel}>
                {label}
                {required ? (
                    <span className="text-red-600 dark:text-red-400"> *</span>
                ) : null}
            </label>
            {children}
            <AdminFieldError message={error} />
        </div>
    );
}

export function FormSection({
    title,
    description,
    children,
    defaultOpen = true,
    badge,
}: PropsWithChildren<{
    title: string;
    description?: string;
    defaultOpen?: boolean;
    badge?: ReactNode;
}>) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <section className={adminFormSection}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-start justify-between gap-3 text-left"
                aria-expanded={open}
            >
                <div>
                    <h2 className={adminFormSectionTitle}>{title}</h2>
                    {description ? (
                        <p className={adminFormSectionDesc}>{description}</p>
                    ) : null}
                </div>
                <span className="flex shrink-0 items-center gap-2">
                    {badge}
                    <Chevron open={open} />
                </span>
            </button>
            {open ? <div className="mt-5 space-y-4">{children}</div> : null}
        </section>
    );
}

function Chevron({ open }: { open: boolean }) {
    return (
        <svg
            className={`h-5 w-5 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    );
}

export function PublishPanel({
    processing,
    cancelHref,
}: {
    processing: boolean;
    cancelHref: string;
}) {
    return (
        <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 via-white to-indigo-50/60 p-5 shadow-md ring-1 ring-violet-100/80 dark:border-violet-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/50 dark:ring-white/10">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Ready to publish?
            </p>
            <p className={`mt-1 ${adminMutedText}`}>
                Save when product details and at least one variant are complete.
            </p>
            <div className="mt-4 flex flex-col gap-2">
                <button
                    type="submit"
                    disabled={processing}
                    className={`${adminPrimaryBtn} w-full`}
                >
                    {processing ? 'Saving…' : 'Save product'}
                </button>
                <Link
                    href={cancelHref}
                    className={`inline-flex items-center justify-center ${adminCancelBtn}`}
                >
                    Cancel
                </Link>
            </div>
        </div>
    );
}

export type VariantColorRow = {
    color: string;
    color_hex: string;
};

export function VariantColorField({
    row,
    onColorNameChange,
    onColorHexChange,
    onPresetPick,
    colorNameError,
    colorError,
    colorHexError,
    combinationError,
}: {
    row: VariantColorRow;
    onColorNameChange: (value: string) => void;
    onColorHexChange: (value: string) => void;
    onPresetPick: (hex: string) => void;
    colorNameError?: string;
    colorError?: string;
    colorHexError?: string;
    combinationError?: string;
}) {
    const currentHex = normalizeHexColor6(row.color_hex);
    const customActive =
        currentHex !== null && !VARIANT_PRESET_HEX_SET.has(currentHex);

    const requiredColorMessage =
        colorError || colorNameError || colorHexError || undefined;

    return (
        <div className="space-y-3">
            <div>
                <label className={adminLabel}>
                    Color name{' '}
                    <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <input
                    value={row.color}
                    onChange={(e) => onColorNameChange(e.target.value)}
                    placeholder="e.g. Navy"
                    className={adminInput}
                />
            </div>
            <div>
                <label className={adminLabel}>
                    Color{' '}
                    <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    {VARIANT_COLOR_PRESET_SWATCHES.map(({ hex, label }) => {
                        const selected = currentHex === hex;
                        const isWhite = hex === '#ffffff';

                        return (
                            <button
                                key={hex}
                                type="button"
                                title={label}
                                aria-label={`${label} ${hex}`}
                                aria-pressed={selected}
                                onClick={() => onPresetPick(hex)}
                                className={`h-8 w-8 shrink-0 rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                                    selected
                                        ? 'border-violet-600 ring-2 ring-violet-500 ring-offset-1'
                                        : isWhite
                                          ? 'border-slate-300'
                                          : 'border-slate-200 hover:scale-105 dark:border-slate-600'
                                }`}
                                style={{ backgroundColor: hex }}
                            />
                        );
                    })}
                    <input
                        type="color"
                        aria-label="Custom color"
                        title="Custom color"
                        value={colorPickerInputValue(row.color_hex)}
                        onChange={(e) =>
                            onColorHexChange(e.target.value.toLowerCase())
                        }
                        className={`h-8 w-8 shrink-0 cursor-pointer appearance-none overflow-hidden rounded-full border-2 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 ${
                            customActive
                                ? 'border-emerald-600 ring-2 ring-emerald-500/60 ring-offset-1'
                                : 'border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
                        }`}
                    />
                </div>
                <input
                    value={row.color_hex}
                    onChange={(e) => onColorHexChange(e.target.value)}
                    placeholder="#2563eb"
                    className={`${adminInput} mt-2 max-w-[10rem] font-mono text-sm`}
                />
            </div>
            <AdminFieldError message={requiredColorMessage} />
            <AdminFieldError message={combinationError} />
        </div>
    );
}

export function VariantMediaToggle({
    open,
    onToggle,
    imageCount,
    videoCount,
}: {
    open: boolean;
    onToggle: () => void;
    imageCount: number;
    videoCount: number;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-expanded={open}
        >
            <span>
                Images &amp; videos
                <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                    ({imageCount} img · {videoCount} vid)
                </span>
            </span>
            <Chevron open={open} />
        </button>
    );
}
