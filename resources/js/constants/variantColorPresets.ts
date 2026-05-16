/** Quick-pick swatches for variant “Color code (hex)” (plus any custom hex). */
export const VARIANT_COLOR_PRESET_SWATCHES: { hex: string; label: string }[] = [
    { hex: '#e60012', label: 'Red' },
    { hex: '#f39800', label: 'Orange' },
    { hex: '#0000ff', label: 'Blue' },
    { hex: '#800080', label: 'Purple' },
    { hex: '#ff00ff', label: 'Magenta' },
    { hex: '#ffff00', label: 'Yellow' },
    { hex: '#00ff00', label: 'Lime' },
    { hex: '#87ceeb', label: 'Sky blue' },
    { hex: '#8b4513', label: 'Brown' },
    { hex: '#000000', label: 'Black' },
    { hex: '#808080', label: 'Grey' },
    { hex: '#ffffff', label: 'White' },
];

/** Normalized hex values for “preset vs custom” selection UI. */
export const VARIANT_PRESET_HEX_SET = new Set(
    VARIANT_COLOR_PRESET_SWATCHES.map((s) => s.hex.toLowerCase()),
);
