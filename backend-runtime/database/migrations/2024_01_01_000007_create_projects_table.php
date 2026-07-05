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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_number')->unique();
            $table->string('name');
            $table->string('client_name');
            $table->text('location')->nullable();
            $table->decimal('contract_value', 20, 2)->default(0);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->foreignId('manager_id')->constrained('users')->restrictOnDelete();
            $table->enum('status', ['planning', 'running', 'hold', 'completed', 'cancelled'])->default('planning');
            $table->integer('progress')->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index('project_number');
            $table->index('status');
            $table->index('manager_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
