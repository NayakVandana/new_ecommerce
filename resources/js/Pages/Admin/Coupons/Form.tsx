import {
    adminBackLink,
    adminCancelBtn,
    adminCheckbox,
    adminErrorBanner,
    adminFieldError,
    adminFormCard,
    adminFormPageWrap,
    adminInput,
    adminLabel,
    adminMutedText,
    adminPrimaryBtn,
} from '@/admin/adminTheme';
import {
    adminApiPost,
    type AdminApiEnvelope,
} from '@/api/adminClient';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps as AppPageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type Coupon = {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount: number | null;
    max_uses: number | null;
    per_user_limit: number | null;
    per_user_limit_label?: string | null;
    is_once_per_user?: boolean;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
};

type PerUserLimitMode = 'none' | 'once' | 'custom';

function perUserLimitModeFromValue(limit: number | '' | null | undefined): PerUserLimitMode {
    if (limit === '' || limit === null || limit === undefined) {
        return 'none';
    }

    const n = typeof limit === 'number' ? limit : Number(limit);

    if (Number.isNaN(n) || n < 1) {
        return 'none';
    }

    if (n === 1) {
        return 'once';
    }

    return 'custom';
}

function perUserLimitFromMode(mode: PerUserLimitMode, customValue: string | number): number | null {
    if (mode === 'none') {
        return null;
    }

    if (mode === 'once') {
        return 1;
    }

    if (customValue === '') {
        return null;
    }

    const n = Number(customValue);

    return Number.isNaN(n) || n < 1 ? null : n;
}

type PageProps = AppPageProps<{
    couponId: number | null;
}>;

type DateTimeParts = { date: string; time: string };

function pad2(n: number): string {
    return String(n).padStart(2, '0');
}

function splitIsoDateTime(value: string | null, fallbackTime: string): DateTimeParts {
    if (!value) {
        return { date: '', time: fallbackTime };
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return { date: '', time: fallbackTime };
    }

    return {
        date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
        time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
    };
}

function combineDateTime(date: string, time: string): string | null {
    const trimmedDate = date.trim();
    const trimmedTime = time.trim();

    if (!trimmedDate || !trimmedTime) {
        return null;
    }

    const d = new Date(`${trimmedDate}T${trimmedTime}`);

    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function RequiredLabel({ children }: { children: string }) {
    return (
        <span className={adminLabel}>
            {children} <span className="text-red-600 dark:text-red-400">*</span>
        </span>
    );
}

function mapApiFieldErrors(data: unknown): Record<string, string> {
    if (!data || typeof data !== 'object') {
        return {};
    }

    const out: Record<string, string> = {};

    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
        if (Array.isArray(val) && typeof val[0] === 'string') {
            out[key] = val[0];
        } else if (typeof val === 'string') {
            out[key] = val;
        }
    }

    return out;
}

