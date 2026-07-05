<?php

namespace App\Services;

use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\JournalItem;
use App\Models\LedgerEntry;
use Illuminate\Support\Facades\DB;

class JournalService
{
    /**
     * Create journal entry for large cash request approval
     */
    public function createForLargeCashRequest($request, $approverId)
    {
        DB::beginTransaction();
        try {
            // Get cash account (asset account)
            $cashAccount = ChartOfAccount::where('account_number', '1.1.1.01')->first();
            // Get expense account
            $expenseAccount = ChartOfAccount::where('account_type', 'expense')->first();

            if (!$cashAccount || !$expenseAccount) {
                throw new \Exception('Required accounts not found');
            }

            $journal = JournalEntry::create([
                'journal_number' => $this->generateJournalNumber(),
                'date' => now()->toDateString(),
                'description' => 'Large Cash Request Approved - ' . $request->request_number,
                'period' => now()->format('Y-m'),
                'status' => 'draft',
                'created_by' => $approverId,
            ]);

            // Debit expense account
            JournalItem::create([
                'journal_id' => $journal->id,
                'account_id' => $expenseAccount->id,
                'debit' => $request->total_amount,
                'credit' => 0,
                'description' => 'Large Cash Request: ' . $request->description,
            ]);

            // Credit cash account
            JournalItem::create([
                'journal_id' => $journal->id,
                'account_id' => $cashAccount->id,
                'debit' => 0,
                'credit' => $request->total_amount,
                'description' => 'Large Cash Request: ' . $request->description,
            ]);

            // Post the journal
            $journal->post($approverId);

            DB::commit();
            return $journal;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Create journal entry for operational expense approval
     */
    public function createForOperationalExpense($expense, $approverId)
    {
        DB::beginTransaction();
        try {
            // Get cash account (asset account)
            $cashAccount = ChartOfAccount::where('account_number', '1.1.1.01')->first();
            // Get expense account
            $expenseAccount = ChartOfAccount::where('account_type', 'expense')->first();

            if (!$cashAccount || !$expenseAccount) {
                throw new \Exception('Required accounts not found');
            }

            $journal = JournalEntry::create([
                'journal_number' => $this->generateJournalNumber(),
                'date' => $expense->date,
                'description' => 'Operational Expense Approved - ' . $expense->category->name ?? 'Expense',
                'period' => \Carbon\Carbon::parse($expense->date)->format('Y-m'),
                'status' => 'draft',
                'created_by' => $approverId,
            ]);

            // Debit expense account
            JournalItem::create([
                'journal_id' => $journal->id,
                'account_id' => $expenseAccount->id,
                'debit' => $expense->amount,
                'credit' => 0,
                'description' => 'Operational Expense: ' . $expense->description,
            ]);

            // Credit cash account
            JournalItem::create([
                'journal_id' => $journal->id,
                'account_id' => $cashAccount->id,
                'debit' => 0,
                'credit' => $expense->amount,
                'description' => 'Operational Expense: ' . $expense->description,
            ]);

            // Post the journal
            $journal->post($approverId);

            DB::commit();
            return $journal;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update account balances from ledger entries
     */
    public function updateAccountBalances($journal)
    {
        foreach ($journal->items as $item) {
            $account = $item->account;
            $period = $journal->period;

            // Get or create account balance
            $balance = $account->balances()->where('period', $period)->first();

            if (!$balance) {
                // Get previous period balance
                $previousPeriod = \Carbon\Carbon::parse($period . '-01')->subMonth()->format('Y-m');
                $previousBalance = $account->balances()->where('period', $previousPeriod)->first();
                $openingBalance = $previousBalance ? $previousBalance->closing_balance : 0;

                $balance = $account->balances()->create([
                    'period' => $period,
                    'opening_balance' => $openingBalance,
                    'closing_balance' => $openingBalance,
                ]);
            }

            // Update balance based on account type
            if ($account->balance_type === 'debit') {
                $balance->closing_balance += $item->debit - $item->credit;
            } else {
                $balance->closing_balance += $item->credit - $item->debit;
            }

            $balance->save();
        }
    }

    /**
     * Generate unique journal number
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
