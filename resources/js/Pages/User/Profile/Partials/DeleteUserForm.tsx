import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { setUserApiToken } from '@/auth/authToken';
import { clearAuthUserCache } from '@/auth/useAuthUser';
import { type UserApiEnvelope, userApiPost } from '@/api/userClient';
import { router } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const passwordInput = useRef<HTMLInputElement>(null);

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        try {
            const res = await userApiPost<UserApiEnvelope<null>>(
                '/profile/destroy',
                { password },
            );
            if (res.success) {
                setUserApiToken(null);
                clearAuthUserCache();
                router.visit(route('home'));

                return;
            }
            if (
                res.data &&
                typeof res.data === 'object' &&
                !Array.isArray(res.data)
            ) {
                const msgs = res.data as Record<string, string[]>;
                const flat: Record<string, string> = {};
                for (const [key, val] of Object.entries(msgs)) {
                    if (Array.isArray(val) && val[0]) {
                        flat[key] = val[0];
                    }
                }
                setErrors(flat);
            } else {
                setErrors({ password: res.message });
            }
        } catch {
            setErrors({ password: 'Could not delete account.' });
        } finally {
            setProcessing(false);
            passwordInput.current?.focus();
        }
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        setErrors({});
        setPassword('');
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Delete Account
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Are you sure you want to delete your account?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Please enter your
                        password to confirm you would like to permanently delete
                        your account.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder="Password"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton className="ms-3" disabled={processing}>
                            Delete Account
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
