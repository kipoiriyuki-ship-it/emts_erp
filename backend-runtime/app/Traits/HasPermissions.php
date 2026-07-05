<?php

namespace App\Traits;

use App\Models\Permission;

trait HasPermissions
{
    /**
     * Get all permissions for the user.
     */
    public function getAllPermissions()
    {
        return $this->role->permissions;
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission($permissionCode)
    {
        return $this->role->permissions()->where('code', $permissionCode)->exists();
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(...$permissions)
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions(...$permissions)
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if user can perform an action on a module.
     * Diselaraskan dengan signature bawaan Laravel agar tidak crash.
     */
    public function can($abilities, $arguments = [])
    {
        // Petakan ulang agar kompatibel dengan sistem ($action, $module) kustom Anda
        $action = $abilities;
        $module = is_array($arguments) ? ($arguments[0] ?? null) : $arguments;

        // Jika modul diisi, gunakan format kode gabungan (CONTOH: FINANCE.CREATE)
        if ($module) {
            $permissionCode = strtoupper("{$module}.{$action}");
            return $this->hasPermission($permissionCode);
        }

        // Fallback jika hanya memeriksa satu string permission langsung
        return $this->hasPermission(strtoupper($abilities));
    }

    /**
     * Scope a query to only include users with a specific permission.
     */
    public function scopeWithPermission($query, $permissionCode)
    {
        return $query->whereHas('role.permissions', function ($q) use ($permissionCode) {
            $q->where('code', $permissionCode);
        });
    }
}
