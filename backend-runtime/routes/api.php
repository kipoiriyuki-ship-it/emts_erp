<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\BudgetController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\FinanceController;
use App\Http\Controllers\Api\V1\AccountingController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\ApprovalController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\LicenseController;
use App\Http\Controllers\Api\V1\RegistrationApprovalController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\ClientController;
use App\Http\Controllers\Api\V1\LeaveRequestController;
use App\Http\Controllers\Api\V1\OvertimeController;
use App\Http\Controllers\Api\V1\PayrollController;
use App\Http\Controllers\Api\V1\PettyCashController;
use App\Http\Controllers\Api\V1\LargeCashController;
use App\Http\Controllers\Api\V1\FieldMonitoringController;
use App\Http\Controllers\Api\V1\ChartOfAccountsController;
use App\Http\Controllers\Api\V1\JournalEntryController;
use App\Http\Controllers\Api\V1\LedgerController;
use App\Http\Controllers\Api\V1\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {
    // Public routes with rate limiting
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('/auth/login', [AuthController::class, 'login']);
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
        Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    });

    // License activation (public - for new users)
    Route::middleware('throttle:3,1')->group(function () {
        Route::post('/license/activate', [LicenseController::class, 'activate']);
    });

    // Protected routes
    Route::middleware(['api.jwt'])->group(function () {
        // Auth routes with rate limiting for sensitive operations
        Route::middleware('throttle:10,1')->group(function () {
            Route::post('/auth/logout', [AuthController::class, 'logout']);
            Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
        });
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Notifications
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('/notifications', [NotificationController::class, 'index']);
            Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
            Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
            Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        });

        // License routes with rate limiting for admin operations
        Route::middleware('throttle:20,1')->group(function () {
            Route::get('/license/my', [LicenseController::class, 'myLicense']);
            Route::get('/license', [LicenseController::class, 'index'])->middleware('role:SUPER_ADMIN');
            Route::post('/license/generate', [LicenseController::class, 'generate'])->middleware('role:SUPER_ADMIN');
            Route::post('/admin/license-generator', [LicenseController::class, 'generate'])->middleware('role:SUPER_ADMIN');
            Route::post('/license/{id}/deactivate', [LicenseController::class, 'deactivate'])->middleware('role:SUPER_ADMIN');
        });

        // Dashboard with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index']);
            Route::get('/dashboard/charts', [DashboardController::class, 'charts']);
        });

        // Projects with rate limiting for write operations
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('projects', [ProjectController::class, 'index']);
            Route::get('projects/{project}', [ProjectController::class, 'show']);
            Route::get('/projects/{project}/members', [ProjectController::class, 'members']);
            Route::get('/projects/{project}/milestones', [ProjectController::class, 'milestones']);
            Route::get('/projects/{project}/documents', [ProjectController::class, 'documents']);
            Route::get('/projects/{project}/documents/{document}', [ProjectController::class, 'downloadDocument']);
            Route::get('/projects/{project}/budget-summary', [ProjectController::class, 'budgetSummary']);
            Route::get('/projects/{project}/timeline', [ProjectController::class, 'timeline']);
            Route::get('/projects/{project}/activity-logs', [ProjectController::class, 'activityLogs']);
            Route::get('field-monitoring', [FieldMonitoringController::class, 'index']);
            Route::get('field-monitoring/{fieldMonitoring}', [FieldMonitoringController::class, 'show']);
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('projects', [ProjectController::class, 'store']);
            Route::put('projects/{project}', [ProjectController::class, 'update']);
            Route::delete('projects/{project}', [ProjectController::class, 'destroy']);
            Route::post('/projects/{project}/progress', [ProjectController::class, 'addProgress']);
            Route::put('/projects/{project}/progress/{progress}', [ProjectController::class, 'updateProgress']);
            Route::delete('/projects/{project}/progress/{progress}', [ProjectController::class, 'deleteProgress']);
            Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
            Route::put('/projects/{project}/members/{userId}', [ProjectController::class, 'updateMember']);
            Route::delete('/projects/{project}/members/{userId}', [ProjectController::class, 'removeMember']);
            Route::post('/projects/{project}/milestones', [ProjectController::class, 'addMilestone']);
            Route::put('/projects/{project}/milestones/{milestoneId}', [ProjectController::class, 'updateMilestone']);
            Route::delete('/projects/{project}/milestones/{milestoneId}', [ProjectController::class, 'deleteMilestone']);
            Route::post('/projects/{project}/documents', [ProjectController::class, 'uploadDocument']);
            Route::delete('/projects/{project}/documents/{document}', [ProjectController::class, 'deleteDocument']);
            Route::post('field-monitoring', [FieldMonitoringController::class, 'store']);
        });

        // Clients with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('clients', [ClientController::class, 'index']);
            Route::get('clients/{id}', [ClientController::class, 'show']);
            Route::get('/clients/statistics', [ClientController::class, 'statistics']);
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('clients', [ClientController::class, 'store']);
            Route::put('clients/{id}', [ClientController::class, 'update']);
            Route::delete('clients/{id}', [ClientController::class, 'destroy']);
        });

        // Budgets with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('budgets', [BudgetController::class, 'index']);
            Route::get('budgets/{id}', [BudgetController::class, 'show']);
            Route::get('/budgets/{id}/vs-actual', [BudgetController::class, 'budgetVsActual']);
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('budgets', [BudgetController::class, 'store']);
            Route::put('budgets/{id}', [BudgetController::class, 'update']);
            Route::delete('budgets/{id}', [BudgetController::class, 'destroy']);
            Route::post('/budgets/{id}/approve', [BudgetController::class, 'approve']);
            Route::post('/budgets/{id}/details', [BudgetController::class, 'addDetail']);
            Route::put('/budgets/{id}/details/{detailId}', [BudgetController::class, 'updateDetail']);
        });

        // Attendance with rate limiting
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
            Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
            Route::post('/attendance/leave', [AttendanceController::class, 'requestLeave']);
        });
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('/attendance/my', [AttendanceController::class, 'myAttendance']);
            Route::get('/attendance/all', [AttendanceController::class, 'allAttendance'])->middleware('permission:ATTENDANCE.VIEW_ALL');
        });

        // Leave Requests with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('leave-requests', [LeaveRequestController::class, 'index']);
            Route::get('leave-requests/{id}', [LeaveRequestController::class, 'show']);
            Route::get('/leave-requests/my', [LeaveRequestController::class, 'myRequests']);
            Route::get('/leave-requests/pending', [LeaveRequestController::class, 'pending'])->middleware('role:DIRECTOR,ADMIN');
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('leave-requests', [LeaveRequestController::class, 'store']);
            Route::put('leave-requests/{id}', [LeaveRequestController::class, 'update']);
            Route::delete('leave-requests/{id}', [LeaveRequestController::class, 'destroy']);
            Route::post('/leave-requests/{id}/approve', [LeaveRequestController::class, 'approve'])->middleware('role:DIRECTOR,ADMIN');
            Route::post('/leave-requests/{id}/reject', [LeaveRequestController::class, 'reject'])->middleware('role:DIRECTOR,ADMIN');
        });

        // Overtime with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('overtime', [OvertimeController::class, 'index']);
            Route::get('overtime/{id}', [OvertimeController::class, 'show']);
            Route::get('/overtime/my', [OvertimeController::class, 'myRecords']);
            Route::get('/overtime/pending', [OvertimeController::class, 'pending'])->middleware('role:DIRECTOR,ADMIN');
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('overtime', [OvertimeController::class, 'store']);
            Route::put('overtime/{id}', [OvertimeController::class, 'update']);
            Route::delete('overtime/{id}', [OvertimeController::class, 'destroy']);
            Route::post('/overtime/{id}/approve', [OvertimeController::class, 'approve'])->middleware('role:DIRECTOR,ADMIN');
            Route::post('/overtime/{id}/reject', [OvertimeController::class, 'reject'])->middleware('role:DIRECTOR,ADMIN');
        });

        // Payroll with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('payroll', [PayrollController::class, 'index'])->middleware('role:DIRECTOR,ADMIN');
            Route::get('payroll/{id}', [PayrollController::class, 'show'])->middleware('role:DIRECTOR,ADMIN');
        });
        Route::middleware('throttle:20,1')->group(function () {
            Route::post('payroll', [PayrollController::class, 'store'])->middleware('role:DIRECTOR,ADMIN');
            Route::put('payroll/{id}', [PayrollController::class, 'update'])->middleware('role:DIRECTOR,ADMIN');
            Route::delete('payroll/{id}', [PayrollController::class, 'destroy'])->middleware('role:DIRECTOR,ADMIN');
            Route::post('/payroll/generate', [PayrollController::class, 'generatePeriod'])->middleware('role:DIRECTOR,ADMIN');
            Route::post('/payroll/{id}/process', [PayrollController::class, 'process'])->middleware('role:DIRECTOR,ADMIN');
            Route::post('/payroll/{id}/pay', [PayrollController::class, 'markAsPaid'])->middleware('role:DIRECTOR,ADMIN');
        });

        // Petty Cash with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('petty-cash', [PettyCashController::class, 'index']);
            Route::get('petty-cash/{id}', [PettyCashController::class, 'show']);
            Route::get('/petty-cash/summary', [PettyCashController::class, 'summary']);
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('petty-cash', [PettyCashController::class, 'store']);
            Route::put('petty-cash/{id}', [PettyCashController::class, 'update']);
            Route::delete('petty-cash/{id}', [PettyCashController::class, 'destroy']);
            Route::post('/petty-cash/{id}/approve', [PettyCashController::class, 'approve'])->middleware('role:DIRECTOR,ADMIN');
            Route::post('/petty-cash/{id}/reject', [PettyCashController::class, 'reject'])->middleware('role:DIRECTOR,ADMIN');
        });

        // Large Cash with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('large-cash', [LargeCashController::class, 'index']);
            Route::get('large-cash/{id}', [LargeCashController::class, 'show']);
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('large-cash', [LargeCashController::class, 'store']);
            Route::put('large-cash/{large_cash_request}', [LargeCashController::class, 'update']);
            Route::delete('large-cash/{large_cash_request}', [LargeCashController::class, 'destroy']);
            Route::post('/large-cash/{large_cash_request}/submit', [LargeCashController::class, 'submit']);
            Route::post('/large-cash/{large_cash_request}/approve', [LargeCashController::class, 'approve'])->middleware('role:DIRECTOR,ADMIN');
            Route::post('/large-cash/{large_cash_request}/reject', [LargeCashController::class, 'reject'])->middleware('role:DIRECTOR,ADMIN');
        });

        // Chart of Accounts with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('chart-of-accounts', [ChartOfAccountsController::class, 'index'])->middleware('role:DIRECTOR,ADMIN');
            Route::get('chart-of-accounts/{id}', [ChartOfAccountsController::class, 'show'])->middleware('role:DIRECTOR,ADMIN');
            Route::get('/chart-of-accounts/tree', [ChartOfAccountsController::class, 'tree'])->middleware('role:DIRECTOR,ADMIN');
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('chart-of-accounts', [ChartOfAccountsController::class, 'store'])->middleware('role:DIRECTOR,ADMIN');
            Route::put('chart-of-accounts/{id}', [ChartOfAccountsController::class, 'update'])->middleware('role:DIRECTOR,ADMIN');
            Route::delete('chart-of-accounts/{id}', [ChartOfAccountsController::class, 'destroy'])->middleware('role:DIRECTOR,ADMIN');
        });

        // Journal Entries with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('journal-entries', [JournalEntryController::class, 'index'])->middleware('role:DIRECTOR,ADMIN');
            Route::get('journal-entries/{id}', [JournalEntryController::class, 'show'])->middleware('role:DIRECTOR,ADMIN');
            Route::get('/journal-entries/accounts', [JournalEntryController::class, 'accounts'])->middleware('role:DIRECTOR,ADMIN');
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('journal-entries', [JournalEntryController::class, 'store'])->middleware('role:DIRECTOR,ADMIN');
            Route::put('journal-entries/{id}', [JournalEntryController::class, 'update'])->middleware('role:DIRECTOR,ADMIN');
            Route::delete('journal-entries/{id}', [JournalEntryController::class, 'destroy'])->middleware('role:DIRECTOR,ADMIN');
            Route::post('/journal-entries/{id}/post', [JournalEntryController::class, 'post'])->middleware('role:DIRECTOR,ADMIN');
            Route::post('/journal-entries/{id}/cancel', [JournalEntryController::class, 'cancel'])->middleware('role:DIRECTOR,ADMIN');
        });

        // Ledger with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('ledger', [LedgerController::class, 'index'])->middleware('role:DIRECTOR,ADMIN');
            Route::get('ledger/{id}', [LedgerController::class, 'show'])->middleware('role:DIRECTOR,ADMIN');
            Route::get('/ledger/account/{accountId}', [LedgerController::class, 'accountLedger'])->middleware('role:DIRECTOR,ADMIN');
            Route::get('/ledger/accounts', [LedgerController::class, 'accounts'])->middleware('role:DIRECTOR,ADMIN');
        });

        // Reports with rate limiting
        Route::middleware('throttle:30,1')->group(function () {
            Route::get('/reports/trial-balance', [ReportController::class, 'trialBalance'])->middleware('role:DIRECTOR,ADMIN');
            Route::get('/reports/profit-loss', [ReportController::class, 'profitLoss'])->middleware('role:DIRECTOR,ADMIN');
            Route::get('/reports/balance-sheet', [ReportController::class, 'balanceSheet'])->middleware('role:DIRECTOR,ADMIN');
            Route::get('/reports/cash-flow', [ReportController::class, 'cashFlow'])->middleware('role:DIRECTOR,ADMIN');
        });

        // Finance - Operational with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('operational-expenses', [FinanceController::class, 'index']);
            Route::get('operational-expenses/{id}', [FinanceController::class, 'show']);
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('operational-expenses', [FinanceController::class, 'store']);
            Route::put('operational-expenses/{id}', [FinanceController::class, 'update']);
            Route::delete('operational-expenses/{id}', [FinanceController::class, 'destroy']);
            Route::post('/operational-expenses/{id}/approve', [FinanceController::class, 'approveExpense']);
            Route::post('/operational-expenses/{id}/reject', [FinanceController::class, 'rejectExpense']);
        });

        // Finance - Large Cash Requests with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('large-cash-requests', [FinanceController::class, 'largeCashIndex']);
            Route::get('large-cash-requests/{large_cash_request}', [FinanceController::class, 'showLargeCash']);
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('large-cash-requests', [FinanceController::class, 'storeLargeCash']);
            Route::put('large-cash-requests/{large_cash_request}', [FinanceController::class, 'updateLargeCash']);
            Route::delete('large-cash-requests/{large_cash_request}', [FinanceController::class, 'destroyLargeCash']);
            Route::post('/large-cash-requests/{large_cash_request}/submit', [FinanceController::class, 'submitRequest']);
            Route::post('/large-cash-requests/{large_cash_request}/approve', [FinanceController::class, 'approveRequest']);
            Route::post('/large-cash-requests/{large_cash_request}/reject', [FinanceController::class, 'rejectRequest']);
        });

        // Approvals with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('/approvals/pending', [ApprovalController::class, 'pending']);
            Route::get('/approvals/approved', [ApprovalController::class, 'approved']);
            Route::get('/approvals/rejected', [ApprovalController::class, 'rejected']);
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('/approvals/{id}/approve', [ApprovalController::class, 'approve']);
            Route::post('/approvals/{id}/reject', [ApprovalController::class, 'reject']);
            Route::post('/approvals/{id}/return-revision', [ApprovalController::class, 'returnRevision']);
        });

        // Users (Director only) with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('users', [UserController::class, 'index'])->middleware('role:DIRECTOR,SUPER_ADMIN');
            Route::get('users/{id}', [UserController::class, 'show'])->middleware('role:DIRECTOR,SUPER_ADMIN');
            Route::get('/users/roles', [UserController::class, 'roles'])->middleware('role:DIRECTOR,SUPER_ADMIN');
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('users', [UserController::class, 'store'])->middleware('role:DIRECTOR,SUPER_ADMIN');
            Route::put('users/{id}', [UserController::class, 'update'])->middleware('role:DIRECTOR,SUPER_ADMIN');
            Route::delete('users/{id}', [UserController::class, 'destroy'])->middleware('role:DIRECTOR,SUPER_ADMIN');
        });

        // Roles (Director only) with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('roles', [RoleController::class, 'index'])->middleware('role:DIRECTOR,SUPER_ADMIN');
            Route::get('roles/{id}', [RoleController::class, 'show'])->middleware('role:DIRECTOR,SUPER_ADMIN');
            Route::get('/roles/permissions', [RoleController::class, 'permissions'])->middleware('role:DIRECTOR,SUPER_ADMIN');
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('roles', [RoleController::class, 'store'])->middleware('role:DIRECTOR,SUPER_ADMIN');
            Route::put('roles/{id}', [RoleController::class, 'update'])->middleware('role:DIRECTOR,SUPER_ADMIN');
            Route::delete('roles/{id}', [RoleController::class, 'destroy'])->middleware('role:DIRECTOR,SUPER_ADMIN');
        });

        // Permissions (Director only) with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('permissions', [PermissionController::class, 'index'])->middleware('role:DIRECTOR,SUPER_ADMIN');
            Route::get('permissions/{id}', [PermissionController::class, 'show'])->middleware('role:DIRECTOR,SUPER_ADMIN');
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('permissions', [PermissionController::class, 'store'])->middleware('role:DIRECTOR,SUPER_ADMIN');
            Route::put('permissions/{id}', [PermissionController::class, 'update'])->middleware('role:DIRECTOR,SUPER_ADMIN');
            Route::delete('permissions/{id}', [PermissionController::class, 'destroy'])->middleware('role:DIRECTOR,SUPER_ADMIN');
        });

        // Employees (Director/Admin only) with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('employees', [EmployeeController::class, 'index'])->middleware('role:DIRECTOR,ADMIN,SUPER_ADMIN');
            Route::get('employees/{id}', [EmployeeController::class, 'show'])->middleware('role:DIRECTOR,ADMIN,SUPER_ADMIN');
            Route::get('/employees/departments', [EmployeeController::class, 'departments'])->middleware('role:DIRECTOR,ADMIN,SUPER_ADMIN');
            Route::get('/employees/positions', [EmployeeController::class, 'positions'])->middleware('role:DIRECTOR,ADMIN,SUPER_ADMIN');
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('employees', [EmployeeController::class, 'store'])->middleware('role:DIRECTOR,ADMIN,SUPER_ADMIN');
            Route::put('employees/{id}', [EmployeeController::class, 'update'])->middleware('role:DIRECTOR,ADMIN,SUPER_ADMIN');
            Route::delete('employees/{id}', [EmployeeController::class, 'destroy'])->middleware('role:DIRECTOR,ADMIN,SUPER_ADMIN');
        });

        // Registration Approval (Director only) with rate limiting
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('/registrations/pending', [RegistrationApprovalController::class, 'index'])->middleware('role:DIRECTOR');
            Route::get('/registrations/roles', [RegistrationApprovalController::class, 'getRoles'])->middleware('role:DIRECTOR');
        });
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('/registrations/{id}/approve', [RegistrationApprovalController::class, 'approve'])->middleware('role:DIRECTOR');
            Route::post('/registrations/{id}/reject', [RegistrationApprovalController::class, 'reject'])->middleware('role:DIRECTOR');
        });

        // Audit Logs with rate limiting
        Route::middleware('throttle:30,1')->group(function () {
            Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('permission:AUDIT.VIEW_LOGS');
        });
    });
});
