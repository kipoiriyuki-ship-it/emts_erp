<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class ProjectProductionReadyApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_budget_timeline_and_activity_endpoints_are_available(): void
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
            'name' => 'Production Project',
            'client_name' => 'Client ABC',
            'location' => 'Jakarta',
            'contract_value' => 1000000,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'manager_id' => $user->id,
            'status' => 'running',
            'progress' => 35,
            'description' => 'Production readiness',
        ]);

        Budget::create([
            'budget_number' => 'BUD2026010001',
            'name' => 'Project Budget',
            'description' => 'Initial budget',
            'project_id' => $project->id,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'total_budget' => 800000,
            'actual_amount' => 280000,
            'remaining_amount' => 520000,
            'status' => 'active',
            'created_by' => $user->id,
        ]);

        $token = JWTAuth::fromUser($user);
        $this->withHeader('Authorization', 'Bearer ' . $token);

        $budgetResponse = $this->getJson("/api/v1/projects/{$project->id}/budget-summary");
        $budgetResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.budget_count', 1)
            ->assertJsonPath('data.over_budget', false);

        $timelineResponse = $this->getJson("/api/v1/projects/{$project->id}/timeline");
        $timelineResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.summary.total_items', 0);

        $activityResponse = $this->getJson("/api/v1/projects/{$project->id}/activity-logs");
        $activityResponse->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_project_write_endpoints_reject_employee_users(): void
    {
        $role = Role::create([
            'name' => 'Employee',
            'code' => 'EMPLOYEE',
            'description' => 'Employee',
            'level' => 1,
        ]);

        $user = User::factory()->create([
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        $project = Project::create([
            'project_number' => 'PRJ-101',
            'name' => 'Restricted Project',
            'client_name' => 'Client XYZ',
            'location' => 'Bandung',
            'contract_value' => 500000,
            'start_date' => '2026-02-01',
            'end_date' => '2026-10-31',
            'manager_id' => $user->id,
            'status' => 'planning',
            'progress' => 0,
            'description' => 'Permission test',
        ]);

        $token = JWTAuth::fromUser($user);
        $this->withHeader('Authorization', 'Bearer ' . $token);

        $response = $this->postJson("/api/v1/projects/{$project->id}/progress", [
            'date' => '2026-02-10',
            'percentage' => 10,
            'description' => 'Attempted progress update',
        ]);

        $response->assertStatus(403);
    }
}
