export type OrderStatusHistoryEntry = {
    id: number;
    status: string;
    note?: string | null;
    created_at: string;
    creator?: { id?: number; name: string } | null;
};

export const ORDER_STATUS_PIPELINE = [
    'pending',
    'processing',
    'confirmed',
    'shipped',
    'delivered',
] as const;

export const TERMINAL_ORDER_STATUSES = [
    'cancelled',
    'canceled',
    'refunded',
    'failed',
] as const;

export type OrderTimelineStepState = 'current' | 'completed' | 'upcoming';

export type OrderTimelineStep = {
    key: string;
    status: string;
    state: OrderTimelineStepState;
    history?: OrderStatusHistoryEntry | null;
};

function pipelineIndex(status: string): number {
    return ORDER_STATUS_PIPELINE.indexOf(
        status.toLowerCase() as (typeof ORDER_STATUS_PIPELINE)[number],
    );
}

function isTerminalStatus(status: string): boolean {
    return (TERMINAL_ORDER_STATUSES as readonly string[]).includes(status.toLowerCase());
}

function historyByStatus(
    histories: OrderStatusHistoryEntry[],
): Map<string, OrderStatusHistoryEntry> {
    const map = new Map<string, OrderStatusHistoryEntry>();

    for (const entry of histories) {
        const key = entry.status.toLowerCase();
        const existing = map.get(key);

        if (
            !existing ||
            new Date(entry.created_at).getTime() > new Date(existing.created_at).getTime()
        ) {
            map.set(key, entry);
        }
    }

    return map;
}

function makeStep(
    status: string,
    state: OrderTimelineStepState,
    history?: OrderStatusHistoryEntry | null,
): OrderTimelineStep {
    const key = status.toLowerCase();

    return {
        key,
        status: key,
        state,
        history: history ?? null,
    };
}

/** Pipeline order: Pending → … → Delivered; current step highlighted in place. */
export function buildOrderStatusTimelineSteps(
    currentStatus: string,
    histories: OrderStatusHistoryEntry[],
): OrderTimelineStep[] {
    const current = currentStatus.toLowerCase();
    const byStatus = historyByStatus(histories);

    if (isTerminalStatus(current)) {
        const highestPipeline = Math.max(
            -1,
            ...[...byStatus.keys()]
                .filter((s) => s !== current)
                .map((s) => pipelineIndex(s)),
        );

        const completedPipeline = ORDER_STATUS_PIPELINE.filter(
            (_, index) => index <= highestPipeline,
        ).map((status) => makeStep(status, 'completed', byStatus.get(status)));

        return [
            ...completedPipeline,
            makeStep(current, 'current', byStatus.get(current)),
        ];
    }

    const currentIdx = pipelineIndex(current);

    if (currentIdx === -1) {
        const sorted = [...histories].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );

        return sorted.map((entry, index) =>
            makeStep(
                entry.status,
                index === sorted.length - 1 ? 'current' : 'completed',
                entry,
            ),
        );
    }

    return ORDER_STATUS_PIPELINE.map((status, index) => {
        let state: OrderTimelineStepState;

        if (index < currentIdx) {
            state = 'completed';
        } else if (index === currentIdx) {
            state = 'current';
        } else {
            state = 'upcoming';
        }

        return makeStep(status, state, byStatus.get(status));
    });
}
