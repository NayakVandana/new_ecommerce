import { storeCard, storeMutedText, storeSectionEyebrow, storeSectionTitle } from '@/store/storeTheme';
import UserPanelLayout from '@/Layouts/User/UserPanelLayout';
import { useAuthUser } from '@/auth/useAuthUser';
import { catalogUrl } from '@/store/fashionBrand';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    const { user } = useAuthUser();

    const actionCard =
        'block border border-stone-200 bg-white p-6 transition hover:border-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-400';

    return (
        <UserPanelLayout title="Overview">
            <Head title="ÉLAN · My account" />
            <div className="mx-auto w-full max-w-5xl space-y-8">
                <div className={storeCard}>
                    <p className={storeSectionEyebrow}>Your wardrobe</p>
                    <h2 className={`${storeSectionTitle} mt-2`}>
                        Hello{user ? `, ${user.name.split(' ')[0]}` : ''}
                    </h2>
                    <p className={`mt-3 ${storeMutedText}`}>
                        Track fashion orders, update your profile, and shop new arrivals — all
                        connected to the same account as our mobile app.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Link href={route('user.orders.index')} className={actionCard}>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
                            Orders
                        </p>
                        <p className="mt-2 font-display text-xl text-stone-900 dark:text-stone-50">
                            Order history
                        </p>
                        <p className={`mt-2 ${storeMutedText}`}>
                            Status, delivery, and line items for every purchase.
                        </p>
                    </Link>
                    <Link href={route('profile.edit')} className={actionCard}>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
                            Profile
                        </p>
                        <p className="mt-2 font-display text-xl text-stone-900 dark:text-stone-50">
                            Details & security
                        </p>
                        <p className={`mt-2 ${storeMutedText}`}>
                            Name, email, password, and appearance preferences.
                        </p>
                    </Link>
                    <Link href={catalogUrl({ featured_only: true })} className={`${actionCard} sm:col-span-2`}>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
                            Boutique
                        </p>
                        <p className="mt-2 font-display text-xl text-stone-900 dark:text-stone-50">
                            Shop new arrivals
                        </p>
                        <p className={`mt-2 ${storeMutedText}`}>
                            Browse the latest fashion from the live catalog.
                        </p>
                    </Link>
                </div>
            </div>
        </UserPanelLayout>
    );
}
