<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->json('address_of_bill_to')->nullable()->after('customer_note');
            $table->json('address_of_ship_to')->nullable()->after('address_of_bill_to');
        });

        if (Schema::hasColumn('orders', 'billing_snapshot')) {
            $decode = static function (mixed $value): ?array {
                if ($value === null) {
                    return null;
                }
                if (is_array($value)) {
                    return $value;
                }

                return json_decode((string) $value, true);
            };

            DB::table('orders')->orderBy('id')->chunkById(100, function ($orders) use ($decode) {
                foreach ($orders as $order) {
                    $bill = $decode($order->billing_snapshot) ?? $decode($order->shipping_snapshot);
                    $ship = $decode($order->shipping_snapshot) ?? $bill;

                    DB::table('orders')->where('id', $order->id)->update([
                        'address_of_bill_to' => $bill !== null ? json_encode($bill) : null,
                        'address_of_ship_to' => $ship !== null ? json_encode($ship) : null,
                    ]);
                }
            });
        }

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'billing_address_id')) {
                $table->dropForeign(['billing_address_id']);
            }
            if (Schema::hasColumn('orders', 'shipping_address_id')) {
                $table->dropForeign(['shipping_address_id']);
            }
            $table->dropColumn([
                'billing_address_id',
                'shipping_address_id',
                'billing_snapshot',
                'shipping_snapshot',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('billing_address_id')->nullable()->constrained('user_addresses')->nullOnDelete();
            $table->foreignId('shipping_address_id')->nullable()->constrained('user_addresses')->nullOnDelete();
            $table->json('billing_snapshot')->nullable();
            $table->json('shipping_snapshot')->nullable();
        });

        DB::table('orders')->orderBy('id')->chunkById(100, function ($orders) {
            foreach ($orders as $order) {
                DB::table('orders')->where('id', $order->id)->update([
                    'billing_snapshot' => $order->address_of_bill_to,
                    'shipping_snapshot' => $order->address_of_ship_to,
                ]);
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['address_of_bill_to', 'address_of_ship_to']);
        });
    }
};
