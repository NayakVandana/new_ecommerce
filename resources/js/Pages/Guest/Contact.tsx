import { getUserApiToken } from '@/auth/authToken';
import { useAuthUser } from '@/auth/useAuthUser';
import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import {
    storeBtnPrimary,
    storeCard,
    storeErrorBanner,
    storeFieldError,
    storeInput,
    storeInputError,
    storeLabel,
    storeMutedText,
} from '@/store/storeTheme';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

type ContactResponse = {
    success: boolean;
    message: string;
    data?: { id: number } | Record<string, string[]>;
};

type FieldKey = 'name' | 'email' | 'phone' | 'subject' | 'message';

export default function Contact() {
    return (
        <GuestPanelLayout title="Contact us">
            <Head title="Contact us" />
            <ContactForm />
        </GuestPanelLayout>
    );
}

function ContactForm() {
    const { user } = useAuthUser();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            if (user.phone) {
                setPhone(user.phone);
            }
        }
    }, [user]);

    const inputClass = (field: FieldKey) =>
        `${storeInput} mt-1 ${fieldErrors[field] ? storeInputError : ''}`;

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        setSuccess(null);
        setFieldErrors({});

        const token = getUserApiToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        try {
            const res = await axios.post<ContactResponse>(
                '/api/v1/contact/contact-submit',
                { name, email, phone: phone || null, subject: subject || null, message },
                { headers },
            );

            if (!res.data.success) {
                const payload = res.data.data;
                if (payload && !('id' in payload)) {
                    const next: Partial<Record<FieldKey, string>> = {};
                    for (const [key, messages] of Object.entries(payload)) {
                        if (Array.isArray(messages) && messages[0]) {
                            next[key as FieldKey] = messages[0];
                        }
                    }
                    setFieldErrors(next);
                }
                setError(res.data.message || 'Could not send your message.');

                return;
            }

            setSuccess(res.data.message);
            setSubject('');
            setMessage('');
            if (!user) {
                setName('');
                setEmail('');
                setPhone('');
            }
        } catch {
            setError('Could not send your message. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl">
            <p className={storeMutedText}>
                Questions about orders, sizing, or our collection? Send us a note and we will
                respond by email.
            </p>

            {success ? (
                <div className="mt-6 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
                    {success}
                </div>
            ) : null}

            {error ? <div className={`mt-6 ${storeErrorBanner}`}>{error}</div> : null}

            <form onSubmit={submit} className={`mt-8 ${storeCard}`}>
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="contact-name" className={storeLabel}>
                            Name
                        </label>
                        <input
                            id="contact-name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass('name')}
                            autoComplete="name"
                        />
                        {fieldErrors.name ? (
                            <p className={storeFieldError}>{fieldErrors.name}</p>
                        ) : null}
                    </div>
                    <div>
                        <label htmlFor="contact-email" className={storeLabel}>
                            Email
                        </label>
                        <input
                            id="contact-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass('email')}
                            autoComplete="email"
                        />
                        {fieldErrors.email ? (
                            <p className={storeFieldError}>{fieldErrors.email}</p>
                        ) : null}
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="contact-phone" className={storeLabel}>
                            Phone (optional)
                        </label>
                        <input
                            id="contact-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={inputClass('phone')}
                            autoComplete="tel"
                        />
                        {fieldErrors.phone ? (
                            <p className={storeFieldError}>{fieldErrors.phone}</p>
                        ) : null}
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="contact-subject" className={storeLabel}>
                            Subject (optional)
                        </label>
                        <input
                            id="contact-subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className={inputClass('subject')}
                        />
                        {fieldErrors.subject ? (
                            <p className={storeFieldError}>{fieldErrors.subject}</p>
                        ) : null}
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="contact-message" className={storeLabel}>
                            Message
                        </label>
                        <textarea
                            id="contact-message"
                            required
                            rows={6}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className={`${inputClass('message')} resize-y`}
                        />
                        {fieldErrors.message ? (
                            <p className={storeFieldError}>{fieldErrors.message}</p>
                        ) : null}
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`${storeBtnPrimary} w-full sm:w-auto disabled:opacity-60`}
                    >
                        {processing ? 'Sending…' : 'Send message'}
                    </button>
                </div>
            </form>
        </div>
    );
}
