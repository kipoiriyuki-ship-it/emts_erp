<?php

namespace Tests\Feature;

use App\Mail\LicenseCodeIssued;
use App\Mail\RegistrationReceived;
use App\Models\Company;
use App\Models\License;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class LicenseRegistrationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_pending_registration_and_notifies_admin(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/v1/auth/register', [
            'company_name' => 'PT EMTS Testing',
            'pic' => 'Rizki',
            'email' => 'rizki@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING_LICENSE');

        $this->assertDatabaseHas('users', [
            'email' => 'rizki@example.com',
            'status' => 'PENDING_LICENSE',
        ]);

        $this->assertDatabaseCount('licenses', 0);
        $this->assertDatabaseHas('companies', [
            'email' => 'rizki@example.com',
            'settings->registration_status' => 'PENDING_LICENSE',
        ]);

        Mail::assertSent(RegistrationReceived::class);
    }

    public function test_login_pending_license_user_redirects_to_activation(): void
    {
        $role = Role::firstOrCreate([
            'code' => 'USER',
        ], [
            'name' => 'User',
            'description' => 'Default user role',
            'level' => 1,
        ]);

        $company = Company::create([
            'name' => 'PT EMTS Pending License',
            'pic' => 'Rizki',
            'email' => 'pending@example.com',
            'phone' => '+6281234567890',
        ]);

        User::create([
            'role_id' => $role->id,
            'company_id' => $company->id,
            'name' => 'Pending User',
            'email' => 'pending@example.com',
            'password' => bcrypt('password123'),
            'status' => 'PENDING_LICENSE',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'pending@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.license_status', 'waiting')
            ->assertJsonPath('data.user.email', 'pending@example.com')
            ->assertJsonPath('data.access_token', fn ($value) => !empty($value))
            ->assertJsonPath('data.refresh_token', fn ($value) => !empty($value));
    }

    public function test_newly_registered_user_can_login_and_receives_waiting_license_status(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'company_name' => 'PT EMTS New User',
            'pic' => 'New User',
            'email' => 'new-user-pending@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'PENDING_LICENSE');

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'new-user-pending@example.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonPath('data.license_status', 'waiting')
            ->assertJsonPath('data.user.email', 'new-user-pending@example.com')
            ->assertJsonPath('data.access_token', fn ($value) => !empty($value))
            ->assertJsonPath('data.refresh_token', fn ($value) => !empty($value));
    }

    public function test_activation_creates_company_and_active_super_admin_for_valid_license(): void
    {
        $role = Role::firstOrCreate([
            'code' => 'SUPER_ADMIN',
        ], [
            'name' => 'Super Admin',
            'description' => 'Super Admin role',
            'level' => 1,
        ]);

        $company = Company::create([
            'name' => 'PT EMTS Testing',
            'pic' => 'Rizki',
            'email' => 'rizki@example.com',
            'phone' => '+6281234567890',
        ]);

        $pendingUser = User::create([
            'role_id' => $role->id,
            'company_id' => $company->id,
            'name' => 'Rizki',
            'email' => 'rizki@example.com',
            'password' => bcrypt('password123'),
            'status' => 'PENDING_LICENSE',
        ]);

        $license = License::create([
            'code' => 'EMTS-TRIAL-9X4A8K7P',
            'license_code' => 'EMTS-TRIAL-9X4A8K7P',
            'type' => 'TRIAL',
            'license_type' => 'TRIAL',
            'status' => 'available',
            'is_used' => false,
            'is_active' => true,
            'valid_from' => now()->subDay(),
            'valid_until' => now()->addDays(7),
            'company_id' => $company->id,
            'used_by' => null,
            'used_by_user_id' => null,
        ]);

        $response = $this->postJson('/api/v1/license/activate', [
            'activation_code' => $license->code,
        ]);

        $response->assertStatus(201);

        $pendingUser->refresh();
        $this->assertSame('ACTIVE', $pendingUser->status);
        $this->assertNotNull($pendingUser->company_id);
        $this->assertNotNull($pendingUser->license_id);
        $this->assertSame('used', $license->fresh()->status);
    }
}
