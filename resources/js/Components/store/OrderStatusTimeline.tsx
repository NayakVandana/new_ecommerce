import {
    formatStatusLabel,
    formatTimelineDate,
    orderStatusTimelineBadgeClass,
    orderStatusTimelineCurrentHighlightClass,
    orderStatusTimelineDotClass,
    orderStatusTimelineDotClassAdmin,
    orderStatusTimelineUpcomingDotClass,
} from '@/store/orderStatus';
import {
    buildOrderStatusTimelineSteps,
    type OrderStatusHistoryEntry,
    type OrderTimelineStep,
} from '@/store/orderStatusFlow';
import { useMemo } from 'react';

export type { OrderStatusHistoryEntry };

type Props = {
    currentStatus: string;
    histories?: OrderStatusHistoryEntry[];
    variant?: 'store' | 'admin';
    className?: string;
};

function stepDotClass(
    step: OrderTimelineStep,
    isAdmin: boolean,
): string {
    const isCurrent = step.state === 'current';
    const isUpcoming = step.state === 'upcoming';

    if (isUpcoming) {
        return orderStatusTimelineUpcomingDotClass(step.status, isAdmin);
    }

    return isAdmin
        ? orderStatusTimelineDotClassAdmin(step.status, isCurrent)
        : orderStatusTimelineDotClass(step.status, isCurrent);
}

export default function OrderStatusTimeline({
    currentStatus,
    histories = [],
    variant = 'store',
    className = '',
}: Props) {
    const isAdmin = variant === 'admin';

    const steps = useMemo(
        () => buildOrderStatusTimelineSteps(currentStatus, histories),
        [currentStatus, histories],
    );

    if (steps.length === 0) {
        return null;
    }

    const lineClass = isAdmin
        ? 'border-slate-200 dark:border-slate-700'
        : 'border-stone-200 dark:border-stone-700';

    const noteClass = isAdmin
        ? 'text-sm text-slate-600 dark:text-slate-400'
        : 'text-sm text-stone-600 dark:text-stone-400';

    const metaClass = isAdmin
        ? 'text-xs text-slate-500 dark:text-slate-400'
        : 'text-xs text-stone-500 dark:text-stone-400';

    const currentLabelClass =
        'rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm';

    const upcomingLabelClass = isAdmin
        ? 'rounded-full border border-dashed border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400'
        : 'rounded-full border border-dashed border-stone-300 bg-stone-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-500 dark:border-stone-600 dark:bg-stone-800/50 dark:text-stone-400';

    return (
        <ol className={`relative ml-1.5 border-l-2 ${lineClass} ${className}`}>
            {steps.map((step, index) => {
                const isCurrent = step.state === 'current';
                const isUpcoming = step.state === 'upcoming';
                const isLast = index === steps.length - 1;
                const history = step.history;
                const dateTime = history?.created_at ?? null;
                const { date, time } = formatTimelineDate(dateTime);
                const dotClass = stepDotClass(step, isAdmin);
                const rowKey = history?.id ?? `step-${step.key}`;

                return (
                    <li
                        key={rowKey}
                        className={`relative pl-6 ${isLast ? 'pb-0' : 'pb-8'} ${
                            isUpcoming ? 'opacity-75' : ''
                        }`}
                    >
                        <span className={dotClass} aria-hidden />

                        <div className="flex flex-wrap items-center gap-2 gap-y-1">
                            {dateTime ? (
                                <time className={metaClass} dateTime={dateTime}>
                                    <span
                                        className={
                                            isAdmin
                                                ? 'font-medium text-slate-700 dark:text-slate-300'
                                                : 'font-medium text-stone-700 dark:text-stone-300'
                                        }
                                    >
                                        {date}
                                    </span>
                                    {time ? (
                                        <span
                                            className={
                                                isAdmin
                                                    ? 'text-slate-400 dark:text-slate-500'
                                                    : 'text-stone-400 dark:text-stone-500'
                                            }
                                        >
                                            {' '}
                                            · {time}
                                        </span>
                                    ) : null}
                                </time>
                            ) : isUpcoming ? (
                                <span className={metaClass}>Not yet</span>
                            ) : null}
                            {isCurrent ? (
                                <span className={currentLabelClass}>Current</span>
                            ) : null}
                            {isUpcoming ? (
                                <span className={upcomingLabelClass}>Upcoming</span>
                            ) : null}
                        </div>

                        <div
                            className={`mt-2 flex flex-wrap items-center gap-2 ${
                                isCurrent
                                    ? orderStatusTimelineCurrentHighlightClass(step.status)
                                    : ''
                            }`}
                        >
                            <span
                                className={orderStatusTimelineBadgeClass(
                                    step.status,
                                    step.state,
                                )}
                            >
                                {formatStatusLabel(step.status)}
                            </span>
                        </div>

                        {history?.creator?.name ? (
                            <p className={`mt-1.5 ${metaClass}`}>
                                Updated by {history.creator.name}
                            </p>
                        ) : null}

                        {history?.note ? (
                            <p className={`mt-2 ${noteClass}`}>{history.note}</p>
                        ) : null}
                    </li>
                );
            })}
        </ol>
    );
}
