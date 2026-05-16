import { cartImageSrc, type CartPayload } from '@/api/cartClient';
import CheckoutStepper, { type CheckoutStepId } from '@/Components/store/CheckoutStepper';
import {
    estimateCheckoutTotals,
    orderStore,
    type CheckoutOptions,
    type DeliveryCityOption,
    type ShippingAddressInput,
} from '@/api/orderClient';
import { formatMoney } from '@/store/orderStatus';
import {
    storeBtnPrimary,
    storeBtnSecondary,
    storeBtnGhost,
    storeCard,
    storeCartLine,
    storeCartLineBody,
    storeCheckoutNav,
    storeErrorBanner,
    storeFieldError,
    storeInput,
    storeInputError,
    storeLabel,
    storeMutedText,
    storeSectionEyebrow,
    storeSectionTitle,
} from '@/store/storeTheme';
import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import { useAuthUser } from '@/auth/useAuthUser';
import { redirectToLogin } from '@/utils/requireAuth';
import {
    mapApiFieldErrors,
    validateShippingAddress,
} from '@/utils/shippingAddressValidation';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

const emptyAddress = (): ShippingAddressInput => ({
    full_name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'IN',
});

function addressFieldKey(field: keyof ShippingAddressInput): string {
    return `shipping_address.${field}`;
}

function RequiredLabel({ children }: { children: string }) {
    return (
        <span className={storeLabel}>
            {children} <span className="text-red-600 dark:text-red-400">*</span>
        </span>
    );
}

function buildAddressPayload(address: ShippingAddressInput): ShippingAddressInput {
    return {
        ...address,
        full_name: address.full_name.trim(),
        phone: address.phone.trim(),
        line1: address.line1.trim(),
        line2: address.line2?.trim() ?? '',
        city: address.city.trim(),
        state: address.state?.trim() ?? '',
        postal_code: address.postal_code?.trim() ?? '',
        country: (address.country ?? 'IN').trim().toUpperCase() || 'IN',
    };
}

