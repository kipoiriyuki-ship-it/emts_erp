<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financial_policies', function (Blueprint $table) {
            $table->id();
            $table->decimal('petty_cash_approval_limit', 20, 2)->default(0);
            $table->boolean('large_cash_always_require_approval')->default(false);
            $table->decimal('maximum_petty_cash_per_day', 20, 2)->default(0);
            $table->decimal('maximum_petty_cash_per_employee', 20, 2)->default(0);
            $table->decimal('maximum_cash_request_per_project', 20, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_policies');
    }
};
