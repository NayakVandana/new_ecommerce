import {
    storeBadgeDanger,
    storeBadgeMuted,
    storeBadgePending,
    storeBadgeSuccess,
} from '@/store/storeTheme';

export function orderStatusBadgeClass(status: string): string {
    const s = status.toLowerCase();

    if (['delivered', 'completed', 'paid'].includes(s)) {
        return storeBadgeSuccess;
    }

    if (['cancelled', 'canceled', 'refunded', 'failed'].includes(s)) {
        return storeBadgeDanger;
    }

    if (['pending', 'processing', 'confirmed', 'shipped'].includes(s)) {
        return storeBadgePending;
    }

    return storeBadgeMuted;
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
