import { FASHION_BRAND, FASHION_TAGLINE } from '@/store/fashionBrand';
import { storeBrand, storeBrandSub } from '@/store/storeTheme';
import { Link } from '@inertiajs/react';

export default function FashionLogo({
    subline,
    hideSublineOnMobile = false,
}: {
    subline?: string;
    hideSublineOnMobile?: boolean;
}) {
    const line = subline ?? FASHION_TAGLINE;

    return (
        <Link href={route('home')} className="block min-w-0 text-left">
            <span className={`block ${storeBrand}`}>{FASHION_BRAND}</span>
            {line ? (
                <span
                    className={`${storeBrandSub} mt-0.5 block truncate ${
                        hideSublineOnMobile ? 'hidden sm:block' : ''
                    }`}
                >
                    {line}
                </span>
            ) : null}
        </Link>
    );
}
