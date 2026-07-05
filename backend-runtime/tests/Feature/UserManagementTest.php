<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_create_user_with_company_scope(): void
    {
        $company = Company::create([
            'name' => 'EMTS Corp',
            'email' => 'corp@example.com',
            'phone' => '08123456789',
        ]);

        $superAdminRole = Role::create([
            'name' => 'Super Admin',
            'code' => 'SUPER_ADMIN',
            'level' => 99,
        ]);

        $superAdmin = User::create([
            'role_id' => $superAdminRole->id,
            'name' => 'Super Admin',
            'email' => 'super@example.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'company_id' => $company->id,
        ]);

        $token = JWTAuth::fromUser($superAdmin);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)->postJson('/api/v1/users', [
            'role_id' => $superAdminRole->id,
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'phone' => '08111111111',
            'status' => 'active',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.company_id', $company->id);
        $response->assertJsonPath('data.role_id', $superAdminRole->id);

        $createdUser = User::where('email', 'newuser@example.com')->first();
        $this->assertNotNull($createdUser);
        $this->assertEquals($company->id, $createdUser->company_id);
        $this->assertTrue(Hash::check('password123', $createdUser->password));
    }
}
