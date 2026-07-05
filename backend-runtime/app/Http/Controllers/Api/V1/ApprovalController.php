<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Models\LargeCashRequest;
use App\Models\OperationalExpense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ApprovalController extends Controller
{
    /**
     * Get pending approvals.
     */
    public function pending(Request $request): JsonResponse
    {
        $query = Approval::with(['approvable', 'approver'])
            ->where('status', 'pending');

        if (!auth()->user()->isDirector()) {
            $query->where('approver_id', auth()->id());
        }

        $approvals = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $approvals,
        ]);
    }

    /**
     * Get approved approvals.
     */
    public function approved(Request $request): JsonResponse
    {
        $query = Approval::with(['approvable', 'approver'])
            ->where('status', 'approved');

        if (!auth()->user()->isDirector()) {
            $query->where('approver_id', auth()->id());
        }

        $approvals = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $approvals,
        ]);
    }

    /**
     * Get rejected approvals.
     */
    public function rejected(Request $request): JsonResponse
    {
        $query = Approval::with(['approvable', 'approver'])
            ->where('status', 'rejected');

        if (!auth()->user()->isDirector()) {
            $query->where('approver_id', auth()->id());
        }

        $approvals = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $approvals,
        ]);
    }

    /**
     * Approve an approval request.
     */
    public function approve(Request $request, Approval $approval): JsonResponse
    {
        if ($approval->approver_id !== auth()->id() && !auth()->user()->isDirector()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $approval->status;
        $approval->update([
            'status' => 'approved',
            'action_at' => now(),
            'notes' => $request->notes,
        ]);

        // Update the approvable status
        $approvable = $approval->approvable;
        if ($approvable) {
            if (method_exists($approvable, 'approve')) {
                $approvable->approve(auth()->id());
            }
        }

        // Audit log
        \App\Models\AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'APPROVE',
            'module' => 'Approval',
            'description' => "Approved {$approval->approvable_type} #{$approval->approvable_id}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => 'approved', 'notes' => $request->notes],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Approval successful',
        ]);
    }

    /**
     * Reject an approval request.
     */
    public function reject(Request $request, Approval $approval): JsonResponse
    {
        if ($approval->approver_id !== auth()->id() && !auth()->user()->isDirector()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'reason' => 'required|string',
        ]);

        $oldStatus = $approval->status;
        $approval->update([
            'status' => 'rejected',
            'action_at' => now(),
            'notes' => $request->reason,
        ]);

        // Update the approvable status
        $approvable = $approval->approvable;
        if ($approvable) {
            if (method_exists($approvable, 'reject')) {
                $approvable->reject(auth()->id(), $request->reason);
            }
        }

        // Audit log
        \App\Models\AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'REJECT',
            'module' => 'Approval',
            'description' => "Rejected {$approval->approvable_type} #{$approval->approvable_id}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => 'rejected', 'reason' => $request->reason],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Approval rejected',
        ]);
    }

    /**
     * Return approval request for revision.
     */
    public function returnRevision(Request $request, Approval $approval): JsonResponse
    {
        if ($approval->approver_id !== auth()->id() && !auth()->user()->isDirector()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'reason' => 'required|string',
        ]);

        $oldStatus = $approval->status;
        $approval->update([
            'status' => 'rejected',
            'action_at' => now(),
            'notes' => $request->reason,
        ]);

        $approvable = $approval->approvable;
        if ($approvable && method_exists($approvable, 'returnForRevision')) {
            $approvable->returnForRevision(auth()->id(), $request->reason);
        }

        \App\Models\AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'RETURN_REVISION',
            'module' => 'Approval',
            'description' => "Returned {$approval->approvable_type} #{$approval->approvable_id} for revision",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => 'rejected', 'reason' => $request->reason],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Approval returned for revision',
        ]);
    }
}
