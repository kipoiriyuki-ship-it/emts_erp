<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('licenses', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('used_at')->constrained('companies')->nullOnDelete();
            $table->json('modules_enabled')->nullable()->after('max_projects');
            $table->unsignedInteger('device_limit')->default(1)->after('modules_enabled');
            $table->string('status')->default('active')->after('is_active');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('license_type')->constrained('companies')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('company_id');
        });

        Schema::table('licenses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('company_id');
            $table->dropColumn(['modules_enabled', 'device_limit', 'status']);
        });
    }
};
