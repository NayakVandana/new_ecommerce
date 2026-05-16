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
            Cart
            {user && count > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                    {count > 99 ? '99+' : count}
                </span>
            ) : null}
        </Link>
    );
}
