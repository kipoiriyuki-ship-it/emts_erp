<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use App\Models\Attendance;
use App\Models\OperationalExpense;
use App\Models\LargeCashRequest;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get dashboard data based on user role.
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $role = $user->role->code;

        $data = match($role) {
            'DIRECTOR' => $this->directorDashboard(),
            'ACCOUNTING' => $this->accountingDashboard(),
            'ADMIN' => $this->administrationDashboard(),
            'PROJECT_MANAGER' => $this->projectManagerDashboard($user),
            'EMPLOYEE' => $this->employeeDashboard($user),
            default => [],
        };

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Director dashboard data.
     */
    protected function directorDashboard(): array
    {
        $monthlyRevenue = $this->getMonthlyRevenue();
        $monthlyExpense = $this->getMonthlyExpense();

        return [
            'stats' => [
                'total_projects' => Project::count(),
                'active_projects' => Project::where('status', 'running')->count(),
                'completed_projects' => Project::where('status', 'completed')->count(),
                'total_progress' => Project::avg('progress') ?? 0,
                'total_contract_value' => Project::sum('contract_value'),
            ],
            'financial' => [
                'cash_balance' => $this->getCashBalance(),
                'bank_balance' => $this->getBankBalance(),
                'monthly_income' => $monthlyRevenue,
                'monthly_expense' => $monthlyExpense,
                'monthly_profit' => $monthlyRevenue - $monthlyExpense,
            ],
            'approvals' => [
                'pending_cash_requests' => LargeCashRequest::where('status', 'pending')->count(),
                'pending_expenses' => OperationalExpense::where('status', 'pending')->count(),
            ],
            'recent_projects' => Project::with('manager')->latest()->take(5)->get(),
        ];
    }

    /**
     * Accounting dashboard data.
     */
    protected function accountingDashboard(): array
    {
        return [
            'financial' => [
                'cash_balance' => $this->getCashBalance(),
                'bank_balance' => $this->getBankBalance(),
                'monthly_revenue' => $this->getMonthlyRevenue(),
                'monthly_expense' => $this->getMonthlyExpense(),
            ],
            'journal' => [
                'today_entries' => JournalEntry::whereDate('date', today())->count(),
                'pending_journals' => JournalEntry::where('status', 'draft')->count(),
            ],
            'recent_journals' => JournalEntry::with('creator')->latest()->take(5)->get(),
        ];
    }

    /**
     * Administration dashboard data.
     */
    protected function administrationDashboard(): array
    {
        return [
            'attendance' => [
                'today_present' => Attendance::whereDate('date', today())->where('status', 'present')->count(),
                'today_late' => Attendance::whereDate('date', today())->where('status', 'late')->count(),
                'today_absent' => Attendance::whereDate('date', today())->where('status', 'absent')->count(),
            ],
            'expenses' => [
                'today_expenses' => OperationalExpense::whereDate('date', today())->sum('amount'),
                'pending_expenses' => OperationalExpense::where('status', 'pending')->count(),
            ],
            'recent_attendance' => Attendance::with('user')->latest()->take(5)->get(),
        ];
    }

    /**
     * Project Manager dashboard data.
     */
    protected function projectManagerDashboard(User $user): array
    {
        $myProjects = $user->managedProjects;

        return [
            'projects' => [
                'total' => $myProjects->count(),
                'active' => $myProjects->where('status', 'running')->count(),
                'completed' => $myProjects->where('status', 'completed')->count(),
                'avg_progress' => $myProjects->avg('progress') ?? 0,
            ],
            'my_projects' => $myProjects->load('members')->take(5),
            'today_tasks' => $this->getTodayTasks($user),
            'recent_progress' => $user->projectProgress()->with('project')->latest()->take(5)->get(),
        ];
    }

    /**
     * Employee dashboard data.
     */
    protected function employeeDashboard(User $user): array
    {
        return [
            'attendance' => [
                'today_status' => Attendance::where('user_id', $user->id)
                    ->where('date', today())
                    ->first()?->status ?? 'not_recorded',
                'this_month_present' => Attendance::where('user_id', $user->id)
                    ->whereMonth('date', now()->month)
                    ->where('status', 'present')
                    ->count(),
            ],
            'projects' => $user->projects()->with('manager')->take(5)->get(),
            'today_schedule' => $this->getTodaySchedule($user),
            'reminders' => $user->reminders()->where('reminder_date', '>=', today())->take(5)->get(),
        ];
    }

    /**
     * Get cash balance from chart of accounts.
     */
    protected function getCashBalance(): float
    {
        return \App\Models\ChartOfAccount::where('account_type', 'asset')
            ->where('account_name', 'like', '%Kas%')
            ->with(['balances' => function ($query) {
                $query->where('period', now()->format('Y-m'))->latest();
            }])
            ->get()
            ->sum(function ($account) {
                return $account->balances->first()?->closing_balance ?? 0;
            });
    }

    /**
     * Get bank balance from chart of accounts.
     */
    protected function getBankBalance(): float
    {
        return \App\Models\ChartOfAccount::where('account_type', 'asset')
            ->where('account_name', 'like', '%Bank%')
            ->with(['balances' => function ($query) {
                $query->where('period', now()->format('Y-m'))->latest();
            }])
            ->get()
            ->sum(function ($account) {
                return $account->balances->first()?->closing_balance ?? 0;
            });
    }

    /**
     * Get monthly revenue.
     */
    protected function getMonthlyRevenue(): float
    {
        return JournalEntry::whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->where('status', 'posted')
            ->whereHas('items', function ($query) {
                $query->whereHas('account', function ($q) {
                    $q->where('account_type', 'revenue');
                });
            })
            ->get()
            ->sum(function ($journal) {
                return $journal->items->sum('credit');
            });
    }

    /**
     * Get monthly expense.
     */
    protected function getMonthlyExpense(): float
    {
        return JournalEntry::whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->where('status', 'posted')
            ->whereHas('items', function ($query) {
                $query->whereHas('account', function ($q) {
                    $q->where('account_type', 'expense');
                });
            })
            ->get()
            ->sum(function ($journal) {
                return $journal->items->sum('debit');
            });
    }

    /**
     * Get today's tasks for user.
     */
    protected function getTodayTasks(User $user): array
    {
        // This would come from project tasks or work schedules
        return [];
    }

    /**
     * Get today's schedule for user.
     */
    protected function getTodaySchedule(User $user): array
    {
        // This would come from work schedules
        return [];
    }
}
