<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OperationalExpense;
use App\Models\LargeCashRequest;
use App\Models\LargeCashItem;
use App\Models\Notification;
use App\Models\User;
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

        if (!$expense->isPendingApproval()) {
            $expense->createApprovalForDirector();
        }

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
    public function approveExpense(Request $request, $expenseId): JsonResponse
    {
        $expense = OperationalExpense::find($expenseId);

        if (!$expense) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found',
            ], 404);
        }

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
            'items.*.amount' => 'nullable|numeric|min:0',
            'items.*.quantity' => 'nullable|numeric|min:0',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $largeCashRequest = LargeCashRequest::create([
            'request_number' => $this->generateRequestNumber(),
            'project_id' => $request->project_id,
            'user_id' => auth()->id(),
            'type' => $request->type,
            'total_amount' => collect($request->items)->sum(fn ($item) => (float) ($this->normalizeItemAmount($item))),
            'description' => $request->description,
            'status' => 'draft',
        ]);

        foreach ($request->items as $item) {
            $itemData = $this->normalizeItemPayload($item);
            $largeCashRequest->items()->create($itemData);
        }

        return response()->json([
            'success' => true,
            'data' => $largeCashRequest->load('items'),
            'message' => 'Cash request created successfully',
        ], 201);
    }

    /**
     * Display a specific large cash request.
     */
    public function showLargeCash(LargeCashRequest $largeCashRequest): JsonResponse
    {
        $largeCashRequest->load(['project', 'user', 'reviewer', 'approver', 'items']);

        return response()->json([
            'success' => true,
            'data' => $largeCashRequest,
        ]);
    }

    /**
     * Update a large cash request.
     */
    public function updateLargeCash(Request $request, LargeCashRequest $largeCashRequest): JsonResponse
    {
        if (!in_array($largeCashRequest->status, ['draft', 'rejected'])) {
            return response()->json([
                'success' => false,
                'message' => 'Can only update draft or rejected large cash requests',
            ], 400);
        }

        $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'type' => 'sometimes|required|in:material,vendor,subcontractor,asset,project_payment',
            'items' => 'sometimes|required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.amount' => 'nullable|numeric|min:0',
            'items.*.quantity' => 'nullable|numeric|min:0',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $data = $request->only(['project_id', 'type', 'description']);

        if ($request->has('items')) {
            $largeCashRequest->items()->delete();
            $data['total_amount'] = collect($request->items)->sum(fn ($item) => (float) ($this->normalizeItemAmount($item)));

            foreach ($request->items as $item) {
                $itemData = $this->normalizeItemPayload($item);
                $largeCashRequest->items()->create($itemData);
            }
        }

        $largeCashRequest->update($data);

        return response()->json([
            'success' => true,
            'data' => $largeCashRequest->load('items'),
            'message' => 'Large cash request updated successfully',
        ]);
    }

    /**
     * Delete a large cash request.
     */
    public function destroyLargeCash(LargeCashRequest $largeCashRequest): JsonResponse
    {
        if (in_array($largeCashRequest->status, ['submitted', 'pending', 'approved'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a request that is already submitted or approved',
            ], 400);
        }

        $largeCashRequest->items()->delete();
        $largeCashRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Large cash request deleted successfully',
        ]);
    }

    protected function normalizeItemPayload(array $item): array
    {
        $quantity = isset($item['quantity']) ? (float) $item['quantity'] : 1;
        $unitPrice = isset($item['unit_price']) ? (float) $item['unit_price'] : $this->normalizeItemAmount($item);
        $total = isset($item['total']) ? (float) $item['total'] : ($quantity * $unitPrice);

        return [
            'description' => $item['description'],
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total' => $total,
        ];
    }

    protected function normalizeItemAmount(array $item): float
    {
        if (array_key_exists('amount', $item) && $item['amount'] !== null) {
            return (float) $item['amount'];
        }

        $quantity = isset($item['quantity']) ? (float) $item['quantity'] : 1;
        $unitPrice = isset($item['unit_price']) ? (float) $item['unit_price'] : 0;

        return $quantity * $unitPrice;
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

        $directors = User::whereHas('role', function ($query) {
            $query->where('code', 'DIRECTOR');
        })->get();

        foreach ($directors as $director) {
            Notification::create([
                'user_id' => $director->id,
                'title' => 'Large Cash Request Needs Approval',
                'message' => "Request {$request->request_number} requires your approval.",
                'type' => 'approval',
                'link' => '/approval-center',
                'data' => [
                    'request_id' => $request->id,
                    'request_type' => 'large_cash',
                ],
            ]);
        }

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

        Notification::create([
            'user_id' => $request->user_id,
            'title' => 'Large Cash Request Approved',
            'message' => "Your request {$request->request_number} has been approved.",
            'type' => 'approval',
            'link' => '/finance/large-cash',
            'data' => [
                'request_id' => $request->id,
                'status' => 'approved',
            ],
        ]);

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

        Notification::create([
            'user_id' => $cashRequest->user_id,
            'title' => 'Large Cash Request Rejected',
            'message' => "Your request {$cashRequest->request_number} was rejected.",
            'type' => 'approval',
            'link' => '/finance/large-cash',
            'data' => [
                'request_id' => $cashRequest->id,
                'status' => 'rejected',
                'reason' => $request->reason,
            ],
        ]);

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
