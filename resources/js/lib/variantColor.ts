/** Fallback shown in `<input type="color">` when stored value is not a hex color. */
export const COLOR_PICKER_FALLBACK_HEX = '#94a3b8';

/**
 * Normalize to 6-digit lowercase hex, or null if not a hex string.
 * Accepts #RGB and #RRGGBB.
 */
export function normalizeHexColor6(input: string): string | null {
    const t = input.trim();
    if (/^#[0-9A-Fa-f]{6}$/i.test(t)) {
        return t.toLowerCase();
    }
    if (/^#[0-9A-Fa-f]{3}$/i.test(t)) {
        const r = t[1];
        const g = t[2];
        const b = t[3];

        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }

    return null;
}

export function isHexColorString(value: string): boolean {
    return normalizeHexColor6(value) !== null;
}

/** Value for `<input type="color">` (must be #rrggbb); falls back when missing/invalid. */
export function colorPickerInputValue(hexOrEmpty: string): string {
    return normalizeHexColor6(hexOrEmpty) ?? COLOR_PICKER_FALLBACK_HEX;
}

/** Normalize to #rrggbb or null (for API / DB). */
export function normalizeColorHexForApi(input: string): string | null {
    return normalizeHexColor6(input.trim());
}
