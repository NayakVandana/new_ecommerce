import { storeBadgeMuted } from '@/store/storeTheme';

const statusBadgeBase =
    'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset';

/** Per-status badge palette (store + admin order UI). */
const STATUS_BADGE: Record<string, string> = {
    pending: `${statusBadgeBase} bg-amber-100 text-amber-900 ring-amber-300/70 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-400/30`,
    processing: `${statusBadgeBase} bg-sky-100 text-sky-900 ring-sky-300/70 dark:bg-sky-500/20 dark:text-sky-200 dark:ring-sky-400/30`,
    confirmed: `${statusBadgeBase} bg-violet-100 text-violet-900 ring-violet-300/70 dark:bg-violet-500/20 dark:text-violet-200 dark:ring-violet-400/30`,
    shipped: `${statusBadgeBase} bg-indigo-100 text-indigo-900 ring-indigo-300/70 dark:bg-indigo-500/20 dark:text-indigo-200 dark:ring-indigo-400/30`,
    delivered: `${statusBadgeBase} bg-emerald-100 text-emerald-900 ring-emerald-300/70 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/30`,
    completed: `${statusBadgeBase} bg-emerald-100 text-emerald-900 ring-emerald-300/70 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/30`,
    paid: `${statusBadgeBase} bg-teal-100 text-teal-900 ring-teal-300/70 dark:bg-teal-500/20 dark:text-teal-200 dark:ring-teal-400/30`,
    cancelled: `${statusBadgeBase} bg-red-100 text-red-900 ring-red-300/70 dark:bg-red-500/20 dark:text-red-200 dark:ring-red-400/30`,
    canceled: `${statusBadgeBase} bg-red-100 text-red-900 ring-red-300/70 dark:bg-red-500/20 dark:text-red-200 dark:ring-red-400/30`,
    refunded: `${statusBadgeBase} bg-orange-100 text-orange-900 ring-orange-300/70 dark:bg-orange-500/20 dark:text-orange-200 dark:ring-orange-400/30`,
    failed: `${statusBadgeBase} bg-rose-100 text-rose-900 ring-rose-300/70 dark:bg-rose-500/20 dark:text-rose-200 dark:ring-rose-400/30`,
};

const STATUS_BADGE_UPCOMING: Record<string, string> = {
    pending: `${statusBadgeBase} border border-dashed border-amber-300/80 bg-amber-50/80 text-amber-700/80 ring-0 dark:border-amber-600/50 dark:bg-amber-950/20 dark:text-amber-300/70`,
    processing: `${statusBadgeBase} border border-dashed border-sky-300/80 bg-sky-50/80 text-sky-700/80 ring-0 dark:border-sky-600/50 dark:bg-sky-950/20 dark:text-sky-300/70`,
    confirmed: `${statusBadgeBase} border border-dashed border-violet-300/80 bg-violet-50/80 text-violet-700/80 ring-0 dark:border-violet-600/50 dark:bg-violet-950/20 dark:text-violet-300/70`,
    shipped: `${statusBadgeBase} border border-dashed border-indigo-300/80 bg-indigo-50/80 text-indigo-700/80 ring-0 dark:border-indigo-600/50 dark:bg-indigo-950/20 dark:text-indigo-300/70`,
    delivered: `${statusBadgeBase} border border-dashed border-emerald-300/80 bg-emerald-50/80 text-emerald-700/80 ring-0 dark:border-emerald-600/50 dark:bg-emerald-950/20 dark:text-emerald-300/70`,
};

const STATUS_DOT_BORDER: Record<string, string> = {
    pending: 'border-amber-400 dark:border-amber-500',
    processing: 'border-sky-400 dark:border-sky-500',
    confirmed: 'border-violet-400 dark:border-violet-500',
    shipped: 'border-indigo-400 dark:border-indigo-500',
    delivered: 'border-emerald-400 dark:border-emerald-500',
    completed: 'border-emerald-400 dark:border-emerald-500',
    paid: 'border-teal-400 dark:border-teal-500',
    cancelled: 'border-red-400 dark:border-red-500',
    canceled: 'border-red-400 dark:border-red-500',
    refunded: 'border-orange-400 dark:border-orange-500',
    failed: 'border-rose-400 dark:border-rose-500',
};

const STATUS_DOT: Record<string, string> = {
    pending: 'bg-amber-500',
    processing: 'bg-sky-500',
    confirmed: 'bg-violet-500',
    shipped: 'bg-indigo-500',
    delivered: 'bg-emerald-500',
    completed: 'bg-emerald-500',
    paid: 'bg-teal-500',
    cancelled: 'bg-red-500',
    canceled: 'bg-red-500',
    refunded: 'bg-orange-500',
    failed: 'bg-rose-500',
};

