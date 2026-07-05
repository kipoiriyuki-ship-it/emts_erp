<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChartOfAccountsController extends Controller
{
    /**
     * Display a listing of chart of accounts.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ChartOfAccount::with(['parent', 'children']);

        if ($request->has('account_type')) {
            $query->where('account_type', $request->account_type);
        }

        if ($request->has('balance_type')) {
            $query->where('balance_type', $request->balance_type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('account_number', 'like', '%' . $request->search . '%')
                  ->orWhere('account_name', 'like', '%' . $request->search . '%');
            });
        }

        $accounts = $query->orderBy('account_number')->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }

    /**
     * Store a newly created chart of account.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'account_number' => 'required|string|unique:chart_of_accounts,account_number',
            'account_name' => 'required|string',
            'account_type' => 'required|in:asset,liability,equity,revenue,expense',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'balance_type' => 'required|in:debit,credit',
            'is_active' => 'boolean',
        ]);

        $level = $request->parent_id ? ChartOfAccount::find($request->parent_id)->level + 1 : 1;

        $account = ChartOfAccount::create([
            'account_number' => $request->account_number,
            'account_name' => $request->account_name,
            'account_type' => $request->account_type,
            'parent_id' => $request->parent_id,
            'level' => $level,
            'balance_type' => $request->balance_type,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $account->load(['parent', 'children']),
            'message' => 'Chart of account created successfully',
        ], 201);
    }

    /**
     * Display the specified chart of account.
     */
    public function show(ChartOfAccount $chartOfAccount): JsonResponse
    {
        $chartOfAccount->load(['parent', 'children', 'balances']);

        return response()->json([
            'success' => true,
            'data' => $chartOfAccount,
        ]);
    }

    /**
     * Update the specified chart of account.
     */
    public function update(Request $request, ChartOfAccount $chartOfAccount): JsonResponse
    {
        $request->validate([
            'account_number' => 'sometimes|required|string|unique:chart_of_accounts,account_number,' . $chartOfAccount->id,
            'account_name' => 'sometimes|required|string',
            'account_type' => 'sometimes|required|in:asset,liability,equity,revenue,expense',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'balance_type' => 'sometimes|required|in:debit,credit',
            'is_active' => 'boolean',
        ]);

        $data = $request->only(['account_number', 'account_name', 'account_type', 'parent_id', 'balance_type', 'is_active']);
        
        if (isset($data['parent_id'])) {
            $data['level'] = $data['parent_id'] ? ChartOfAccount::find($data['parent_id'])->level + 1 : 1;
        }

        $chartOfAccount->update($data);

        return response()->json([
            'success' => true,
            'data' => $chartOfAccount->load(['parent', 'children']),
            'message' => 'Chart of account updated successfully',
        ]);
    }

    /**
     * Remove the specified chart of account.
     */
    public function destroy(ChartOfAccount $chartOfAccount): JsonResponse
    {
        if ($chartOfAccount->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete account with child accounts',
            ], 400);
        }

        if ($chartOfAccount->journalItems()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete account with journal entries',
            ], 400);
        }

        $chartOfAccount->delete();

        return response()->json([
            'success' => true,
            'message' => 'Chart of account deleted successfully',
        ]);
    }

    /**
     * Get account tree structure.
     */
    public function tree(): JsonResponse
    {
        $accounts = ChartOfAccount::with(['children' => function ($query) {
            $query->with(['children']);
        }])->root()->active()->get();

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }
}
