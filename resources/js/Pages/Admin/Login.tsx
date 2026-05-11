import {
    type AdminApiEnvelope,
    setAdminApiToken,
} from '@/api/adminClient';
import AppearanceSync from '@/Components/AppearanceSync';
import axios from 'axios';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type LoginPayload = {
    user: Record<string, unknown>;
    token: string;
    token_type?: string;
};

const inputClass =
    'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        try {
            const res = await axios.post<AdminApiEnvelope<LoginPayload>>(
                '/api/v1/admin/auth/login',
                {
                    email,
                    password,
                    device_name: 'admin-panel',
                },
            );

            const body = res.data;
            if (!body.success || !body.data?.token) {
                setError(body.message || 'Could not sign in.');

                return;
            }

            setAdminApiToken(body.data.token);

            await axios.get('/sanctum/csrf-cookie');
            await axios.post(route('admin.session.bootstrap'), {
                token: body.data.token,
            });

            router.visit(route('admin.dashboard'));
        } catch {
            setError('Could not sign in.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title="Admin login" />
            <AppearanceSync />
            <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <h1 className="text-center text-2xl font-semibold text-slate-900 dark:text-white">
                        Admin sign in
                    </h1>
                    <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                        Seeded{' '}
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                            admin@example.com
                        </span>
                    </p>

                    <form className="mt-8 space-y-5" onSubmit={submit}>
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                                {error}
                            </div>
                        )}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="username"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className={inputClass}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            Sign in
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
                        <Link
                            href={route('home')}
                            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            Back to storefront
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
