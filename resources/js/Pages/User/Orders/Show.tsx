import {
    storeBtnSecondary,
    storeCard,
    storeErrorBanner,
    storeMutedText,
    storeTable,
    storeTableHead,
    storeTableTd,
    storeTableTh,
    storeTableWrap,
} from '@/store/storeTheme';
import {
    formatMoney,
    formatOrderDate,
    orderStatusBadgeClass,
} from '@/store/orderStatus';
import {
    type UserApiEnvelope,
    userApiPost,
} from '@/api/userClient';
import UserPanelLayout from '@/Layouts/User/UserPanelLayout';
import type { PageProps as AppPageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

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
    items?: OrderItem[];
    status_histories?: StatusHistory[];
};

type PageProps = AppPageProps<{
    orderId: number;
}>;

export default function Show() {
    const { orderId } = usePage<PageProps>().props;
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await userApiPost<UserApiEnvelope<OrderDetail>>(
                    '/orders/show',
                    { id: orderId },
                );
                if (cancelled) {
                    return;
                }
                if (!res.success || !res.data) {
                    setError(res.message || 'Could not load order.');

                    return;
                }
                setOrder(res.data);
            } catch {
                if (!cancelled) {
                    setError('Could not load order.');
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
    }, [orderId]);

    const histories = order?.status_histories ?? [];
    const items = order?.items ?? [];

    return (
        <UserPanelLayout title={order ? `Order ${order.order_number}` : 'Order'}>
            <Head title={order ? `Order ${order.order_number}` : 'Order detail'} />
            <div className="mx-auto max-w-3xl space-y-4">
                <Link
                    href={route('user.orders.index')}
                    className="text-sm font-medium text-stone-900 underline-offset-4 hover:underline dark:text-stone-100"
                >
                    ← Back to orders
                </Link>

                {error ? <div className={storeErrorBanner}>{error}</div> : null}
                {loading ? <p className={storeMutedText}>Loading…</p> : null}

                {!loading && !error && order ? (
                    <>
                        <div className={storeCard}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                                        Order
                                    </p>
                                    <p className="text-lg font-semibold text-stone-900 dark:text-white">
                                        {order.order_number}
                                    </p>
                                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                                        Placed {formatOrderDate(order.placed_at ?? order.created_at)}
                                    </p>
                                </div>
                                <span className={orderStatusBadgeClass(order.status)}>
                                    {order.status}
                                </span>
                            </div>
                            <dl className="mt-6 grid gap-3 border-t border-stone-100 pt-4 text-sm dark:border-stone-800 sm:grid-cols-2">
                                <div>
                                    <dt className="text-stone-500 dark:text-stone-400">Subtotal</dt>
                                    <dd className="font-medium text-stone-900 dark:text-white">
                                        {formatMoney(order.subtotal, order.currency)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-stone-500 dark:text-stone-400">Shipping</dt>
                                    <dd className="font-medium text-stone-900 dark:text-white">
                                        {formatMoney(order.shipping_total, order.currency)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-stone-500 dark:text-stone-400">Tax</dt>
                                    <dd className="font-medium text-stone-900 dark:text-white">
                                        {formatMoney(order.tax_total, order.currency)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-stone-500 dark:text-stone-400">Discount</dt>
                                    <dd className="font-medium text-stone-900 dark:text-white">
                                        {formatMoney(order.discount_total, order.currency)}
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-stone-500 dark:text-stone-400">Total</dt>
                                    <dd className="text-lg font-bold text-stone-900 dark:text-white">
                                        {formatMoney(order.grand_total, order.currency)}
                                    </dd>
                                </div>
                            </dl>
                            {order.customer_note ? (
                                <p className="mt-4 border-t border-stone-100 pt-4 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-400">
                                    <span className="font-medium text-stone-800 dark:text-stone-200">
                                        Note:{' '}
                                    </span>
                                    {order.customer_note}
                                </p>
                            ) : null}
                        </div>

                        <div className={storeCard}>
                            <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                                Items
                            </h2>
                            <div className={`${storeTableWrap} mt-4 border-0 shadow-none`}>
                                <table className={storeTable}>
                                    <thead className={storeTableHead}>
                                        <tr>
                                            <th className={storeTableTh}>Product</th>
                                            <th className={storeTableTh}>Qty</th>
                                            <th className={`${storeTableTh} text-right`}>
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                        {items.map((item) => (
                                            <tr key={item.id}>
                                                <td className={storeTableTd}>
                                                    <p className="font-medium text-stone-900 dark:text-white">
                                                        {item.product_name}
                                                    </p>
                                                    {item.variant_label ? (
                                                        <p className="text-xs text-stone-500">
                                                            {item.variant_label}
                                                        </p>
                                                    ) : null}
                                                    <p className="text-xs text-stone-400">
                                                        SKU {item.sku}
                                                    </p>
                                                </td>
                                                <td className={storeTableTd}>{item.quantity}</td>
                                                <td className={`${storeTableTd} text-right`}>
                                                    {formatMoney(item.line_total, order.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {histories.length > 0 ? (
                            <div className={storeCard}>
                                <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                                    Status history
                                </h2>
                                <ul className="mt-4 space-y-3">
                                    {histories.map((h) => (
                                        <li
                                            key={h.id}
                                            className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 last:border-0 dark:border-stone-800"
                                        >
                                            <span className={orderStatusBadgeClass(h.status)}>
                                                {h.status}
                                            </span>
                                            <span className="text-xs text-stone-500">
                                                {formatOrderDate(h.created_at)}
                                            </span>
                                            {h.note ? (
                                                <p className="w-full text-sm text-stone-600 dark:text-stone-400">
                                                    {h.note}
                                                </p>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </>
                ) : null}
            </div>
        </UserPanelLayout>
    );
}
