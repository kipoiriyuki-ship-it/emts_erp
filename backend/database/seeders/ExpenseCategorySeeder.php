<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ExpenseCategory;

class ExpenseCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Operational
            ['name' => 'BBM', 'code' => 'BBM', 'type' => 'operational', 'description' => 'Fuel expenses'],
            ['name' => 'Transport', 'code' => 'TRANSPORT', 'type' => 'operational', 'description' => 'Transportation expenses'],
            ['name' => 'Konsumsi', 'code' => 'KONSUMSI', 'type' => 'operational', 'description' => 'Food and beverage expenses'],
            ['name' => 'ATK', 'code' => 'ATK', 'type' => 'operational', 'description' => 'Office supplies'],
            ['name' => 'Parkir', 'code' => 'PARKIR', 'type' => 'operational', 'description' => 'Parking fees'],
            ['name' => 'Lainnya', 'code' => 'LAINNYA', 'type' => 'operational', 'description' => 'Other operational expenses'],
            
            // Large
            ['name' => 'Pembelian Material', 'code' => 'MATERIAL', 'type' => 'large', 'description' => 'Material purchases'],
            ['name' => 'Vendor', 'code' => 'VENDOR', 'type' => 'large', 'description' => 'Vendor payments'],
            ['name' => 'Subkontraktor', 'code' => 'SUBKONTRAKTOR', 'type' => 'large', 'description' => 'Subcontractor payments'],
            ['name' => 'Asset', 'code' => 'ASSET', 'type' => 'large', 'description' => 'Asset purchases'],
            ['name' => 'Pembayaran Proyek', 'code' => 'PEMBAYARAN_PROYEK', 'type' => 'large', 'description' => 'Project payments'],
        ];

        foreach ($categories as $category) {
            ExpenseCategory::create($category);
        }
    }
}
