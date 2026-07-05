<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\PettyCashTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PettyCashController extends Controller
{
    /**
     * Display a listing of petty cash transactions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = PettyCashTransaction::with(['category', 'requester', 'approvedBy', 'createdBy']);

        if ($request->has('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('transaction_number', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('receipt_number', 'like', '%' . $request->search . '%');
            });
        }

        $transactions = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * Store a newly created petty cash transaction.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'transaction_type' => 'required|in:in,out',
            'project_id' => 'nullable|exists:projects,id',
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'category_id' => 'nullable|exists:expense_categories,id',
            'description' => 'required|string',
            'notes' => 'nullable|string',
            'receipt_number' => 'nullable|string',
            'receipt_image' => 'nullable|string|max:5000000', // Max 5MB base64
        ]);

        $budgetValidation = $this->validateProjectBudget($request->project_id, $request->amount, $request->transaction_type);
        if (!$budgetValidation['success']) {
            return response()->json([
                'success' => false,
                'message' => $budgetValidation['message'],
            ], 422);
        }

        // Validate and process receipt image if provided
        $receiptImagePath = null;
        if ($request->receipt_image) {
            $validationResult = $this->validateAndStoreImage($request->receipt_image, 'petty-cash/receipts');
            if (!$validationResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $validationResult['message'],
                ], 400);
            }
            $receiptImagePath = $validationResult['path'];
        }

        $transactionNumber = 'PCT-' . date('Ymd') . '-' . str_pad(PettyCashTransaction::count() + 1, 4, '0', STR_PAD_LEFT);

        $transaction = PettyCashTransaction::create([
            'transaction_number' => $transactionNumber,
            'project_id' => $request->project_id,
            'transaction_type' => $request->transaction_type,
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date,
            'category_id' => $request->category_id,
            'description' => $request->description,
            'notes' => $request->notes,
            'receipt_number' => $request->receipt_number,
            'receipt_image' => $receiptImagePath,
            'requester_id' => auth()->id(),
            'status' => 'pending',
            'created_by' => auth()->id(),
        ]);

        if (!$transaction->isPendingApproval()) {
            $transaction->createApprovalForDirector();
        }

        return response()->json([
            'success' => true,
            'data' => $transaction->load(['category', 'requester', 'approvedBy', 'createdBy']),
            'message' => 'Petty cash transaction created successfully',
        ], 201);
    }

    /**
     * Display the specified petty cash transaction.
     */
    public function show(PettyCashTransaction $pettyCashTransaction): JsonResponse
    {
        $pettyCashTransaction->load(['category', 'requester', 'approvedBy', 'createdBy']);

        return response()->json([
            'success' => true,
            'data' => $pettyCashTransaction,
        ]);
    }

    /**
     * Update the specified petty cash transaction.
     */
    public function update(Request $request, PettyCashTransaction $pettyCashTransaction): JsonResponse
    {
        // Only allow updating pending transactions
        if ($pettyCashTransaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only update pending transactions',
            ], 400);
        }

        // Only the requester or admin can update
        if ($pettyCashTransaction->requester_id !== auth()->id() && auth()->user()->role->code !== 'DIRECTOR' && auth()->user()->role->code !== 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'transaction_type' => 'sometimes|required|in:in,out',
            'project_id' => 'nullable|exists:projects,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'transaction_date' => 'sometimes|required|date',
            'category_id' => 'nullable|exists:expense_categories,id',
            'description' => 'sometimes|required|string',
            'notes' => 'nullable|string',
            'receipt_number' => 'nullable|string',
            'receipt_image' => 'nullable|string|max:5000000', // Max 5MB base64
        ]);

        $budgetValidation = $this->validateProjectBudget($request->project_id ?? $pettyCashTransaction->project_id, $request->amount ?? $pettyCashTransaction->amount, $request->transaction_type ?? $pettyCashTransaction->transaction_type);
        if (!$budgetValidation['success']) {
            return response()->json([
                'success' => false,
                'message' => $budgetValidation['message'],
            ], 422);
        }

        // Validate and process receipt image if provided
        $receiptImagePath = $pettyCashTransaction->receipt_image;
        if ($request->receipt_image) {
            $validationResult = $this->validateAndStoreImage($request->receipt_image, 'petty-cash/receipts');
            if (!$validationResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $validationResult['message'],
                ], 400);
            }
            $receiptImagePath = $validationResult['path'];
        }

        $pettyCashTransaction->update([
            'project_id' => $request->project_id ?? $pettyCashTransaction->project_id,
            'transaction_type' => $request->transaction_type ?? $pettyCashTransaction->transaction_type,
            'amount' => $request->amount ?? $pettyCashTransaction->amount,
            'transaction_date' => $request->transaction_date ?? $pettyCashTransaction->transaction_date,
            'category_id' => $request->category_id ?? $pettyCashTransaction->category_id,
            'description' => $request->description ?? $pettyCashTransaction->description,
            'notes' => $request->notes ?? $pettyCashTransaction->notes,
            'receipt_number' => $request->receipt_number ?? $pettyCashTransaction->receipt_number,
            'receipt_image' => $receiptImagePath,
        ]);

        return response()->json([
            'success' => true,
            'data' => $pettyCashTransaction->load(['category', 'requester', 'approvedBy', 'createdBy']),
            'message' => 'Petty cash transaction updated successfully',
        ]);
    }

    /**
     * Remove the specified petty cash transaction.
     */
    public function destroy(PettyCashTransaction $pettyCashTransaction): JsonResponse
    {
        // Only allow deleting pending transactions
        if ($pettyCashTransaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only delete pending transactions',
            ], 400);
        }

        // Only the requester or admin can delete
        if ($pettyCashTransaction->requester_id !== auth()->id() && auth()->user()->role->code !== 'DIRECTOR' && auth()->user()->role->code !== 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $pettyCashTransaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Petty cash transaction deleted successfully',
        ]);
    }

    /**
     * Approve a petty cash transaction.
     */
    public function approve(Request $request, PettyCashTransaction $pettyCashTransaction): JsonResponse
    {
        if ($pettyCashTransaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only approve pending transactions',
            ], 400);
        }

        $pettyCashTransaction->approve(auth()->id());
        $this->applyBudgetImpact($pettyCashTransaction);

        return response()->json([
            'success' => true,
            'data' => $pettyCashTransaction->load(['category', 'requester', 'approvedBy', 'createdBy']),
            'message' => 'Petty cash transaction approved successfully',
        ]);
    }

    /**
     * Reject a petty cash transaction.
     */
    public function reject(Request $request, PettyCashTransaction $pettyCashTransaction): JsonResponse
    {
        if ($pettyCashTransaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Can only reject pending transactions',
            ], 400);
        }

        $pettyCashTransaction->reject(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $pettyCashTransaction->load(['category', 'requester', 'approvedBy', 'createdBy']),
            'message' => 'Petty cash transaction rejected successfully',
        ]);
    }

    /**
     * Get petty cash summary.
     */
    public function summary(Request $request): JsonResponse
    {
        $query = PettyCashTransaction::where('status', 'approved');

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
        }

        $totalIn = (clone $query)->in()->sum('amount');
        $totalOut = (clone $query)->out()->sum('amount');
        $balance = $totalIn - $totalOut;

        return response()->json([
            'success' => true,
            'data' => [
                'total_in' => $totalIn,
                'total_out' => $totalOut,
                'balance' => $balance,
            ],
        ]);
    }

    /**
     * Validate and store image.
     */
    protected function validateProjectBudget(?int $projectId, float $amount, string $transactionType): array
    {
        if ($transactionType !== 'out' || !$projectId) {
            return ['success' => true];
        }

        $budgets = Budget::where('project_id', $projectId)
            ->where('status', 'active')
            ->get();

        if ($budgets->isEmpty()) {
            return [
                'success' => false,
                'message' => 'No active project budget is available for this project.',
            ];
        }

        $remainingBudget = (float) $budgets->sum('remaining_amount');
        if ($remainingBudget < $amount) {
            return [
                'success' => false,
                'message' => 'Requested amount exceeds the remaining project budget.',
            ];
        }

        return ['success' => true];
    }

    protected function applyBudgetImpact(PettyCashTransaction $pettyCashTransaction): void
    {
        if ($pettyCashTransaction->transaction_type !== 'out' || !$pettyCashTransaction->project_id) {
            return;
        }

        $budgets = Budget::where('project_id', $pettyCashTransaction->project_id)
            ->where('status', 'active')
            ->orderBy('created_at')
            ->get();

        $remainingToAllocate = (float) $pettyCashTransaction->amount;
        foreach ($budgets as $budget) {
            if ($remainingToAllocate <= 0) {
                break;
            }

            $available = (float) $budget->remaining_amount;
            if ($available <= 0) {
                continue;
            }

            $used = min($available, $remainingToAllocate);
            $budget->actual_amount = (float) $budget->actual_amount + $used;
            $budget->remaining_amount = max(0, $available - $used);
            $budget->save();
            $remainingToAllocate -= $used;
        }
    }

    protected function validateAndStoreImage(string $base64Image, string $directory): array
    {
        // Validate base64 format
        if (!preg_match('#^data:image/(jpeg|jpg|png|gif|webp);base64,#i', $base64Image)) {
            return [
                'success' => false,
                'message' => 'Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed.',
            ];
        }

        // Extract and validate image data
        $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64Image));
        if (!$imageData) {
            return [
                'success' => false,
                'message' => 'Failed to decode image data.',
            ];
        }

        // Validate file size (max 5MB)
        if (strlen($imageData) > 5 * 1024 * 1024) {
            return [
                'success' => false,
                'message' => 'Image size exceeds 5MB limit.',
            ];
        }

        // Validate it's actually an image
        if (!$this->isValidImage($imageData)) {
            return [
                'success' => false,
                'message' => 'Invalid image data.',
            ];
        }

        // Store the image
        $fileName = uniqid() . '_' . time() . '.jpg';
        $path = $directory . '/' . $fileName;
        \Storage::disk('public')->put($path, $imageData);

        return [
            'success' => true,
            'path' => $path,
        ];
    }

    /**
     * Validate image data.
     */
    protected function isValidImage(string $data): bool
    {
        // Check for valid image signatures
        $signatures = [
            'jpeg' => "\xFF\xD8\xFF",
            'png' => "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A",
            'gif' => "GIF87a",
            'gif2' => "GIF89a",
            'webp' => "RIFF",
        ];

        foreach ($signatures as $sig) {
            if (strpos($data, $sig) === 0) {
                return true;
            }
        }

        return false;
    }
}
