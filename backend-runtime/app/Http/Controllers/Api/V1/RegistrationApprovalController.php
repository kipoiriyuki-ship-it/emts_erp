<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegistrationApprovalController extends Controller
{
    /**
     * Get pending registrations.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $pendingUsers = User::where('status', 'pending')
                ->whereNull('role_id')
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'pending_users' => $pendingUsers,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get pending registrations: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve a pending registration.
     */
    public function approve(Request $request, $id): JsonResponse
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        try {
            $user = User::findOrFail($id);

            if ($user->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not pending approval',
                ], 400);
            }

            $role = Role::findOrFail($request->role_id);

            DB::beginTransaction();
            try {
                $user->update([
                    'status' => 'active',
                    'role_id' => $role->id,
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Registration approved successfully',
                    'data' => [
                        'user' => $user->load('role'),
                    ],
                ], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve registration: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject a pending registration.
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        try {
            $user = User::findOrFail($id);

            if ($user->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not pending approval',
                ], 400);
            }

            DB::beginTransaction();
            try {
                // Delete the user instead of just changing status
                $user->delete();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Registration rejected successfully',
                ], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject registration: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available roles for approval.
     */
    public function getRoles(Request $request): JsonResponse
    {
        try {
            $roles = Role::where('is_active', true)->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'roles' => $roles,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get roles: ' . $e->getMessage(),
            ], 500);
        }
    }
}
