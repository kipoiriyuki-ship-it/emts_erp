<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Authentication
            ['code' => 'AUTH.LOGIN', 'name' => 'Login', 'module' => 'authentication'],
            ['code' => 'AUTH.LOGOUT', 'name' => 'Logout', 'module' => 'authentication'],
            ['code' => 'AUTH.CHANGE_PASSWORD', 'name' => 'Change Password', 'module' => 'authentication'],
            
            // Dashboard
            ['code' => 'DASHBOARD.VIEW', 'name' => 'View Dashboard', 'module' => 'dashboard'],
            ['code' => 'DASHBOARD.VIEW_ALL_PROJECTS', 'name' => 'View All Projects', 'module' => 'dashboard'],
            ['code' => 'DASHBOARD.VIEW_FINANCIAL_SUMMARY', 'name' => 'View Financial Summary', 'module' => 'dashboard'],
            
            // Projects
            ['code' => 'PROJECT.CREATE', 'name' => 'Create Project', 'module' => 'projects'],
            ['code' => 'PROJECT.EDIT', 'name' => 'Edit Project', 'module' => 'projects'],
            ['code' => 'PROJECT.DELETE', 'name' => 'Delete Project', 'module' => 'projects'],
            ['code' => 'PROJECT.VIEW_ALL', 'name' => 'View All Projects', 'module' => 'projects'],
            ['code' => 'PROJECT.VIEW_OWN', 'name' => 'View Own Projects', 'module' => 'projects'],
            ['code' => 'PROJECT.UPDATE_PROGRESS', 'name' => 'Update Progress', 'module' => 'projects'],
            ['code' => 'PROJECT.UPLOAD_PHOTOS', 'name' => 'Upload Photos', 'module' => 'projects'],
            ['code' => 'PROJECT.GENERATE_REPORTS', 'name' => 'Generate Reports', 'module' => 'projects'],
            
            // Attendance
            ['code' => 'ATTENDANCE.CHECK_IN', 'name' => 'Check In', 'module' => 'attendance'],
            ['code' => 'ATTENDANCE.CHECK_OUT', 'name' => 'Check Out', 'module' => 'attendance'],
            ['code' => 'ATTENDANCE.VIEW_OWN', 'name' => 'View Own Attendance', 'module' => 'attendance'],
            ['code' => 'ATTENDANCE.VIEW_ALL', 'name' => 'View All Attendance', 'module' => 'attendance'],
            ['code' => 'ATTENDANCE.MANAGE', 'name' => 'Manage Attendance', 'module' => 'attendance'],
            ['code' => 'ATTENDANCE.GENERATE_REPORTS', 'name' => 'Generate Reports', 'module' => 'attendance'],
            
            // Scheduling
            ['code' => 'SCHEDULE.VIEW', 'name' => 'View Calendar', 'module' => 'scheduling'],
            ['code' => 'SCHEDULE.CREATE', 'name' => 'Create Schedule', 'module' => 'scheduling'],
            ['code' => 'SCHEDULE.EDIT', 'name' => 'Edit Schedule', 'module' => 'scheduling'],
            ['code' => 'SCHEDULE.DELETE', 'name' => 'Delete Schedule', 'module' => 'scheduling'],
            
            // Operational Cash Flow
            ['code' => 'FINANCE.OPERATIONAL.CREATE', 'name' => 'Create Expense', 'module' => 'finance'],
            ['code' => 'FINANCE.OPERATIONAL.EDIT', 'name' => 'Edit Expense', 'module' => 'finance'],
            ['code' => 'FINANCE.OPERATIONAL.DELETE', 'name' => 'Delete Expense', 'module' => 'finance'],
            ['code' => 'FINANCE.OPERATIONAL.VIEW_ALL', 'name' => 'View All Expenses', 'module' => 'finance'],
            ['code' => 'FINANCE.OPERATIONAL.APPROVE', 'name' => 'Approve Expense', 'module' => 'finance'],
            
            // Large Cash Flow
            ['code' => 'FINANCE.LARGE.CREATE', 'name' => 'Create Request', 'module' => 'finance'],
            ['code' => 'FINANCE.LARGE.SUBMIT', 'name' => 'Submit Request', 'module' => 'finance'],
            ['code' => 'FINANCE.LARGE.VIEW', 'name' => 'View Requests', 'module' => 'finance'],
            ['code' => 'FINANCE.LARGE.APPROVE', 'name' => 'Approve Request', 'module' => 'finance'],
            ['code' => 'FINANCE.LARGE.REJECT', 'name' => 'Reject Request', 'module' => 'finance'],
            
            // Accounting
            ['code' => 'ACCOUNTING.MANAGE_COA', 'name' => 'Manage COA', 'module' => 'accounting'],
            ['code' => 'ACCOUNTING.CREATE_JOURNAL', 'name' => 'Create Journal', 'module' => 'accounting'],
            ['code' => 'ACCOUNTING.EDIT_JOURNAL', 'name' => 'Edit Journal', 'module' => 'accounting'],
            ['code' => 'ACCOUNTING.VIEW_LEDGER', 'name' => 'View Ledger', 'module' => 'accounting'],
            ['code' => 'ACCOUNTING.GENERATE_REPORTS', 'name' => 'Generate Reports', 'module' => 'accounting'],
            
            // Reports
            ['code' => 'REPORT.CASH_FLOW', 'name' => 'View Cash Flow', 'module' => 'reports'],
            ['code' => 'REPORT.PROFIT_LOSS', 'name' => 'View Profit Loss', 'module' => 'reports'],
            ['code' => 'REPORT.BALANCE_SHEET', 'name' => 'View Balance Sheet', 'module' => 'reports'],
            ['code' => 'REPORT.EXPORT_PDF', 'name' => 'Export PDF', 'module' => 'reports'],
            ['code' => 'REPORT.EXPORT_EXCEL', 'name' => 'Export Excel', 'module' => 'reports'],
            
            // Approvals
            ['code' => 'APPROVAL.VIEW_PENDING', 'name' => 'View Pending', 'module' => 'approvals'],
            ['code' => 'APPROVAL.VIEW_APPROVED', 'name' => 'View Approved', 'module' => 'approvals'],
            ['code' => 'APPROVAL.VIEW_REJECTED', 'name' => 'View Rejected', 'module' => 'approvals'],
            ['code' => 'APPROVAL.APPROVE', 'name' => 'Approve', 'module' => 'approvals'],
            ['code' => 'APPROVAL.REJECT', 'name' => 'Reject', 'module' => 'approvals'],
            
            // User Management
            ['code' => 'USER.VIEW', 'name' => 'View Users', 'module' => 'users'],
            ['code' => 'USER.CREATE', 'name' => 'Create User', 'module' => 'users'],
            ['code' => 'USER.EDIT', 'name' => 'Edit User', 'module' => 'users'],
            ['code' => 'USER.DELETE', 'name' => 'Delete User', 'module' => 'users'],
            ['code' => 'USER.ASSIGN_ROLES', 'name' => 'Assign Roles', 'module' => 'users'],
            
            // Finance
            ['code' => 'FINANCE.VIEW', 'name' => 'View Finance', 'module' => 'finance'],
            ['code' => 'FINANCE.CREATE', 'name' => 'Create Finance', 'module' => 'finance'],
            ['code' => 'FINANCE.EDIT', 'name' => 'Edit Finance', 'module' => 'finance'],
            ['code' => 'FINANCE.DELETE', 'name' => 'Delete Finance', 'module' => 'finance'],
            ['code' => 'FINANCE.APPROVE', 'name' => 'Approve Finance', 'module' => 'finance'],
            
            // Accounting
            ['code' => 'ACCOUNTING.VIEW', 'name' => 'View Accounting', 'module' => 'accounting'],
            ['code' => 'ACCOUNTING.CREATE', 'name' => 'Create Accounting', 'module' => 'accounting'],
            ['code' => 'ACCOUNTING.EDIT', 'name' => 'Edit Accounting', 'module' => 'accounting'],
            ['code' => 'ACCOUNTING.POST', 'name' => 'Post Accounting', 'module' => 'accounting'],
            
            // HRD
            ['code' => 'HRD.VIEW', 'name' => 'View HRD', 'module' => 'hrd'],
            ['code' => 'HRD.CREATE', 'name' => 'Create HRD', 'module' => 'hrd'],
            ['code' => 'HRD.EDIT', 'name' => 'Edit HRD', 'module' => 'hrd'],
            ['code' => 'HRD.DELETE', 'name' => 'Delete HRD', 'module' => 'hrd'],
            
            // Audit Trail
            ['code' => 'AUDIT.VIEW_LOGS', 'name' => 'View Logs', 'module' => 'audit'],
            ['code' => 'AUDIT.EXPORT_LOGS', 'name' => 'Export Logs', 'module' => 'audit'],
            
            // Settings
            ['code' => 'SETTINGS.EDIT_PROFILE', 'name' => 'Edit Profile', 'module' => 'settings'],
            ['code' => 'SETTINGS.CHANGE_SECURITY', 'name' => 'Change Security', 'module' => 'settings'],
            ['code' => 'SETTINGS.MANAGE_NOTIFICATIONS', 'name' => 'Manage Notifications', 'module' => 'settings'],
        ];

        // Filter paksa untuk menjamin TIDAK ADA duplikasi code DAN name
        $cleanPermissions = [];
        foreach ($permissions as $p) {
            $duplicate = false;
            foreach ($cleanPermissions as $clean) {
                if ($clean['code'] === $p['code'] || $clean['name'] === $p['name']) {
                    $duplicate = true;
                    break;
                }
            }
            if (!$duplicate) {
                $cleanPermissions[] = $p;
            }
        }

        // Masukkan satu per satu ke database menggunakan updateOrInsert
        foreach ($cleanPermissions as $data) {
            try {
                \Illuminate\Support\Facades\DB::table('permissions')->updateOrInsert(
                    ['code' => $data['code']],
                    [
                        'name' => $data['name'],
                        'module' => $data['module'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            } catch (\Exception $e) {
                continue;
            }
        }
    }
}