const STATUS_CURRENT_RING: Record<string, string> = {
    pending: 'ring-amber-400 dark:ring-amber-500',
    processing: 'ring-sky-400 dark:ring-sky-500',
    confirmed: 'ring-violet-400 dark:ring-violet-500',
    shipped: 'ring-indigo-400 dark:ring-indigo-500',
    delivered: 'ring-emerald-400 dark:ring-emerald-500',
    completed: 'ring-emerald-400 dark:ring-emerald-500',
    paid: 'ring-teal-400 dark:ring-teal-500',
    cancelled: 'ring-red-400 dark:ring-red-500',
    canceled: 'ring-red-400 dark:ring-red-500',
    refunded: 'ring-orange-400 dark:ring-orange-500',
    failed: 'ring-rose-400 dark:ring-rose-500',
};

function normalizeStatus(status: string): string {
    return status.toLowerCase();
}

export function orderStatusBadgeClass(status: string): string {
    const key = normalizeStatus(status);

    return STATUS_BADGE[key] ?? storeBadgeMuted;
}

export function orderStatusTimelineBadgeClass(
    status: string,
    state: 'completed' | 'current' | 'upcoming',
): string {
    const key = normalizeStatus(status);

    if (state === 'upcoming') {
        return STATUS_BADGE_UPCOMING[key] ?? storeBadgeMuted;
    }

    if (state === 'current') {
        return `${orderStatusBadgeClass(status)} shadow-sm`;
    }

    return orderStatusBadgeClass(status);
}

export function orderStatusTimelineCurrentHighlightClass(status: string): string {
    const key = normalizeStatus(status);
    const ring = STATUS_CURRENT_RING[key] ?? 'ring-stone-400 dark:ring-stone-500';

    return `rounded-xl p-1.5 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-stone-900 ${ring}`;
}

export function formatMoney(amount: string | number, currency: string): string {
    const n = typeof amount === 'string' ? Number.parseFloat(amount) : amount;

    if (Number.isNaN(n)) {
        return `${amount} ${currency}`;
    }

    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currency || 'INR',
        }).format(n);
    } catch {
        return `${n.toFixed(2)} ${currency}`;
    }
}

/** Discount / deduction lines: currency symbol first, then minus (e.g. ₹ -1,000.00). */
export function formatMoneyDeduction(amount: string | number, currency: string): string {
    const n = Math.abs(typeof amount === 'string' ? Number.parseFloat(amount) : amount);

    if (Number.isNaN(n)) {
        return `-${amount}`;
    }

    const code = currency || 'INR';

    try {
        const amountPart = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(n);

        if (code === 'INR') {
            return `₹ -${amountPart}`;
        }

        return `-${formatMoney(n, code)}`;
    } catch {
        return `-${n.toFixed(2)} ${code}`;
    }
}

export function formatStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'Pending',
        processing: 'Processing',
        confirmed: 'Confirmed',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        canceled: 'Cancelled',
        paid: 'Paid',
        completed: 'Completed',
        failed: 'Failed',
        refunded: 'Refunded',
    };

    const key = status.toLowerCase();

    if (labels[key]) {
        return labels[key];
    }

    return key
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export function formatTimelineDate(value: string | null): { date: string; time: string } {
    if (!value) {
        return { date: '—', time: '' };
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return { date: '—', time: '' };
    }

    return {
        date: d.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }),
        time: d.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
        }),
    };
}

function timelineDotBase(isAdmin: boolean): string {
    return `absolute -left-[0.5625rem] top-1.5 flex h-4 w-4 shrink-0 rounded-full border-2 shadow-sm ${
        isAdmin
            ? 'border-white dark:border-slate-900'
            : 'border-white dark:border-stone-900'
    }`;
}

function statusDotColor(status: string): string {
    return STATUS_DOT[normalizeStatus(status)] ?? 'bg-stone-400 dark:bg-stone-500';
}

export function orderStatusTimelineDotClass(status: string, isCurrent: boolean): string {
    const base = timelineDotBase(false);
    const fill = statusDotColor(status);

    if (isCurrent) {
        return `${base} ${fill} ring-2 ring-offset-1 ring-offset-white ring-stone-200 dark:ring-offset-stone-900 dark:ring-stone-700`;
    }

    return `${base} ${fill}`;
}

export function orderStatusTimelineUpcomingDotClass(status: string, isAdmin: boolean): string {
    const base = timelineDotBase(isAdmin);
    const border =
        STATUS_DOT_BORDER[normalizeStatus(status)] ??
        'border-stone-300 dark:border-stone-600';

    return `${base} border-2 bg-transparent ${border}`;
}

export function orderStatusTimelineDotClassAdmin(status: string, isCurrent: boolean): string {
    const base = timelineDotBase(true);
    const fill = statusDotColor(status);

    if (isCurrent) {
        return `${base} ${fill} ring-2 ring-offset-1 ring-offset-white ring-violet-200 dark:ring-offset-slate-900 dark:ring-violet-800`;
    }

    return `${base} ${fill}`;
}

export function formatOrderDate(value: string | null): string {
    if (!value) {
        return '—';
    }
    const d = new Date(value);

    return Number.isNaN(d.getTime())
        ? '—'
        : d.toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
          });
}
