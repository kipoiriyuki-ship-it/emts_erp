<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Director - Full access
        $director = Role::where('code', 'DIRECTOR')->first();
        if ($director) {
            $director->permissions()->sync(Permission::pluck('id'));
        }

        // Accounting - Financial access
        $accounting = Role::where('code', 'ACCOUNTING')->first();
        if ($accounting) {
            $accountingPermissions = [
                'AUTH.LOGIN', 'AUTH.LOGOUT', 'AUTH.CHANGE_PASSWORD',
                'DASHBOARD.VIEW', 'DASHBOARD.VIEW_ALL_PROJECTS', 'DASHBOARD.VIEW_FINANCIAL_SUMMARY',
                'PROJECT.VIEW_ALL', 'PROJECT.GENERATE_REPORTS',
                'ATTENDANCE.VIEW_ALL', 'ATTENDANCE.GENERATE_REPORTS',
                'SCHEDULE.VIEW',
                'FINANCE.OPERATIONAL.CREATE', 'FINANCE.OPERATIONAL.EDIT', 'FINANCE.OPERATIONAL.VIEW_ALL', 'FINANCE.OPERATIONAL.APPROVE',
                'FINANCE.LARGE.CREATE', 'FINANCE.LARGE.SUBMIT', 'FINANCE.LARGE.VIEW',
                'ACCOUNTING.MANAGE_COA', 'ACCOUNTING.CREATE_JOURNAL', 'ACCOUNTING.EDIT_JOURNAL', 'ACCOUNTING.VIEW_LEDGER', 'ACCOUNTING.GENERATE_REPORTS',
                'REPORT.CASH_FLOW', 'REPORT.PROFIT_LOSS', 'REPORT.BALANCE_SHEET', 'REPORT.EXPORT_PDF', 'REPORT.EXPORT_EXCEL',
                'APPROVAL.VIEW_PENDING', 'APPROVAL.VIEW_APPROVED', 'APPROVAL.VIEW_REJECTED',
                'AUDIT.VIEW_LOGS', 'AUDIT.EXPORT_LOGS',
                'SETTINGS.EDIT_PROFILE', 'SETTINGS.CHANGE_SECURITY', 'SETTINGS.MANAGE_NOTIFICATIONS',
            ];
            $accounting->permissions()->sync(
                Permission::whereIn('code', $accountingPermissions)->pluck('id')
            );
        }

        // Super Admin - Full system access
        $admin = Role::where('code', 'SUPER_ADMIN')->first();
        if ($admin) {
            $adminPermissions = [
                'AUTH.LOGIN', 'AUTH.LOGOUT', 'AUTH.CHANGE_PASSWORD',
                'DASHBOARD.VIEW',
                'PROJECT.VIEW_ALL', 'PROJECT.GENERATE_REPORTS',
                'ATTENDANCE.CHECK_IN', 'ATTENDANCE.CHECK_OUT', 'ATTENDANCE.VIEW_ALL', 'ATTENDANCE.MANAGE', 'ATTENDANCE.GENERATE_REPORTS',
                'SCHEDULE.VIEW', 'SCHEDULE.CREATE', 'SCHEDULE.EDIT', 'SCHEDULE.DELETE',
                'FINANCE.OPERATIONAL.CREATE', 'FINANCE.OPERATIONAL.EDIT', 'FINANCE.OPERATIONAL.VIEW_ALL', 'FINANCE.OPERATIONAL.APPROVE',
                'FINANCE.LARGE.CREATE', 'FINANCE.LARGE.SUBMIT', 'FINANCE.LARGE.VIEW',
                'APPROVAL.VIEW_PENDING', 'APPROVAL.VIEW_APPROVED', 'APPROVAL.VIEW_REJECTED',
                'SETTINGS.EDIT_PROFILE', 'SETTINGS.CHANGE_SECURITY', 'SETTINGS.MANAGE_NOTIFICATIONS',
            ];
            $admin->permissions()->sync(
                Permission::whereIn('code', $adminPermissions)->pluck('id')
            );
        }

        // Project Manager - Project access
        $pm = Role::where('code', 'PROJECT_MANAGER')->first();
        if ($pm) {
            $pmPermissions = [
                'AUTH.LOGIN', 'AUTH.LOGOUT', 'AUTH.CHANGE_PASSWORD',
                'DASHBOARD.VIEW', 'DASHBOARD.VIEW_ALL_PROJECTS',
                'PROJECT.CREATE', 'PROJECT.EDIT', 'PROJECT.VIEW_ALL', 'PROJECT.VIEW_OWN', 'PROJECT.UPDATE_PROGRESS', 'PROJECT.UPLOAD_PHOTOS', 'PROJECT.GENERATE_REPORTS',
                'ATTENDANCE.VIEW_ALL', 'ATTENDANCE.GENERATE_REPORTS',
                'SCHEDULE.VIEW', 'SCHEDULE.CREATE', 'SCHEDULE.EDIT',
                'FINANCE.OPERATIONAL.CREATE', 'FINANCE.OPERATIONAL.EDIT', 'FINANCE.OPERATIONAL.VIEW_ALL',
                'FINANCE.LARGE.CREATE', 'FINANCE.LARGE.SUBMIT', 'FINANCE.LARGE.VIEW',
                'APPROVAL.VIEW_PENDING', 'APPROVAL.VIEW_APPROVED', 'APPROVAL.VIEW_REJECTED',
                'SETTINGS.EDIT_PROFILE', 'SETTINGS.CHANGE_SECURITY', 'SETTINGS.MANAGE_NOTIFICATIONS',
            ];
            $pm->permissions()->sync(
                Permission::whereIn('code', $pmPermissions)->pluck('id')
            );
        }

        // Staff - Basic access
        $employee = Role::where('code', 'STAFF')->first();
        if ($employee) {
            $employeePermissions = [
                'AUTH.LOGIN', 'AUTH.LOGOUT', 'AUTH.CHANGE_PASSWORD',
                'DASHBOARD.VIEW',
                'PROJECT.VIEW_OWN',
                'ATTENDANCE.CHECK_IN', 'ATTENDANCE.CHECK_OUT', 'ATTENDANCE.VIEW_OWN',
                'SCHEDULE.VIEW',
                'SETTINGS.EDIT_PROFILE', 'SETTINGS.CHANGE_SECURITY', 'SETTINGS.MANAGE_NOTIFICATIONS',
            ];
            $employee->permissions()->sync(
                Permission::whereIn('code', $employeePermissions)->pluck('id')
            );
        }
    }
}
