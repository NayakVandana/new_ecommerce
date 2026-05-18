<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('compare_at_price', 12, 2)->nullable()->after('unit_price');
            $table->decimal('discount_percent', 5, 2)->default(0)->after('compare_at_price');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['compare_at_price', 'discount_percent']);
        });
    }
};
