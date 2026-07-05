<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Attendance;
use App\Models\Project;
use App\Models\Approval;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees (filtered by company).
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['role', 'company'])
            ->whereHas('role', function ($q) {
                $q->where('code', '!=', 'SUPER_ADMIN');
            });

        // Multi-company filtering
        if (auth()->check() && auth()->user()->company_id) {
            $query->where('company_id', auth()->user()->company_id);
        }

        if ($request->has('division')) {
            $query->where('division', $request->division);
        }

        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('username', 'like', '%' . $request->search . '%')
                  ->orWhere('nik', 'like', '%' . $request->search . '%');
            });
        }

        $employees = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $employees,
        ]);
    }

    /**
     * Display the specified employee with details.
     */
    public function show(User $employee): JsonResponse
    {
        // Check if employee belongs to the same company
        if (auth()->check() && auth()->user()->company_id) {
            if ($employee->company_id !== auth()->user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }
        }

        $employee->load(['role', 'role.permissions', 'company']);

        return response()->json([
            'success' => true,
            'data' => $employee,
        ]);
    }

    /**
     * Get employee attendance history.
     */
    public function attendance(Request $request, User $employee): JsonResponse
    {
        // Check if employee belongs to the same company
        if (auth()->check() && auth()->user()->company_id) {
            if ($employee->company_id !== auth()->user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }
        }

        $query = $employee->attendances();

        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $attendances = $query->latest()->paginate($request->per_page ?? 30);

        // Calculate statistics
        $stats = [
            'total_present' => $employee->attendances()->where('status', 'present')->count(),
            'total_late' => $employee->attendances()->where('status', 'late')->count(),
            'total_leave' => $employee->leaveRequests()->where('status', 'approved')->count(),
            'total_sick' => $employee->leaveRequests()->where('type', 'sick')->where('status', 'approved')->count(),
            'total_absent' => $employee->attendances()->where('status', 'absent')->count(),
            'avg_check_in' => $employee->attendances()->whereNotNull('check_in_time')->avg('check_in_time'),
            'avg_check_out' => $employee->attendances()->whereNotNull('check_out_time')->avg('check_out_time'),
            'total_work_hours' => $employee->attendances()->sum('work_hours'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'attendances' => $attendances,
                'statistics' => $stats,
            ],
        ]);
    }

    /**
     * Get employee project history.
     */
    public function projects(Request $request, User $employee): JsonResponse
    {
        // Check if employee belongs to the same company
        if (auth()->check() && auth()->user()->company_id) {
            if ($employee->company_id !== auth()->user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }
        }

        $projects = $employee->projects()
            ->with(['manager', 'members'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    /**
     * Get employee approval history.
     */
    public function approvals(Request $request, User $employee): JsonResponse
    {
        // Check if employee belongs to the same company
        if (auth()->check() && auth()->user()->company_id) {
            if ($employee->company_id !== auth()->user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }
        }

        $approvals = Approval::where('approver_id', $employee->id)
            ->with(['approvable'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $approvals,
        ]);
    }

    /**
     * Get employee login history.
     */
    public function loginHistory(Request $request, User $employee): JsonResponse
    {
        // Check if employee belongs to the same company
        if (auth()->check() && auth()->user()->company_id) {
            if ($employee->company_id !== auth()->user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }
        }

        $auditLogs = AuditLog::where('user_id', $employee->id)
            ->where('action', 'login')
            ->latest()
            ->paginate($request->per_page ?? 30);

        return response()->json([
            'success' => true,
            'data' => $auditLogs,
        ]);
    }

    /**
     * Get employee activity history.
     */
    public function activityHistory(Request $request, User $employee): JsonResponse
    {
        // Check if employee belongs to the same company
        if (auth()->check() && auth()->user()->company_id) {
            if ($employee->company_id !== auth()->user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }
        }

        $auditLogs = AuditLog::where('user_id', $employee->id)
            ->latest()
            ->paginate($request->per_page ?? 30);

        return response()->json([
            'success' => true,
            'data' => $auditLogs,
        ]);
    }

    /**
     * Deactivate employee account.
     */
    public function deactivate(User $employee): JsonResponse
    {
        // Check if employee belongs to the same company
        if (auth()->check() && auth()->user()->company_id) {
            if ($employee->company_id !== auth()->user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }
        }

        if ($employee->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot deactivate your own account',
            ], 400);
        }

        $employee->update(['status' => 'inactive']);

        return response()->json([
            'success' => true,
            'message' => 'Employee deactivated successfully',
        ]);
    }

    /**
     * Activate employee account.
     */
    public function activate(User $employee): JsonResponse
    {
        // Check if employee belongs to the same company
        if (auth()->check() && auth()->user()->company_id) {
            if ($employee->company_id !== auth()->user()->company_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }
        }

        $employee->update(['status' => 'active']);

        return response()->json([
            'success' => true,
            'message' => 'Employee activated successfully',
        ]);
    }
}
