<?php

namespace App\Services;

use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\JournalItem;
use App\Models\LedgerEntry;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    /**
     * Create journal entry with items.
     */
    public function createJournal(array $data): JournalEntry
    {
        DB::beginTransaction();
        try {
            $journal = JournalEntry::create([
                'journal_number' => $this->generateJournalNumber(),
                'date' => $data['date'],
                'description' => $data['description'],
                'period' => \Carbon\Carbon::parse($data['date'])->format('Y-m'),
                'status' => 'draft',
                'created_by' => auth()->id(),
            ]);

            foreach ($data['items'] as $item) {
                JournalItem::create([
                    'journal_id' => $journal->id,
                    'account_id' => $item['account_id'],
                    'debit' => $item['debit'] ?? 0,
                    'credit' => $item['credit'] ?? 0,
                    'description' => $item['description'] ?? null,
                ]);
            }

            DB::commit();
            return $journal;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Post journal entry and generate ledger entries.
     */
    public function postJournal(JournalEntry $journal): void
    {
        if (!$journal->isBalanced()) {
            throw new \Exception('Journal entry is not balanced');
        }

        DB::beginTransaction();
        try {
            $journal->update([
                'status' => 'posted',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            // Create ledger entries
            foreach ($journal->items as $item) {
                LedgerEntry::create([
                    'account_id' => $item->account_id,
                    'journal_item_id' => $item->id,
                    'date' => $journal->date,
                    'debit' => $item->debit,
                    'credit' => $item->credit,
                    'description' => $item->description,
                ]);
            }

            // Update account balances
            $this->updateAccountBalances($journal);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Reverse (cancel) posted journal entry.
     */
    public function reverseJournal(JournalEntry $journal, string $reason): JournalEntry
    {
        if ($journal->status !== 'posted') {
            throw new \Exception('Can only reverse posted journals');
        }

        DB::beginTransaction();
        try {
            // Create reversing journal
            $reversingJournal = JournalEntry::create([
                'journal_number' => $this->generateJournalNumber(),
                'date' => now()->toDateString(),
                'description' => "Reversal of Journal #{$journal->journal_number}: {$reason}",
                'period' => now()->format('Y-m'),
                'status' => 'posted',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'created_by' => auth()->id(),
            ]);

            // Create reversing items (swap debit/credit)
            foreach ($journal->items as $item) {
                JournalItem::create([
                    'journal_id' => $reversingJournal->id,
                    'account_id' => $item->account_id,
                    'debit' => $item->credit,
                    'credit' => $item->debit,
                    'description' => "Reversal: {$item->description}",
                ]);
            }

            // Create ledger entries for reversal
            foreach ($reversingJournal->items as $item) {
                LedgerEntry::create([
                    'account_id' => $item->account_id,
                    'journal_item_id' => $item->id,
                    'date' => $reversingJournal->date,
                    'debit' => $item->debit,
                    'credit' => $item->credit,
                    'description' => $item->description,
                ]);
            }

            // Update account balances
            $this->updateAccountBalances($reversingJournal);

            // Mark original as reversed
            $journal->update(['status' => 'reversed']);

            DB::commit();
            return $reversingJournal;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Calculate trial balance.
     */
    public function calculateTrialBalance(string $asOfDate): array
    {
        $accounts = ChartOfAccount::where('is_active', true)->get();

        $trialBalance = [];
        $totalDebits = 0;
        $totalCredits = 0;

        foreach ($accounts as $account) {
            $balance = $this->calculateAccountBalance($account->id, $asOfDate);

            if ($balance != 0) {
                $debitAmount = $account->balance_type === 'debit' && $balance > 0 ? $balance : 0;
                $creditAmount = $account->balance_type === 'credit' && $balance > 0 ? $balance : 0;

                // For debit accounts with negative balance, show as credit
                if ($account->balance_type === 'debit' && $balance < 0) {
                    $creditAmount = abs($balance);
                    $debitAmount = 0;
                }

                // For credit accounts with negative balance, show as debit
                if ($account->balance_type === 'credit' && $balance < 0) {
                    $debitAmount = abs($balance);
                    $creditAmount = 0;
                }

                $trialBalance[] = [
                    'account_number' => $account->account_number,
                    'account_name' => $account->account_name,
                    'account_type' => $account->account_type,
                    'debit' => $debitAmount,
                    'credit' => $creditAmount,
                ];

                $totalDebits += $debitAmount;
                $totalCredits += $creditAmount;
            }
        }

        return [
            'as_of_date' => $asOfDate,
            'accounts' => $trialBalance,
            'total_debits' => $totalDebits,
            'total_credits' => $totalCredits,
            'is_balanced' => abs($totalDebits - $totalCredits) < 0.01,
        ];
    }

    /**
     * Calculate profit and loss statement.
     */
    public function calculateProfitLoss(string $startDate, string $endDate): array
    {
        $revenueAccounts = ChartOfAccount::where('account_type', 'revenue')
            ->where('is_active', true)
            ->get();

        $expenseAccounts = ChartOfAccount::where('account_type', 'expense')
            ->where('is_active', true)
            ->get();

        $totalRevenue = 0;
        $revenues = [];

        foreach ($revenueAccounts as $account) {
            $balance = $this->calculateAccountBalanceForPeriod($account->id, $startDate, $endDate);
            if ($balance > 0) {
                $revenues[] = [
                    'account_number' => $account->account_number,
                    'account_name' => $account->account_name,
                    'amount' => $balance,
                ];
                $totalRevenue += $balance;
            }
        }

        $totalExpense = 0;
        $expenses = [];

        foreach ($expenseAccounts as $account) {
            $balance = $this->calculateAccountBalanceForPeriod($account->id, $startDate, $endDate);
            if ($balance > 0) {
                $expenses[] = [
                    'account_number' => $account->account_number,
                    'account_name' => $account->account_name,
                    'amount' => $balance,
                ];
                $totalExpense += $balance;
            }
        }

        $grossProfit = $totalRevenue - $totalExpense;
        $netProfit = $grossProfit; // Can add other income/expense categories later

        return [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'revenue' => [
                'items' => $revenues,
                'total' => $totalRevenue,
            ],
            'expenses' => [
                'items' => $expenses,
                'total' => $totalExpense,
            ],
            'gross_profit' => $grossProfit,
            'net_profit' => $netProfit,
            'profit_margin' => $totalRevenue > 0 ? ($netProfit / $totalRevenue) * 100 : 0,
        ];
    }

    /**
     * Calculate balance sheet.
     */
    public function calculateBalanceSheet(string $asOfDate): array
    {
        $assetAccounts = ChartOfAccount::where('account_type', 'asset')
            ->where('is_active', true)
            ->get();

        $liabilityAccounts = ChartOfAccount::where('account_type', 'liability')
            ->where('is_active', true)
            ->get();

        $equityAccounts = ChartOfAccount::where('account_type', 'equity')
            ->where('is_active', true)
            ->get();

        $totalAssets = 0;
        $assets = [];

        foreach ($assetAccounts as $account) {
            $balance = $this->calculateAccountBalance($account->id, $asOfDate);
            $assets[] = [
                'account_number' => $account->account_number,
                'account_name' => $account->account_name,
                'balance' => $balance,
            ];
            $totalAssets += $balance;
        }

        $totalLiabilities = 0;
        $liabilities = [];

        foreach ($liabilityAccounts as $account) {
            $balance = $this->calculateAccountBalance($account->id, $asOfDate);
            $liabilities[] = [
                'account_number' => $account->account_number,
                'account_name' => $account->account_name,
                'balance' => $balance,
            ];
            $totalLiabilities += $balance;
        }

        $totalEquity = 0;
        $equity = [];

        foreach ($equityAccounts as $account) {
            $balance = $this->calculateAccountBalance($account->id, $asOfDate);
            $equity[] = [
                'account_number' => $account->account_number,
                'account_name' => $account->account_name,
                'balance' => $balance,
            ];
            $totalEquity += $balance;
        }

        return [
            'as_of_date' => $asOfDate,
            'assets' => [
                'items' => $assets,
                'total' => $totalAssets,
            ],
            'liabilities' => [
                'items' => $liabilities,
                'total' => $totalLiabilities,
            ],
            'equity' => [
                'items' => $equity,
                'total' => $totalEquity,
            ],
            'total_liabilities_equity' => $totalLiabilities + $totalEquity,
            'is_balanced' => abs($totalAssets - ($totalLiabilities + $totalEquity)) < 0.01,
        ];
    }

    /**
     * Update account balances from journal.
     */
    protected function updateAccountBalances(JournalEntry $journal): void
    {
        foreach ($journal->items as $item) {
            $account = $item->account;
            $period = $journal->period;

            $balance = $account->balances()->where('period', $period)->first();

            if (!$balance) {
                $previousPeriod = \Carbon\Carbon::parse($period . '-01')->subMonth()->format('Y-m');
                $previousBalance = $account->balances()->where('period', $previousPeriod)->first();
                $openingBalance = $previousBalance ? $previousBalance->closing_balance : 0;

                $balance = $account->balances()->create([
                    'period' => $period,
                    'opening_balance' => $openingBalance,
                    'closing_balance' => $openingBalance,
                ]);
            }

            if ($account->balance_type === 'debit') {
                $balance->closing_balance += $item->debit - $item->credit;
            } else {
                $balance->closing_balance += $item->credit - $item->debit;
            }

            $balance->save();
        }
    }

    /**
     * Calculate account balance as of date.
     */
    protected function calculateAccountBalance(int $accountId, string $asOfDate): float
    {
        $account = ChartOfAccount::find($accountId);
        if (!$account) return 0;

        $ledgerEntries = LedgerEntry::where('account_id', $accountId)
            ->where('date', '<=', $asOfDate)
            ->get();

        $balance = 0;
        foreach ($ledgerEntries as $entry) {
            if ($account->balance_type === 'debit') {
                $balance += $entry->debit - $entry->credit;
            } else {
                $balance += $entry->credit - $entry->debit;
            }
        }

        return $balance;
    }

    /**
     * Calculate account balance for a specific period.
     */
    protected function calculateAccountBalanceForPeriod(int $accountId, string $startDate, string $endDate): float
    {
        $account = ChartOfAccount::find($accountId);
        if (!$account) return 0;

        $ledgerEntries = LedgerEntry::where('account_id', $accountId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $balance = 0;
        foreach ($ledgerEntries as $entry) {
            if ($account->balance_type === 'debit') {
                $balance += $entry->debit - $entry->credit;
            } else {
                $balance += $entry->credit - $entry->debit;
            }
        }

        return abs($balance);
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
