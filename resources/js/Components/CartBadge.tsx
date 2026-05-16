import { BagIcon } from '@/Components/store/StoreHeaderIcons';
import { cartStore } from '@/api/cartClient';
import { useAuthUser } from '@/auth/useAuthUser';
import { storeHeaderCartBadge, storeHeaderIconBtn } from '@/store/storeTheme';
import { loginUrl } from '@/utils/requireAuth';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function CartBadge() {
    const { user } = useAuthUser();
    const [count, setCount] = useState(0);

    const refresh = () => {
        if (!user) {
            setCount(0);

            return;
        }

        void cartStore.list().then((res) => {
            if (res.success && res.data) {
                setCount(res.data.count);
            }
        });
    };

    useEffect(() => {
        refresh();
        window.addEventListener('cartUpdated', refresh);

        return () => window.removeEventListener('cartUpdated', refresh);
    }, [user]);

    const href = user ? route('guest.cart') : loginUrl(route('guest.cart'));
    const isActive = route().current('guest.cart');

    return (
        <Link
            href={href}
            className={`${storeHeaderIconBtn} ${isActive ? 'text-stone-900 dark:text-stone-50' : ''}`}
            aria-label={
                user && count > 0
                    ? `Shopping bag, ${count} item${count === 1 ? '' : 's'}`
                    : 'Shopping bag'
            }
        >
            <BagIcon className="h-[22px] w-[22px] sm:h-6 sm:w-6" />
            {user && count > 0 ? (
                <span className={storeHeaderCartBadge}>
                    {count > 99 ? '99+' : count}
                </span>
            ) : null}
        </Link>
    );
}
