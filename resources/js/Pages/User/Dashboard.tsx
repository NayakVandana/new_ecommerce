import { storeCard, storeMutedText } from '@/store/storeTheme';
import UserPanelLayout from '@/Layouts/User/UserPanelLayout';
import { useAuthUser } from '@/auth/useAuthUser';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    const { user } = useAuthUser();

    const actionCard =
        'block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700';

    return (
        <UserPanelLayout title="Overview">
            <Head title="My account" />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className={storeCard}>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Hello{user ? `, ${user.name}` : ''}
                    </h2>
                    <p className={`mt-2 ${storeMutedText}`}>
                        Manage your profile, track orders, and shop from the storefront or mobile
                        app with the same account.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Link href={route('user.orders.index')} className={actionCard}>
                        <p className="font-semibold text-slate-900 dark:text-white">Orders</p>
                        <p className={`mt-1 ${storeMutedText}`}>
                            Order history, status, and line items
                        </p>
                        <span className="mt-3 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            View orders →
                        </span>
                    </Link>
                    <Link href={route('profile.edit')} className={actionCard}>
                        <p className="font-semibold text-slate-900 dark:text-white">
                            Profile & security
                        </p>
                        <p className={`mt-1 ${storeMutedText}`}>
                            Name, email, password, appearance
                        </p>
                        <span className="mt-3 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            Open →
                        </span>
                    </Link>
                    <Link href={route('home')} className={`${actionCard} sm:col-span-2`}>
                        <p className="font-semibold text-slate-900 dark:text-white">
                            Guest store
                        </p>
                        <p className={`mt-1 ${storeMutedText}`}>
                            Browse catalog and cart without admin tools
                        </p>
                        <span className="mt-3 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            Shop →
                        </span>
                    </Link>
                </div>
            </div>
        </UserPanelLayout>
    );
}
