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
            // Get or create cash account (asset account)
            $cashAccount = ChartOfAccount::where('account_number', '1.1.1.01')->first();
            if (!$cashAccount) {
                $cashAccount = ChartOfAccount::create([
                    'account_number' => '1.1.1.01',
                    'account_name' => 'Cash in Bank',
                    'account_type' => 'asset',
                    'balance_type' => 'debit',
                    'status' => 'active',
                ]);
            }

            // Get or create expense account
            $expenseAccount = ChartOfAccount::where('account_type', 'expense')
                ->where('account_number', '5.1.1.01')
                ->first();
            if (!$expenseAccount) {
                $expenseAccount = ChartOfAccount::create([
                    'account_number' => '5.1.1.01',
                    'account_name' => 'General Expenses',
                    'account_type' => 'expense',
                    'balance_type' => 'debit',
                    'status' => 'active',
                ]);
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
            \Log::error('Failed to create journal for large cash request: ' . $e->getMessage(), ['exception' => $e]);
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
            // Get or create cash account (asset account)
            $cashAccount = ChartOfAccount::where('account_number', '1.1.1.01')->first();
            if (!$cashAccount) {
                $cashAccount = ChartOfAccount::create([
                    'account_number' => '1.1.1.01',
                    'account_name' => 'Cash in Bank',
                    'account_type' => 'asset',
                    'balance_type' => 'debit',
                    'status' => 'active',
                ]);
            }

            // Get or create expense account
            $expenseAccount = ChartOfAccount::where('account_type', 'expense')
                ->where('account_number', '5.1.1.01')
                ->first();
            if (!$expenseAccount) {
                $expenseAccount = ChartOfAccount::create([
                    'account_number' => '5.1.1.01',
                    'account_name' => 'General Expenses',
                    'account_type' => 'expense',
                    'balance_type' => 'debit',
                    'status' => 'active',
                ]);
            }

            $expenseDate = $expense->date ? \Carbon\Carbon::parse($expense->date) : now();

            $journal = JournalEntry::create([
                'journal_number' => $this->generateJournalNumber(),
                'date' => $expenseDate->toDateString(),
                'description' => 'Operational Expense Approved - ' . (optional($expense->category)->name ?? 'Expense'),
                'period' => $expenseDate->format('Y-m'),
                'status' => 'draft',
                'created_by' => $approverId,
            ]);

            $expenseAmount = (float) ($expense->amount ?? 0);

            $debitItem = JournalItem::create([
                'journal_id' => $journal->id,
                'account_id' => $expenseAccount->id,
                'debit' => $expenseAmount,
                'credit' => 0,
                'description' => 'Operational Expense: ' . ($expense->description ?? ''),
            ]);

            $creditItem = JournalItem::create([
                'journal_id' => $journal->id,
                'account_id' => $cashAccount->id,
                'debit' => 0,
                'credit' => $expenseAmount,
                'description' => 'Operational Expense: ' . ($expense->description ?? ''),
            ]);

            // Post the journal
            $journal->post($approverId);

            DB::commit();
            return $journal;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to create journal for operational expense: ' . $e->getMessage(), ['exception' => $e]);
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

            if (!$account) {
                continue;
            }

            $balanceQuery = DB::table('account_balances')->where('account_id', $account->id)->where('period', $period);
            $balance = $balanceQuery->first();

            if (!$balance) {
                $previousPeriod = \Carbon\Carbon::parse($period . '-01')->subMonth()->format('Y-m');
                $previousBalance = DB::table('account_balances')
                    ->where('account_id', $account->id)
                    ->where('period', $previousPeriod)
                    ->first();

                $openingBalance = $previousBalance ? (float) $previousBalance->closing_balance : 0;

                $balanceId = DB::table('account_balances')->insertGetId([
                    'account_id' => $account->id,
                    'period' => $period,
                    'opening_balance' => $openingBalance,
                    'closing_balance' => $openingBalance,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $balance = (object) [
                    'id' => $balanceId,
                    'account_id' => $account->id,
                    'period' => $period,
                    'opening_balance' => $openingBalance,
                    'closing_balance' => $openingBalance,
                ];
            }

            $debit = (float) ($item->debit ?? 0);
            $credit = (float) ($item->credit ?? 0);
            $newClosingBalance = (float) $balance->closing_balance;

            if ($account->balance_type === 'debit') {
                $newClosingBalance += $debit - $credit;
            } else {
                $newClosingBalance += $credit - $debit;
            }

            DB::table('account_balances')
                ->where('id', $balance->id)
                ->update([
                    'closing_balance' => $newClosingBalance,
                    'updated_at' => now(),
                ]);
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
