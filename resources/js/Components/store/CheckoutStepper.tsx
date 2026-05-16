import {
    storeCheckoutStepBtnActive,
    storeCheckoutStepBtnDone,
    storeCheckoutStepBtnPending,
    storeCheckoutStepper,
    storeCheckoutStepTrack,
    storeMutedText,
} from '@/store/storeTheme';

export const CHECKOUT_STEPS = [
    { id: 1, label: 'Delivery', short: 'Address' },
    { id: 2, label: 'Payment', short: 'Payment' },
    { id: 3, label: 'Review', short: 'Confirm' },
] as const;

export type CheckoutStepId = (typeof CHECKOUT_STEPS)[number]['id'];

type Props = {
    current: CheckoutStepId;
    maxReached: CheckoutStepId;
    onGoTo: (step: CheckoutStepId) => void;
};

export default function CheckoutStepper({ current, maxReached, onGoTo }: Props) {
    return (
        <nav className={storeCheckoutStepper} aria-label="Checkout progress">
            <ol className={storeCheckoutStepTrack}>
                {CHECKOUT_STEPS.map((step) => {
                    const isActive = step.id === current;
                    const isDone = step.id < current;
                    const canClick = step.id <= maxReached && ! isActive;

                    let btnClass = storeCheckoutStepBtnPending;
                    if (isActive) {
                        btnClass = storeCheckoutStepBtnActive;
                    } else if (isDone) {
                        btnClass = storeCheckoutStepBtnDone;
                    }

                    return (
                        <li key={step.id} className="min-w-0">
                            {canClick || isActive ? (
                                <button
                                    type="button"
                                    onClick={() => canClick && onGoTo(step.id)}
                                    disabled={! canClick && ! isActive}
                                    className={`${btnClass} w-full rounded-sm ${canClick ? 'cursor-pointer hover:opacity-90' : ''}`}
                                    aria-current={isActive ? 'step' : undefined}
                                >
                                    <span className="text-[10px] font-bold tabular-nums sm:text-xs">
                                        {step.id}
                                    </span>
                                    <span className="hidden text-[9px] font-semibold uppercase tracking-wider sm:block">
                                        {step.short}
                                    </span>
                                    <span className="text-[9px] font-semibold uppercase tracking-wider sm:hidden">
                                        {step.short}
                                    </span>
                                </button>
                            ) : (
                                <span className={`${storeCheckoutStepBtnPending} w-full rounded-sm`}>
                                    <span className="text-[10px] font-bold tabular-nums">{step.id}</span>
                                    <span className="text-[9px] font-semibold uppercase tracking-wider">
                                        {step.short}
                                    </span>
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
            <p className={`mt-3 text-center ${storeMutedText}`}>
                Step {current} of {CHECKOUT_STEPS.length}:{' '}
                <span className="font-medium text-stone-800 dark:text-stone-200">
                    {CHECKOUT_STEPS[current - 1]?.label}
                </span>
            </p>
        </nav>
    );
}
