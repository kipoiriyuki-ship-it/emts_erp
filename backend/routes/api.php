<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\FinanceController;
use App\Http\Controllers\Api\V1\AccountingController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\ApprovalController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\FinancialPolicyController;

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
    // Public routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    // Protected routes
    Route::middleware(['api.jwt'])->group(function () {
        // Auth routes
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:MODULE.DASHBOARD');

        // Projects
        Route::apiResource('projects', ProjectController::class)->middleware('permission:MODULE.PROJECTS');
        Route::post('/projects/{id}/progress', [ProjectController::class, 'addProgress'])->middleware('permission:PROJECT.UPDATE_PROGRESS');
        Route::get('/projects/{id}/members', [ProjectController::class, 'members'])->middleware('permission:PROJECT.VIEW_ALL');
        Route::post('/projects/{id}/members', [ProjectController::class, 'addMember'])->middleware('permission:PROJECT.EDIT');
        Route::delete('/projects/{id}/members/{userId}', [ProjectController::class, 'removeMember'])->middleware('permission:PROJECT.EDIT');

        // Attendance
        Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn'])->middleware('permission:MODULE.ATTENDANCE');
        Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut'])->middleware('permission:MODULE.ATTENDANCE');
        Route::get('/attendance/my', [AttendanceController::class, 'myAttendance'])->middleware('permission:MODULE.ATTENDANCE');
        Route::get('/attendance/all', [AttendanceController::class, 'allAttendance'])->middleware('permission:ATTENDANCE.VIEW_ALL');
        Route::post('/attendance/leave', [AttendanceController::class, 'requestLeave'])->middleware('permission:ATTENDANCE.CHECK_IN');

        // Finance - Operational
        Route::apiResource('operational-expenses', FinanceController::class)->middleware('permission:MODULE.FINANCE');
        Route::post('/operational-expenses/{id}/approve', [FinanceController::class, 'approveExpense'])->middleware('permission:FINANCE.OPERATIONAL.APPROVE');
        Route::post('/operational-expenses/{id}/reject', [FinanceController::class, 'rejectExpense'])->middleware('permission:FINANCE.OPERATIONAL.APPROVE');

        // Finance - Large Cash Requests
        Route::apiResource('large-cash-requests', FinanceController::class)->middleware('permission:MODULE.LARGE_CASH');
        Route::post('/large-cash-requests/{id}/submit', [FinanceController::class, 'submitRequest'])->middleware('permission:FINANCE.LARGE.SUBMIT');
        Route::post('/large-cash-requests/{id}/approve', [FinanceController::class, 'approveRequest'])->middleware('permission:FINANCE.LARGE.APPROVE');
        Route::post('/large-cash-requests/{id}/reject', [FinanceController::class, 'rejectRequest'])->middleware('permission:FINANCE.LARGE.APPROVE');

        // Accounting
        Route::apiResource('chart-of-accounts', AccountingController::class)->middleware('permission:MODULE.ACCOUNTING');
        Route::apiResource('journal-entries', AccountingController::class)->middleware('permission:ACCOUNTING.CREATE_JOURNAL');
        Route::post('/journal-entries/{id}/post', [AccountingController::class, 'postJournal'])->middleware('permission:ACCOUNTING.POST');
        Route::get('/ledger', [AccountingController::class, 'ledger'])->middleware('permission:ACCOUNTING.VIEW_LEDGER');

        // Reports
        Route::get('/reports/cash-flow', [ReportController::class, 'cashFlow'])->middleware('permission:REPORT.CASH_FLOW');
        Route::get('/reports/profit-loss', [ReportController::class, 'profitLoss'])->middleware('permission:REPORT.PROFIT_LOSS');
        Route::get('/reports/balance-sheet', [ReportController::class, 'balanceSheet'])->middleware('permission:REPORT.BALANCE_SHEET');
        Route::get('/reports/trial-balance', [ReportController::class, 'trialBalance'])->middleware('permission:ACCOUNTING.GENERATE_REPORTS');
        Route::get('/reports/budget-vs-actual', [ReportController::class, 'budgetVsActual'])->middleware('permission:REPORT.PROFIT_LOSS');
        Route::get('/reports/fixed-assets', [ReportController::class, 'fixedAssets'])->middleware('permission:ACCOUNTING.VIEW');
        Route::get('/reports/journal', [ReportController::class, 'journal'])->middleware('permission:ACCOUNTING.VIEW');
        Route::get('/reports/ledger', [ReportController::class, 'ledger'])->middleware('permission:ACCOUNTING.VIEW_LEDGER');

        // Report Exports
        Route::get('/reports/profit-loss/pdf', [ReportController::class, 'profitLossPdf'])->middleware('permission:REPORT.EXPORT_PDF');
        Route::get('/reports/profit-loss/excel', [ReportController::class, 'profitLossExcel'])->middleware('permission:REPORT.EXPORT_EXCEL');
        Route::get('/reports/balance-sheet/pdf', [ReportController::class, 'balanceSheetPdf'])->middleware('permission:REPORT.EXPORT_PDF');
        Route::get('/reports/balance-sheet/excel', [ReportController::class, 'balanceSheetExcel'])->middleware('permission:REPORT.EXPORT_EXCEL');
        Route::get('/reports/cash-flow/pdf', [ReportController::class, 'cashFlowPdf'])->middleware('permission:REPORT.EXPORT_PDF');
        Route::get('/reports/cash-flow/excel', [ReportController::class, 'cashFlowExcel'])->middleware('permission:REPORT.EXPORT_EXCEL');
        Route::get('/reports/trial-balance/pdf', [ReportController::class, 'trialBalancePdf'])->middleware('permission:REPORT.EXPORT_PDF');
        Route::get('/reports/trial-balance/excel', [ReportController::class, 'trialBalanceExcel'])->middleware('permission:REPORT.EXPORT_EXCEL');
        Route::get('/reports/ledger/pdf', [ReportController::class, 'ledgerPdf'])->middleware('permission:REPORT.EXPORT_PDF');
        Route::get('/reports/ledger/excel', [ReportController::class, 'ledgerExcel'])->middleware('permission:REPORT.EXPORT_EXCEL');

        // Approvals
        Route::get('/approvals/pending', [ApprovalController::class, 'pending'])->middleware('permission:APPROVAL.VIEW_PENDING');
        Route::get('/approvals/approved', [ApprovalController::class, 'approved'])->middleware('permission:APPROVAL.VIEW_APPROVED');
        Route::get('/approvals/rejected', [ApprovalController::class, 'rejected'])->middleware('permission:APPROVAL.VIEW_REJECTED');
        Route::post('/approvals/{id}/approve', [ApprovalController::class, 'approve'])->middleware('permission:APPROVAL.APPROVE');
        Route::post('/approvals/{id}/reject', [ApprovalController::class, 'reject'])->middleware('permission:APPROVAL.REJECT');
        Route::post('/approvals/{id}/return-revision', [ApprovalController::class, 'returnRevision'])->middleware('permission:APPROVAL.APPROVE');

        // Financial policy
        Route::get('/financial-policy', [FinancialPolicyController::class, 'show'])->middleware('role:SUPER_ADMIN,DIRECTOR');
        Route::put('/financial-policy', [FinancialPolicyController::class, 'update'])->middleware('role:SUPER_ADMIN,DIRECTOR');

        // Users (Super Admin only)
        Route::apiResource('users', UserController::class)->middleware('permission:MODULE.USER_MANAGEMENT');
        Route::get('/users/roles', [UserController::class, 'roles'])->middleware('permission:USER.ASSIGN_ROLES');
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->middleware('permission:USER.RESET_PASSWORD');

        // Employees (Super Admin only)
        Route::apiResource('employees', EmployeeController::class)->middleware('permission:MODULE.EMPLOYEE_MANAGEMENT');
        Route::get('/employees/{employee}/attendance', [EmployeeController::class, 'attendance'])->middleware('permission:EMPLOYEE.VIEW_ATTENDANCE');
        Route::get('/employees/{employee}/projects', [EmployeeController::class, 'projects'])->middleware('permission:EMPLOYEE.VIEW_PROJECTS');
        Route::get('/employees/{employee}/approvals', [EmployeeController::class, 'approvals'])->middleware('permission:EMPLOYEE.VIEW_APPROVALS');
        Route::get('/employees/{employee}/login-history', [EmployeeController::class, 'loginHistory'])->middleware('permission:EMPLOYEE.VIEW_HISTORY');
        Route::get('/employees/{employee}/activity-history', [EmployeeController::class, 'activityHistory'])->middleware('permission:EMPLOYEE.VIEW_HISTORY');
        Route::post('/employees/{employee}/deactivate', [EmployeeController::class, 'deactivate'])->middleware('permission:EMPLOYEE.DEACTIVATE');
        Route::post('/employees/{employee}/activate', [EmployeeController::class, 'activate'])->middleware('permission:EMPLOYEE.ACTIVATE');

        // Audit Logs
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('permission:MODULE.AUDIT_LOG');
    });
});
