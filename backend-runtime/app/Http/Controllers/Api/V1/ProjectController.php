<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Project;
use App\Models\ProjectDoc;
use App\Models\ProjectProgress;
use App\Models\ProjectMember;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Project::with(['manager', 'members']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by manager (for project managers)
        if (auth()->user()->isProjectManager()) {
            $query->where('manager_id', auth()->id());
        }

        $projects = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'location' => 'nullable|string',
            'contract_value' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'description' => 'nullable|string',
        ]);

        $project = Project::create([
            'project_number' => $this->generateProjectNumber(),
            'name' => $request->name,
            'client_name' => $request->client_name,
            'location' => $request->location,
            'contract_value' => $request->contract_value,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'manager_id' => auth()->id(),
            'status' => 'planning',
            'progress' => 0,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'data' => $project->load('manager'),
            'message' => 'Project created successfully',
        ], 201);
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project): JsonResponse
    {
        $project->load(['manager', 'members.user', 'progress', 'milestones', 'documents.uploader']);

        return response()->json([
            'success' => true,
            'data' => $project,
        ]);
    }

    /**
     * Get project documents.
     */
    public function documents(Project $project): JsonResponse
    {
        $documents = $project->documents()->with('uploader')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    /**
     * Upload a project document.
     */
    public function uploadDocument(Request $request, Project $project): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file_base64' => 'required|string',
            'file_name' => 'required|string|max:255',
            'file_type' => 'required|string|max:255',
            'file_size' => 'required|integer|min:1|max:10485760',
        ]);

        if (!preg_match('#^data:(.+);base64,#i', $request->file_base64)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid file format. Expected base64-encoded data URI.',
            ], 400);
        }

        $fileData = base64_decode(preg_replace('#^data:(.+);base64,#i', '', $request->file_base64));
        if ($fileData === false) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to decode file data.',
            ], 400);
        }

        if (strlen($fileData) > 10 * 1024 * 1024) {
            return response()->json([
                'success' => false,
                'message' => 'File size exceeds 10MB limit.',
            ], 400);
        }

        $safeFileName = preg_replace('/[^A-Za-z0-9_\-.]/', '_', $request->file_name);
        $path = 'project-documents/' . uniqid() . '_' . time() . '_' . $safeFileName;
        \Storage::disk('public')->put($path, $fileData);

        $document = \App\Models\ProjectDoc::create([
            'project_id' => $project->id,
            'title' => $request->title,
            'description' => $request->description,
            'file_path' => $path,
            'file_name' => $request->file_name,
            'file_type' => $request->file_type,
            'file_size' => $request->file_size,
            'uploaded_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $document->load('uploader'),
            'message' => 'Document uploaded successfully',
        ], 201);
    }

    /**
     * Download a project document.
     */
    public function downloadDocument(Project $project, ProjectDoc $document)
    {
        if ($document->project_id !== $project->id) {
            abort(404);
        }

        $path = storage_path('app/public/' . $document->file_path);
        if (!file_exists($path)) {
            abort(404);
        }

        $response = new BinaryFileResponse($path);
        $response->headers->set('Content-Type', $document->file_type ?? 'application/octet-stream');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $document->file_name . '"');

        return $response;
    }

    /**
     * Delete a project document.
     */
    public function deleteDocument(Project $project, ProjectDoc $document): JsonResponse
    {
        if ($document->project_id !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found for this project.',
            ], 404);
        }

        $filePath = $document->file_path;
        $document->delete();

        if ($filePath) {
            \Storage::disk('public')->delete($filePath);
        }

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully',
        ]);
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'client_name' => 'sometimes|required|string|max:255',
            'location' => 'nullable|string',
            'contract_value' => 'sometimes|required|numeric|min:0',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after:start_date',
            'status' => 'sometimes|required|in:planning,running,hold,completed,cancelled',
            'progress' => 'sometimes|required|integer|min:0|max:100',
            'description' => 'nullable|string',
        ]);

        $project->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $project->load('manager'),
            'message' => 'Project updated successfully',
        ]);
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project): JsonResponse
    {
        if ($project->status === 'running') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete running project',
            ], 400);
        }

        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully',
        ]);
    }

    /**
     * Add progress to project.
     */
    public function addProgress(Request $request, Project $project): JsonResponse
    {
        $user = auth()->user();
        $roleCode = $user?->role?->code;
        if (!$user || !in_array($roleCode, ['SUPER_ADMIN', 'DIRECTOR', 'PROJECT_MANAGER'], true)) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $request->validate([
            'date' => 'required|date',
            'percentage' => 'required|integer|min:0|max:100',
            'description' => 'nullable|string',
            'challenges' => 'nullable|string',
            'solutions' => 'nullable|string',
        ]);

        $progress = ProjectProgress::create([
            'project_id' => $project->id,
            'date' => $request->date,
            'percentage' => $request->percentage,
            'description' => $request->description,
            'challenges' => $request->challenges,
            'solutions' => $request->solutions,
            'created_by' => auth()->id(),
        ]);

        $project->update(['progress' => $request->percentage]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'CREATE',
            'module' => 'projects',
            'description' => 'Added project progress',
            'old_values' => null,
            'new_values' => [
                'project_id' => $project->id,
                'percentage' => $request->percentage,
                'description' => $request->description,
            ],
        ]);

        return response()->json([
            'success' => true,
            'data' => $progress,
            'message' => 'Progress added successfully',
        ], 201);
    }

    /**
     * Update project progress entry.
     */
    public function updateProgress(Request $request, Project $project, ProjectProgress $progress): JsonResponse
    {
        $user = auth()->user();
        $roleCode = $user?->role?->code;
        if (!$user || !in_array($roleCode, ['SUPER_ADMIN', 'DIRECTOR', 'PROJECT_MANAGER'], true)) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        if ($progress->project_id !== $project->id) {
            return response()->json(['success' => false, 'message' => 'Progress entry not found for this project.'], 404);
        }

        $request->validate([
            'date' => 'sometimes|required|date',
            'percentage' => 'sometimes|required|integer|min:0|max:100',
            'description' => 'nullable|string',
            'challenges' => 'nullable|string',
            'solutions' => 'nullable|string',
        ]);

        $progress->update($request->all());
        $project->update(['progress' => $progress->percentage]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'UPDATE',
            'module' => 'projects',
            'description' => 'Updated project progress',
            'old_values' => ['percentage' => $progress->getOriginal('percentage')],
            'new_values' => ['percentage' => $progress->percentage],
        ]);

        return response()->json([
            'success' => true,
            'data' => $progress->fresh(),
            'message' => 'Progress updated successfully',
        ]);
    }

    /**
     * Delete project progress entry.
     */
    public function deleteProgress(Project $project, ProjectProgress $progress): JsonResponse
    {
        $user = auth()->user();
        $roleCode = $user?->role?->code;
        if (!$user || !in_array($roleCode, ['SUPER_ADMIN', 'DIRECTOR', 'PROJECT_MANAGER'], true)) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        if ($progress->project_id !== $project->id) {
            return response()->json(['success' => false, 'message' => 'Progress entry not found for this project.'], 404);
        }

        $progress->delete();

        $latestProgress = $project->progress()->latest('date')->first();
        $project->update(['progress' => $latestProgress?->percentage ?? 0]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'DELETE',
            'module' => 'projects',
            'description' => 'Deleted project progress',
            'old_values' => ['id' => $progress->id],
            'new_values' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Progress deleted successfully',
        ]);
    }

    /**
     * Get project members.
     */
    public function members(Project $project): JsonResponse
    {
        $members = $project->members()->with('user.role')->get();

        return response()->json([
            'success' => true,
            'data' => $members,
        ]);
    }

    /**
     * Add member to project.
     */
    public function addMember(Request $request, Project $project): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string',
        ]);

        $member = ProjectMember::updateOrCreate(
            ['project_id' => $project->id, 'user_id' => $request->user_id],
            ['role' => $request->role]
        );

        return response()->json([
            'success' => true,
            'data' => $member->load('user'),
            'message' => 'Member added successfully',
        ], 201);
    }

    /**
     * Update a project member role.
     */
    public function updateMember(Request $request, Project $project, $userId): JsonResponse
    {
        $member = ProjectMember::where('project_id', $project->id)
            ->where('user_id', $userId)
            ->first();

        if (!$member) {
            return response()->json(['success' => false, 'message' => 'Member not found'], 404);
        }

        $request->validate([
            'role' => 'required|string',
        ]);

        $member->update(['role' => $request->role]);

        return response()->json([
            'success' => true,
            'data' => $member->load('user'),
            'message' => 'Member updated successfully',
        ]);
    }

    /**
     * Remove member from project.
     */
    public function removeMember(Project $project, $userId): JsonResponse
    {
        $member = ProjectMember::where('project_id', $project->id)
            ->where('user_id', $userId)
            ->first();

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found',
            ], 404);
        }

        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Member removed successfully',
        ]);
    }

    /**
     * Get project milestones.
     */
    public function milestones(Project $project): JsonResponse
    {
        $milestones = $project->milestones()->orderBy('due_date')->get();

        return response()->json([
            'success' => true,
            'data' => $milestones,
        ]);
    }

    /**
     * Add milestone to project.
     */
    public function addMilestone(Request $request, Project $project): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
        ]);

        $milestone = $project->milestones()->create([
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date,
            'status' => 'pending',
            'progress' => 0,
        ]);

        return response()->json([
            'success' => true,
            'data' => $milestone,
            'message' => 'Milestone added successfully',
        ], 201);
    }

    /**
     * Get project budget summary.
     */
    public function budgetSummary(Project $project): JsonResponse
    {
        $budgets = Budget::where('project_id', $project->id)->get();
        $latestBudget = $budgets->sortByDesc('created_at')->first();

        $overBudget = false;
        $remainingBudget = 0;
        $variance = 0;
        if ($latestBudget) {
            $remainingBudget = (float) $latestBudget->remaining_amount;
            $variance = (float) $latestBudget->actual_amount - (float) $latestBudget->total_budget;
            $overBudget = $variance > 0;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'project_id' => $project->id,
                'budget_count' => $budgets->count(),
                'budget' => $latestBudget ? $latestBudget : null,
                'remaining_budget' => $remainingBudget,
                'variance' => $variance,
                'over_budget' => $overBudget,
                'project_value' => (float) $project->contract_value,
                'project_progress' => (int) $project->progress,
            ],
        ]);
    }

    /**
     * Get project timeline data.
     */
    public function timeline(Project $project): JsonResponse
    {
        $milestones = $project->milestones()->orderBy('due_date')->get();
        $progress = $project->progress()->orderBy('date')->get();

        $timelineItems = collect([]);
        foreach ($milestones as $milestone) {
            $timelineItems->push([
                'type' => 'milestone',
                'id' => $milestone->id,
                'title' => $milestone->title,
                'description' => $milestone->description,
                'date' => $milestone->due_date->toDateString(),
                'status' => $milestone->status,
                'progress' => (int) $milestone->progress,
            ]);
        }

        foreach ($progress as $entry) {
            $timelineItems->push([
                'type' => 'progress',
                'id' => $entry->id,
                'title' => 'Progress update',
                'description' => $entry->description,
                'date' => $entry->date->toDateString(),
                'status' => 'updated',
                'progress' => (int) $entry->percentage,
            ]);
        }

        $timelineItems = $timelineItems->sortBy('date')->values();

        return response()->json([
            'success' => true,
            'data' => [
                'project_id' => $project->id,
                'items' => $timelineItems,
                'summary' => [
                    'total_items' => $timelineItems->count(),
                    'milestones' => $milestones->count(),
                    'progress_updates' => $progress->count(),
                ],
            ],
        ]);
    }

    /**
     * Get project activity logs.
     */
    public function activityLogs(Project $project): JsonResponse
    {
        $logs = AuditLog::where('module', 'projects')
            ->where(function ($query) use ($project) {
                $query->where('description', 'like', '%project%')
                      ->orWhere('new_values', 'like', '%' . $project->id . '%');
            })
            ->latest('created_at')
            ->with('user')
            ->take(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Update milestone.
     */
    public function updateMilestone(Request $request, Project $project, $milestoneId): JsonResponse
    {
        $milestone = $project->milestones()->findOrFail($milestoneId);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:pending,in_progress,completed,delayed',
            'progress' => 'sometimes|required|integer|min:0|max:100',
        ]);

        $milestone->update($request->all());

        if ($request->status === 'completed' && !$milestone->completed_at) {
            $milestone->update(['completed_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'data' => $milestone,
            'message' => 'Milestone updated successfully',
        ]);
    }

    /**
     * Delete a milestone.
     */
    public function deleteMilestone(Project $project, $milestoneId): JsonResponse
    {
        $milestone = $project->milestones()->find($milestoneId);

        if (!$milestone) {
            return response()->json(['success' => false, 'message' => 'Milestone not found'], 404);
        }

        $milestone->delete();

        return response()->json([
            'success' => true,
            'message' => 'Milestone deleted successfully',
        ]);
    }

    /**
     * Generate unique project number.
     */
    protected function generateProjectNumber(): string
    {
        $prefix = 'PRJ';
        $year = now()->format('Y');
        $month = now()->format('m');
        $sequence = Project::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;

        return sprintf('%s%s%s%04d', $prefix, $year, $month, $sequence);
    }
}
