<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class ProjectDocumentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_documents_can_be_listed_uploaded_downloaded_and_deleted(): void
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
            'project_number' => 'PRJ-001',
            'name' => 'Test Project',
            'client_name' => 'Client ABC',
            'location' => 'Jakarta',
            'contract_value' => 1000000,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'manager_id' => $user->id,
            'status' => 'running',
            'progress' => 10,
            'description' => 'Test project',
        ]);

        $token = JWTAuth::fromUser($user);
        $this->withHeader('Authorization', 'Bearer ' . $token);

        $listResponse = $this->getJson("/api/v1/projects/{$project->id}/documents");
        $listResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(0, 'data');

        $payload = [
            'title' => 'Test Document',
            'description' => 'A test document',
            'file_base64' => 'data:text/plain;base64,' . base64_encode('test file contents'),
            'file_name' => 'test-document.txt',
            'file_type' => 'text/plain',
            'file_size' => 17,
        ];

        $uploadResponse = $this->postJson("/api/v1/projects/{$project->id}/documents", $payload);
        $uploadResponse->assertCreated()
            ->assertJsonPath('success', true);

        $documentId = $uploadResponse->json('data.id');
        $filePath = $uploadResponse->json('data.file_path');

        $this->assertDatabaseHas('project_docs', [
            'id' => $documentId,
            'project_id' => $project->id,
            'file_name' => 'test-document.txt',
        ]);
        Storage::disk('public')->assertExists($filePath);

        $refreshedListResponse = $this->getJson("/api/v1/projects/{$project->id}/documents");
        $refreshedListResponse->assertOk()
            ->assertJsonCount(1, 'data');

        $downloadResponse = $this->get("/api/v1/projects/{$project->id}/documents/{$documentId}");
        $downloadResponse->assertOk()
            ->assertHeader('content-disposition', 'attachment; filename="test-document.txt"');

        $deleteResponse = $this->deleteJson("/api/v1/projects/{$project->id}/documents/{$documentId}");
        $deleteResponse->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('project_docs', ['id' => $documentId]);
        Storage::disk('public')->assertMissing($filePath);
    }
}
