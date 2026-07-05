<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
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
                'role_id' => 1, // Director
                'name' => 'Director Utama',
                'email' => 'director@emts.com',
                'password' => Hash::make('password123'),
                'phone' => '+6281234567890',
                'status' => 'active',
            ],
            [
                'role_id' => 2, // Accounting
                'name' => 'Accounting Manager',
                'email' => 'accounting@emts.com',
                'password' => Hash::make('password123'),
                'phone' => '+6281234567891',
                'status' => 'active',
            ],
            [
                'role_id' => 3, // Admin
                'name' => 'Administrator',
                'email' => 'admin@emts.com',
                'password' => Hash::make('password123'),
                'phone' => '+6281234567892',
                'status' => 'active',
            ],
            [
                'role_id' => 4, // Project Manager
                'name' => 'Project Manager 1',
                'email' => 'pm1@emts.com',
                'password' => Hash::make('password123'),
                'phone' => '+6281234567893',
                'status' => 'active',
            ],
            [
                'role_id' => 5, // Employee
                'name' => 'Employee 1',
                'email' => 'employee1@emts.com',
                'password' => Hash::make('password123'),
                'phone' => '+6281234567894',
                'status' => 'active',
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
