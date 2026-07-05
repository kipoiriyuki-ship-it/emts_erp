<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FieldMonitoring;
use App\Models\FieldMonitoringMedia;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FieldMonitoringController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FieldMonitoring::with(['project', 'media', 'createdBy']);

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('area')) {
            $query->where('area', 'like', '%' . $request->area . '%');
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        if ($request->filled('from_date')) {
            $query->whereDate('monitoring_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('monitoring_date', '<=', $request->to_date);
        }

        if ($request->filled('project_manager_id')) {
            $query->whereHas('project', function ($q) use ($request) {
                $q->where('manager_id', $request->project_manager_id);
            });
        }

        $order = $request->get('order', 'desc');
        $perPage = intval($request->get('per_page', 20));
        $perPage = $perPage > 0 ? min($perPage, 100) : 20;

        $items = $query->orderBy('monitoring_date', $order)->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function show(FieldMonitoring $fieldMonitoring): JsonResponse
    {
        $fieldMonitoring->load(['project', 'media', 'createdBy']);

        return response()->json([
            'success' => true,
            'data' => $fieldMonitoring,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'area' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'workers' => 'nullable|array',
            'workers.*' => 'nullable|string|max:100',
            'supervisors' => 'nullable|array',
            'supervisors.*' => 'nullable|string|max:100',
            'monitoring_date' => 'required|date',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'progress_percentage' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
            'media' => 'nullable|array',
            'media.*.file_base64' => 'required_with:media|string',
            'media.*.file_name' => 'required_with:media|string|max:255',
            'media.*.file_type' => 'required_with:media|string|max:255',
            'media.*.file_size' => 'required_with:media|integer|min:1|max:10485760',
        ]);

        $fieldMonitoring = FieldMonitoring::create([
            'project_id' => $request->project_id,
            'area' => $request->area,
            'location' => $request->location,
            'workers' => $request->workers ?? [],
            'supervisors' => $request->supervisors ?? [],
            'monitoring_date' => $request->monitoring_date,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'notes' => $request->notes,
            'created_by' => auth()->id(),
        ]);

        if ($request->has('progress_percentage')) {
            $project = Project::find($request->project_id);
            if ($project) {
                $project->progress = (int) round($request->progress_percentage);
                $project->last_activity_at = now();
                $project->save();
            }
        }

        if ($request->filled('media')) {
            foreach ($request->media as $mediaItem) {
                if (!preg_match('#^data:(.+);base64,#i', $mediaItem['file_base64'] ?? '')) {
                    continue;
                }

                $fileData = base64_decode(preg_replace('#^data:(.+);base64,#i', '', $mediaItem['file_base64']));
                if ($fileData === false) {
                    continue;
                }

                $safeFileName = preg_replace('/[^A-Za-z0-9_\-.]/', '_', $mediaItem['file_name']);
                $path = 'field-monitoring/' . uniqid() . '_' . time() . '_' . $safeFileName;
                \Storage::disk('public')->put($path, $fileData);

                FieldMonitoringMedia::create([
                    'field_monitoring_id' => $fieldMonitoring->id,
                    'file_path' => $path,
                    'file_name' => $mediaItem['file_name'],
                    'file_type' => $mediaItem['file_type'],
                    'file_size' => $mediaItem['file_size'],
                    'uploaded_by' => auth()->id(),
                ]);
            }
        }

        $fieldMonitoring->load(['project', 'media', 'createdBy']);

        return response()->json([
            'success' => true,
            'data' => $fieldMonitoring,
            'message' => 'Field monitoring record created successfully',
        ], 201);
    }
}
