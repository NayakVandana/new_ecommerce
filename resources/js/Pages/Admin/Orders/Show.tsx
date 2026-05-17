import {
    adminErrorBanner,
    adminFormSection,
    adminFormSectionTitle,
    adminInput,
    adminLabel,
    adminMutedText,
    adminStackPageWrap,
    adminTable,
    adminTableHead,
    adminTableTd,
    adminTableTh,
    adminTableWrap,
} from '@/admin/adminTheme';
import {
    adminApiPost,
    type AdminApiEnvelope,
} from '@/api/adminClient';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps as AppPageProps } from '@/types';
import {
    formatMoney,
    formatOrderDate,
    orderStatusBadgeClass,
} from '@/store/orderStatus';
import { Head, Link, usePage } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useState } from 'react';

type AddressSnapshot = {
    full_name?: string;
    phone?: string;
    line1?: string;
    line2?: string | null;
    city?: string;
    state?: string;
    postal_code?: string;
};

type OrderItem = {
    id: number;
    product_name: string;
    variant_label: string | null;
    sku: string;
    unit_price: string | number;
    quantity: number;
    line_total: string | number;
};

type StatusHistory = {
    id: number;
    status: string;
    note: string | null;
    created_at: string;
    creator?: { id: number; name: string } | null;
};

type Payment = {
    id: number;
    method: string;
    status: string;
    amount: string | number;
    currency: string;
};

type OrderUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
};

type OrderDetail = {
    id: number;
    order_number: string;
    status: string;
    subtotal: string | number;
    tax_total: string | number;
    shipping_total: string | number;
    discount_total: string | number;
    grand_total: string | number;
    currency: string;
    customer_note: string | null;
    placed_at: string | null;
    created_at: string;
    shipping_snapshot?: AddressSnapshot | null;
    user?: OrderUser | null;
    items?: OrderItem[];
    status_histories?: StatusHistory[];
    payments?: Payment[];
};

type StatusOption = { id: string; label: string };

type PageProps = AppPageProps<{
    orderId: number;
}>;

function formatAddress(snapshot: AddressSnapshot | null | undefined): string | null {
    if (!snapshot?.line1) {
        return null;
    }

    const lines = [
        snapshot.full_name,
        snapshot.phone,
        snapshot.line1,
        snapshot.line2,
        [snapshot.city, snapshot.state, snapshot.postal_code].filter(Boolean).join(', '),
    ].filter(Boolean);

    return lines.join('\n');
}

