import { HeartIcon } from '@/Components/store/StoreHeaderIcons';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuthUser } from '@/auth/useAuthUser';
import { storeHeaderCartBadge, storeHeaderIconBtn } from '@/store/storeTheme';
import { loginUrl } from '@/utils/requireAuth';
import { Link } from '@inertiajs/react';

export default function WishlistBadge() {
    const { user } = useAuthUser();
    const { count } = useWishlist();
    const href = user ? route('user.wishlist.index') : loginUrl(route('user.wishlist.index'));
    const isActive = route().current('user.wishlist.index');

    return (
        <Link
            href={href}
            className={`${storeHeaderIconBtn} ${isActive ? 'text-stone-900 dark:text-stone-50' : ''}`}
            aria-label={
                user && count > 0
                    ? `Wishlist, ${count} item${count === 1 ? '' : 's'}`
                    : 'Wishlist'
            }
        >
            <HeartIcon className="h-[22px] w-[22px] sm:h-6 sm:w-6" filled={false} />
            {user && count > 0 ? (
                <span className={storeHeaderCartBadge}>
                    {count > 99 ? '99+' : count}
                </span>
            ) : null}
        </Link>
    );
}
