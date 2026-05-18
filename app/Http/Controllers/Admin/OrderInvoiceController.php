<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Order\OrderInvoiceService;
use App\Support\OrderPresentation;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderInvoiceController extends Controller
{
    public function __construct(
        private readonly OrderInvoiceService $invoiceService,
    ) {}

    public function download(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $order = $this->invoiceService->findForInvoice((int) $request->input('id'));

            if (! $order) {
                return $this->sendJsonResponse(false, 'Order not found.', null, 200);
            }

            $summary = OrderPresentation::summarize($order);

            $pdf = Pdf::loadView('invoices.order', [
                'order' => $order,
                'lineItems' => $summary['items'],
                'mrpSubtotal' => $summary['mrp_subtotal'],
                'productDiscountTotal' => $summary['product_discount_total'],
                'itemCount' => $summary['item_count'],
                'brand' => 'Suhaag',
                'statusLabel' => $this->invoiceService->statusLabel($order->status),
                'billingLines' => $this->invoiceService->formatAddressLines($order->address_of_bill_to),
                'shippingLines' => $this->invoiceService->formatAddressLines($order->address_of_ship_to),
                'placedAt' => $order->placed_at ?? $order->created_at,
            ]);

            $filename = 'invoice-'.$order->order_number.'.pdf';

            return $pdf->download($filename);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
