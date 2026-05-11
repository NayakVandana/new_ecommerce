import UserPanelLayout from '@/Layouts/User/UserPanelLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Dashboard({ auth }: PageProps) {
    const user = auth.user;

    const card =
        'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900';
    const actionCard =
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:shadow-lg';

    return (
        <UserPanelLayout title="Overview">
            <Head title="My account" />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className={card}>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Hello{user ? `, ${user.name}` : ''}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        This is your <strong className="text-slate-800 dark:text-slate-200">user panel</strong>.
                        Manage profile and security, then use the storefront or mobile app with the same account.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Link href={route('profile.edit')} className={actionCard}>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Profile & security
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Name, email, password, appearance, delete account
                        </p>
                        <span className="mt-3 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            Open →
                        </span>
                    </Link>
                    <Link href={route('home')} className={actionCard}>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Guest store
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Browse catalog and cart as guest
                        </p>
                        <span className="mt-3 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            Open →
                        </span>
                    </Link>
                </div>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                        User API
                    </p>
                    <p className="mt-2">
                        Authenticated JSON routes live under{' '}
                        <code className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-800 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200">
                            /api/v1/user/*
                        </code>{' '}
                        (Sanctum + session). Profile forms on the Profile page call these endpoints.
                    </p>
                </div>
            </div>
        </UserPanelLayout>
    );
}
