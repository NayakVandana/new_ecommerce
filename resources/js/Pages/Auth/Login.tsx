import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import PasswordInput from '@/Components/PasswordInput';
import TextInput from '@/Components/TextInput';
import { clearAuthUserCache, useAuthUser } from '@/auth/useAuthUser';
import { setUserApiToken } from '@/auth/authToken';
import { getPostAuthRedirect, registerUrl } from '@/utils/requireAuth';
import GuestLayout from '@/Layouts/GuestLayout';
import type { User } from '@/types';
import axios from 'axios';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

type LoginResponse = {
    success: boolean;
    message: string;
    data?: { user: User; token: string };
};

export default function Login({
    status,
    redirect,
}: {
    status?: string;
    redirect?: string | null;
}) {
    const { isLoggedIn, refresh } = useAuthUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isLoggedIn) {
            router.visit(getPostAuthRedirect(redirect, route('dashboard')));
        }
    }, [isLoggedIn, redirect]);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const res = await axios.post<LoginResponse>('/api/v1/auth/auth-login', {
                email,
                password,
                device_name: remember ? 'web-remember' : 'web',
            });

            if (!res.data.success || !res.data.data?.token) {
                setErrors({ email: res.data.message || 'Invalid credentials.' });

                return;
            }

            setUserApiToken(res.data.data.token);
            clearAuthUserCache();
            await refresh();

            router.visit(getPostAuthRedirect(redirect, route('dashboard')));
        } catch {
            setErrors({ email: 'Could not sign in.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <p className="mb-4 text-sm text-gray-600">
                Sign in with your account token — no server session.
            </p>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <PasswordInput
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-gray-600">Remember me</span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('password.request')}
                        className="rounded-md text-sm text-gray-600 underline"
                    >
                        Forgot password?
                    </Link>
                    <PrimaryButton className="ms-4" disabled={processing}>
                        {processing ? 'Signing in…' : 'Log in'}
                    </PrimaryButton>
                </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                No account?{' '}
                <Link
                    href={registerUrl(redirect ?? undefined)}
                    className="font-medium text-indigo-600 underline"
                >
                    Register
                </Link>
            </p>
        </GuestLayout>
    );
}
