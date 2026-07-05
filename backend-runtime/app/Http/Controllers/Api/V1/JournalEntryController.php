<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use App\Models\JournalItem;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JournalEntryController extends Controller
{
    /**
     * Display a listing of journal entries.
     */
    public function index(Request $request): JsonResponse
    {
        $query = JournalEntry::with(['creator', 'approver', 'items.account']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('period')) {
            $query->where('period', $request->period);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('journal_number', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $entries = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $entries,
        ]);
    }

    /**
     * Store a newly created journal entry.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'description' => 'nullable|string',
            'period' => 'required|string',
            'items' => 'required|array|min:2',
            'items.*.account_id' => 'required|exists:chart_of_accounts,id',
            'items.*.debit' => 'required|numeric|min:0',
            'items.*.credit' => 'required|numeric|min:0',
            'items.*.description' => 'nullable|string',
        ]);

        $totalDebit = collect($request->items)->sum('debit');
        $totalCredit = collect($request->items)->sum('credit');

        if (abs($totalDebit - $totalCredit) > 0.01) {
            return response()->json([
                'success' => false,
                'message' => 'Journal entry must be balanced (debits must equal credits)',
            ], 400);
        }

        if ($totalDebit === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Journal entry must have at least one non-zero amount',
            ], 400);
        }

        $journalNumber = 'JE-' . date('Ymd') . '-' . str_pad(JournalEntry::count() + 1, 4, '0', STR_PAD_LEFT);

        $entry = JournalEntry::create([
            'journal_number' => $journalNumber,
            'date' => $request->date,
            'description' => $request->description,
            'period' => $request->period,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        foreach ($request->items as $item) {
            $entry->items()->create([
                'account_id' => $item['account_id'],
                'debit' => $item['debit'],
                'credit' => $item['credit'],
                'description' => $item['description'] ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $entry->load(['creator', 'items.account']),
            'message' => 'Journal entry created successfully',
        ], 201);
    }

    /**
     * Display the specified journal entry.
     */
    public function show(JournalEntry $journalEntry): JsonResponse
    {
        $journalEntry->load(['creator', 'approver', 'items.account']);

        return response()->json([
            'success' => true,
            'data' => $journalEntry,
        ]);
    }

    /**
     * Update the specified journal entry.
     */
    public function update(Request $request, JournalEntry $journalEntry): JsonResponse
    {
        // Only allow updating draft entries
        if ($journalEntry->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Can only update draft journal entries',
            ], 400);
        }

        $request->validate([
            'date' => 'sometimes|required|date',
            'description' => 'nullable|string',
            'period' => 'sometimes|required|string',
            'items' => 'sometimes|required|array|min:2',
            'items.*.account_id' => 'required|exists:chart_of_accounts,id',
            'items.*.debit' => 'required|numeric|min:0',
            'items.*.credit' => 'required|numeric|min:0',
            'items.*.description' => 'nullable|string',
        ]);

        $data = $request->only(['date', 'description', 'period']);

        if ($request->has('items')) {
            $totalDebit = collect($request->items)->sum('debit');
            $totalCredit = collect($request->items)->sum('credit');

            if (abs($totalDebit - $totalCredit) > 0.01) {
                return response()->json([
                    'success' => false,
                    'message' => 'Journal entry must be balanced (debits must equal credits)',
                ], 400);
            }

            if ($totalDebit === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Journal entry must have at least one non-zero amount',
                ], 400);
            }

            // Delete existing items
            $journalEntry->items()->delete();

            // Create new items
            foreach ($request->items as $item) {
                $journalEntry->items()->create([
                    'account_id' => $item['account_id'],
                    'debit' => $item['debit'],
                    'credit' => $item['credit'],
                    'description' => $item['description'] ?? null,
                ]);
            }
        }

        $journalEntry->update($data);

        return response()->json([
            'success' => true,
            'data' => $journalEntry->load(['creator', 'items.account']),
            'message' => 'Journal entry updated successfully',
        ]);
    }

    /**
     * Remove the specified journal entry.
     */
    public function destroy(JournalEntry $journalEntry): JsonResponse
    {
        // Only allow deleting draft entries
        if ($journalEntry->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Can only delete draft journal entries',
            ], 400);
        }

        $journalEntry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Journal entry deleted successfully',
        ]);
    }

    /**
     * Post a journal entry.
     */
    public function post(Request $request, JournalEntry $journalEntry): JsonResponse
    {
        if ($journalEntry->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Can only post draft journal entries',
            ], 400);
        }

        if (!$journalEntry->isBalanced()) {
            return response()->json([
                'success' => false,
                'message' => 'Journal entry is not balanced',
            ], 400);
        }

        $journalEntry->post(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $journalEntry->load(['creator', 'approver', 'items.account']),
            'message' => 'Journal entry posted successfully',
        ]);
    }

    /**
     * Cancel a journal entry.
     */
    public function cancel(Request $request, JournalEntry $journalEntry): JsonResponse
    {
        if ($journalEntry->status !== 'posted') {
            return response()->json([
                'success' => false,
                'message' => 'Can only cancel posted journal entries',
            ], 400);
        }

        $journalEntry->cancel();

        return response()->json([
            'success' => true,
            'data' => $journalEntry->load(['creator', 'approver', 'items.account']),
            'message' => 'Journal entry cancelled successfully',
        ]);
    }

    /**
     * Get available chart of accounts for journal entries.
     */
    public function accounts(): JsonResponse
    {
        $accounts = ChartOfAccount::active()->orderBy('account_number')->get();

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }
}
