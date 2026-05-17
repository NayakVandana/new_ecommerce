import { wishlistStore } from '@/api/wishlistClient';
import { HeartIcon } from '@/Components/store/StoreHeaderIcons';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuthUser } from '@/auth/useAuthUser';
import { redirectToLogin } from '@/utils/requireAuth';
import { useState } from 'react';

type WishlistToggleButtonProps = {
    productVariantId: number;
    className?: string;
    /** Overlay on product image */
    overlay?: boolean;
};

export default function WishlistToggleButton({
    productVariantId,
    className = '',
    overlay = false,
}: WishlistToggleButtonProps) {
    const { isLoggedIn } = useAuthUser();
    const { isSaved, ready } = useWishlist();
    const [busy, setBusy] = useState(false);

    const saved = ready && isSaved(productVariantId);

    const toggle = async () => {
        if (!productVariantId) {
            return;
        }

        if (!isLoggedIn) {
            redirectToLogin();

            return;
        }

        setBusy(true);
        try {
            await wishlistStore.toggle(productVariantId);
        } finally {
            setBusy(false);
        }
    };

    const baseClass = overlay
        ? 'absolute right-2 top-2 z-10 flex min-h-9 min-w-9 items-center justify-center border border-stone-200/80 bg-white/95 text-stone-600 shadow-sm transition hover:text-rose-600 dark:border-stone-700 dark:bg-stone-900/95 dark:text-stone-300 dark:hover:text-rose-400'
        : 'inline-flex min-h-10 min-w-10 items-center justify-center text-stone-500 transition hover:text-rose-600 disabled:opacity-50 dark:text-stone-400 dark:hover:text-rose-400';

    return (
        <button
            type="button"
            disabled={busy || !productVariantId}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void toggle();
            }}
            className={`${baseClass} ${saved ? 'text-rose-600 dark:text-rose-400' : ''} ${className}`.trim()}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
        >
            <HeartIcon className="h-5 w-5" filled={saved} />
        </button>
    );
}
