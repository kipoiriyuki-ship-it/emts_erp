<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::firstOrCreate(
            ['code' => 'SUPER_ADMIN'],
            ['name' => 'Super Admin', 'level' => 1, 'description' => 'Super Administrator']
        );

        $user = User::firstOrCreate(
            ['email' => 'admin@elynpro.com'],
            [
                'name' => 'Admin Elynpro',
                'password' => bcrypt('password123'),
                'role_id' => $role->id,
                'status' => 'ACTIVE',
            ]
        );

        // Ensure password, role and status are correct even if user existed
        $user->forceFill([
            'name' => 'Admin Elynpro',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
            'status' => 'ACTIVE',
        ])->saveQuietly();

        $this->command->info('Admin user ensured: admin@elynpro.com / password123');
    }
}
