<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'role_code' => 'DIRECTOR',
                'name' => 'Director Utama',
                'email' => 'director@emts.com',
                'password' => Hash::make('password123'),
                'phone' => '+6281234567890',
                'status' => 'active',
            ],
            [
                'role_code' => 'ACCOUNTING',
                'name' => 'Accounting Manager',
                'email' => 'accounting@emts.com',
                'password' => Hash::make('password123'),
                'phone' => '+6281234567891',
                'status' => 'active',
            ],
            [
                'role_code' => 'PROJECT_MANAGER',
                'name' => 'Project Manager 1',
                'email' => 'pm1@emts.com',
                'password' => Hash::make('password123'),
                'phone' => '+6281234567893',
                'status' => 'active',
            ],
            [
                'role_code' => 'STAFF',
                'name' => 'Employee 1',
                'email' => 'employee1@emts.com',
                'password' => Hash::make('password123'),
                'phone' => '+6281234567894',
                'status' => 'active',
            ],
        ];

        foreach ($users as $userData) {
            $role = Role::where('code', $userData['role_code'])->first();
            
            if (!$role) {
                $this->command->error("Role with code {$userData['role_code']} not found. Skipping user {$userData['name']}.");
                continue;
            }

            User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => $userData['password'],
                'phone' => $userData['phone'],
                'status' => $userData['status'],
                'role_id' => $role->id,
            ]);
        }
    }
}
