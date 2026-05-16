import { FASHION_BRAND, catalogUrl, catalogUrlForCategory } from '@/store/fashionBrand';
import { useWomenStore } from '@/hooks/useWomenStore';
import { storeFooter, storeFooterInner, storeMutedText } from '@/store/storeTheme';
import { Link } from '@inertiajs/react';

export default function StoreFooter() {
    const { shopCategories } = useWomenStore();

    return (
        <footer className={storeFooter}>
            <div className={storeFooterInner}>
                <div>
                    <p className="font-display text-2xl tracking-wide text-stone-900 dark:text-stone-50">
                        {FASHION_BRAND}
                    </p>
                    <p className={`mt-3 max-w-xs ${storeMutedText}`}>
                        Women&apos;s ethnic wear — sarees, kurta sets, salwar suits, and tunics.
                        Powered by the same catalog API as our mobile app.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
                            Shop
                        </p>
                        <ul className="mt-4 space-y-2.5 text-sm">
                            <li>
                                <Link href={route('home')} className="hover:underline">
                                    Home
                                </Link>
                            </li>
                            {shopCategories.map((cat) => (
                                <li key={cat.id}>
                                    <Link
                                        href={catalogUrlForCategory(cat.id)}
                                        className="hover:underline"
                                    >
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href={route('guest.cart')} className="hover:underline">
                                    Shopping bag
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
                            Account
                        </p>
                        <ul className="mt-4 space-y-2.5 text-sm">
                            <li>
                                <Link href={route('login')} className="hover:underline">
                                    Sign in
                                </Link>
                            </li>
                            <li>
                                <Link href={route('register')} className="hover:underline">
                                    Create account
                                </Link>
                            </li>
                            <li>
                                <Link href={route('dashboard')} className="hover:underline">
                                    My account
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-500">
                            Help
                        </p>
                        <ul className="mt-4 space-y-2.5 text-sm">
                            <li>
                                <Link href={route('user.orders.index')} className="hover:underline">
                                    Orders & returns
                                </Link>
                            </li>
                            <li>
                                <Link href={catalogUrl({ featured_only: true })} className="hover:underline">
                                    New arrivals
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <p
                className={`border-t border-stone-200 px-4 py-5 text-center text-[10px] uppercase tracking-widest dark:border-stone-800 ${storeMutedText}`}
            >
                © {new Date().getFullYear()} {FASHION_BRAND} · Women&apos;s ethnic wear only
            </p>
        </footer>
    );
}
