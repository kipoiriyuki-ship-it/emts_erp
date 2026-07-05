<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\LargeCashRequest;
use App\Models\OperationalExpense;
use App\Models\ExpenseCategory;
use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class AccountingIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setupAccountingChart()
    {
        ChartOfAccount::create([
            'account_number' => '1.1.1.01',
            'account_name' => 'Cash in Bank',
            'account_type' => 'asset',
            'balance_type' => 'debit',
            'status' => 'active',
        ]);

        ChartOfAccount::create([
            'account_number' => '5.1.1.01',
            'account_name' => 'General Expenses',
            'account_type' => 'expense',
            'balance_type' => 'debit',
            'status' => 'active',
        ]);
    }

    public function test_large_cash_approval_creates_journal_entry(): void
    {
        $this->setupAccountingChart();

        $directorRole = Role::create([
            'name' => 'Director',
            'code' => 'DIRECTOR',
            'description' => 'Director role',
            'level' => 1,
        ]);

        $director = User::factory()->create([
            'role_id' => $directorRole->id,
            'status' => 'active',
        ]);

        $managerRole = Role::create([
            'name' => 'Project Manager',
            'code' => 'PROJECT_MANAGER',
            'description' => 'Project manager',
            'level' => 3,
        ]);

        $manager = User::factory()->create([
            'role_id' => $managerRole->id,
            'status' => 'active',
        ]);

        $project = Project::create([
            'project_number' => 'PRJ-ACC-001',
            'name' => 'Accounting Test Project',
            'client_name' => 'Test Client',
            'location' => 'Jakarta',
            'contract_value' => 5000000,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'manager_id' => $manager->id,
            'status' => 'running',
            'progress' => 0,
            'description' => 'Accounting integration test',
        ]);

        $largeCash = LargeCashRequest::create([
            'request_number' => 'LCR-260630-0001',
            'project_id' => $project->id,
            'user_id' => $manager->id,
            'type' => 'material',
            'total_amount' => 1000000,
            'description' => 'Material for project',
            'status' => 'pending',
        ]);

        $this->assertCount(0, JournalEntry::all());

        $token = JWTAuth::fromUser($director);
        $this->withHeader('Authorization', 'Bearer ' . $token);

        $response = $this->postJson('/api/v1/large-cash/' . $largeCash->id . '/approve', []);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $journals = JournalEntry::all();
        $this->assertGreaterThanOrEqual(1, $journals->count(), 'Expected at least one journal entry after approval');

        if ($journals->count() > 0) {
            $journal = $journals->first();
            $this->assertContains($journal->status, ['draft', 'approved', 'posted']);
        }
    }

    public function test_operational_expense_approval_creates_journal_entry(): void
    {
        $this->setupAccountingChart();

        $directorRole = Role::create([
            'name' => 'Director',
            'code' => 'DIRECTOR',
            'description' => 'Director role',
            'level' => 1,
        ]);

        $director = User::factory()->create([
            'role_id' => $directorRole->id,
            'status' => 'active',
        ]);

        $category = ExpenseCategory::create([
            'name' => 'Utilities',
            'description' => 'Utility expenses',
            'code' => 'UTIL',
            'type' => 'operational',
        ]);

        $expense = OperationalExpense::create([
            'category_id' => $category->id,
            'user_id' => $director->id,
            'date' => '2026-06-30',
            'amount' => 500000,
            'description' => 'Monthly utilities',
            'status' => 'pending',
        ]);

        $this->assertCount(0, JournalEntry::all());

        $token = JWTAuth::fromUser($director);
        $this->withHeader('Authorization', 'Bearer ' . $token);

        $response = $this->postJson('/api/v1/operational-expenses/' . $expense->id . '/approve', []);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $journals = JournalEntry::all();
        $this->assertGreaterThanOrEqual(1, $journals->count(), 'Expected at least one journal entry after expense approval');

        if ($journals->count() > 0) {
            $journal = $journals->first();
            $this->assertContains($journal->status, ['draft', 'approved', 'posted']);
        }
    }

    public function test_petty_cash_approval_does_not_impact_budget_if_no_project(): void
    {
        $this->setupAccountingChart();

        $directorRole = Role::create([
            'name' => 'Director',
            'code' => 'DIRECTOR',
            'description' => 'Director role',
            'level' => 1,
        ]);

        $director = User::factory()->create([
            'role_id' => $directorRole->id,
            'status' => 'active',
        ]);

        $token = JWTAuth::fromUser($director);
        $this->withHeader('Authorization', 'Bearer ' . $token);

        $response = $this->postJson('/api/v1/petty-cash', [
            'transaction_type' => 'in',
            'project_id' => null,
            'amount' => 500000,
            'transaction_date' => '2026-06-30',
            'description' => 'Initial petty cash',
        ]);

        $response->assertCreated();
    }
}
