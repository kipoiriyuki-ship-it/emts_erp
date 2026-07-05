<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_assigns_default_role_when_none_is_provided(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'new-user@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '081234567890',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('success', true);

        $user = User::where('email', 'new-user@example.com')->firstOrFail();

        $this->assertNotNull($user->role_id);
        $this->assertEquals('USER', $user->role->code);
        $this->assertEquals('User', $user->role->name);
    }
}