function validateCouponForm(input: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    startsDate: string;
    startsTime: string;
    endsDate: string;
    endsTime: string;
    minOrderAmount: string | number;
    maxUses: string | number;
    perUserLimitMode: PerUserLimitMode;
    perUserLimitCustom: string | number;
}): Record<string, string> {
    const errors: Record<string, string> = {};
    const code = input.code.trim().toUpperCase();

    if (!code) {
        errors.code = 'Coupon code is required.';
    } else if (code.length < 2) {
        errors.code = 'Coupon code must be at least 2 characters.';
    } else if (!/^[A-Z0-9_-]+$/.test(code)) {
        errors.code = 'Use letters, numbers, hyphens, or underscores only.';
    }

    if (!input.value || Number.isNaN(input.value) || input.value <= 0) {
        errors.value = 'Discount value is required.';
    } else if (input.type === 'percentage' && input.value > 100) {
        errors.value = 'Percentage cannot exceed 100.';
    }

    if (!input.startsDate.trim()) {
        errors.starts_at = 'Start date is required.';
    }
    if (!input.startsTime.trim()) {
        errors.starts_at_time = 'Start time is required.';
    }
    if (!input.endsDate.trim()) {
        errors.ends_at = 'End date is required.';
    }
    if (!input.endsTime.trim()) {
        errors.ends_at_time = 'End time is required.';
    }

    const startsIso = combineDateTime(input.startsDate, input.startsTime);
    const endsIso = combineDateTime(input.endsDate, input.endsTime);

    if (input.startsDate && input.startsTime && !startsIso) {
        errors.starts_at = 'Enter a valid start date and time.';
    }
    if (input.endsDate && input.endsTime && !endsIso) {
        errors.ends_at = 'Enter a valid end date and time.';
    }

    if (startsIso && endsIso) {
        const startMs = new Date(startsIso).getTime();
        const endMs = new Date(endsIso).getTime();

        if (endMs <= startMs) {
            errors.ends_at = 'End must be after the start date and time.';
        }
    }

    if (input.minOrderAmount !== '' && Number(input.minOrderAmount) < 0) {
        errors.min_order_amount = 'Minimum order cannot be negative.';
    }
    if (input.maxUses !== '' && Number(input.maxUses) < 1) {
        errors.max_uses = 'Max uses must be at least 1.';
    }
    if (input.perUserLimitMode === 'custom') {
        if (input.perUserLimitCustom === '') {
            errors.per_user_limit = 'Enter how many times each customer may use this coupon.';
        } else if (Number(input.perUserLimitCustom) < 1) {
            errors.per_user_limit = 'Per customer limit must be at least 1.';
        }
    }

    return errors;
}

