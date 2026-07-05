<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\ProjectMilestone;
use App\Models\ProjectProgress;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class ProjectWorkflowApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_members_milestones_and_progress_can_be_managed(): void
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

        $memberUser = User::factory()->create([
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        $project = Project::create([
            'project_number' => 'PRJ-002',
            'name' => 'Workflow Project',
            'client_name' => 'Client XYZ',
            'location' => 'Bandung',
            'contract_value' => 2000000,
            'start_date' => '2026-02-01',
            'end_date' => '2026-09-30',
            'manager_id' => $user->id,
            'status' => 'running',
            'progress' => 5,
            'description' => 'Workflow test',
        ]);

        $token = JWTAuth::fromUser($user);
        $this->withHeader('Authorization', 'Bearer ' . $token);

        $memberResponse = $this->postJson("/api/v1/projects/{$project->id}/members", [
            'user_id' => $memberUser->id,
            'role' => 'SITE_ENGINEER',
        ]);
        $memberResponse->assertCreated()->assertJsonPath('success', true);

        $updateMemberResponse = $this->putJson("/api/v1/projects/{$project->id}/members/{$memberUser->id}", [
            'role' => 'PROJECT_LEAD',
        ]);
        $updateMemberResponse->assertOk()->assertJsonPath('success', true);

        $milestoneResponse = $this->postJson("/api/v1/projects/{$project->id}/milestones", [
            'title' => 'Foundation',
            'description' => 'Complete foundation work',
            'due_date' => '2026-03-01',
        ]);
        $milestoneResponse->assertCreated()->assertJsonPath('success', true);
        $milestoneId = $milestoneResponse->json('data.id');

        $updateMilestoneResponse = $this->putJson("/api/v1/projects/{$project->id}/milestones/{$milestoneId}", [
            'status' => 'in_progress',
            'progress' => 40,
        ]);
        $updateMilestoneResponse->assertOk()->assertJsonPath('success', true);

        $progressResponse = $this->postJson("/api/v1/projects/{$project->id}/progress", [
            'date' => '2026-02-10',
            'percentage' => 15,
            'description' => 'Initial excavation',
        ]);
        $progressResponse->assertCreated()->assertJsonPath('success', true);
        $progressId = $progressResponse->json('data.id');

        $updateProgressResponse = $this->putJson("/api/v1/projects/{$project->id}/progress/{$progressId}", [
            'percentage' => 25,
            'description' => 'Excavation completed',
        ]);
        $updateProgressResponse->assertOk()->assertJsonPath('success', true);

        $deleteProgressResponse = $this->deleteJson("/api/v1/projects/{$project->id}/progress/{$progressId}");
        $deleteProgressResponse->assertOk()->assertJsonPath('success', true);

        $deleteMilestoneResponse = $this->deleteJson("/api/v1/projects/{$project->id}/milestones/{$milestoneId}");
        $deleteMilestoneResponse->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'user_id' => $memberUser->id,
            'role' => 'PROJECT_LEAD',
        ]);
        $this->assertDatabaseMissing('project_milestones', ['id' => $milestoneId]);
        $this->assertDatabaseMissing('project_progress', ['id' => $progressId]);
    }
}
