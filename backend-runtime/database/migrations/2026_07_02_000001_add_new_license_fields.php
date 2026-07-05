<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('licenses', function (Blueprint $table) {
            if (!Schema::hasColumn('licenses', 'license_code')) {
                $table->string('license_code')->nullable()->after('code');
            }
            if (!Schema::hasColumn('licenses', 'license_type')) {
                $table->string('license_type')->nullable()->after('type');
            }
            if (!Schema::hasColumn('licenses', 'issued_at')) {
                $table->timestamp('issued_at')->nullable()->after('used_at');
            }
            if (!Schema::hasColumn('licenses', 'activated_at')) {
                $table->timestamp('activated_at')->nullable()->after('issued_at');
            }
            if (!Schema::hasColumn('licenses', 'generated_by')) {
                $table->unsignedBigInteger('generated_by')->nullable()->after('activated_at');
            }
            if (!Schema::hasColumn('licenses', 'used_by')) {
                $table->unsignedBigInteger('used_by')->nullable()->after('generated_by');
            }
            if (!Schema::hasColumn('licenses', 'company_id')) {
                $table->foreignId('company_id')->nullable()->after('used_at')->constrained('companies')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('licenses', function (Blueprint $table) {
            $table->dropColumn(['license_code', 'license_type', 'issued_at', 'activated_at', 'generated_by', 'used_by']);
        });
    }
};
