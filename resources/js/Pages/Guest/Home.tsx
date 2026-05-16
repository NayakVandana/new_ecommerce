import {
    storeBtnPrimary,
    storeBtnSecondary,
    storeCard,
    storeCardMuted,
    storeMutedText,
} from '@/store/storeTheme';
import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import { Head, Link } from '@inertiajs/react';

export default function Home() {
    return (
        <GuestPanelLayout title="Welcome">
            <Head title="Store · Home" />
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                <div className={storeCard}>
                    <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                        Guest store
                    </p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Shop without signing in
                    </h2>
                    <p className={`mt-3 ${storeMutedText}`}>
                        Browse the catalog and build a cart. Sign in to open your account for
                        profile, orders, and checkout.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href={route('guest.catalog')} className={storeBtnPrimary}>
                            Browse products
                        </Link>
                        <Link href={route('guest.cart')} className={storeBtnSecondary}>
                            View cart
                        </Link>
                    </div>
                </div>
                <div className={`${storeCardMuted} space-y-3`}>
                    <h3 className="font-semibold text-slate-900 dark:text-white">For members</h3>
                    <p className={storeMutedText}>
                        Sign in to track orders, save your profile, and check out faster.
                    </p>
                    <Link href={route('login')} className={`${storeBtnPrimary} w-full sm:w-auto`}>
                        Log in
                    </Link>
                </div>
            </div>
        </GuestPanelLayout>
    );
}
