<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\BudgetDetail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BudgetController extends Controller
{
    /**
     * Display a listing of budgets.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Budget::with(['project', 'department', 'account', 'details']);

        // Filter by project
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        // Filter by department
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $budgets = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $budgets,
        ]);
    }

    /**
     * Store a newly created budget.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'nullable|exists:projects,id',
            'department_id' => 'nullable|exists:departments,id',
            'account_id' => 'nullable|exists:chart_of_accounts,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'total_budget' => 'required|numeric|min:0',
        ]);

        $budget = Budget::create([
            'budget_number' => $this->generateBudgetNumber(),
            'name' => $request->name,
            'description' => $request->description,
            'project_id' => $request->project_id,
            'department_id' => $request->department_id,
            'account_id' => $request->account_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'total_budget' => $request->total_budget,
            'actual_amount' => 0,
            'remaining_amount' => $request->total_budget,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $budget->load(['project', 'department', 'account']),
            'message' => 'Budget created successfully',
        ], 201);
    }

    /**
     * Display the specified budget.
     */
    public function show(Budget $budget): JsonResponse
    {
        $budget->load(['project', 'department', 'account', 'details.account', 'approvedBy', 'createdBy']);

        return response()->json([
            'success' => true,
            'data' => $budget,
        ]);
    }

    /**
     * Update the specified budget.
     */
    public function update(Request $request, Budget $budget): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'nullable|exists:projects,id',
            'department_id' => 'nullable|exists:departments,id',
            'account_id' => 'nullable|exists:chart_of_accounts,id',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            'total_budget' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|in:draft,active,completed,cancelled',
        ]);

        $budget->update($request->all());

        // Recalculate remaining amount if total_budget changed
        if ($request->has('total_budget')) {
            $budget->calculateRemaining();
        }

        return response()->json([
            'success' => true,
            'data' => $budget->load(['project', 'department', 'account']),
            'message' => 'Budget updated successfully',
        ]);
    }

    /**
     * Remove the specified budget.
     */
    public function destroy(Budget $budget): JsonResponse
    {
        if ($budget->status === 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete active budget',
            ], 400);
        }

        $budget->delete();

        return response()->json([
            'success' => true,
            'message' => 'Budget deleted successfully',
        ]);
    }

    /**
     * Approve the budget.
     */
    public function approve(Budget $budget): JsonResponse
    {
        if ($budget->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft budgets can be approved',
            ], 400);
        }

        $budget->approve(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $budget->load(['approvedBy']),
            'message' => 'Budget approved successfully',
        ]);
    }

    /**
     * Add budget detail.
     */
    public function addDetail(Request $request, Budget $budget): JsonResponse
    {
        $request->validate([
            'account_id' => 'required|exists:chart_of_accounts,id',
            'description' => 'required|string',
            'planned_amount' => 'required|numeric|min:0',
        ]);

        $detail = $budget->details()->create([
            'account_id' => $request->account_id,
            'description' => $request->description,
            'planned_amount' => $request->planned_amount,
            'actual_amount' => 0,
            'variance' => $request->planned_amount,
            'variance_type' => 'favorable',
        ]);

        return response()->json([
            'success' => true,
            'data' => $detail->load('account'),
            'message' => 'Budget detail added successfully',
        ], 201);
    }

    /**
     * Update budget detail.
     */
    public function updateDetail(Request $request, Budget $budget, $detailId): JsonResponse
    {
        $detail = $budget->details()->findOrFail($detailId);

        $request->validate([
            'description' => 'sometimes|required|string',
            'planned_amount' => 'sometimes|required|numeric|min:0',
            'actual_amount' => 'sometimes|required|numeric|min:0',
        ]);

        $detail->update($request->all());

        // Recalculate variance
        $detail->calculateVariance();

        // Update budget actual amount
        $totalActual = $budget->details()->sum('actual_amount');
        $budget->update(['actual_amount' => $totalActual]);
        $budget->calculateRemaining();

        return response()->json([
            'success' => true,
            'data' => $detail->load('account'),
            'message' => 'Budget detail updated successfully',
        ]);
    }

    /**
     * Get budget vs actual report.
     */
    public function budgetVsActual(Request $request): JsonResponse
    {
        $request->validate([
            'budget_id' => 'required|exists:budgets,id',
        ]);

        $budget = Budget::with(['details.account'])->findOrFail($request->budget_id);

        $details = $budget->details->map(function ($detail) {
            return [
                'account_number' => $detail->account->account_number ?? 'N/A',
                'account_name' => $detail->account->account_name ?? 'N/A',
                'planned_amount' => $detail->planned_amount,
                'actual_amount' => $detail->actual_amount,
                'variance' => $detail->variance,
                'variance_type' => $detail->variance_type,
                'variance_percent' => $detail->planned_amount > 0 
                    ? ($detail->variance / $detail->planned_amount) * 100 
                    : 0,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'budget' => [
                    'budget_number' => $budget->budget_number,
                    'name' => $budget->name,
                    'period' => [
                        'start_date' => $budget->start_date,
                        'end_date' => $budget->end_date,
                    ],
                ],
                'summary' => [
                    'total_planned' => $budget->total_budget,
                    'total_actual' => $budget->actual_amount,
                    'total_remaining' => $budget->remaining_amount,
                    'utilization_percent' => $budget->total_budget > 0 
                        ? ($budget->actual_amount / $budget->total_budget) * 100 
                        : 0,
                ],
                'details' => $details,
            ],
        ]);
    }

    /**
     * Generate unique budget number.
     */
    protected function generateBudgetNumber(): string
    {
        $prefix = 'BUD';
        $year = now()->format('Y');
        $month = now()->format('m');
        $sequence = Budget::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;

        return sprintf('%s%s%s%04d', $prefix, $year, $month, $sequence);
    }
}
