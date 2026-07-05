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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained('companies')->nullOnDelete();
            $table->string('username')->unique()->nullable()->after('email');
            $table->string('nik', 20)->nullable()->after('username');
            $table->enum('gender', ['male', 'female'])->nullable()->after('phone');
            $table->text('address')->nullable()->after('gender');
            $table->date('join_date')->nullable()->after('address');
            $table->string('position', 100)->nullable()->after('join_date');
            $table->string('division', 100)->nullable()->after('position');
            
            $table->index('company_id');
            $table->index('username');
            $table->index('division');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropIndex(['company_id']);
            $table->dropColumn(['company_id', 'username', 'nik', 'gender', 'address', 'join_date', 'position', 'division']);
        });
    }
};
