<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LargeCashWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(
            ['code' => 'DIRECTOR'],
            [
                'name' => 'Director',
                'level' => 1,
                'description' => 'Director role',
            ]
        );

        Role::firstOrCreate(
            ['code' => 'EMPLOYEE'],
            [
                'name' => 'Employee',
                'level' => 5,
                'description' => 'Employee role',
            ]
        );
    }

    public function test_large_cash_request_submit_creates_approval_and_notification(): void
    {
        $director = User::factory()->create([
            'email' => 'director@example.com',
            'password' => bcrypt('password'),
            'role_id' => Role::where('code', 'DIRECTOR')->value('id'),
            'status' => 'active',
        ]);

        $requester = User::factory()->create([
            'email' => 'requester@example.com',
            'password' => bcrypt('password'),
            'role_id' => Role::where('code', 'EMPLOYEE')->value('id'),
            'status' => 'active',
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'requester@example.com',
            'password' => 'password',
        ]);

        $loginResponse->assertStatus(200);
        $requesterToken = $loginResponse->json('data.token');

        $createResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $requesterToken,
            'Accept' => 'application/json',
        ])->postJson('/api/v1/large-cash', [
            'type' => 'material',
            'description' => 'Test large cash request',
            'items' => [
                [
                    'description' => 'Test item',
                    'quantity' => 2,
                    'unit_price' => 15000,
                ],
            ],
        ]);

        $createResponse->assertStatus(201);
        $requestId = $createResponse->json('data.id');

        $meResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $requesterToken,
            'Accept' => 'application/json',
        ])->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200);
        $this->assertEquals('requester@example.com', $meResponse->json('data.email'));

        $submitResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $requesterToken,
            'Accept' => 'application/json',
        ])->postJson("/api/v1/large-cash/{$requestId}/submit");

        $submitResponse->assertStatus(200);
        $this->assertEquals('pending', $submitResponse->json('data.status'));

        $directorLoginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'director@example.com',
            'password' => 'password',
        ]);

        $directorLoginResponse->assertStatus(200);
        $directorToken = $directorLoginResponse->json('data.token');

        $approvalResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $directorToken,
            'Accept' => 'application/json',
        ])->getJson('/api/v1/approvals/pending');

        $approvalResponse->assertStatus(200);
        $this->assertNotEmpty($approvalResponse->json('data.data'));

        $notification = Notification::where('user_id', $director->id)
            ->where('title', 'Large Cash Request Needs Approval')
            ->first();

        $this->assertNotNull($notification);
        $this->assertFalse($notification->is_read);
    }
}
