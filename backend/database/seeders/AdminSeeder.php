<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get Super Admin role
        $superAdminRole = Role::where('code', 'SUPER_ADMIN')->first();

        if (!$superAdminRole) {
            $this->command->error('Super Admin role not found. Please run RoleSeeder first.');
            return;
        }

        // Create or update admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@elynpro.com'],
            [
                'name' => 'Administrator',
                'email' => 'admin@elynpro.com',
                'password' => Hash::make('Admin123!'),
                'role_id' => $superAdminRole->id,
                'status' => 'active',
            ]
        );

        $this->command->info('Admin user created or updated successfully.');
        $this->command->info('Email: admin@elynpro.com');
        $this->command->info('Password: Admin123!');
    }
}
