<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OvertimeRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OvertimeController extends Controller
{
    /**
     * Display a listing of overtime records.
     */
    public function index(Request $request): JsonResponse
    {
        $query = OvertimeRecord::with(['user', 'approver']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        // Non-admin users can only see their own records
        if (auth()->user()->role->code !== 'DIRECTOR' && auth()->user()->role->code !== 'ADMIN') {
            $query->where('user_id', auth()->id());
        }

        $overtimeRecords = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $overtimeRecords,
        ]);
    }

    /**
     * Store a newly created overtime record.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'type' => 'required|in:regular,weekend,holiday',
            'reason' => 'required|string',
        ]);

        $startTime = \Carbon\Carbon::parse($request->start_time);
        $endTime = \Carbon\Carbon::parse($request->end_time);
        $hours = $startTime->diffInMinutes($endTime) / 60;

        $rate = match($request->type) {
            'regular' => 1.5,
            'weekend' => 2.0,
            'holiday' => 2.0,
            default => 1.5,
        };

        $overtimeRecord = OvertimeRecord::create([
            'user_id' => auth()->id(),
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'hours' => $hours,
            'type' => $request->type,
            'rate' => $rate,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => $overtimeRecord->load('user'),
            'message' => 'Overtime request submitted successfully',
        ], 201);
    }

    /**
     * Display the specified overtime record.
     */
    public function show(OvertimeRecord $overtimeRecord): JsonResponse
    {
        $overtimeRecord->load(['user', 'approver']);

        return response()->json([
            'success' => true,
            'data' => $overtimeRecord,
        ]);
    }

    /**
     * Update the specified overtime record.
     */
    public function update(Request $request, OvertimeRecord $overtimeRecord): JsonResponse
    {
        // Only allow updating pending records
        if ($overtimeRecord->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only update pending requests',
            ], 400);
        }

        // Only the request owner can update
        if ($overtimeRecord->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'date' => 'sometimes|required|date',
            'start_time' => 'sometimes|required|date_format:H:i',
            'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
            'type' => 'sometimes|required|in:regular,weekend,holiday',
            'reason' => 'sometimes|required|string',
        ]);

        $data = $request->only(['date', 'start_time', 'end_time', 'type', 'reason']);
        
        if (isset($data['start_time']) && isset($data['end_time'])) {
            $startTime = \Carbon\Carbon::parse($data['start_time']);
            $endTime = \Carbon\Carbon::parse($data['end_time']);
            $data['hours'] = $startTime->diffInMinutes($endTime) / 60;
        }

        if (isset($data['type'])) {
            $data['rate'] = match($data['type']) {
                'regular' => 1.5,
                'weekend' => 2.0,
                'holiday' => 2.0,
                default => 1.5,
            };
        }

        $overtimeRecord->update($data);

        return response()->json([
            'success' => true,
            'data' => $overtimeRecord->load('user'),
            'message' => 'Overtime request updated successfully',
        ]);
    }

    /**
     * Remove the specified overtime record.
     */
    public function destroy(OvertimeRecord $overtimeRecord): JsonResponse
    {
        // Only allow deleting pending records
        if ($overtimeRecord->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only delete pending requests',
            ], 400);
        }

        // Only the request owner can delete
        if ($overtimeRecord->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $overtimeRecord->delete();

        return response()->json([
            'success' => true,
            'message' => 'Overtime request deleted successfully',
        ]);
    }

    /**
     * Approve an overtime record.
     */
    public function approve(Request $request, OvertimeRecord $overtimeRecord): JsonResponse
    {
        if ($overtimeRecord->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only approve pending requests',
            ], 400);
        }

        $overtimeRecord->approve(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $overtimeRecord->load(['user', 'approver']),
            'message' => 'Overtime request approved successfully',
        ]);
    }

    /**
     * Reject an overtime record.
     */
    public function reject(Request $request, OvertimeRecord $overtimeRecord): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        if ($overtimeRecord->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only reject pending requests',
            ], 400);
        }

        $overtimeRecord->reject(auth()->id(), $request->reason);

        return response()->json([
            'success' => true,
            'data' => $overtimeRecord->load(['user', 'approver']),
            'message' => 'Overtime request rejected successfully',
        ]);
    }

    /**
     * Get my overtime records.
     */
    public function myRecords(Request $request): JsonResponse
    {
        $query = OvertimeRecord::where('user_id', auth()->id());

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $overtimeRecords = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $overtimeRecords,
        ]);
    }

    /**
     * Get pending overtime records (for approval).
     */
    public function pending(Request $request): JsonResponse
    {
        $overtimeRecords = OvertimeRecord::with('user')
            ->pending()
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $overtimeRecords,
        ]);
    }
}
