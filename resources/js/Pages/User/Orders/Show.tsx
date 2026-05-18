import CartLinePricing from '@/Components/store/CartLinePricing';
import OrderStatusTimeline from '@/Components/store/OrderStatusTimeline';
import PricingSummary from '@/Components/store/PricingSummary';
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
import { couponDiscountLabel } from '@/store/pricingLabels';
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
    unit_price: number;
    compare_at_price: number | null;
    discount_percent: number;
    quantity: number;
    line_total: number;
    line_mrp_total: number;
    line_discount: number;
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
    subtotal: number;
    tax_total: number;
    shipping_total: number;
    discount_total: number;
    coupon_code?: string | null;
    grand_total: number;
    mrp_subtotal: number;
    product_discount_total: number;
    item_count: number;
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

function num(value: string | number): number {
    return typeof value === 'number' ? value : Number.parseFloat(String(value)) || 0;
}

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
                    '/orders/order-show',
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
    const currency = order?.currency ?? 'INR';

    return (
        <UserPanelLayout title={order ? `Order ${order.order_number}` : 'Order'}>
            <Head title={order ? `Order ${order.order_number}` : 'Order detail'} />
            <div className="space-y-6">
                <Link
                    href={route('user.orders.index')}
                    className="text-sm font-medium text-stone-900 underline-offset-4 hover:underline dark:text-stone-100"
                >
                    ← Back to orders
                </Link>

                {error ? <div className={storeErrorBanner}>{error}</div> : null}
                {loading ? <p className={storeMutedText}>Loading…</p> : null}

                {!loading && !error && order ? (
                    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-6">
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
                                                <th className={`${storeTableTh} hidden sm:table-cell`}>
                                                    Unit price
                                                </th>
                                                <th className={storeTableTh}>Qty</th>
                                                <th className={`${storeTableTh} text-right`}>Total</th>
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
                                                        <div className="mt-1 sm:hidden">
                                                            <CartLinePricing
                                                                item={item}
                                                                currency={currency}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td
                                                        className={`${storeTableTd} hidden sm:table-cell`}
                                                    >
                                                        <CartLinePricing
                                                            item={item}
                                                            currency={currency}
                                                        />
                                                    </td>
                                                    <td className={storeTableTd}>{item.quantity}</td>
                                                    <td className={`${storeTableTd} text-right`}>
                                                        {item.line_discount > 0.009 ? (
                                                            <p className="text-xs text-stone-500 line-through">
                                                                {formatMoney(
                                                                    item.line_mrp_total,
                                                                    currency,
                                                                )}
                                                            </p>
                                                        ) : null}
                                                        <p className="font-semibold text-stone-900 dark:text-white">
                                                            {formatMoney(item.line_total, currency)}
                                                        </p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className={storeCard}>
                                <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                                    Order status
                                </h2>
                                <p className={`mt-1 text-sm ${storeMutedText}`}>
                                    Top to bottom: Pending through Delivered.
                                </p>
                                <OrderStatusTimeline
                                    currentStatus={order.status}
                                    histories={histories}
                                    variant="store"
                                    className="mt-6"
                                />
                            </div>
                        </div>

                        <aside className={`${storeCard} h-fit lg:sticky lg:top-24`}>
                            <PricingSummary
                                currency={currency}
                                itemCount={order.item_count ?? items.reduce((n, i) => n + i.quantity, 0)}
                                mrpSubtotal={num(order.mrp_subtotal ?? order.subtotal)}
                                productDiscountTotal={num(order.product_discount_total ?? 0)}
                                subtotal={num(order.subtotal)}
                                shippingTotal={num(order.shipping_total)}
                                taxTotal={num(order.tax_total)}
                                discountTotal={num(order.discount_total)}
                                orderDiscountLabel={couponDiscountLabel(order.coupon_code)}
                                grandTotal={num(order.grand_total)}
                                title="Payment summary"
                                footerNote="Cash on delivery."
                            />
                            <Link
                                href={route('guest.catalog')}
                                className={`${storeBtnSecondary} mt-6 block text-center`}
                            >
                                Continue shopping
                            </Link>
                        </aside>
                    </div>
                ) : null}
            </div>
        </UserPanelLayout>
    );
}