export default function Show() {
    const { orderId } = usePage<PageProps>().props;
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [statuses, setStatuses] = useState<StatusOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusValue, setStatusValue] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const [updating, setUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await adminApiPost<AdminApiEnvelope<OrderDetail>>(
                '/orders/order-show',
                { id: orderId },
            );
            if (!res.success || !res.data) {
                setError(res.message || 'Could not load order.');

                return;
            }
            setOrder(res.data);
            setStatusValue(res.data.status);
        } catch {
            setError('Could not load order.');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        adminApiPost<AdminApiEnvelope<{ statuses: StatusOption[] }>>(
            '/orders/orders-meta',
            {},
        )
            .then((res) => {
                if (res.success && res.data?.statuses) {
                    setStatuses(res.data.statuses);
                }
            })
            .catch(() => {});
    }, []);

    const onUpdateStatus = async (e: FormEvent) => {
        e.preventDefault();
        if (!order || updating) {
            return;
        }

        setUpdating(true);
        setUpdateMessage(null);

        try {
            const res = await adminApiPost<AdminApiEnvelope<OrderDetail>>(
                '/orders/update-status',
                {
                    id: order.id,
                    status: statusValue,
                    ...(statusNote.trim() ? { note: statusNote.trim() } : {}),
                },
            );

            if (!res.success || !res.data) {
                setUpdateMessage(res.message || 'Could not update status.');

                return;
            }

            setOrder(res.data);
            setStatusValue(res.data.status);
            setStatusNote('');
            setUpdateMessage('Status updated.');
        } catch {
            setUpdateMessage('Could not update status.');
        } finally {
            setUpdating(false);
        }
    };

    const items = order?.items ?? [];
    const histories = order?.status_histories ?? [];
    const payments = order?.payments ?? [];
    const addressText = formatAddress(order?.shipping_snapshot);

    return (
        <>
            <Head
                title={
                    order
                        ? `Order ${order.order_number}`
                        : 'Order detail'
                }
            />
            <AdminLayout
                heading={order ? `Order ${order.order_number}` : 'Order'}
            >
                <div className={adminStackPageWrap}>
                    <Link
                        href={route('admin.orders.index')}
                        className="text-sm font-medium text-violet-700 hover:text-violet-900 dark:text-violet-300"
                    >
                        ← Back to orders
                    </Link>

                    {error ? (
                        <div className={adminErrorBanner}>{error}</div>
                    ) : null}
                    {loading ? (
                        <p className={adminMutedText}>Loading…</p>
                    ) : null}

                    {!loading && !error && order ? (
                        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                            <div className="space-y-6">
                                <section className={adminFormSection}>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p
                                                className={`${adminMutedText} text-xs uppercase tracking-wide`}
                                            >
                                                Order
                                            </p>
                                            <h2
                                                className={
                                                    adminFormSectionTitle
                                                }
                                            >
                                                {order.order_number}
                                            </h2>
                                            <p className={`mt-1 ${adminMutedText}`}>
                                                Placed{' '}
                                                {formatOrderDate(
                                                    order.placed_at ??
                                                        order.created_at,
                                                )}
                                            </p>
                                        </div>
                                        <span
                                            className={orderStatusBadgeClass(
                                                order.status,
                                            )}
                                        >
                                            {order.status}
                                        </span>
                                    </div>

                                    {order.user ? (
                                        <dl className="mt-4 grid gap-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800 sm:grid-cols-2">
                                            <div>
                                                <dt className={adminMutedText}>
                                                    Customer
                                                </dt>
                                                <dd className="font-medium text-slate-900 dark:text-white">
                                                    {order.user.name}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className={adminMutedText}>
                                                    Email
                                                </dt>
                                                <dd className="text-slate-700 dark:text-slate-300">
                                                    {order.user.email}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className={adminMutedText}>
                                                    Phone
                                                </dt>
                                                <dd className="text-slate-700 dark:text-slate-300">
                                                    {order.user.phone ?? '—'}
                                                </dd>
                                            </div>
                                        </dl>
                                    ) : null}

                                    <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800 sm:grid-cols-2">
                                        <div>
                                            <dt className={adminMutedText}>
                                                Subtotal
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-white">
                                                {formatMoney(
                                                    order.subtotal,
                                                    order.currency,
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className={adminMutedText}>
                                                Shipping
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-white">
                                                {formatMoney(
                                                    order.shipping_total,
                                                    order.currency,
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className={adminMutedText}>
                                                Tax
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-white">
                                                {formatMoney(
                                                    order.tax_total,
                                                    order.currency,
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className={adminMutedText}>
                                                Discount
                                            </dt>
                                            <dd className="font-medium text-slate-900 dark:text-white">
                                                {formatMoney(
                                                    order.discount_total,
                                                    order.currency,
                                                )}
                                            </dd>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <dt className={adminMutedText}>
                                                Total
                                            </dt>
                                            <dd className="text-lg font-bold text-slate-900 dark:text-white">
                                                {formatMoney(
                                                    order.grand_total,
                                                    order.currency,
                                                )}
                                            </dd>
                                        </div>
                                    </dl>

                                    {order.customer_note ? (
                                        <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                                Customer note:{' '}
                                            </span>
                                            {order.customer_note}
                                        </p>
                                    ) : null}
                                </section>

                                {addressText ? (
                                    <section className={adminFormSection}>
                                        <h2 className={adminFormSectionTitle}>
                                            Delivery address
                                        </h2>
                                        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300">
                                            {addressText}
                                        </pre>
                                    </section>
                                ) : null}

                                <section className={adminFormSection}>
                                    <h2 className={adminFormSectionTitle}>
                                        Line items
                                    </h2>
                                    <div
                                        className={`${adminTableWrap} mt-4 border-0 shadow-none`}
                                    >
                                        <table className={adminTable}>
                                            <thead className={adminTableHead}>
                                                <tr>
                                                    <th className={adminTableTh}>
                                                        Product
                                                    </th>
                                                    <th className={adminTableTh}>
                                                        Qty
                                                    </th>
                                                    <th
                                                        className={`${adminTableTh} text-right`}
                                                    >
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td
                                                            className={
                                                                adminTableTd
                                                            }
                                                        >
                                                            <p className="font-medium text-slate-900 dark:text-white">
                                                                {
                                                                    item.product_name
                                                                }
                                                            </p>
                                                            {item.variant_label ? (
                                                                <p
                                                                    className={
                                                                        adminMutedText
                                                                    }
                                                                >
                                                                    {
                                                                        item.variant_label
                                                                    }
                                                                </p>
                                                            ) : null}
                                                            <p className="text-xs text-slate-400">
                                                                SKU {item.sku}
                                                            </p>
                                                        </td>
                                                        <td
                                                            className={
                                                                adminTableTd
                                                            }
                                                        >
                                                            {item.quantity}
                                                        </td>
                                                        <td
                                                            className={`${adminTableTd} text-right`}
                                                        >
                                                            {formatMoney(
                                                                item.line_total,
                                                                order.currency,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                {payments.length > 0 ? (
                                    <section className={adminFormSection}>
                                        <h2 className={adminFormSectionTitle}>
                                            Payment
                                        </h2>
                                        <ul className="mt-3 space-y-2 text-sm">
                                            {payments.map((p) => (
                                                <li
                                                    key={p.id}
                                                    className="flex flex-wrap justify-between gap-2"
                                                >
                                                    <span className="capitalize text-slate-700 dark:text-slate-300">
                                                        {p.method.replace(
                                                            '_',
                                                            ' ',
                                                        )}{' '}
                                                        · {p.status}
                                                    </span>
                                                    <span className="font-medium text-slate-900 dark:text-white">
                                                        {formatMoney(
                                                            p.amount,
                                                            p.currency,
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                ) : null}

                                {histories.length > 0 ? (
                                    <section className={adminFormSection}>
                                        <h2 className={adminFormSectionTitle}>
                                            Status history
                                        </h2>
                                        <ul className="mt-4 space-y-3">
                                            {histories.map((h) => (
                                                <li
                                                    key={h.id}
                                                    className="border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span
                                                            className={orderStatusBadgeClass(
                                                                h.status,
                                                            )}
                                                        >
                                                            {h.status}
                                                        </span>
                                                        <span
                                                            className={
                                                                adminMutedText
                                                            }
                                                        >
                                                            {formatOrderDate(
                                                                h.created_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                    {h.creator?.name ? (
                                                        <p
                                                            className={`mt-1 text-xs ${adminMutedText}`}
                                                        >
                                                            by {h.creator.name}
                                                        </p>
                                                    ) : null}
                                                    {h.note ? (
                                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                            {h.note}
                                                        </p>
                                                    ) : null}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                ) : null}
                            </div>

                            <aside>
                                <form
                                    onSubmit={onUpdateStatus}
                                    className={adminFormSection}
                                >
                                    <h2 className={adminFormSectionTitle}>
                                        Update status
                                    </h2>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label
                                                htmlFor="order-status"
                                                className={adminLabel}
                                            >
                                                Status
                                            </label>
                                            <select
                                                id="order-status"
                                                value={statusValue}
                                                onChange={(e) =>
                                                    setStatusValue(
                                                        e.target.value,
                                                    )
                                                }
                                                className={adminInput}
                                            >
                                                {statuses.map((s) => (
                                                    <option
                                                        key={s.id}
                                                        value={s.id}
                                                    >
                                                        {s.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="status-note"
                                                className={adminLabel}
                                            >
                                                Note (optional)
                                            </label>
                                            <textarea
                                                id="status-note"
                                                value={statusNote}
                                                onChange={(e) =>
                                                    setStatusNote(
                                                        e.target.value,
                                                    )
                                                }
                                                rows={3}
                                                className={adminInput}
                                                placeholder="Internal note for this change"
                                            />
                                        </div>
                                        {updateMessage ? (
                                            <p
                                                className={
                                                    updateMessage ===
                                                    'Status updated.'
                                                        ? 'text-sm text-emerald-600 dark:text-emerald-400'
                                                        : 'text-sm text-red-600 dark:text-red-400'
                                                }
                                            >
                                                {updateMessage}
                                            </p>
                                        ) : null}
                                        <button
                                            type="submit"
                                            disabled={
                                                updating ||
                                                statusValue === order.status
                                            }
                                            className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-600"
                                        >
                                            {updating
                                                ? 'Saving…'
                                                : 'Save status'}
                                        </button>
                                    </div>
                                </form>
                            </aside>
                        </div>
                    ) : null}
                </div>
            </AdminLayout>
        </>
    );
}
