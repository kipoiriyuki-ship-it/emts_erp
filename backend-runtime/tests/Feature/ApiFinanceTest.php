<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\ExpenseCategory;
use App\Models\License;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiFinanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create role first to avoid foreign key constraint error
        $role = Role::firstOrCreate(
            ['code' => 'SUPER_ADMIN'],
            [
                'name' => 'Super Admin',
                'code' => 'SUPER_ADMIN',
                'level' => 1,
                'description' => 'Super Administrator',
            ]
        );
        
        // Create expense category for operational expense tests
        ExpenseCategory::firstOrCreate(
            ['code' => 'TEST_CATEGORY'],
            [
                'name' => 'Test Category',
                'code' => 'TEST_CATEGORY',
                'type' => 'operational',
                'description' => 'Test expense category',
            ]
        );
        
        $license = License::firstOrCreate(
            ['code' => 'EMTS-TEST-LICENSE'],
            [
                'code' => 'EMTS-TEST-LICENSE',
                'type' => 'TRIAL',
                'max_users' => 5,
                'max_projects' => 10,
                'valid_from' => now()->subDay(),
                'valid_until' => now()->addDays(30),
                'is_active' => true,
                'is_used' => true,
                'used_by_user_id' => null,
                'status' => 'active',
            ]
        );

        // Create user with role reference instead of hardcoded ID
        $user = User::firstOrCreate(
            ['email' => 'director@emts.com'],
            [
                'name' => 'Director Utama',
                'password' => bcrypt('password123'),
                'role_id' => $role->id,
                'status' => 'active',
                'license_id' => $license->id,
            ]
        );

        $user->forceFill(['license_id' => $license->id])->saveQuietly();
    }

    private string $token;

    /**
     * Test login endpoint and store token for subsequent tests.
     */
    public function test_login_returns_token(): void
    {
        $response = $this->withHeaders([
            'Accept' => 'application/json',
        ])->postJson('/api/v1/auth/login', [
            'email' => 'director@emts.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'token',
                         'token_type',
                         'expires_in',
                     ],
                 ]);

        $this->token = $response->json('data.token');
    }

    public function test_login_returns_access_and_refresh_tokens(): void
    {
        $response = $this->withHeaders([
            'Accept' => 'application/json',
        ])->postJson('/api/v1/auth/login', [
            'email' => 'director@emts.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.access_token', fn ($value) => !empty($value))
            ->assertJsonPath('data.refresh_token', fn ($value) => !empty($value));
    }

    /**
     * Test dashboard endpoint with authentication.
     */
    public function test_dashboard_returns_success(): void
    {
        // First, login to get token
        $loginResponse = $this->withHeaders([
            'Accept' => 'application/json',
        ])->postJson('/api/v1/auth/login', [
            'email' => 'director@emts.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');

        // Access dashboard with token
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->getJson('/api/v1/dashboard');

        $response->assertStatus(200);
    }

    /**
     * Test creating operational expense.
     */
    public function test_create_operational_expense(): void
    {
        // Login to get token
        $loginResponse = $this->withHeaders([
            'Accept' => 'application/json',
        ])->postJson('/api/v1/auth/login', [
            'email' => 'director@emts.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');

        // Create operational expense
        $expenseData = [
            'description' => 'Test expense description',
            'amount' => 50000,
            'category_id' => 1,
            'date' => now()->format('Y-m-d'),
            'receipt_url' => null,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->postJson('/api/v1/operational-expenses', $expenseData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'id',
                         'description',
                         'amount',
                     ],
                     'message',
                 ]);
    }

    /**
     * Test retrieving operational expenses.
     */
    public function test_get_operational_expenses(): void
    {
        // Login to get token
        $loginResponse = $this->withHeaders([
            'Accept' => 'application/json',
        ])->postJson('/api/v1/auth/login', [
            'email' => 'director@emts.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('data.token');

        // Get operational expenses
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->getJson('/api/v1/operational-expenses');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'data' => [
                             '*' => [
                                 'id',
                                 'description',
                                 'amount',
                             ]
                         ]
                     ],
                 ]);
    }

    /**
     * Complete finance module workflow test.
     */
    public function test_complete_finance_workflow(): void
    {
        // Step 1: Login
        $loginResponse = $this->withHeaders([
            'Accept' => 'application/json',
        ])->postJson('/api/v1/auth/login', [
            'email' => 'director@emts.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('data.token');

        // Step 2: Access Dashboard
        $dashboardResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->getJson('/api/v1/dashboard');

        $dashboardResponse->assertStatus(200);

        // Step 3: Create Operational Expense
        $expenseData = [
            'description' => 'Testing complete workflow',
            'amount' => 75000,
            'category_id' => 1,
            'date' => now()->format('Y-m-d'),
            'receipt_url' => null,
        ];

        $createResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->postJson('/api/v1/operational-expenses', $expenseData);

        $createResponse->assertStatus(201);
        $expenseId = $createResponse->json('data.id');

        // Step 4: Retrieve Operational Expenses
        $getResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->getJson('/api/v1/operational-expenses');

        $getResponse->assertStatus(200);

        // Verify the created expense exists in the list
        $expenses = $getResponse->json('data.data');
        $foundExpense = collect($expenses)->firstWhere('id', $expenseId);
        $this->assertNotNull($foundExpense);
        $this->assertEquals('Testing complete workflow', $foundExpense['description']);
    }

    public function test_store_large_cash_request_creates_items(): void
    {
        $loginResponse = $this->withHeaders([
            'Accept' => 'application/json',
        ])->postJson('/api/v1/auth/login', [
            'email' => 'director@emts.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('data.token');

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->postJson('/api/v1/large-cash-requests', [
            'project_id' => null,
            'type' => 'material',
            'description' => 'Material purchase',
            'items' => [
                [
                    'description' => 'Cable',
                    'amount' => 250000,
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('large_cash_items', [
            'large_cash_request_id' => $response->json('data.id'),
            'description' => 'Cable',
            'quantity' => 1,
            'unit_price' => 250000,
            'total' => 250000,
        ]);
    }
}
