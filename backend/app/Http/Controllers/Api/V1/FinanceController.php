<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OperationalExpense;
use App\Models\LargeCashRequest;
use App\Models\LargeCashItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class FinanceController extends Controller
{
    /**
     * Display a listing of operational expenses.
     */
    public function index(Request $request): JsonResponse
    {
        $query = OperationalExpense::with(['category', 'user', 'approver']);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $expenses = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $expenses,
        ]);
    }

    /**
     * Store operational expense.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => 'required|exists:expense_categories,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'receipt_url' => 'nullable|string',
        ]);

        $expense = OperationalExpense::create([
            'category_id' => $request->category_id,
            'user_id' => auth()->id(),
            'date' => $request->date,
            'amount' => $request->amount,
            'description' => $request->description,
            'receipt_url' => $request->receipt_url,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => $expense->load('category', 'user'),
            'message' => 'Expense created successfully',
        ], 201);
    }

    /**
     * Display operational expense.
     */
    public function show(OperationalExpense $expense): JsonResponse
    {
        $expense->load(['category', 'user', 'approver']);

        return response()->json([
            'success' => true,
            'data' => $expense,
        ]);
    }

    /**
     * Update operational expense.
     */
    public function update(Request $request, OperationalExpense $expense): JsonResponse
    {
        if ($expense->status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit approved expense',
            ], 400);
        }

        $request->validate([
            'category_id' => 'sometimes|required|exists:expense_categories,id',
            'date' => 'sometimes|required|date',
            'amount' => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'receipt_url' => 'nullable|string',
        ]);

        $expense->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $expense->load('category', 'user'),
            'message' => 'Expense updated successfully',
        ]);
    }

    /**
     * Delete operational expense.
     */
    public function destroy(OperationalExpense $expense): JsonResponse
    {
        if ($expense->status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete approved expense',
            ], 400);
        }

        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expense deleted successfully',
        ]);
    }

    /**
     * Approve operational expense.
     */
    public function approveExpense(Request $request, OperationalExpense $expense): JsonResponse
    {
        $expense->approve(auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Expense approved successfully',
        ]);
    }

    /**
     * Reject operational expense.
     */
    public function rejectExpense(Request $request, OperationalExpense $expense): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $expense->reject(auth()->id(), $request->reason);

        return response()->json([
            'success' => true,
            'message' => 'Expense rejected successfully',
        ]);
    }

    /**
     * Display a listing of large cash requests.
     */
    public function largeCashIndex(Request $request): JsonResponse
    {
        $query = LargeCashRequest::with(['project', 'user', 'approver']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        $requests = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Store large cash request.
     */
    public function storeLargeCash(Request $request): JsonResponse
    {
        $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'type' => 'required|in:material,vendor,subcontractor,asset,project_payment',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $request = LargeCashRequest::create([
            'request_number' => $this->generateRequestNumber(),
            'project_id' => $request->project_id,
            'user_id' => auth()->id(),
            'type' => $request->type,
            'total_amount' => collect($request->items)->sum('amount'),
            'description' => $request->description,
            'status' => 'draft',
        ]);

        foreach ($request->items as $item) {
            LargeCashItem::create([
                'request_id' => $request->id,
                'description' => $item['description'],
                'amount' => $item['amount'],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $request->load('items'),
            'message' => 'Cash request created successfully',
        ], 201);
    }

    /**
     * Submit large cash request.
     */
    public function submitRequest(LargeCashRequest $request): JsonResponse
    {
        if ($request->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->submit();

        return response()->json([
            'success' => true,
            'message' => 'Request submitted successfully',
        ]);
    }

    /**
     * Approve large cash request.
     */
    public function approveRequest(LargeCashRequest $request): JsonResponse
    {
        $request->approve(auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Request approved successfully',
        ]);
    }

    /**
     * Reject large cash request.
     */
    public function rejectRequest(Request $request, LargeCashRequest $cashRequest): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $cashRequest->reject(auth()->id(), $request->reason);

        return response()->json([
            'success' => true,
            'message' => 'Request rejected successfully',
        ]);
    }

    /**
     * Generate unique request number.
     */
    protected function generateRequestNumber(): string
    {
        $prefix = 'LCR';
        $year = now()->format('Y');
        $month = now()->format('m');
        $sequence = LargeCashRequest::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;

        return sprintf('%s%s%s%04d', $prefix, $year, $month, $sequence);
    }
}
