import type { CartPayload } from '@/api/cartClient';
import PricingSummary from '@/Components/store/PricingSummary';
import { couponDiscountLabel } from '@/store/pricingLabels';

export type CartCheckoutTotals = {
    shipping: number;
    tax: number;
    grandTotal: number;
};

type Props = {
    cart: CartPayload;
    currency: string;
    checkoutTotals?: CartCheckoutTotals | null;
    couponDiscount?: number;
    couponCode?: string | null;
};

export default function CartOrderSummary({
    cart,
    currency,
    checkoutTotals,
    couponDiscount = 0,
    couponCode = null,
}: Props) {
    const shipping = checkoutTotals?.shipping ?? 0;
    const tax = checkoutTotals?.tax ?? 0;
    const grandTotal = checkoutTotals?.grandTotal ?? cart.subtotal;

    return (
        <PricingSummary
            currency={currency}
            itemCount={cart.count}
            mrpSubtotal={cart.mrp_subtotal ?? cart.subtotal}
            productDiscountTotal={cart.discount_total ?? 0}
            subtotal={cart.subtotal}
            shippingTotal={shipping}
            taxTotal={tax}
            discountTotal={couponDiscount}
            orderDiscountLabel={couponDiscountLabel(couponCode)}
            grandTotal={grandTotal}
            title="Order summary"
            footerNote="Cash on delivery. Shipping and tax match checkout; final total is confirmed when you place your order."
        />
    );
}
