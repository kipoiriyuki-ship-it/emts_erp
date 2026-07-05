<?php

namespace App\Http\Middleware\Api;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        if (!in_array($user->role->code, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - insufficient role',
            ], 403);
        }

        return $next($request);
    }
}
