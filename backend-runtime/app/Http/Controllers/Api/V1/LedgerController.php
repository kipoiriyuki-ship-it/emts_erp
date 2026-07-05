<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LedgerEntry;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LedgerController extends Controller
{
    /**
     * Display a listing of ledger entries.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LedgerEntry::with(['account', 'journalItem.journal']);

        if ($request->has('account_id')) {
            $query->where('account_id', $request->account_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $entries = $query->orderBy('date')->orderBy('id')->paginate($request->per_page ?? 50);

        // Calculate running balance
        $entries->getCollection()->transform(function ($entry) {
            $entry->balance = $this->calculateBalance($entry);
            return $entry;
        });

        return response()->json([
            'success' => true,
            'data' => $entries,
        ]);
    }

    /**
     * Display the specified ledger entry.
     */
    public function show(LedgerEntry $ledgerEntry): JsonResponse
    {
        $ledgerEntry->load(['account', 'journalItem.journal']);

        return response()->json([
            'success' => true,
            'data' => $ledgerEntry,
        ]);
    }

    /**
     * Get ledger for a specific account.
     */
    public function accountLedger(Request $request, $accountId): JsonResponse
    {
        $account = ChartOfAccount::findOrFail($accountId);
        
        $query = LedgerEntry::with(['journalItem.journal'])
            ->where('account_id', $accountId);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $entries = $query->orderBy('date')->orderBy('id')->get();

        // Calculate running balance
        $runningBalance = 0;
        $entries->transform(function ($entry) use (&$runningBalance, $account) {
            if ($account->balance_type === 'debit') {
                $runningBalance += $entry->debit - $entry->credit;
            } else {
                $runningBalance += $entry->credit - $entry->debit;
            }
            $entry->balance = $runningBalance;
            return $entry;
        });

        // Get opening balance
        $openingBalance = 0;
        if ($request->has('start_date')) {
            $openingEntries = LedgerEntry::where('account_id', $accountId)
                ->where('date', '<', $request->start_date)
                ->get();
            
            foreach ($openingEntries as $entry) {
                if ($account->balance_type === 'debit') {
                    $openingBalance += $entry->debit - $entry->credit;
                } else {
                    $openingBalance += $entry->credit - $entry->debit;
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'account' => $account,
                'opening_balance' => $openingBalance,
                'entries' => $entries,
                'closing_balance' => $runningBalance,
            ],
        ]);
    }

    /**
     * Calculate balance for a single entry.
     */
    private function calculateBalance($entry)
    {
        $account = $entry->account;
        if (!$account) {
            return 0;
        }

        $previousEntries = LedgerEntry::where('account_id', $entry->account_id)
            ->where(function ($query) use ($entry) {
                $query->where('date', '<', $entry->date)
                    ->orWhere(function ($q) use ($entry) {
                        $q->where('date', '=', $entry->date)
                          ->where('id', '<', $entry->id);
                    });
            })
            ->get();

        $balance = 0;
        foreach ($previousEntries as $prev) {
            if ($account->balance_type === 'debit') {
                $balance += $prev->debit - $prev->credit;
            } else {
                $balance += $prev->credit - $prev->debit;
            }
        }

        if ($account->balance_type === 'debit') {
            $balance += $entry->debit - $entry->credit;
        } else {
            $balance += $entry->credit - $entry->debit;
        }

        return $balance;
    }

    /**
     * Get available accounts for ledger view.
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
