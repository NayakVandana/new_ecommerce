<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->decimal('list_price', 12, 2)->nullable()->after('compare_at_price');
            $table->decimal('discount_percent', 5, 2)->default(0)->after('list_price');
            $table->decimal('commission_percent', 5, 2)->default(0)->after('discount_percent');
            $table->boolean('is_active')->default(true)->after('is_default');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn([
                'list_price',
                'discount_percent',
                'commission_percent',
                'is_active',
            ]);
        });
    }
};
