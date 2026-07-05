<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectProgress;
use App\Models\ProjectMember;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

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
        $project->load(['manager', 'members.user', 'progress', 'milestones']);

        return response()->json([
            'success' => true,
            'data' => $project,
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

        // Update project progress
        $project->update(['progress' => $request->percentage]);

        return response()->json([
            'success' => true,
            'data' => $progress,
            'message' => 'Progress added successfully',
        ], 201);
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

        $member = ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $request->user_id,
            'role' => $request->role,
        ]);

        return response()->json([
            'success' => true,
            'data' => $member->load('user'),
            'message' => 'Member added successfully',
        ], 201);
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