export default function Form() {
    const { couponId } = usePage<PageProps>().props;

    const [existing, setExisting] = useState<Coupon | null>(null);
    const [loading, setLoading] = useState(couponId !== null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const initial = useMemo(() => {
        const start = splitIsoDateTime(existing?.starts_at ?? null, '00:00');
        const end = splitIsoDateTime(existing?.ends_at ?? null, '23:59');

        return {
            code: existing?.code ?? '',
            type: existing?.type ?? 'percentage',
            value: existing?.value ?? 10,
            minOrderAmount: existing?.min_order_amount ?? '',
            maxUses: existing?.max_uses ?? '',
            perUserLimitMode: perUserLimitModeFromValue(existing?.per_user_limit ?? ''),
            perUserLimitCustom:
                existing?.per_user_limit != null && existing.per_user_limit > 1
                    ? existing.per_user_limit
                    : '',
            startsDate: start.date,
            startsTime: start.time,
            endsDate: end.date,
            endsTime: end.time,
            isActive: existing?.is_active ?? true,
        };
    }, [existing]);

    const [code, setCode] = useState('');
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
    const [value, setValue] = useState(10);
    const [minOrderAmount, setMinOrderAmount] = useState<string | number>('');
    const [maxUses, setMaxUses] = useState<string | number>('');
    const [perUserLimitMode, setPerUserLimitMode] = useState<PerUserLimitMode>('none');
    const [perUserLimitCustom, setPerUserLimitCustom] = useState<string | number>('');
    const [startsDate, setStartsDate] = useState('');
    const [startsTime, setStartsTime] = useState('00:00');
    const [endsDate, setEndsDate] = useState('');
    const [endsTime, setEndsTime] = useState('23:59');
    const [isActive, setIsActive] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const clearFieldError = (key: string) => {
        setFieldErrors((prev) => {
            if (!prev[key]) {
                return prev;
            }
            const next = { ...prev };
            delete next[key];

            return next;
        });
    };

    useEffect(() => {
        if (!couponId) {
            setExisting(null);
            setLoading(false);
            setLoadError(null);

            return;
        }

        let cancelled = false;

        (async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const res = await adminApiPost<AdminApiEnvelope<Coupon>>(
                    '/coupons/coupon-show',
                    { id: couponId },
                );
                if (cancelled) {
                    return;
                }
                if (!res.success || !res.data) {
                    setLoadError(res.message || 'Could not load coupon.');

                    return;
                }
                setExisting(res.data);
            } catch {
                if (!cancelled) {
                    setLoadError('Could not load coupon.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [couponId]);

    useEffect(() => {
        setCode(initial.code);
        setType(initial.type);
        setValue(initial.value);
        setMinOrderAmount(initial.minOrderAmount);
        setMaxUses(initial.maxUses);
        setPerUserLimitMode(initial.perUserLimitMode);
        setPerUserLimitCustom(initial.perUserLimitCustom);
        setStartsDate(initial.startsDate);
        setStartsTime(initial.startsTime);
        setEndsDate(initial.endsDate);
        setEndsTime(initial.endsTime);
        setIsActive(initial.isActive);
    }, [initial]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const clientErrors = validateCouponForm({
            code,
            type,
            value,
            startsDate,
            startsTime,
            endsDate,
            endsTime,
            minOrderAmount,
            maxUses,
            perUserLimitMode,
            perUserLimitCustom,
        });

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setError('Please fix the highlighted fields.');

            return;
        }

        setFieldErrors({});
        setProcessing(true);

        const startsAt = combineDateTime(startsDate, startsTime);
        const endsAt = combineDateTime(endsDate, endsTime);

        try {
            const payload: Record<string, unknown> = {
                code: code.trim().toUpperCase(),
                type,
                value: Number(value),
                min_order_amount:
                    minOrderAmount === '' ? null : Number(minOrderAmount),
                max_uses: maxUses === '' ? null : Number(maxUses),
                per_user_limit: perUserLimitFromMode(perUserLimitMode, perUserLimitCustom),
                starts_at: startsAt,
                ends_at: endsAt,
                is_active: isActive,
            };

            let res: AdminApiEnvelope<Coupon>;

            if (existing) {
                res = await adminApiPost<AdminApiEnvelope<Coupon>>('/coupons/coupon-update', {
                    id: existing.id,
                    ...payload,
                });
            } else {
                res = await adminApiPost<AdminApiEnvelope<Coupon>>(
                    '/coupons/coupon-store',
                    payload,
                );
            }

            if (!res.success) {
                const apiErrors = mapApiFieldErrors(res.data);
                if (Object.keys(apiErrors).length > 0) {
                    setFieldErrors(apiErrors);
                }
                setError(res.message || 'Could not save.');

                return;
            }

            router.visit(route('admin.coupons.index'));
        } catch {
            setError('Could not save.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title={existing ? 'Edit coupon' : 'New coupon'} />
            <AdminLayout heading={existing ? 'Edit coupon' : 'New coupon'}>
                <div className={adminFormPageWrap}>
                    <div>
                        <Link href={route('admin.coupons.index')} className={adminBackLink}>
                            ← Coupons
                        </Link>
                    </div>

                    {(loadError || error) && (
                        <div className={adminErrorBanner}>{loadError ?? error}</div>
                    )}

                    {loading && <p className={adminMutedText}>Loading…</p>}

                    {!loading && !loadError && (
                        <form onSubmit={(e) => void submit(e)} className={adminFormCard} noValidate>
                            <div>
                                <label htmlFor="code">
                                    <RequiredLabel>Code</RequiredLabel>
                                </label>
                                <input
                                    id="code"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value.toUpperCase());
                                        clearFieldError('code');
                                    }}
                                    required
                                    minLength={2}
                                    pattern="[A-Za-z0-9_-]+"
                                    className={`${adminInput} uppercase`}
                                    placeholder="SUMMER20"
                                    aria-invalid={Boolean(fieldErrors.code)}
                                />
                                {fieldErrors.code ? (
                                    <p className={adminFieldError}>{fieldErrors.code}</p>
                                ) : null}
                            </div>
                            <div>
                                <label htmlFor="type">
                                    <RequiredLabel>Type</RequiredLabel>
                                </label>
                                <select
                                    id="type"
                                    value={type}
                                    onChange={(e) => {
                                        setType(e.target.value as 'percentage' | 'fixed');
                                        clearFieldError('type');
                                        clearFieldError('value');
                                    }}
                                    required
                                    className={adminInput}
                                >
                                    <option value="percentage">Percentage off</option>
                                    <option value="fixed">Fixed amount off</option>
                                </select>
                                {fieldErrors.type ? (
                                    <p className={adminFieldError}>{fieldErrors.type}</p>
                                ) : null}
                            </div>
                            <div>
                                <label htmlFor="value">
                                    <RequiredLabel>
                                        {type === 'percentage' ? 'Percent off' : 'Amount off (Rs.)'}
                                    </RequiredLabel>
                                </label>
                                <input
                                    id="value"
                                    type="number"
                                    min={0.01}
                                    step={type === 'percentage' ? 1 : 0.01}
                                    max={type === 'percentage' ? 100 : undefined}
                                    value={value}
                                    onChange={(e) => {
                                        setValue(Number(e.target.value));
                                        clearFieldError('value');
                                    }}
                                    required
                                    className={adminInput}
                                    aria-invalid={Boolean(fieldErrors.value)}
                                />
                                {fieldErrors.value ? (
                                    <p className={adminFieldError}>{fieldErrors.value}</p>
                                ) : null}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="min_order" className={adminLabel}>
                                        Min order amount (optional)
                                    </label>
                                    <input
                                        id="min_order"
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={minOrderAmount}
                                        onChange={(e) => {
                                            setMinOrderAmount(e.target.value);
                                            clearFieldError('min_order_amount');
                                        }}
                                        className={adminInput}
                                    />
                                    {fieldErrors.min_order_amount ? (
                                        <p className={adminFieldError}>
                                            {fieldErrors.min_order_amount}
                                        </p>
                                    ) : null}
                                </div>
                                <div>
                                    <label htmlFor="max_uses" className={adminLabel}>
                                        Max total uses (optional)
                                    </label>
                                    <input
                                        id="max_uses"
                                        type="number"
                                        min={1}
                                        value={maxUses}
                                        onChange={(e) => {
                                            setMaxUses(e.target.value);
                                            clearFieldError('max_uses');
                                        }}
                                        className={adminInput}
                                    />
                                    {fieldErrors.max_uses ? (
                                        <p className={adminFieldError}>{fieldErrors.max_uses}</p>
                                    ) : null}
                                </div>
                                <div className="sm:col-span-2">
                                    <p className={adminLabel}>Per customer usage</p>
                                    <p className={`mb-3 ${adminMutedText}`}>
                                        For welcome codes like NEWCOM, choose once per customer.
                                    </p>
                                    <fieldset className="space-y-2">
                                        <label className="flex cursor-pointer items-start gap-2">
                                            <input
                                                type="radio"
                                                name="per_user_limit_mode"
                                                checked={perUserLimitMode === 'none'}
                                                onChange={() => {
                                                    setPerUserLimitMode('none');
                                                    clearFieldError('per_user_limit');
                                                }}
                                                className="mt-1"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                                No limit — customer can reuse
                                            </span>
                                        </label>
                                        <label className="flex cursor-pointer items-start gap-2">
                                            <input
                                                type="radio"
                                                name="per_user_limit_mode"
                                                checked={perUserLimitMode === 'once'}
                                                onChange={() => {
                                                    setPerUserLimitMode('once');
                                                    clearFieldError('per_user_limit');
                                                }}
                                                className="mt-1"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                                Once per customer (one-time welcome / NEWCOM style)
                                            </span>
                                        </label>
                                        <label className="flex cursor-pointer items-start gap-2">
                                            <input
                                                type="radio"
                                                name="per_user_limit_mode"
                                                checked={perUserLimitMode === 'custom'}
                                                onChange={() => {
                                                    setPerUserLimitMode('custom');
                                                    clearFieldError('per_user_limit');
                                                }}
                                                className="mt-1"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                                Custom limit per customer
                                            </span>
                                        </label>
                                    </fieldset>
                                    {perUserLimitMode === 'custom' ? (
                                        <input
                                            id="per_user"
                                            type="number"
                                            min={2}
                                            value={perUserLimitCustom}
                                            onChange={(e) => {
                                                setPerUserLimitCustom(e.target.value);
                                                clearFieldError('per_user_limit');
                                            }}
                                            className={`${adminInput} mt-2`}
                                            placeholder="e.g. 3"
                                            aria-label="Max uses per customer"
                                        />
                                    ) : null}
                                    {fieldErrors.per_user_limit ? (
                                        <p className={adminFieldError}>
                                            {fieldErrors.per_user_limit}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className={adminLabel}>
                                        <RequiredLabel>Valid from</RequiredLabel>
                                    </p>
                                    <p className={`mb-2 ${adminMutedText}`}>
                                        Date (dd-mm-yyyy) and time
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            id="starts_at_date"
                                            type="date"
                                            value={startsDate}
                                            onChange={(e) => {
                                                setStartsDate(e.target.value);
                                                clearFieldError('starts_at');
                                            }}
                                            required
                                            className={adminInput}
                                            aria-invalid={Boolean(fieldErrors.starts_at)}
                                        />
                                        <input
                                            id="starts_at_time"
                                            type="time"
                                            value={startsTime}
                                            onChange={(e) => {
                                                setStartsTime(e.target.value);
                                                clearFieldError('starts_at_time');
                                                clearFieldError('starts_at');
                                            }}
                                            required
                                            className={adminInput}
                                            aria-invalid={Boolean(fieldErrors.starts_at_time)}
                                        />
                                    </div>
                                    {fieldErrors.starts_at ? (
                                        <p className={adminFieldError}>{fieldErrors.starts_at}</p>
                                    ) : null}
                                    {fieldErrors.starts_at_time ? (
                                        <p className={adminFieldError}>
                                            {fieldErrors.starts_at_time}
                                        </p>
                                    ) : null}
                                </div>
                                <div>
                                    <p className={adminLabel}>
                                        <RequiredLabel>Valid until</RequiredLabel>
                                    </p>
                                    <p className={`mb-2 ${adminMutedText}`}>
                                        Date (dd-mm-yyyy) and time
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            id="ends_at_date"
                                            type="date"
                                            value={endsDate}
                                            onChange={(e) => {
                                                setEndsDate(e.target.value);
                                                clearFieldError('ends_at');
                                            }}
                                            required
                                            min={startsDate || undefined}
                                            className={adminInput}
                                            aria-invalid={Boolean(fieldErrors.ends_at)}
                                        />
                                        <input
                                            id="ends_at_time"
                                            type="time"
                                            value={endsTime}
                                            onChange={(e) => {
                                                setEndsTime(e.target.value);
                                                clearFieldError('ends_at_time');
                                                clearFieldError('ends_at');
                                            }}
                                            required
                                            className={adminInput}
                                            aria-invalid={Boolean(fieldErrors.ends_at_time)}
                                        />
                                    </div>
                                    {fieldErrors.ends_at ? (
                                        <p className={adminFieldError}>{fieldErrors.ends_at}</p>
                                    ) : null}
                                    {fieldErrors.ends_at_time ? (
                                        <p className={adminFieldError}>{fieldErrors.ends_at_time}</p>
                                    ) : null}
                                </div>
                            </div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className={adminCheckbox}
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    Active
                                </span>
                            </label>
                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:flex-wrap">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={adminPrimaryBtn}
                                >
                                    {processing ? 'Saving…' : 'Save'}
                                </button>
                                <Link
                                    href={route('admin.coupons.index')}
                                    className={`inline-flex items-center justify-center ${adminCancelBtn}`}
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
