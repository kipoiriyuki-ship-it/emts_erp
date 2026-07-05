<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'code' => 'SUPER_ADMIN',
                'description' => 'Full system access, user management, configuration',
                'level' => 1,
            ],
            [
                'name' => 'Direktur',
                'code' => 'DIRECTOR',
                'description' => 'Strategic decisions, final approvals, oversight',
                'level' => 2,
            ],
            [
                'name' => 'Finance Manager',
                'code' => 'FINANCE_MANAGER',
                'description' => 'Financial oversight, budget management, approvals',
                'level' => 3,
            ],
            [
                'name' => 'Accounting',
                'code' => 'ACCOUNTING',
                'description' => 'Financial reporting, journal entries, ledger management',
                'level' => 4,
            ],
            [
                'name' => 'HRD',
                'code' => 'HRD',
                'description' => 'Human resources, employee management, payroll',
                'level' => 5,
            ],
            [
                'name' => 'Project Manager',
                'code' => 'PROJECT_MANAGER',
                'description' => 'Project execution, team management, progress tracking',
                'level' => 6,
            ],
            [
                'name' => 'Purchasing',
                'code' => 'PURCHASING',
                'description' => 'Procurement, supplier management, purchase orders',
                'level' => 7,
            ],
            [
                'name' => 'Warehouse',
                'code' => 'WAREHOUSE',
                'description' => 'Inventory management, stock control, material handling',
                'level' => 8,
            ],
            [
                'name' => 'Engineer',
                'code' => 'ENGINEER',
                'description' => 'Technical design, engineering tasks, quality control',
                'level' => 9,
            ],
            [
                'name' => 'Supervisor',
                'code' => 'SUPERVISOR',
                'description' => 'Team supervision, operational oversight, task assignment',
                'level' => 10,
            ],
            [
                'name' => 'Staff',
                'code' => 'STAFF',
                'description' => 'Task execution, attendance, personal scheduling',
                'level' => 11,
            ],
        ];

        // Bersihkan duplikasi data berdasarkan 'code' di dalam array sebelum masuk DB
        $uniqueRoles = [];
        foreach ($roles as $role) {
            $uniqueRoles[$role['code']] = $role;
        }

        // Masukkan data yang sudah pasti bersih ke database menggunakan updateOrCreate
        foreach ($uniqueRoles as $data) {
            Role::updateOrCreate(
                ['code' => $data['code']],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'level' => $data['level']
                ]
            );
        }
    }
}
