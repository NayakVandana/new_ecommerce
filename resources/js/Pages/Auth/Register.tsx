import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { clearAuthUserCache, useAuthUser } from '@/auth/useAuthUser';
import { setUserApiToken } from '@/auth/authToken';
import { getPostAuthRedirect, loginUrl } from '@/utils/requireAuth';
import GuestLayout from '@/Layouts/GuestLayout';
import type { User } from '@/types';
import axios from 'axios';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

type RegisterResponse = {
    success: boolean;
    message: string;
    data?: { user: User; token: string };
};

export default function Register({
    redirect,
}: {
    redirect?: string | null;
}) {
    const { isLoggedIn, refresh } = useAuthUser();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
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
            const res = await axios.post<RegisterResponse>('/api/v1/auth/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                device_name: 'web',
            });

            if (!res.data.success || !res.data.data?.token) {
                setErrors({ email: res.data.message || 'Could not register.' });

                return;
            }

            setUserApiToken(res.data.data.token);
            clearAuthUserCache();
            await refresh();

            router.visit(getPostAuthRedirect(redirect, route('dashboard')));
        } catch {
            setErrors({ email: 'Could not register.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <p className="mb-4 text-sm text-gray-600">
                Create an account — authentication uses a Bearer token only.
            </p>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirm password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link href={loginUrl(redirect ?? undefined)} className="text-sm underline">
                        Already registered?
                    </Link>
                    <PrimaryButton className="ms-4" disabled={processing}>
                        {processing ? 'Creating…' : 'Register'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
