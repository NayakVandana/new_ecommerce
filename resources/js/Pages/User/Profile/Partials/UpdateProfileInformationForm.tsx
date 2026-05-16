import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { type UserApiEnvelope, userApiPost } from '@/api/userClient';
import { Transition } from '@headlessui/react';
import { clearAuthUserCache, useAuthUser } from '@/auth/useAuthUser';
import { Link } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const { user, refresh } = useAuthUser();

    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');

    useEffect(() => {
        setName(user?.name ?? '');
        setEmail(user?.email ?? '');
    }, [user]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        try {
            const res = await userApiPost<UserApiEnvelope<unknown>>(
                '/profile/update',
                {
                    name,
                    email,
                },
            );
            if (res.success) {
                setRecentlySuccessful(true);
                clearAuthUserCache();
                await refresh();
                window.setTimeout(() => setRecentlySuccessful(false), 2500);
            } else if (
                res.data &&
                typeof res.data === 'object' &&
                !Array.isArray(res.data)
            ) {
                const flat: Record<string, string> = {};
                for (const [key, val] of Object.entries(
                    res.data as Record<string, string[]>,
                )) {
                    if (Array.isArray(val) && val[0]) {
                        flat[key] = val[0];
                    }
                }
                setErrors(flat);
            } else {
                setErrors({ email: res.message });
            }
        } catch {
            setErrors({ email: 'Could not save profile.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="text-sm font-medium text-stone-700 underline underline-offset-4 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
