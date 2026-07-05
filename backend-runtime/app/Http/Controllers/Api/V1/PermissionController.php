<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    /**
     * Display a listing of permissions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Permission::query();

        if ($request->has('module')) {
            $query->where('module', $request->module);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
            });
        }

        $permissions = $query->orderBy('module')->orderBy('code')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'permissions' => $permissions,
            ],
        ]);
    }

    /**
     * Store a newly created permission.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:permissions',
            'code' => 'required|string|max:100|unique:permissions',
            'module' => 'required|string|max:50',
            'description' => 'nullable|string',
        ]);

        $permission = Permission::create([
            'name' => $request->name,
            'code' => $request->code,
            'module' => $request->module,
            'description' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'data' => $permission,
            'message' => 'Permission created successfully',
        ], 201);
    }

    /**
     * Display the specified permission.
     */
    public function show(Permission $permission): JsonResponse
    {
        $permission->load('roles');

        return response()->json([
            'success' => true,
            'data' => $permission,
        ]);
    }

    /**
     * Update the specified permission.
     */
    public function update(Request $request, Permission $permission): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:permissions,name,' . $permission->id,
            'code' => 'sometimes|required|string|max:100|unique:permissions,code,' . $permission->id,
            'module' => 'sometimes|required|string|max:50',
            'description' => 'nullable|string',
        ]);

        $permission->update($request->only(['name', 'code', 'module', 'description']));

        return response()->json([
            'success' => true,
            'data' => $permission,
            'message' => 'Permission updated successfully',
        ]);
    }

    /**
     * Remove the specified permission.
     */
    public function destroy(Permission $permission): JsonResponse
    {
        // Check if permission is assigned to roles
        if ($permission->roles()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete permission assigned to roles',
            ], 400);
        }

        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Permission deleted successfully',
        ]);
    }
}
