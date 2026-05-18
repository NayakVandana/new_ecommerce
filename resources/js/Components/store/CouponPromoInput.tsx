import { orderStore, type AppliedCoupon } from '@/api/orderClient';
import { storeBtnSecondary, storeInput, storeMutedText } from '@/store/storeTheme';
import { formatMoneyDeduction } from '@/store/orderStatus';
import { useEffect, useState } from 'react';

type Props = {
    currency: string;
    applied: AppliedCoupon | null;
    onApplied: (coupon: AppliedCoupon | null) => void;
    compact?: boolean;
};

export default function CouponPromoInput({
    currency,
    applied,
    onApplied,
    compact = false,
}: Props) {
    const [code, setCode] = useState(applied?.code ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCode(applied?.code ?? '');
    }, [applied?.code]);

    const apply = async () => {
        const trimmed = code.trim();
        if (!trimmed) {
            setError('Enter a coupon code.');

            return;
        }

        setBusy(true);
        setError(null);

        try {
            const res = await orderStore.applyCoupon(trimmed);
            if (!res.success || !res.data) {
                setError(res.message || 'Could not apply coupon.');
                onApplied(null);

                return;
            }
            onApplied(res.data);
            setCode(res.data.code);
        } catch {
            setError('Could not apply coupon.');
            onApplied(null);
        } finally {
            setBusy(false);
        }
    };

    const remove = () => {
        setCode('');
        setError(null);
        onApplied(null);
    };

    return (
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    disabled={busy || !!applied}
                    className={`${storeInput} min-w-0 flex-1 uppercase`}
                    aria-label="Coupon code"
                />
                {applied ? (
                    <button
                        type="button"
                        onClick={remove}
                        className={storeBtnSecondary}
                    >
                        Remove
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => void apply()}
                        disabled={busy}
                        className={storeBtnSecondary}
                    >
                        {busy ? 'Applying…' : 'Apply'}
                    </button>
                )}
            </div>
            {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
            {applied ? (
                <p className={`text-sm text-emerald-700 dark:text-emerald-400 ${storeMutedText}`}>
                    <span className="font-medium">{applied.code}</span> applied — saved{' '}
                    {formatMoneyDeduction(applied.coupon_discount, currency)}
                </p>
            ) : null}
        </div>
    );
}
