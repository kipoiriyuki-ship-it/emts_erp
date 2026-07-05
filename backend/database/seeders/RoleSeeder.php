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
                'name' => 'Director',
                'code' => 'DIRECTOR',
                'description' => 'Strategic decisions, final approvals, oversight',
                'level' => 2,
            ],
            [
                'name' => 'Admin',
                'code' => 'ADMIN',
                'description' => 'System administration, configuration management',
                'level' => 3,
            ],
            [
                'name' => 'Manager',
                'code' => 'MANAGER',
                'description' => 'Department management, team oversight',
                'level' => 4,
            ],
            [
                'name' => 'Finance',
                'code' => 'FINANCE',
                'description' => 'Financial oversight, budget management, approvals',
                'level' => 5,
            ],
            [
                'name' => 'HRD',
                'code' => 'HRD',
                'description' => 'Human resources, employee management, payroll',
                'level' => 6,
            ],
            [
                'name' => 'Project Manager',
                'code' => 'PROJECT_MANAGER',
                'description' => 'Project execution, team management, progress tracking',
                'level' => 7,
            ],
            [
                'name' => 'Field Supervisor',
                'code' => 'FIELD_SUPERVISOR',
                'description' => 'Field team supervision, on-site oversight',
                'level' => 8,
            ],
            [
                'name' => 'Supervisor',
                'code' => 'SUPERVISOR',
                'description' => 'Team supervision, operational oversight, task assignment',
                'level' => 9,
            ],
            [
                'name' => 'Field Staff',
                'code' => 'FIELD_STAFF',
                'description' => 'Field task execution, on-site operations',
                'level' => 10,
            ],
            [
                'name' => 'Staff',
                'code' => 'STAFF',
                'description' => 'Task execution, attendance, personal scheduling',
                'level' => 11,
            ],
            [
                'name' => 'Warehouse',
                'code' => 'WAREHOUSE',
                'description' => 'Inventory management, stock control, material handling',
                'level' => 12,
            ],
            [
                'name' => 'Purchasing',
                'code' => 'PURCHASING',
                'description' => 'Procurement, supplier management, purchase orders',
                'level' => 13,
            ],
            [
                'name' => 'Engineering',
                'code' => 'ENGINEERING',
                'description' => 'Technical design, engineering tasks, quality control',
                'level' => 14,
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['code' => $role['code']],
                [
                    'name' => $role['name'],
                    'description' => $role['description'],
                    'level' => $role['level']
                ]
            );
        }
    }
}
