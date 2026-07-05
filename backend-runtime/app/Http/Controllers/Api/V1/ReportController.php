<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use App\Models\ChartOfAccount;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ProfitLossExport;
use App\Exports\BalanceSheetExport;
use App\Exports\CashFlowExport;
use App\Exports\GeneralLedgerExport;

class ReportController extends Controller
{
    /**
     * Generate cash flow report.
     */
    public function cashFlow(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        // Get cash inflows
        $inflows = JournalEntry::whereBetween('date', [$startDate, $endDate])
            ->where('status', 'posted')
            ->whereHas('items', function ($query) {
                $query->whereHas('account', function ($q) {
                    $q->where('account_type', 'asset')
                      ->where('account_number', 'like', '1.1.1%');
                });
            })
            ->with('items.account')
            ->get();

        // Get cash outflows
        $outflows = JournalEntry::whereBetween('date', [$startDate, $endDate])
            ->where('status', 'posted')
            ->whereHas('items', function ($query) {
                $query->whereHas('account', function ($q) {
                    $q->where('account_type', 'expense');
                });
            })
            ->with('items.account')
            ->get();

        $totalInflow = $inflows->sum(function ($journal) {
            return $journal->items->sum('debit');
        });

        $totalOutflow = $outflows->sum(function ($journal) {
            return $journal->items->sum('debit');
        });

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
                'summary' => [
                    'total_inflow' => $totalInflow,
                    'total_outflow' => $totalOutflow,
                    'net_cash_flow' => $totalInflow - $totalOutflow,
                ],
                'inflows' => $inflows,
                'outflows' => $outflows,
            ],
        ]);
    }

    /**
     * Generate profit and loss report.
     */
    public function profitLoss(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        // Get revenue
        $revenue = JournalEntry::whereBetween('date', [$startDate, $endDate])
            ->where('status', 'posted')
            ->whereHas('items', function ($query) {
                $query->whereHas('account', function ($q) {
                    $q->where('account_type', 'revenue');
                });
            })
            ->with('items.account')
            ->get();

        // Get expenses
        $expenses = JournalEntry::whereBetween('date', [$startDate, $endDate])
            ->where('status', 'posted')
            ->whereHas('items', function ($query) {
                $query->whereHas('account', function ($q) {
                    $q->where('account_type', 'expense');
                });
            })
            ->with('items.account')
            ->get();

        $totalRevenue = $revenue->sum(function ($journal) {
            return $journal->items->sum('credit');
        });

        $totalExpenses = $expenses->sum(function ($journal) {
            return $journal->items->sum('debit');
        });

        $netProfit = $totalRevenue - $totalExpenses;

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
                'summary' => [
                    'total_revenue' => $totalRevenue,
                    'total_expenses' => $totalExpenses,
                    'net_profit' => $netProfit,
                    'profit_margin' => $totalRevenue > 0 ? ($netProfit / $totalRevenue) * 100 : 0,
                ],
                'revenue' => $revenue,
                'expenses' => $expenses,
            ],
        ]);
    }

    /**
     * Generate balance sheet report from ledger entries.
     */
    public function balanceSheet(Request $request): JsonResponse
    {
        $request->validate([
            'as_of_date' => 'required|date',
        ]);

        $asOfDate = $request->as_of_date;

        // Get assets from ledger entries
        $assetAccounts = ChartOfAccount::where('account_type', 'asset')
            ->where('is_active', true)
            ->get();

        $totalAssets = 0;
        $assets = $assetAccounts->map(function ($account) use ($asOfDate, &$totalAssets) {
            $balance = $this->calculateAccountBalanceFromLedger($account->id, $asOfDate);
            $totalAssets += $balance;
            return [
                'id' => $account->id,
                'account_number' => $account->account_number,
                'account_name' => $account->account_name,
                'balance' => $balance,
            ];
        });

        // Get liabilities from ledger entries
        $liabilityAccounts = ChartOfAccount::where('account_type', 'liability')
            ->where('is_active', true)
            ->get();

        $totalLiabilities = 0;
        $liabilities = $liabilityAccounts->map(function ($account) use ($asOfDate, &$totalLiabilities) {
            $balance = $this->calculateAccountBalanceFromLedger($account->id, $asOfDate);
            $totalLiabilities += $balance;
            return [
                'id' => $account->id,
                'account_number' => $account->account_number,
                'account_name' => $account->account_name,
                'balance' => $balance,
            ];
        });

        // Get equity from ledger entries
        $equityAccounts = ChartOfAccount::where('account_type', 'equity')
            ->where('is_active', true)
            ->get();

        $totalEquity = 0;
        $equity = $equityAccounts->map(function ($account) use ($asOfDate, &$totalEquity) {
            $balance = $this->calculateAccountBalanceFromLedger($account->id, $asOfDate);
            $totalEquity += $balance;
            return [
                'id' => $account->id,
                'account_number' => $account->account_number,
                'account_name' => $account->account_name,
                'balance' => $balance,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'as_of_date' => $asOfDate,
                'summary' => [
                    'total_assets' => $totalAssets,
                    'total_liabilities' => $totalLiabilities,
                    'total_equity' => $totalEquity,
                    'total_liabilities_equity' => $totalLiabilities + $totalEquity,
                ],
                'assets' => $assets,
                'liabilities' => $liabilities,
                'equity' => $equity,
            ],
        ]);
    }

    /**
     * Calculate account balance from ledger entries.
     */
    private function calculateAccountBalanceFromLedger($accountId, $asOfDate)
    {
        $account = ChartOfAccount::find($accountId);
        if (!$account) {
            return 0;
        }

        $ledgerEntries = \App\Models\LedgerEntry::where('account_id', $accountId)
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
     * Generate journal report.
     */
    public function journal(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $journals = JournalEntry::whereBetween('date', [$request->start_date, $request->end_date])
            ->where('status', 'posted')
            ->with(['creator', 'approver', 'items.account'])
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                ],
                'journals' => $journals,
            ],
        ]);
    }

    /**
     * Generate trial balance report.
     */
    public function trialBalance(Request $request): JsonResponse
    {
        $request->validate([
            'as_of_date' => 'required|date',
        ]);

        $asOfDate = $request->as_of_date;
        $accounts = ChartOfAccount::where('is_active', true)->get();

        $trialBalance = [];
        $totalDebits = 0;
        $totalCredits = 0;

        foreach ($accounts as $account) {
            $balance = $this->calculateAccountBalanceFromLedger($account->id, $asOfDate);

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

        return response()->json([
            'success' => true,
            'data' => [
                'as_of_date' => $asOfDate,
                'accounts' => $trialBalance,
                'total_debits' => $totalDebits,
                'total_credits' => $totalCredits,
                'is_balanced' => abs($totalDebits - $totalCredits) < 0.01,
            ],
        ]);
    }

    /**
     * Generate budget vs actual report.
     */
    public function budgetVsActual(Request $request): JsonResponse
    {
        $request->validate([
            'budget_id' => 'required|exists:budgets,id',
        ]);

        $budget = \App\Models\Budget::with('details.account')->findOrFail($request->budget_id);

        $budgetDetails = $budget->details->map(function ($detail) {
            $actualAmount = $this->calculateActualForAccount(
                $detail->account_id,
                $budget->start_date,
                $budget->end_date
            );

            $variance = $detail->planned_amount - $actualAmount;
            $varianceType = $variance >= 0 ? 'favorable' : 'unfavorable';
            $variancePercent = $detail->planned_amount > 0
                ? ($variance / $detail->planned_amount) * 100
                : 0;

            return [
                'account_number' => $detail->account->account_number,
                'account_name' => $detail->account->account_name,
                'planned_amount' => $detail->planned_amount,
                'actual_amount' => $actualAmount,
                'variance' => $variance,
                'variance_type' => $varianceType,
                'variance_percent' => $variancePercent,
            ];
        });

        $totalPlanned = $budget->details->sum('planned_amount');
        $totalActual = $budgetDetails->sum('actual_amount');
        $totalVariance = $totalPlanned - $totalActual;

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
                    'total_planned' => $totalPlanned,
                    'total_actual' => $totalActual,
                    'total_variance' => $totalVariance,
                ],
                'details' => $budgetDetails,
            ],
        ]);
    }

    /**
     * Generate fixed assets report.
     */
    public function fixedAssets(Request $request): JsonResponse
    {
        $request->validate([
            'as_of_date' => 'required|date',
        ]);

        $asOfDate = $request->as_of_date;
        $fixedAssets = \App\Models\FixedAsset::with(['category', 'depreciations'])
            ->where('status', 'active')
            ->get();

        $assetsReport = $fixedAssets->map(function ($asset) use ($asOfDate) {
            $accumulatedDepreciation = $asset->depreciations
                ->where('depreciation_date', '<=', $asOfDate)
                ->sum('depreciation_amount');

            $netBookValue = $asset->purchase_cost - $accumulatedDepreciation;

            return [
                'asset_number' => $asset->asset_number,
                'name' => $asset->name,
                'category' => $asset->category->name ?? null,
                'purchase_date' => $asset->purchase_date,
                'purchase_cost' => $asset->purchase_cost,
                'salvage_value' => $asset->salvage_value,
                'useful_life_years' => $asset->useful_life_years,
                'depreciation_method' => $asset->depreciation_method,
                'accumulated_depreciation' => $accumulatedDepreciation,
                'net_book_value' => $netBookValue,
                'status' => $asset->status,
            ];
        });

        $totalPurchaseCost = $assetsReport->sum('purchase_cost');
        $totalAccumulatedDepreciation = $assetsReport->sum('accumulated_depreciation');
        $totalNetBookValue = $assetsReport->sum('net_book_value');

        return response()->json([
            'success' => true,
            'data' => [
                'as_of_date' => $asOfDate,
                'summary' => [
                    'total_assets' => $assetsReport->count(),
                    'total_purchase_cost' => $totalPurchaseCost,
                    'total_accumulated_depreciation' => $totalAccumulatedDepreciation,
                    'total_net_book_value' => $totalNetBookValue,
                ],
                'assets' => $assetsReport,
            ],
        ]);
    }

    /**
     * Calculate actual amount for account within period.
     */
    private function calculateActualForAccount($accountId, $startDate, $endDate): float
    {
        $account = ChartOfAccount::find($accountId);
        if (!$account) return 0;

        $ledgerEntries = \App\Models\LedgerEntry::where('account_id', $accountId)
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
     * Export profit and loss report to PDF.
     */
    public function profitLossPdf(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        $response = $this->profitLoss($request);
        $data = json_decode($response->getContent(), true)['data'];

        $pdf = Pdf::loadView('reports.profit_loss_pdf', [
            'data' => $data,
            'company_name' => config('app.name', 'ElynPro Finance'),
            'print_date' => now()->format('d F Y H:i'),
        ]);

        return $pdf->download('profit_loss_' . $startDate . '_to_' . $endDate . '.pdf');
    }

    /**
     * Export balance sheet report to PDF.
     */
    public function balanceSheetPdf(Request $request)
    {
        $request->validate([
            'as_of_date' => 'required|date',
        ]);

        $response = $this->balanceSheet($request);
        $data = json_decode($response->getContent(), true)['data'];

        $pdf = Pdf::loadView('reports.balance_sheet_pdf', [
            'data' => $data,
            'company_name' => config('app.name', 'ElynPro Finance'),
            'print_date' => now()->format('d F Y H:i'),
        ]);

        return $pdf->download('balance_sheet_' . $request->as_of_date . '.pdf');
    }

    /**
     * Export cash flow report to PDF.
     */
    public function cashFlowPdf(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $response = $this->cashFlow($request);
        $data = json_decode($response->getContent(), true)['data'];

        $pdf = Pdf::loadView('reports.cash_flow_pdf', [
            'data' => $data,
            'company_name' => config('app.name', 'ElynPro Finance'),
            'print_date' => now()->format('d F Y H:i'),
        ]);

        return $pdf->download('cash_flow_' . $request->start_date . '_to_' . $request->end_date . '.pdf');
    }

    /**
     * Export profit and loss report to Excel.
     */
    public function profitLossExcel(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $response = $this->profitLoss($request);
        $data = json_decode($response->getContent(), true)['data'];

        return Excel::download(
            new ProfitLossExport($data),
            'profit_loss_' . $request->start_date . '_to_' . $request->end_date . '.xlsx'
        );
    }

    /**
     * Export balance sheet report to Excel.
     */
    public function balanceSheetExcel(Request $request)
    {
        $request->validate([
            'as_of_date' => 'required|date',
        ]);

        $response = $this->balanceSheet($request);
        $data = json_decode($response->getContent(), true)['data'];

        return Excel::download(
            new BalanceSheetExport($data),
            'balance_sheet_' . $request->as_of_date . '.xlsx'
        );
    }

    /**
     * Export cash flow report to Excel.
     */
    public function cashFlowExcel(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $response = $this->cashFlow($request);
        $data = json_decode($response->getContent(), true)['data'];

        return Excel::download(
            new CashFlowExport($data),
            'cash_flow_' . $request->start_date . '_to_' . $request->end_date . '.xlsx'
        );
    }

    /**
     * Export general ledger report to Excel.
     */
    public function generalLedgerExcel(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $response = $this->journal($request);
        $data = json_decode($response->getContent(), true)['data'];

        return Excel::download(
            new GeneralLedgerExport($data),
            'general_ledger_' . $request->start_date . '_to_' . $request->end_date . '.xlsx'
        );
    }
}
