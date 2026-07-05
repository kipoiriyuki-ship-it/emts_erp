<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FinancialPolicy;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FinancialPolicyController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $policy = FinancialPolicy::first();

        if (!$policy) {
            $policy = FinancialPolicy::create([
                'petty_cash_approval_limit' => 0,
                'large_cash_always_require_approval' => false,
                'maximum_petty_cash_per_day' => 0,
                'maximum_petty_cash_per_employee' => 0,
                'maximum_cash_request_per_project' => 0,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $policy,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $policy = FinancialPolicy::first();

        if (!$policy) {
            $policy = FinancialPolicy::create([
                'petty_cash_approval_limit' => 0,
                'large_cash_always_require_approval' => false,
                'maximum_petty_cash_per_day' => 0,
                'maximum_petty_cash_per_employee' => 0,
                'maximum_cash_request_per_project' => 0,
            ]);
        }

        $validated = $request->validate([
            'petty_cash_approval_limit' => 'required|numeric|min:0',
            'large_cash_always_require_approval' => 'required|boolean',
            'maximum_petty_cash_per_day' => 'required|numeric|min:0',
            'maximum_petty_cash_per_employee' => 'required|numeric|min:0',
            'maximum_cash_request_per_project' => 'required|numeric|min:0',
        ]);

        $oldValues = $policy->getOriginal();
        $policy->update($validated);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'UPDATE',
            'module' => 'FinancialPolicy',
            'description' => 'Updated financial policy settings',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'old_values' => $oldValues,
            'new_values' => $validated,
        ]);

        return response()->json([
            'success' => true,
            'data' => $policy,
            'message' => 'Financial policy updated successfully',
        ]);
    }
}
