import { FASHION_BRAND, FASHION_TAGLINE } from '@/store/fashionBrand';
import { storeBrand, storeBrandSub } from '@/store/storeTheme';
import { Link } from '@inertiajs/react';

export default function FashionLogo({ subline }: { subline?: string }) {
    return (
        <Link href={route('home')} className="min-w-0 text-center md:text-left">
            <span className={`block ${storeBrand}`}>{FASHION_BRAND}</span>
            <span className={`${storeBrandSub} mt-0.5 block`}>
                {subline ?? FASHION_TAGLINE}
            </span>
        </Link>
    );
}