function OrderSummaryPanel({
    cart,
    currency,
    totals,
    compact = false,
}: {
    cart: CartPayload;
    currency: string;
    totals: { shipping: number; tax: number; grandTotal: number } | null;
    compact?: boolean;
}) {
    return (
        <>
            <h2 className="font-display text-lg text-stone-900 dark:text-stone-50">Order summary</h2>
            <ul
                className={`mt-4 space-y-3 overflow-y-auto ${compact ? 'max-h-48' : 'max-h-64'}`}
            >
                {cart.items.map((item) => {
                    const src = cartImageSrc(item.image_path);

                    return (
                        <li key={item.id} className={storeCartLine}>
                            <div className={storeCartLineBody}>
                                {src ? (
                                    <img
                                        src={src}
                                        alt=""
                                        className="h-14 w-14 shrink-0 object-cover bg-stone-200 dark:bg-stone-800"
                                    />
                                ) : (
                                    <div className="h-14 w-14 shrink-0 bg-stone-200 dark:bg-stone-800" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
                                        {item.product_name}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                        {item.variant_label} × {item.quantity}
                                    </p>
                                    {! compact ? (
                                        <p className="mt-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                                            {formatMoney(item.line_total, currency)}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm dark:border-stone-800">
                <div className="flex justify-between">
                    <dt className="text-stone-500">Subtotal ({cart.count} items)</dt>
                    <dd className="font-medium text-stone-900 dark:text-stone-50">
                        {formatMoney(cart.subtotal, currency)}
                    </dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-stone-500">Shipping</dt>
                    <dd className="text-stone-700 dark:text-stone-300">
                        {totals && totals.shipping > 0
                            ? formatMoney(totals.shipping, currency)
                            : 'Free'}
                    </dd>
                </div>
                {totals && totals.tax > 0 ? (
                    <div className="flex justify-between">
                        <dt className="text-stone-500">Tax</dt>
                        <dd className="text-stone-700 dark:text-stone-300">
                            {formatMoney(totals.tax, currency)}
                        </dd>
                    </div>
                ) : null}
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4 dark:border-stone-800">
                <span className="font-semibold text-stone-900 dark:text-stone-50">Total</span>
                <span className="text-lg font-bold text-stone-900 dark:text-stone-50">
                    {formatMoney(totals?.grandTotal ?? cart.subtotal, currency)}
                </span>
            </div>
        </>
    );
}

export default function Checkout() {
    const { user, loading: authLoading } = useAuthUser();
    const [cart, setCart] = useState<CartPayload | null>(null);
    const [options, setOptions] = useState<CheckoutOptions | null>(null);
    const [address, setAddress] = useState<ShippingAddressInput>(emptyAddress);
    const [customerNote, setCustomerNote] = useState('');
    const [saveAddress, setSaveAddress] = useState(true);
    const [step, setStep] = useState<CheckoutStepId>(1);
    const [maxReached, setMaxReached] = useState<CheckoutStepId>(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!authLoading && !user) {
            redirectToLogin(route('guest.checkout'));

            return;
        }
        if (!user) {
            return;
        }

        setAddress((prev) => ({
            ...prev,
            full_name: prev.full_name || user.name,
            phone: prev.phone || ('phone' in user && user.phone ? String(user.phone) : ''),
        }));

        void Promise.all([orderStore.loadCart(), orderStore.checkoutOptions()])
            .then(([cartData, optionsRes]) => {
                if (!cartData || cartData.items.length === 0) {
                    router.visit(route('guest.cart'));

                    return;
                }
                setCart(cartData);
                if (optionsRes.success && optionsRes.data) {
                    setOptions(optionsRes.data);
                }
            })
            .catch(() => setError('Could not load checkout.'))
            .finally(() => setLoading(false));
    }, [user, authLoading]);

    const totals = useMemo(() => {
        if (!cart || !options) {
            return null;
        }

        return estimateCheckoutTotals(cart.subtotal, options);
    }, [cart, options]);

    const deliveryCities: DeliveryCityOption[] =
        options?.delivery_cities?.length ? options.delivery_cities : [
            { name: 'Vapi', state: 'Gujarat' },
            { name: 'Daman', state: 'Daman and Diu' },
        ];

    const cityNames = deliveryCities.map((c) => c.name);
    const currency = cart?.currency ?? options?.currency ?? 'INR';
    const addressPayload = useMemo(() => buildAddressPayload(address), [address]);

    const setField = (key: keyof ShippingAddressInput, value: string) => {
        setAddress((prev) => {
            const next = { ...prev, [key]: value };
            if (key === 'city') {
                const match = deliveryCities.find((c) => c.name === value);
                if (match) {
                    next.state = match.state;
                }
            }

            return next;
        });
        const errKey = addressFieldKey(key);
        setFieldErrors((prev) => {
            if (! prev[errKey]) {
                return prev;
            }
            const next = { ...prev };
            delete next[errKey];

            return next;
        });
    };

    const fieldError = (field: keyof ShippingAddressInput) =>
        fieldErrors[addressFieldKey(field)];

    const inputClass = (field: keyof ShippingAddressInput) =>
        `${storeInput} mt-1 ${fieldError(field) ? storeInputError : ''}`;

    const scrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const validateAddressStep = useCallback(() => {
        const errors = validateShippingAddress(addressPayload, cityNames);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError('Please complete your delivery address.');

            return false;
        }
        setFieldErrors({});
        setError(null);

        return true;
    }, [addressPayload, cityNames]);

    const goToStep = (target: CheckoutStepId) => {
        if (target > step && step === 1 && target > 1) {
            if (! validateAddressStep()) {
                setStep(1);
                setMaxReached((m) => (m < 1 ? 1 : m));

                return;
            }
        }
        setStep(target);
        setMaxReached((m) => (target > m ? target : m));
        scrollTop();
    };

    const goNext = () => {
        if (step === 1 && ! validateAddressStep()) {
            return;
        }
        if (step < 3) {
            const next = (step + 1) as CheckoutStepId;
            setStep(next);
            setMaxReached((m) => (next > m ? next : m));
            setError(null);
            scrollTop();
        }
    };

    const goBack = () => {
        if (step > 1) {
            setStep((step - 1) as CheckoutStepId);
            setError(null);
            scrollTop();
        }
    };

    const placeOrder = async () => {
        if (! validateAddressStep()) {
            setStep(1);

            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await orderStore.placeOrder({
                payment_method: 'cod',
                shipping_address: addressPayload,
                customer_note: customerNote || undefined,
                save_address: saveAddress,
            });

            if (!res.success || !res.data) {
                const apiErrors = mapApiFieldErrors(res.data);
                if (Object.keys(apiErrors).length > 0) {
                    setFieldErrors(apiErrors);
                    setStep(1);
                    setMaxReached(1);
                }
                setError(res.message || 'Could not place order.');

                return;
            }

            router.visit(route('user.orders.show', res.data.id));
        } catch {
            setError('Could not place order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (step === 3) {
            void placeOrder();
        } else {
            goNext();
        }
    };

    if (loading || ! cart) {
        return (
            <GuestPanelLayout title="Checkout">
                <Head title="Suhaag · Checkout" />
                <p className={storeMutedText}>Loading checkout…</p>
            </GuestPanelLayout>
        );
    }

    return (
        <GuestPanelLayout title="Checkout">
            <Head title="Suhaag · Checkout" />

            <div className="mx-auto max-w-4xl">
                <CheckoutStepper current={step} maxReached={maxReached} onGoTo={goToStep} />

                {error ? <div className={`mb-6 ${storeErrorBanner}`}>{error}</div> : null}

                <form
                    onSubmit={onFormSubmit}
                    className="grid gap-8 lg:grid-cols-[1fr_300px]"
                    noValidate
                >
                    <div className="min-w-0">
                        {step === 1 ? (
                            <section className={storeCard}>
                                <p className={storeSectionEyebrow}>Step 1</p>
                                <h2 className={`${storeSectionTitle} mt-1 text-xl`}>Delivery address</h2>
                                <p className={`mt-2 ${storeMutedText}`}>
                                    We deliver to{' '}
                                    <span className="font-medium text-stone-800 dark:text-stone-200">
                                        Vapi
                                    </span>{' '}
                                    and{' '}
                                    <span className="font-medium text-stone-800 dark:text-stone-200">
                                        Daman
                                    </span>{' '}
                                    only.
                                </p>
                                <AddressFields
                                    address={address}
                                    deliveryCities={deliveryCities}
                                    saveAddress={saveAddress}
                                    onSaveAddressChange={setSaveAddress}
                                    customerNote={customerNote}
                                    onCustomerNoteChange={setCustomerNote}
                                    setField={setField}
                                    fieldError={fieldError}
                                    inputClass={inputClass}
                                />
                            </section>
                        ) : null}

                        {step === 2 ? (
                            <section className={storeCard}>
                                <p className={storeSectionEyebrow}>Step 2</p>
                                <h2 className={`${storeSectionTitle} mt-1 text-xl`}>Payment method</h2>
                                <p className={`mt-2 ${storeMutedText}`}>
                                    Online payment is not required for your area.
                                </p>
                                <div className="mt-6 border border-stone-900 bg-stone-50 px-4 py-5 dark:border-stone-100 dark:bg-stone-900/50">
                                    <div className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 border-stone-900 bg-stone-900 dark:border-stone-100 dark:bg-stone-100">
                                            <span className="h-2 w-2 rounded-full bg-white dark:bg-stone-900" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-50">
                                                Cash on delivery
                                            </p>
                                            <p className={`mt-2 ${storeMutedText}`}>
                                                Pay{' '}
                                                {formatMoney(
                                                    totals?.grandTotal ?? cart.subtotal,
                                                    currency,
                                                )}{' '}
                                                in cash when your order arrives.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ) : null}

                        {step === 3 ? (
                            <section className={storeCard}>
                                <p className={storeSectionEyebrow}>Step 3</p>
                                <h2 className={`${storeSectionTitle} mt-1 text-xl`}>Confirm your order</h2>
                                <p className={`mt-2 ${storeMutedText}`}>
                                    Review everything before placing your order.
                                </p>
                                <dl className="mt-6 space-y-4 text-sm">
                                    <ReviewBlock title="Deliver to">
                                        <p className="font-medium text-stone-900 dark:text-stone-50">
                                            {addressPayload.full_name}
                                        </p>
                                        <p className="text-stone-600 dark:text-stone-400">
                                            {addressPayload.phone}
                                        </p>
                                        <p className="mt-1 text-stone-600 dark:text-stone-400">
                                            {addressPayload.line1}
                                            {addressPayload.line2 ? `, ${addressPayload.line2}` : ''}
                                            <br />
                                            {addressPayload.city}, {addressPayload.state}{' '}
                                            {addressPayload.postal_code}
                                        </p>
                                    </ReviewBlock>
                                    <ReviewBlock title="Payment">
                                        <p className="font-medium text-stone-900 dark:text-stone-50">
                                            Cash on delivery
                                        </p>
                                    </ReviewBlock>
                                    {customerNote ? (
                                        <ReviewBlock title="Note">
                                            <p className="text-stone-600 dark:text-stone-400">
                                                {customerNote}
                                            </p>
                                        </ReviewBlock>
                                    ) : null}
                                </dl>
                                <button
                                    type="button"
                                    onClick={() => goToStep(1)}
                                    className={`${storeBtnGhost} mt-4`}
                                >
                                    Edit delivery address
                                </button>
                            </section>
                        ) : null}

                        <nav className={storeCheckoutNav}>
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className={storeBtnSecondary}
                                >
                                    Back
                                </button>
                            ) : (
                                <Link href={route('guest.cart')} className={storeBtnSecondary}>
                                    Back to bag
                                </Link>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`${storeBtnPrimary} w-full sm:ml-auto sm:w-auto disabled:opacity-60`}
                            >
                                {step === 3
                                    ? submitting
                                        ? 'Placing order…'
                                        : 'Place order'
                                    : 'Continue'}
                            </button>
                        </nav>
                    </div>

                    <aside className={`${storeCard} hidden h-fit lg:sticky lg:top-36 lg:block`}>
                        <OrderSummaryPanel cart={cart} currency={currency} totals={totals} />
                    </aside>
                </form>

                <aside className={`${storeCard} mt-6 lg:hidden`}>
                    <OrderSummaryPanel cart={cart} currency={currency} totals={totals} compact />
                </aside>
            </div>
        </GuestPanelLayout>
    );
}

function ReviewBlock({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="border-b border-stone-100 pb-4 last:border-0 dark:border-stone-800">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                {title}
            </dt>
            <dd className="mt-1">{children}</dd>
        </div>
    );
}

function AddressFields({
    address,
    deliveryCities,
    saveAddress,
    onSaveAddressChange,
    customerNote,
    onCustomerNoteChange,
    setField,
    fieldError,
    inputClass,
}: {
    address: ShippingAddressInput;
    deliveryCities: DeliveryCityOption[];
    saveAddress: boolean;
    onSaveAddressChange: (v: boolean) => void;
    customerNote: string;
    onCustomerNoteChange: (v: string) => void;
    setField: (key: keyof ShippingAddressInput, value: string) => void;
    fieldError: (field: keyof ShippingAddressInput) => string | undefined;
    inputClass: (field: keyof ShippingAddressInput) => string;
}) {
    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
                <RequiredLabel>Full name</RequiredLabel>
                <input
                    required
                    autoComplete="name"
                    value={address.full_name}
                    onChange={(e) => setField('full_name', e.target.value)}
                    className={inputClass('full_name')}
                    aria-invalid={Boolean(fieldError('full_name'))}
                />
                {fieldError('full_name') ? (
                    <p className={storeFieldError}>{fieldError('full_name')}</p>
                ) : null}
            </label>
            <label className="block sm:col-span-2">
                <RequiredLabel>Phone</RequiredLabel>
                <input
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    value={address.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    className={inputClass('phone')}
                    aria-invalid={Boolean(fieldError('phone'))}
                />
                {fieldError('phone') ? (
                    <p className={storeFieldError}>{fieldError('phone')}</p>
                ) : null}
            </label>
            <label className="block sm:col-span-2">
                <RequiredLabel>Address line 1</RequiredLabel>
                <input
                    required
                    autoComplete="address-line1"
                    value={address.line1}
                    onChange={(e) => setField('line1', e.target.value)}
                    className={inputClass('line1')}
                    aria-invalid={Boolean(fieldError('line1'))}
                />
                {fieldError('line1') ? (
                    <p className={storeFieldError}>{fieldError('line1')}</p>
                ) : null}
            </label>
            <label className="block sm:col-span-2">
                <span className={storeLabel}>Address line 2 (optional)</span>
                <input
                    autoComplete="address-line2"
                    value={address.line2 ?? ''}
                    onChange={(e) => setField('line2', e.target.value)}
                    className={`${storeInput} mt-1`}
                />
            </label>
            <label className="block sm:col-span-2">
                <RequiredLabel>Delivery city</RequiredLabel>
                <select
                    required
                    value={address.city}
                    onChange={(e) => setField('city', e.target.value)}
                    className={inputClass('city')}
                    aria-invalid={Boolean(fieldError('city'))}
                >
                    <option value="">Select city — Vapi or Daman</option>
                    {deliveryCities.map((c) => (
                        <option key={c.name} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </select>
                {fieldError('city') ? (
                    <p className={storeFieldError}>{fieldError('city')}</p>
                ) : null}
            </label>
            <label className="block sm:col-span-2">
                <span className={storeLabel}>State</span>
                <input
                    readOnly
                    value={address.state ?? ''}
                    className={`${storeInput} mt-1 bg-stone-100 dark:bg-stone-800/80`}
                    placeholder="Select a city above"
                />
            </label>
            <label className="block sm:col-span-2">
                <RequiredLabel>PIN code</RequiredLabel>
                <input
                    required
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="6 digits"
                    maxLength={6}
                    value={address.postal_code ?? ''}
                    onChange={(e) =>
                        setField('postal_code', e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    className={inputClass('postal_code')}
                    aria-invalid={Boolean(fieldError('postal_code'))}
                />
                {fieldError('postal_code') ? (
                    <p className={storeFieldError}>{fieldError('postal_code')}</p>
                ) : null}
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
                <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => onSaveAddressChange(e.target.checked)}
                    className="rounded border-stone-300"
                />
                <span className={storeMutedText}>Save this address to my account</span>
            </label>
            <label className="block sm:col-span-2">
                <span className={storeLabel}>Order note (optional)</span>
                <textarea
                    value={customerNote}
                    onChange={(e) => onCustomerNoteChange(e.target.value)}
                    rows={3}
                    className={`${storeInput} mt-1 resize-y`}
                    placeholder="Delivery instructions, gift message, etc."
                />
            </label>
        </div>
    );
}
