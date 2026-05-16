/** Women's ethnic fashion storefront (Suhaag). */

export const FASHION_BRAND = 'Suhaag';
export const FASHION_TAGLINE = "Women's ethnic wear";
export const FASHION_ANNOUNCEMENT =
    'Free shipping on sarees & suits over ₹999 · 14-day easy returns';

/** Primary shop departments — must match `config/store.php` slugs. */
export const SHOP_CATEGORY_SLUGS = ['sarees', 'kurtas-suits', 'tunics'] as const;

export type ShopCategorySlug = (typeof SHOP_CATEGORY_SLUGS)[number];

export const SHOP_CATEGORY_LABELS: Record<ShopCategorySlug, string> = {
    sarees: 'Sarees',
    'kurtas-suits': 'Kurtas & Suits',
    tunics: 'Tunics',
};

export function catalogUrl(
    params: Record<string, string | number | boolean | undefined> = {},
): string {
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '' && value !== false) {
            q.set(key, String(value));
        }
    }
    const query = q.toString();

    return query ? `${route('guest.catalog')}?${query}` : route('guest.catalog');
}

export function catalogUrlForCategory(
    categoryId: number,
    extra: Record<string, string | number | boolean | undefined> = {},
): string {
    return catalogUrl({ category_id: categoryId, ...extra });
}
