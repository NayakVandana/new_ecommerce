import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { loginUrl } from '@/utils/requireAuth';
import { storeMutedText } from '@/store/storeTheme';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({
    status,
    redirect,
}: {
    status?: string;
    redirect?: string | null;
}) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot password" />

            <h1 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                Forgot your password?
            </h1>
            <p className={`mt-2 ${storeMutedText}`}>
                Enter your email and we will send you a link to choose a new password.
            </p>

            {status ? (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                    {status}
                </div>
            ) : null}

            <form className="mt-6" onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        isFocused
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href={loginUrl(redirect ?? undefined)}
                        className="text-sm font-medium text-stone-600 underline dark:text-stone-400"
                    >
                        Back to sign in
                    </Link>
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Sending…' : 'Email reset link'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
