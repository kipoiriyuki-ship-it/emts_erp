<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class IntegratedWorkflowApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_field_monitoring_updates_project_progress_and_activity(): void
    {
        $role = Role::create([
            'name' => 'Project Manager',
            'code' => 'PROJECT_MANAGER',
            'description' => 'Project manager',
            'level' => 3,
        ]);

        $user = User::factory()->create([
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        $project = Project::create([
            'project_number' => 'PRJ-100',
            'name' => 'Workflow Project',
            'client_name' => 'Client A',
            'location' => 'Bandung',
            'contract_value' => 1000000,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'manager_id' => $user->id,
            'status' => 'running',
            'progress' => 0,
            'description' => 'Workflow test',
        ]);

        $token = JWTAuth::fromUser($user);
        $this->withHeader('Authorization', 'Bearer ' . $token);

        $response = $this->postJson('/api/v1/field-monitoring', [
            'project_id' => $project->id,
            'area' => 'Area 1',
            'location' => 'Location 1',
            'monitoring_date' => '2026-06-20',
            'latitude' => -6.9175,
            'longitude' => 107.6191,
            'notes' => 'Progress update',
            'progress_percentage' => 35,
        ]);

        $response->assertCreated()->assertJsonPath('success', true);

        $project->refresh();
        $this->assertEquals(35, $project->progress);
        $this->assertNotNull($project->last_activity_at);
    }

    public function test_petty_cash_requires_project_budget_validation(): void
    {
        $role = Role::create([
            'name' => 'Project Manager',
            'code' => 'PROJECT_MANAGER',
            'description' => 'Project manager',
            'level' => 3,
        ]);

        $user = User::factory()->create([
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        $project = Project::create([
            'project_number' => 'PRJ-200',
            'name' => 'Budget Project',
            'client_name' => 'Client B',
            'location' => 'Jakarta',
            'contract_value' => 2000000,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'manager_id' => $user->id,
            'status' => 'running',
            'progress' => 10,
            'description' => 'Budget test',
        ]);

        Budget::create([
            'budget_number' => 'BDG-001',
            'name' => 'Project Budget',
            'project_id' => $project->id,
            'department_id' => null,
            'account_id' => null,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'total_budget' => 1000,
            'actual_amount' => 0,
            'remaining_amount' => 1000,
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $token = JWTAuth::fromUser($user);
        $this->withHeader('Authorization', 'Bearer ' . $token);

        $response = $this->postJson('/api/v1/petty-cash', [
            'project_id' => $project->id,
            'transaction_type' => 'out',
            'amount' => 1500,
            'transaction_date' => '2026-06-20',
            'description' => 'Exceeding budget',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }
}
