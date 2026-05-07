<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tracking_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->cascadeOnDelete();
            $table->string('status', 64);
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->timestamp('tracked_at')->useCurrent();
            $table->timestamps();

            $table->index(['shipment_id', 'tracked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_histories');
    }
};
