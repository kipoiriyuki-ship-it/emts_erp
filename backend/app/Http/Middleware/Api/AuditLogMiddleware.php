<?php

namespace App\Http\Middleware\Api;

use Closure;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditLogMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only log for POST, PUT, DELETE, PATCH methods
        if (in_array($request->method(), ['POST', 'PUT', 'DELETE', 'PATCH'])) {
            $user = Auth::user();
            
            if ($user && $request->route()) {
                $routeName = $request->route()->getName();
                $action = $this->getActionFromMethod($request->method());
                $module = $this->getModuleFromRoute($routeName);

                AuditLog::create([
                    'user_id' => $user->id,
                    'action' => $action,
                    'module' => $module,
                    'description' => "{$action} {$routeName}",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'old_values' => $request->method() === 'PUT' || $request->method() === 'PATCH' ? $request->old : null,
                    'new_values' => $request->except(['password', 'password_confirmation']),
                ]);
            }
        }

        return $response;
    }

    /**
     * Get action from HTTP method.
     */
    protected function getActionFromMethod(string $method): string
    {
        return match($method) {
            'POST' => 'CREATE',
            'PUT', 'PATCH' => 'UPDATE',
            'DELETE' => 'DELETE',
            default => 'UNKNOWN',
        };
    }

    /**
     * Get module from route name.
     */
    protected function getModuleFromRoute(?string $routeName): string
    {
        if (!$routeName) {
            return 'unknown';
        }

        if (str_contains($routeName, 'project')) {
            return 'projects';
        }
        if (str_contains($routeName, 'attendance')) {
            return 'attendance';
        }
        if (str_contains($routeName, 'expense') || str_contains($routeName, 'cash')) {
            return 'finance';
        }
        if (str_contains($routeName, 'journal') || str_contains($routeName, 'account')) {
            return 'accounting';
        }
        if (str_contains($routeName, 'user')) {
            return 'users';
        }
        if (str_contains($routeName, 'approval')) {
            return 'approvals';
        }

        return 'general';
    }
}
