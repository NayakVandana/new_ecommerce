<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->index();
            $table->string('size', 50)->nullable();
            $table->string('color', 50)->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('compare_at_price', 12, 2)->nullable();
            $table->decimal('cost', 12, 2)->nullable();
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->unsignedInteger('low_stock_threshold')->nullable();
            $table->decimal('weight_kg', 10, 3)->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index('product_id');
            $table->index(['size', 'color']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
