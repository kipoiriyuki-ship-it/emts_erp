<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('role');

        $authUser = auth()->user();
        if ($authUser?->company_id) {
            $query->where('company_id', $authUser->company_id);
        }

        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive,suspended',
            'company_id' => 'nullable|exists:companies,id',
        ]);

        $authUser = auth()->user();
        $companyId = $request->input('company_id') ?? $authUser?->company_id;

        $user = User::create([
            'role_id' => $request->role_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'status' => $request->status,
            'company_id' => $companyId,
        ]);

        $employeePayload = $this->buildEmployeePayload($request, $user);
        if ($employeePayload) {
            Employee::create($employeePayload);
        }

        return response()->json([
            'success' => true,
            'data' => $user->load('role'),
            'message' => 'User created successfully',
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        $authUser = auth()->user();
        if ($authUser?->company_id && $user->company_id !== $authUser->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $user->load(['role', 'role.permissions']);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $authUser = auth()->user();
        if ($authUser?->company_id && $user->company_id !== $authUser->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $request->validate([
            'role_id' => 'sometimes|required|exists:roles,id',
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'status' => 'sometimes|required|in:active,inactive,suspended',
        ]);

        $data = $request->except('password');

        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'data' => $user->load('role'),
            'message' => 'User updated successfully',
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): JsonResponse
    {
        $authUser = auth()->user();
        if ($authUser?->company_id && $user->company_id !== $authUser->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete your own account',
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Get all roles.
     */
    protected function buildEmployeePayload(Request $request, User $user): ?array
    {
        $hasEmployeeData = $request->filled('first_name')
            || $request->filled('last_name')
            || $request->filled('position')
            || $request->filled('division')
            || $request->filled('join_date')
            || $request->filled('nik')
            || $request->filled('address');

        if (!$hasEmployeeData) {
            return null;
        }

        $nameParts = preg_split('/\s+/', trim((string) $request->name), 2) ?: [trim((string) $request->name)];
        $firstName = $request->input('first_name') ?? ($nameParts[0] ?? '');
        $lastName = $request->input('last_name') ?? ($nameParts[1] ?? '');

        $notes = array_filter([
            $request->filled('division') ? 'division: ' . $request->division : null,
            $request->filled('nik') ? 'nik: ' . $request->nik : null,
        ]);

        return [
            'user_id' => $user->id,
            'employee_id' => $request->input('employee_id') ?? 'EMP-' . str_pad((string) $user->id, 4, '0', STR_PAD_LEFT),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $request->input('phone'),
            'address' => $request->input('address'),
            'hire_date' => $request->input('join_date') ?? now()->toDateString(),
            'employment_type' => $request->input('employment_type') ?? 'full_time',
            'employment_status' => $request->input('employment_status') ?? $request->input('status') ?? 'active',
            'notes' => $notes ? implode(' | ', $notes) : null,
        ];
    }

    public function roles(): JsonResponse
    {
        $roles = Role::with('permissions')->get();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }
}
