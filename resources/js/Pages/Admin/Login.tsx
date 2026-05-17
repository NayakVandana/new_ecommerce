import { ADMIN_BRAND, ADMIN_TAGLINE } from '@/admin/adminBrand';
import {
    adminErrorBanner,
    adminInput,
    adminLabel,
    adminPageGradient,
    adminPrimaryBtn,
} from '@/admin/adminTheme';
import { type AdminApiEnvelope, setAdminApiToken } from '@/api/adminClient';
import AdminThemeToggle from '@/admin/AdminThemeToggle';
import AppearanceSync from '@/Components/AppearanceSync';
import axios from 'axios';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type LoginPayload = {
    user: Record<string, unknown>;
    token: string;
    token_type?: string;
};

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
                '/api/v1/admin/auth/admin-login',
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

            router.visit(route('admin.dashboard'));
        } catch {
            setError('Could not sign in.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title={`${ADMIN_BRAND} admin`} />
            <AppearanceSync />
            <div className={`${adminPageGradient} relative flex min-h-screen flex-col lg:flex-row`}>
                <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
                    <AdminThemeToggle />
                </div>
                <div className="relative hidden overflow-hidden lg:flex lg:w-[42%] xl:w-[45%]">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-stone-900 to-stone-950" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(139,92,246,0.35),transparent_55%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(59,130,246,0.2),transparent_50%)]" />
                    <div className="relative flex flex-col justify-between p-12 text-white xl:p-16">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-300/90">
                                {ADMIN_TAGLINE}
                            </p>
                            <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                                Manage sarees, kurtas & tunics in one place.
                            </h2>
                            <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-300">
                                Add ethnic pieces, update stock, and keep the women&apos;s catalog
                                in sync with the Suhaag storefront API.
                            </p>
                        </div>
                        <p className="text-xs text-slate-500">
                            © {new Date().getFullYear()} {ADMIN_BRAND}
                        </p>
                    </div>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-300/30 ring-1 ring-slate-100 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-black/40 dark:ring-white/5">
                        <div className="text-center lg:text-left">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
                                Admin
                            </p>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Sign in
                            </h1>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                Demo account{' '}
                                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                                    admin@example.com
                                </span>
                            </p>
                        </div>

                        <form className="mt-8 space-y-5" onSubmit={submit}>
                            {error && (
                                <div className={adminErrorBanner}>{error}</div>
                            )}
                            <div>
                                <label
                                    htmlFor="email"
                                    className={adminLabel}
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
                                    className={adminInput}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className={adminLabel}
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
                                    className={adminInput}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`${adminPrimaryBtn} w-full`}
                            >
                                {processing ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">
                            <Link
                                href={route('home')}
                                className="font-semibold text-violet-600 transition hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300"
                            >
                                ← Back to storefront
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
