<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LeaveRequestController extends Controller
{
    /**
     * Display a listing of leave requests.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LeaveRequest::with(['user', 'approver']);

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
            $query->whereBetween('start_date', [$request->start_date, $request->end_date]);
        }

        // Non-admin users can only see their own requests
        if (auth()->user()->role->code !== 'DIRECTOR' && auth()->user()->role->code !== 'ADMIN') {
            $query->where('user_id', auth()->id());
        }

        $leaveRequests = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $leaveRequests,
        ]);
    }

    /**
     * Store a newly created leave request.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:annual,sick,personal,unpaid,maternity,paternity',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        $days = \Carbon\Carbon::parse($request->start_date)->diffInDays(\Carbon\Carbon::parse($request->end_date)) + 1;

        $leaveRequest = LeaveRequest::create([
            'user_id' => auth()->id(),
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'days' => $days,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => $leaveRequest->load('user'),
            'message' => 'Leave request submitted successfully',
        ], 201);
    }

    /**
     * Display the specified leave request.
     */
    public function show(LeaveRequest $leaveRequest): JsonResponse
    {
        $leaveRequest->load(['user', 'approver']);

        return response()->json([
            'success' => true,
            'data' => $leaveRequest,
        ]);
    }

    /**
     * Update the specified leave request.
     */
    public function update(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        // Only allow updating pending requests
        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only update pending requests',
            ], 400);
        }

        // Only the request owner can update
        if ($leaveRequest->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'type' => 'sometimes|required|in:annual,sick,personal,unpaid,maternity,paternity',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'reason' => 'sometimes|required|string',
        ]);

        $data = $request->only(['type', 'start_date', 'end_date', 'reason']);
        
        if (isset($data['start_date']) && isset($data['end_date'])) {
            $data['days'] = \Carbon\Carbon::parse($data['start_date'])->diffInDays(\Carbon\Carbon::parse($data['end_date'])) + 1;
        }

        $leaveRequest->update($data);

        return response()->json([
            'success' => true,
            'data' => $leaveRequest->load('user'),
            'message' => 'Leave request updated successfully',
        ]);
    }

    /**
     * Remove the specified leave request.
     */
    public function destroy(LeaveRequest $leaveRequest): JsonResponse
    {
        // Only allow deleting pending requests
        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only delete pending requests',
            ], 400);
        }

        // Only the request owner can delete
        if ($leaveRequest->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $leaveRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Leave request deleted successfully',
        ]);
    }

    /**
     * Approve a leave request.
     */
    public function approve(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only approve pending requests',
            ], 400);
        }

        $leaveRequest->approve(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $leaveRequest->load(['user', 'approver']),
            'message' => 'Leave request approved successfully',
        ]);
    }

    /**
     * Reject a leave request.
     */
    public function reject(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only reject pending requests',
            ], 400);
        }

        $leaveRequest->reject(auth()->id(), $request->reason);

        return response()->json([
            'success' => true,
            'data' => $leaveRequest->load(['user', 'approver']),
            'message' => 'Leave request rejected successfully',
        ]);
    }

    /**
     * Get my leave requests.
     */
    public function myRequests(Request $request): JsonResponse
    {
        $query = LeaveRequest::where('user_id', auth()->id());

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $leaveRequests = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $leaveRequests,
        ]);
    }

    /**
     * Get pending leave requests (for approval).
     */
    public function pending(Request $request): JsonResponse
    {
        $leaveRequests = LeaveRequest::with('user')
            ->pending()
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $leaveRequests,
        ]);
    }
}
