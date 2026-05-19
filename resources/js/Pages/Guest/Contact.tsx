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
import {
    type ContactFieldKey,
    mapApiFieldErrors,
    validateContactForm,
} from '@/store/validateContactForm';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

type ContactResponse = {
    success: boolean;
    message: string;
    data?: { id: number } | Record<string, string[]>;
};

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
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<ContactFieldKey, string>>>({});

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            if (user.phone) {
                setPhone(user.phone);
            }
        }
    }, [user]);

    const clearFieldError = (field: ContactFieldKey) => {
        setFieldErrors((prev) => {
            if (!prev[field]) {
                return prev;
            }

            const next = { ...prev };
            delete next[field];

            return next;
        });
    };

    const inputClass = (field: ContactFieldKey) =>
        `${storeInput} mt-1 ${fieldErrors[field] ? storeInputError : ''}`;

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const payload = {
            name,
            email,
            phone,
            subject,
            message,
        };

        const clientErrors = validateContactForm(payload);

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setError('Please fix the highlighted fields.');

            return;
        }

        setFieldErrors({});
        setProcessing(true);

        const token = getUserApiToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        try {
            const res = await axios.post<ContactResponse>(
                '/api/v1/contact/contact-submit',
                {
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    subject: subject.trim() || null,
                    message: message.trim(),
                },
                { headers },
            );

            if (!res.data.success) {
                const apiErrors = mapApiFieldErrors(res.data.data);

                if (Object.keys(apiErrors).length > 0) {
                    setFieldErrors(apiErrors);
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
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const body = err.response.data as ContactResponse;
                const apiErrors = mapApiFieldErrors(body.data);

                if (Object.keys(apiErrors).length > 0) {
                    setFieldErrors(apiErrors);
                    setError(body.message || 'Please fix the highlighted fields.');

                    return;
                }

                setError(body.message || 'Could not send your message.');
            } else {
                setError('Could not send your message. Please try again.');
            }
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

            <form onSubmit={submit} className={`mt-8 ${storeCard}`} noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="contact-name" className={storeLabel}>
                            Name <span className="text-red-600 dark:text-red-400">*</span>
                        </label>
                        <input
                            id="contact-name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                clearFieldError('name');
                            }}
                            className={inputClass('name')}
                            autoComplete="name"
                            aria-invalid={Boolean(fieldErrors.name)}
                        />
                        {fieldErrors.name ? (
                            <p className={storeFieldError}>{fieldErrors.name}</p>
                        ) : null}
                    </div>
                    <div>
                        <label htmlFor="contact-email" className={storeLabel}>
                            Email <span className="text-red-600 dark:text-red-400">*</span>
                        </label>
                        <input
                            id="contact-email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                clearFieldError('email');
                            }}
                            className={inputClass('email')}
                            autoComplete="email"
                            aria-invalid={Boolean(fieldErrors.email)}
                        />
                        {fieldErrors.email ? (
                            <p className={storeFieldError}>{fieldErrors.email}</p>
                        ) : null}
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="contact-phone" className={storeLabel}>
                            Phone <span className="text-red-600 dark:text-red-400">*</span>
                        </label>
                        <input
                            id="contact-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                clearFieldError('phone');
                            }}
                            className={inputClass('phone')}
                            autoComplete="tel"
                            placeholder="10-digit mobile number"
                            aria-invalid={Boolean(fieldErrors.phone)}
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
                            onChange={(e) => {
                                setSubject(e.target.value);
                                clearFieldError('subject');
                            }}
                            className={inputClass('subject')}
                            maxLength={200}
                            aria-invalid={Boolean(fieldErrors.subject)}
                        />
                        {fieldErrors.subject ? (
                            <p className={storeFieldError}>{fieldErrors.subject}</p>
                        ) : null}
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="contact-message" className={storeLabel}>
                            Message <span className="text-red-600 dark:text-red-400">*</span>
                        </label>
                        <textarea
                            id="contact-message"
                            rows={6}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                clearFieldError('message');
                            }}
                            className={`${inputClass('message')} resize-y`}
                            maxLength={5000}
                            aria-invalid={Boolean(fieldErrors.message)}
                        />
                        <p className={`mt-1 text-xs ${storeMutedText}`}>
                            {message.trim().length}/5000 characters (minimum 10)
                        </p>
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
