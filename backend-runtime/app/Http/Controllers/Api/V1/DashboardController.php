<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\Attendance;
use App\Models\OperationalExpense;
use App\Models\FieldMonitoring;
use App\Models\LargeCashRequest;
use App\Models\JournalEntry;
use App\Models\ExpenseCategory;
use App\Models\BankTransaction;
use App\Models\Role;
use App\Models\WorkSchedule;
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
            'SUPER_ADMIN' => $this->administrationDashboard(),
            'ADMIN' => $this->administrationDashboard(),
            'DIRECTOR' => $this->directorDashboard(),
            'ACCOUNTING' => $this->accountingDashboard(),
            'PROJECT_MANAGER' => $this->projectManagerDashboard($user),
            'EMPLOYEE' => $this->employeeDashboard($user),
            default => $this->administrationDashboard(),
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
            'field_monitoring' => [
                'total_records' => FieldMonitoring::count(),
                'today_records' => FieldMonitoring::whereDate('monitoring_date', today())->count(),
                'this_month_records' => FieldMonitoring::whereMonth('monitoring_date', now()->month)
                    ->whereYear('monitoring_date', now()->year)
                    ->count(),
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
        try {
            $tasks = ProjectTask::query()
                ->where('assigned_to', $user->id)
                ->whereDate('due_date', today())
                ->orderBy('priority')
                ->take(5)
                ->get();

            return $tasks->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'status' => $task->status,
                    'priority' => $task->priority,
                    'due_date' => $task->due_date?->toDateString(),
                    'project' => $task->project?->name,
                ];
            })->values()->toArray();
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Get today's schedule for user.
     */
    protected function getTodaySchedule(User $user): array
    {
        try {
            $day = strtolower(now()->englishDayOfWeek);

            return $user->workSchedules()
                ->where('day', $day)
                ->where('is_active', true)
                ->get()
                ->map(function ($schedule) {
                    return [
                        'activity' => $schedule->notes ?? 'Work schedule',
                        'time' => $schedule->start_time && $schedule->end_time
                            ? $schedule->start_time->format('H:i') . ' - ' . $schedule->end_time->format('H:i')
                            : null,
                        'location' => $schedule->notes,
                    ];
                })
                ->values()
                ->toArray();
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Get chart data for dashboard.
     */
    public function charts(Request $request): JsonResponse
    {
        $user = auth()->user();
        $role = $user->role->code;

        $data = match($role) {
            'SUPER_ADMIN' => $this->adminCharts(),
            'DIRECTOR' => $this->directorCharts(),
            'ACCOUNTING' => $this->accountingCharts(),
            'ADMIN' => $this->adminCharts(),
            'PROJECT_MANAGER' => $this->projectManagerCharts($user),
            'EMPLOYEE' => $this->employeeCharts($user),
            default => $this->adminCharts(),
        };

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Director dashboard charts.
     */
    protected function directorCharts(): array
    {
        return [
            'monthly_revenue_expense' => $this->getMonthlyRevenueExpense(),
            'project_status_distribution' => $this->getProjectStatusDistribution(),
            'department_expenses' => $this->getDepartmentExpenses(),
        ];
    }

    /**
     * Accounting dashboard charts.
     */
    protected function accountingCharts(): array
    {
        return [
            'monthly_revenue_expense' => $this->getMonthlyRevenueExpense(),
            'expense_categories' => $this->getExpenseCategories(),
            'cash_flow' => $this->getCashFlow(),
        ];
    }

    /**
     * Admin dashboard charts.
     */
    protected function adminCharts(): array
    {
        return [
            'attendance_trends' => $this->getAttendanceTrends(),
            'department_headcount' => $this->getDepartmentHeadcount(),
        ];
    }

    /**
     * Project Manager dashboard charts.
     */
    protected function projectManagerCharts(User $user): array
    {
        return [
            'project_progress' => $this->getProjectProgress($user),
            'team_performance' => $this->getTeamPerformance($user),
        ];
    }

    /**
     * Employee dashboard charts.
     */
    protected function employeeCharts(User $user): array
    {
        return [
            'personal_attendance' => $this->getPersonalAttendance($user),
            'task_completion' => $this->getTaskCompletion($user),
        ];
    }

    /**
     * Get monthly revenue and expense data.
     */
    protected function getMonthlyRevenueExpense(): array
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $month = $date->format('M Y');
            
            $revenue = JournalEntry::whereMonth('date', $date->month)
                ->whereYear('date', $date->year)
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

            $expense = JournalEntry::whereMonth('date', $date->month)
                ->whereYear('date', $date->year)
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

            $data[] = [
                'month' => $month,
                'revenue' => $revenue,
                'expense' => $expense,
                'profit' => $revenue - $expense,
            ];
        }

        return $data;
    }

    /**
     * Get project status distribution.
     */
    protected function getProjectStatusDistribution(): array
    {
        $statuses = ['running', 'completed', 'hold', 'pending'];
        $data = [];

        foreach ($statuses as $status) {
            $count = Project::where('status', $status)->count();
            $data[] = [
                'name' => ucfirst($status),
                'value' => $count,
            ];
        }

        return $data;
    }

    /**
     * Get department expenses.
     */
    protected function getDepartmentExpenses(): array
    {
        try {
            return OperationalExpense::query()
                ->with('category')
                ->selectRaw('category_id, SUM(amount) as total_amount')
                ->groupBy('category_id')
                ->orderByDesc('total_amount')
                ->take(6)
                ->get()
                ->map(function ($expense) {
                    return [
                        'name' => $expense->category?->name ?? 'Uncategorized',
                        'value' => (float) $expense->total_amount,
                    ];
                })
                ->values()
                ->toArray();
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Get expense categories breakdown.
     */
    protected function getExpenseCategories(): array
    {
        $categories = ExpenseCategory::withSum('expenses', 'amount')
            ->get()
            ->map(function ($cat) {
                return [
                    'name' => $cat->name,
                    'value' => $cat->expenses_sum_amount ?? 0,
                ];
            });

        return $categories->toArray();
    }

    /**
     * Get cash flow data.
     */
    protected function getCashFlow(): array
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $month = $date->format('M Y');
            
            $cashIn = BankTransaction::whereMonth('transaction_date', $date->month)
                ->whereYear('transaction_date', $date->year)
                ->where('transaction_type', 'credit')
                ->sum('amount');

            $cashOut = BankTransaction::whereMonth('transaction_date', $date->month)
                ->whereYear('transaction_date', $date->year)
                ->where('transaction_type', 'debit')
                ->sum('amount');

            $data[] = [
                'month' => $month,
                'cash_in' => $cashIn,
                'cash_out' => $cashOut,
                'net' => $cashIn - $cashOut,
            ];
        }

        return $data;
    }

    /**
     * Get attendance trends.
     */
    protected function getAttendanceTrends(): array
    {
        $data = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $present = Attendance::whereDate('date', $date->format('Y-m-d'))
                ->where('status', 'present')
                ->count();
            
            $absent = Attendance::whereDate('date', $date->format('Y-m-d'))
                ->where('status', 'absent')
                ->count();

            $data[] = [
                'date' => $date->format('M d'),
                'present' => $present,
                'absent' => $absent,
            ];
        }

        return $data;
    }

    /**
     * Get department headcount.
     */
    protected function getDepartmentHeadcount(): array
    {
        $roles = Role::withCount('users')->get();
        
        return $roles->map(function ($role) {
            return [
                'name' => $role->name,
                'value' => $role->users_count,
            ];
        })->toArray();
    }

    /**
     * Get project progress for manager.
     */
    protected function getProjectProgress(User $user): array
    {
        $projects = $user->managedProjects()->get();
        
        return $projects->map(function ($project) {
            return [
                'name' => $project->name,
                'progress' => $project->progress,
                'status' => $project->status,
            ];
        })->toArray();
    }

    /**
     * Get team performance for manager.
     */
    protected function getTeamPerformance(User $user): array
    {
        try {
            return $user->managedProjects()
                ->withCount('members')
                ->get()
                ->map(function ($project) {
                    return [
                        'member' => $project->manager?->name ?? 'Team',
                        'performance' => (int) ($project->progress ?? 0),
                        'project' => $project->name,
                    ];
                })
                ->values()
                ->toArray();
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Get personal attendance for employee.
     */
    protected function getPersonalAttendance(User $user): array
    {
        $attendances = $user->attendances()
            ->orderBy('date', 'desc')
            ->take(30)
            ->get()
            ->reverse();

        return $attendances->map(function ($att) {
            return [
                'date' => $att->date->format('M d'),
                'status' => $att->status,
                'hours' => $att->work_hours ?? 0,
            ];
        })->toArray();
    }

    /**
     * Get task completion for employee.
     */
    protected function getTaskCompletion(User $user): array
    {
        try {
            $completed = ProjectTask::query()
                ->where('assigned_to', $user->id)
                ->where('status', 'completed')
                ->count();

            $inProgress = ProjectTask::query()
                ->where('assigned_to', $user->id)
                ->whereIn('status', ['in_progress', 'in progress'])
                ->count();

            $pending = ProjectTask::query()
                ->where('assigned_to', $user->id)
                ->whereIn('status', ['pending', 'todo', 'not_started'])
                ->count();

            return [
                ['name' => 'Completed', 'value' => $completed],
                ['name' => 'In Progress', 'value' => $inProgress],
                ['name' => 'Pending', 'value' => $pending],
            ];
        } catch (\Throwable $e) {
            return [
                ['name' => 'Completed', 'value' => 0],
                ['name' => 'In Progress', 'value' => 0],
                ['name' => 'Pending', 'value' => 0],
            ];
        }
    }
}
