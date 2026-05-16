import { cartStore } from '@/api/cartClient';
import { useAuthUser } from '@/auth/useAuthUser';
import { storeNavActive, storeNavInactive } from '@/store/storeTheme';
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
            className={`relative ${isActive ? storeNavActive : storeNavInactive}`}
        >
            Bag
            {user && count > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-stone-900 px-1 text-[9px] font-bold text-white dark:bg-stone-100 dark:text-stone-900">
                    {count > 99 ? '99+' : count}
                </span>
            ) : null}
        </Link>
    );
}
