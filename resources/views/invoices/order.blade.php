<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $order->order_number }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #1e293b;
            margin: 0;
            padding: 24px;
        }
        h1 { font-size: 20px; margin: 0 0 4px; color: #5b21b6; }
        h2 { font-size: 13px; margin: 0 0 8px; color: #334155; }
        .muted { color: #64748b; font-size: 10px; }
        .header { margin-bottom: 24px; border-bottom: 2px solid #e9d5ff; padding-bottom: 16px; }
        .header-row { width: 100%; }
        .header-row td { vertical-align: top; }
        .meta { text-align: right; }
        .meta strong { display: block; font-size: 14px; color: #1e293b; }
        .grid { width: 100%; margin-bottom: 20px; }
        .grid td { width: 50%; vertical-align: top; padding-right: 12px; }
        .box {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 12px;
            min-height: 72px;
        }
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
        }
        table.items th {
            background: #f5f3ff;
            color: #4c1d95;
            text-align: left;
            padding: 8px 10px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            border-bottom: 1px solid #ddd6fe;
        }
        table.items td {
            padding: 8px 10px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
        }
        table.items .num { text-align: right; white-space: nowrap; }
        .totals {
            width: 260px;
            margin-left: auto;
            margin-top: 8px;
        }
        .totals td { padding: 4px 0; }
        .totals .label { color: #64748b; }
        .totals .value { text-align: right; }
        .totals .grand td {
            border-top: 2px solid #c4b5fd;
            padding-top: 8px;
            font-size: 13px;
            color: #5b21b6;
        }
        .totals .savings td { color: #047857; }
        .price-mrp {
            text-decoration: line-through;
            color: #94a3b8;
            font-size: 9px;
            display: block;
        }
        .price-off {
            color: #047857;
            font-size: 9px;
        }
        .payment-note {
            margin-top: 16px;
            color: #64748b;
            font-size: 10px;
        }
        .footer {
            margin-top: 28px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #94a3b8;
            font-size: 9px;
        }
    </style>
</head>
<body>
@php
    // DomPDF + DejaVu Sans: avoid ₹ and bold weights (glyphs render as "?"). Use "Rs." on PDFs.
    $currency = $order->currency ?: 'INR';
    $money = static function ($amount) use ($currency) {
        $formatted = number_format((float) $amount, 2);

        if ($currency === 'INR') {
            return 'Rs. '.$formatted;
        }

        return trim($currency).' '.$formatted;
    };
    $moneyDeduction = static function ($amount) use ($currency) {
        $formatted = number_format(abs((float) $amount), 2);

        if ($currency === 'INR') {
            return 'Rs. -'.$formatted;
        }

        return '-'.trim($currency).' '.$formatted;
    };
@endphp

<div class="header">
    <table class="header-row">
        <tr>
            <td>
                <h1>{{ $brand }}</h1>
                <p class="muted">Tax invoice / order receipt</p>
            </td>
            <td class="meta">
                <strong>INVOICE</strong>
                <span>{{ $order->order_number }}</span><br>
                <span class="muted">Date: {{ $placedAt?->format('d M Y') ?? '—' }}</span>
            </td>
        </tr>
    </table>
</div>

<table class="grid">
    <tr>
        <td>
            <h2>Bill to</h2>
            <div class="box">
                @if ($order->user)
                    <div><strong>{{ $order->user->name }}</strong></div>
                    <div>{{ $order->user->email }}</div>
                    @if ($order->user->phone)
                        <div>{{ $order->user->phone }}</div>
                    @endif
                @endif
                @foreach ($billingLines as $line)
                    <div>{{ $line }}</div>
                @endforeach
                @if (! $order->user && count($billingLines) === 0)
                    <span class="muted">—</span>
                @endif
            </div>
        </td>
        <td>
            <h2>Ship to</h2>
            <div class="box">
                @forelse ($shippingLines as $line)
                    <div>{{ $line }}</div>
                @empty
                    <span class="muted">Same as billing</span>
                @endforelse
            </div>
        </td>
    </tr>
</table>

<table class="items">
    <thead>
        <tr>
            <th>Item</th>
            <th>SKU</th>
            <th class="num">Qty</th>
            <th class="num">Unit price</th>
            <th class="num">Line total</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($lineItems as $item)
            @php
                $hasDiscount = ! empty($item['compare_at_price'])
                    && (float) $item['compare_at_price'] > (float) $item['unit_price'] + 0.009;
            @endphp
            <tr>
                <td>
                    <strong>{{ $item['product_name'] }}</strong>
                    @if (! empty($item['variant_label']))
                        <br><span class="muted">{{ $item['variant_label'] }}</span>
                    @endif
                    @if ($hasDiscount && (float) ($item['line_discount'] ?? 0) > 0)
                        <br><span class="price-off">You save {{ $money($item['line_discount']) }}</span>
                    @endif
                </td>
                <td>{{ $item['sku'] }}</td>
                <td class="num">{{ $item['quantity'] }}</td>
                <td class="num">
                    @if ($hasDiscount)
                        <span class="price-mrp">{{ $money($item['compare_at_price']) }}</span>
                    @endif
                    {{ $money($item['unit_price']) }}
                    @if ($hasDiscount && (float) ($item['discount_percent'] ?? 0) > 0)
                        <br><span class="price-off">{{ number_format((float) $item['discount_percent'], $item['discount_percent'] == floor($item['discount_percent']) ? 0 : 1) }}% off</span>
                    @endif
                </td>
                <td class="num">
                    @if ($hasDiscount)
                        <span class="price-mrp">{{ $money($item['line_mrp_total']) }}</span>
                    @endif
                    {{ $money($item['line_total']) }}
                </td>
            </tr>
        @endforeach
    </tbody>
</table>

<table class="totals">
    <tr>
        <td class="label">Items ({{ $itemCount }})</td>
        <td class="value">{{ $money($mrpSubtotal) }}</td>
    </tr>
    @if ((float) $productDiscountTotal > 0.009)
        <tr class="savings">
            <td class="label">Discount on MRP</td>
            <td class="value">{{ $moneyDeduction($productDiscountTotal) }}</td>
        </tr>
    @endif
    <tr>
        <td class="label">Subtotal</td>
        <td class="value">{{ $money($order->subtotal) }}</td>
    </tr>
    <tr>
        <td class="label">Shipping</td>
        <td class="value">
            @if ((float) $order->shipping_total > 0)
                {{ $money($order->shipping_total) }}
            @else
                Free
            @endif
        </td>
    </tr>
    @if ((float) $order->tax_total > 0.009)
        <tr>
            <td class="label">Tax</td>
            <td class="value">{{ $money($order->tax_total) }}</td>
        </tr>
    @endif
    @if ((float) $order->discount_total > 0.009)
        <tr class="savings">
            <td class="label">{{ \App\Support\OrderPresentation::couponDiscountLabel($order->coupon?->code) }}</td>
            <td class="value">{{ $moneyDeduction($order->discount_total) }}</td>
        </tr>
    @endif
    <tr class="grand">
        <td class="label"><strong>Total</strong></td>
        <td class="value"><strong>{{ $money($order->grand_total) }}</strong></td>
    </tr>
</table>

<p class="payment-note">Payment: {{ $paymentMethodLabel }}</p>

@if ($order->customer_note)
    <p style="margin-top: 16px;"><strong>Customer note:</strong> {{ $order->customer_note }}</p>
@endif

<div class="footer">
    Thank you for shopping with {{ $brand }}. This is a computer-generated invoice.
</div>
</body>
</html>
