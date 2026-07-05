<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChartOfAccount;

class ChartOfAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = [
            // Assets
            ['account_number' => '1', 'account_name' => 'ASSET', 'account_type' => 'asset', 'parent_id' => null, 'level' => 1, 'balance_type' => 'debit'],
            ['account_number' => '1.1', 'account_name' => 'Current Assets', 'account_type' => 'asset', 'parent_id' => 1, 'level' => 2, 'balance_type' => 'debit'],
            ['account_number' => '101', 'account_name' => 'Kas Kecil', 'account_type' => 'asset', 'parent_id' => 2, 'level' => 3, 'balance_type' => 'debit'],
            ['account_number' => '102', 'account_name' => 'Kas Besar', 'account_type' => 'asset', 'parent_id' => 2, 'level' => 3, 'balance_type' => 'debit'],
            ['account_number' => '103', 'account_name' => 'Bank BCA', 'account_type' => 'asset', 'parent_id' => 2, 'level' => 3, 'balance_type' => 'debit'],
            ['account_number' => '104', 'account_name' => 'Bank Mandiri', 'account_type' => 'asset', 'parent_id' => 2, 'level' => 3, 'balance_type' => 'debit'],
            ['account_number' => '110', 'account_name' => 'Piutang Usaha', 'account_type' => 'asset', 'parent_id' => 2, 'level' => 3, 'balance_type' => 'debit'],
            ['account_number' => '120', 'account_name' => 'Persediaan Material', 'account_type' => 'asset', 'parent_id' => 2, 'level' => 3, 'balance_type' => 'debit'],
            ['account_number' => '130', 'account_name' => 'Persediaan Barang Jadi', 'account_type' => 'asset', 'parent_id' => 2, 'level' => 3, 'balance_type' => 'debit'],
            ['account_number' => '140', 'account_name' => 'Uang Muka Supplier', 'account_type' => 'asset', 'parent_id' => 2, 'level' => 3, 'balance_type' => 'debit'],
            ['account_number' => '1.2', 'account_name' => 'Fixed Assets', 'account_type' => 'asset', 'parent_id' => 1, 'level' => 2, 'balance_type' => 'debit'],
            ['account_number' => '150', 'account_name' => 'Kendaraan', 'account_type' => 'asset', 'parent_id' => 11, 'level' => 3, 'balance_type' => 'debit'],
            ['account_number' => '160', 'account_name' => 'Mesin Produksi', 'account_type' => 'asset', 'parent_id' => 11, 'level' => 3, 'balance_type' => 'debit'],
            ['account_number' => '170', 'account_name' => 'Peralatan Kerja', 'account_type' => 'asset', 'parent_id' => 11, 'level' => 3, 'balance_type' => 'debit'],
            ['account_number' => '180', 'account_name' => 'Akumulasi Penyusutan', 'account_type' => 'asset', 'parent_id' => 11, 'level' => 3, 'balance_type' => 'credit'],

            // Liabilities
            ['account_number' => '2', 'account_name' => 'LIABILITY', 'account_type' => 'liability', 'parent_id' => null, 'level' => 1, 'balance_type' => 'credit'],
            ['account_number' => '2.1', 'account_name' => 'Current Liabilities', 'account_type' => 'liability', 'parent_id' => 16, 'level' => 2, 'balance_type' => 'credit'],
            ['account_number' => '201', 'account_name' => 'Hutang Supplier', 'account_type' => 'liability', 'parent_id' => 17, 'level' => 3, 'balance_type' => 'credit'],
            ['account_number' => '202', 'account_name' => 'Hutang Pajak', 'account_type' => 'liability', 'parent_id' => 17, 'level' => 3, 'balance_type' => 'credit'],
            ['account_number' => '203', 'account_name' => 'Hutang Gaji', 'account_type' => 'liability', 'parent_id' => 17, 'level' => 3, 'balance_type' => 'credit'],

            // Equity
            ['account_number' => '3', 'account_name' => 'EQUITY', 'account_type' => 'equity', 'parent_id' => null, 'level' => 1, 'balance_type' => 'credit'],
            ['account_number' => '301', 'account_name' => 'Modal Pemilik', 'account_type' => 'equity', 'parent_id' => 21, 'level' => 2, 'balance_type' => 'credit'],
            ['account_number' => '302', 'account_name' => 'Laba Ditahan', 'account_type' => 'equity', 'parent_id' => 21, 'level' => 2, 'balance_type' => 'credit'],

            // Revenue
            ['account_number' => '4', 'account_name' => 'REVENUE', 'account_type' => 'revenue', 'parent_id' => null, 'level' => 1, 'balance_type' => 'credit'],
            ['account_number' => '401', 'account_name' => 'Penjualan Produk', 'account_type' => 'revenue', 'parent_id' => 24, 'level' => 2, 'balance_type' => 'credit'],
            ['account_number' => '402', 'account_name' => 'Jasa Fabrikasi', 'account_type' => 'revenue', 'parent_id' => 24, 'level' => 2, 'balance_type' => 'credit'],
            ['account_number' => '403', 'account_name' => 'Jasa Engineering', 'account_type' => 'revenue', 'parent_id' => 24, 'level' => 2, 'balance_type' => 'credit'],

            // Expenses
            ['account_number' => '5', 'account_name' => 'EXPENSE', 'account_type' => 'expense', 'parent_id' => null, 'level' => 1, 'balance_type' => 'debit'],
            ['account_number' => '501', 'account_name' => 'Gaji', 'account_type' => 'expense', 'parent_id' => 28, 'level' => 2, 'balance_type' => 'debit'],
            ['account_number' => '502', 'account_name' => 'Listrik', 'account_type' => 'expense', 'parent_id' => 28, 'level' => 2, 'balance_type' => 'debit'],
            ['account_number' => '503', 'account_name' => 'Air', 'account_type' => 'expense', 'parent_id' => 28, 'level' => 2, 'balance_type' => 'debit'],
            ['account_number' => '504', 'account_name' => 'BBM', 'account_type' => 'expense', 'parent_id' => 28, 'level' => 2, 'balance_type' => 'debit'],
            ['account_number' => '505', 'account_name' => 'Transportasi', 'account_type' => 'expense', 'parent_id' => 28, 'level' => 2, 'balance_type' => 'debit'],
            ['account_number' => '506', 'account_name' => 'Konsumsi', 'account_type' => 'expense', 'parent_id' => 28, 'level' => 2, 'balance_type' => 'debit'],
            ['account_number' => '507', 'account_name' => 'ATK', 'account_type' => 'expense', 'parent_id' => 28, 'level' => 2, 'balance_type' => 'debit'],
            ['account_number' => '508', 'account_name' => 'Internet', 'account_type' => 'expense', 'parent_id' => 28, 'level' => 2, 'balance_type' => 'debit'],
            ['account_number' => '509', 'account_name' => 'Maintenance', 'account_type' => 'expense', 'parent_id' => 28, 'level' => 2, 'balance_type' => 'debit'],
            ['account_number' => '510', 'account_name' => 'Penyusutan', 'account_type' => 'expense', 'parent_id' => 28, 'level' => 2, 'balance_type' => 'debit'],
        ];

        foreach ($accounts as $account) {
            ChartOfAccount::create($account);
        }
    }
}
