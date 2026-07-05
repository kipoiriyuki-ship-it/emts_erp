<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\JournalItem;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AccountingController extends Controller
{
    /**
     * Display a listing of chart of accounts.
     */
    public function coaIndex(Request $request): JsonResponse
    {
        $query = ChartOfAccount::with(['parent', 'children']);

        if ($request->has('type')) {
            $query->where('account_type', $request->type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $accounts = $query->orderBy('account_number')->get();

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }

    /**
     * Store chart of account.
     */
    public function coaStore(Request $request): JsonResponse
    {
        $request->validate([
            'account_number' => 'required|string|unique:chart_of_accounts,account_number',
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,revenue,expense',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'balance_type' => 'required|in:debit,credit',
        ]);

        $account = ChartOfAccount::create([
            'account_number' => $request->account_number,
            'account_name' => $request->account_name,
            'account_type' => $request->account_type,
            'parent_id' => $request->parent_id,
            'level' => $request->parent_id ? ChartOfAccount::find($request->parent_id)->level + 1 : 1,
            'balance_type' => $request->balance_type,
        ]);

        return response()->json([
            'success' => true,
            'data' => $account,
            'message' => 'Account created successfully',
        ], 201);
    }

    /**
     * Display chart of account.
     */
    public function coaShow(ChartOfAccount $account): JsonResponse
    {
        $account->load(['parent', 'children']);

        return response()->json([
            'success' => true,
            'data' => $account,
        ]);
    }

    /**
     * Update chart of account.
     */
    public function coaUpdate(Request $request, ChartOfAccount $account): JsonResponse
    {
        $request->validate([
            'account_name' => 'sometimes|required|string|max:255',
            'is_active' => 'sometimes|required|boolean',
        ]);

        $account->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $account,
            'message' => 'Account updated successfully',
        ]);
    }

    /**
     * Delete chart of account.
     */
    public function coaDestroy(ChartOfAccount $account): JsonResponse
    {
        if ($account->children()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete account with child accounts',
            ], 400);
        }

        $account->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully',
        ]);
    }

    /**
     * Display a listing of journal entries.
     */
    public function journalIndex(Request $request): JsonResponse
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

        $journals = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $journals,
        ]);
    }

    /**
     * Store journal entry.
     */
    public function journalStore(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'description' => 'nullable|string',
            'items' => 'required|array|min:2',
            'items.*.account_id' => 'required|exists:chart_of_accounts,id',
            'items.*.debit' => 'required|numeric|min:0',
            'items.*.credit' => 'required|numeric|min:0',
        ]);

        // Validate balance
        $totalDebit = collect($request->items)->sum('debit');
        $totalCredit = collect($request->items)->sum('credit');

        if ($totalDebit !== $totalCredit) {
            return response()->json([
                'success' => false,
                'message' => 'Journal must be balanced (debit = credit)',
            ], 400);
        }

        $journal = JournalEntry::create([
            'journal_number' => $this->generateJournalNumber(),
            'date' => $request->date,
            'description' => $request->description,
            'period' => \Carbon\Carbon::parse($request->date)->format('Y-m'),
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        foreach ($request->items as $item) {
            JournalItem::create([
                'journal_id' => $journal->id,
                'account_id' => $item['account_id'],
                'debit' => $item['debit'],
                'credit' => $item['credit'],
                'description' => $item['description'] ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $journal->load('items.account'),
            'message' => 'Journal entry created successfully',
        ], 201);
    }

    /**
     * Display journal entry.
     */
    public function journalShow(JournalEntry $journal): JsonResponse
    {
        $journal->load(['creator', 'approver', 'items.account']);

        return response()->json([
            'success' => true,
            'data' => $journal,
        ]);
    }

    /**
     * Update journal entry.
     */
    public function journalUpdate(Request $request, JournalEntry $journal): JsonResponse
    {
        if ($journal->status === 'posted') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit posted journal',
            ], 400);
        }

        $request->validate([
            'date' => 'sometimes|required|date',
            'description' => 'nullable|string',
        ]);

        $journal->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $journal,
            'message' => 'Journal updated successfully',
        ]);
    }

    /**
     * Post journal entry.
     */
    public function postJournal(Request $request, JournalEntry $journal): JsonResponse
    {
        try {
            $oldStatus = $journal->status;
            $journal->post(auth()->id());

            // Audit log
            \App\Models\AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'POST',
                'module' => 'Accounting',
                'description' => "Posted Journal Entry #{$journal->journal_number}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'old_values' => ['status' => $oldStatus],
                'new_values' => ['status' => 'posted', 'approved_by' => auth()->id()],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Journal posted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Delete journal entry.
     */
    public function journalDestroy(JournalEntry $journal): JsonResponse
    {
        if ($journal->status === 'posted') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete posted journal',
            ], 400);
        }

        $journal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Journal deleted successfully',
        ]);
    }

    /**
     * Get ledger entries.
     */
    public function ledger(Request $request): JsonResponse
    {
        $request->validate([
            'account_id' => 'required|exists:chart_of_accounts,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $query = LedgerEntry::with('journalItem.journal')
            ->where('account_id', $request->account_id);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $entries = $query->orderBy('date')->get();

        return response()->json([
            'success' => true,
            'data' => $entries,
        ]);
    }

    /**
     * Generate unique journal number.
     */
    protected function generateJournalNumber(): string
    {
        $prefix = 'JNL';
        $year = now()->format('Y');
        $month = now()->format('m');
        $sequence = JournalEntry::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;

        return sprintf('%s%s%s%04d', $prefix, $year, $month, $sequence);
    }
}
