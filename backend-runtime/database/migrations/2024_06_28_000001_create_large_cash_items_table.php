<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('large_cash_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('large_cash_request_id')->constrained('large_cash_requests')->cascadeOnDelete();
            $table->text('description');
            $table->decimal('quantity', 20, 2)->default(0);
            $table->decimal('unit_price', 20, 2)->default(0);
            $table->decimal('total', 20, 2)->default(0);
            $table->timestamps();

            $table->index('large_cash_request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('large_cash_items');
    }
};
