# EMTS - Project Structure Documentation
## Frontend (Next.js) & Backend (Laravel) Folder Structure

---

## 1. ROOT DIRECTORY STRUCTURE

```
EMTS/
├── backend/                    # Laravel 12 API Backend
├── frontend/                   # Next.js 14 Frontend
├── docs/                       # Documentation
├── scripts/                    # Utility Scripts
├── docker/                     # Docker Configuration
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## 2. BACKEND STRUCTURE (Laravel 12)

```
backend/
├── app/
│   ├── Actions/
│   │   ├── Fortify/
│   │   │   ├── CreateNewUser.php
│   │   │   ├── PasswordValidationRules.php
│   │   │   └── UpdateUserProfileInformation.php
│   │   └── Jetstream/
│   │       └── DeleteUser.php
│   ├── Console/
│   │   ├── Commands/
│   │   │   ├── GenerateProjectNumber.php
│   │   │   ├── GenerateJournalNumber.php
│   │   │   ├── SyncAccountBalances.php
│   │   │   └── CleanupExpiredTokens.php
│   │   └── Kernel.php
│   ├── Events/
│   │   ├── ProjectCreated.php
│   │   ├── ExpenseSubmitted.php
│   │   ├── ExpenseApproved.php
│   │   ├── ExpenseRejected.php
│   │   ├── UserLoggedIn.php
│   │   └── AttendanceRecorded.php
│   ├── Exceptions/
│   │   ├── Handler.php
│   │   └── AppException.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── V1/
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   ├── ProjectController.php
│   │   │   │   │   ├── ProjectProgressController.php
│   │   │   │   │   ├── AttendanceController.php
│   │   │   │   │   ├── ScheduleController.php
│   │   │   │   │   ├── PettyCashController.php
│   │   │   │   │   ├── OperationalExpenseController.php
│   │   │   │   │   ├── LargeCashRequestController.php
│   │   │   │   │   ├── ChartOfAccountController.php
│   │   │   │   │   ├── JournalEntryController.php
│   │   │   │   │   ├── ReportController.php
│   │   │   │   │   ├── ApprovalController.php
│   │   │   │   │   ├── UserController.php
│   │   │   │   │   ├── RoleController.php
│   │   │   │   │   ├── PermissionController.php
│   │   │   │   │   ├── AuditLogController.php
│   │   │   │   │   ├── NotificationController.php
│   │   │   │   │   ├── SettingController.php
│   │   │   │   │   ├── VendorController.php
│   │   │   │   │   └── SubcontractorController.php
│   │   │   │   └── Controller.php
│   │   │   └── Controller.php
│   │   ├── Middleware/
│   │   │   ├── Authenticate.php
│   │   │   ├── CheckForMaintenanceMode.php
│   │   │   ├── EncryptCookies.php
│   │   │   ├── PreventRequestsDuringMaintenance.php
│   │   │   ├── RedirectIfAuthenticated.php
│   │   │   ├── TrimStrings.php
│   │   │   ├── TrustHosts.php
│   │   │   ├── TrustProxies.php
│   │   │   ├── ValidateSignature.php
│   │   │   ├── VerifyCsrfToken.php
│   │   │   ├── Api/
│   │   │   │   ├── JwtMiddleware.php
│   │   │   │   ├── RefreshTokenMiddleware.php
│   │   │   │   ├── RoleMiddleware.php
│   │   │   │   ├── PermissionMiddleware.php
│   │   │   │   └── AuditLogMiddleware.php
│   │   │   └── ...
│   │   ├── Requests/
│   │   │   ├── Api/
│   │   │   │   ├── V1/
│   │   │   │   │   ├── Auth/
│   │   │   │   │   │   ├── LoginRequest.php
│   │   │   │   │   │   ├── RegisterRequest.php
│   │   │   │   │   │   ├── ForgotPasswordRequest.php
│   │   │   │   │   │   ├── ResetPasswordRequest.php
│   │   │   │   │   │   └── ChangePasswordRequest.php
│   │   │   │   │   ├── Project/
│   │   │   │   │   │   ├── StoreProjectRequest.php
│   │   │   │   │   │   ├── UpdateProjectRequest.php
│   │   │   │   │   │   └── StoreProgressRequest.php
│   │   │   │   │   ├── Attendance/
│   │   │   │   │   │   ├── CheckInRequest.php
│   │   │   │   │   │   ├── CheckOutRequest.php
│   │   │   │   │   │   └── LeaveRequest.php
│   │   │   │   │   ├── Finance/
│   │   │   │   │   │   ├── StoreExpenseRequest.php
│   │   │   │   │   │   ├── StoreLargeCashRequest.php
│   │   │   │   │   │   └── StoreJournalRequest.php
│   │   │   │   │   ├── User/
│   │   │   │   │   │   ├── StoreUserRequest.php
│   │   │   │   │   │   └── UpdateUserRequest.php
│   │   │   │   │   └── Request.php
│   │   │   │   └── Request.php
│   │   │   └── Request.php
│   │   ├── Resources/
│   │   │   ├── Api/
│   │   │   │   ├── V1/
│   │   │   │   │   ├── UserResource.php
│   │   │   │   │   ├── RoleResource.php
│   │   │   │   │   ├── PermissionResource.php
│   │   │   │   │   ├── ProjectResource.php
│   │   │   │   │   ├── ProjectProgressResource.php
│   │   │   │   │   ├── AttendanceResource.php
│   │   │   │   │   ├── ScheduleResource.php
│   │   │   │   │   ├── PettyCashResource.php
│   │   │   │   │   ├── ExpenseResource.php
│   │   │   │   │   ├── LargeCashRequestResource.php
│   │   │   │   │   ├── ChartOfAccountResource.php
│   │   │   │   │   ├── JournalEntryResource.php
│   │   │   │   │   ├── ReportResource.php
│   │   │   │   │   ├── ApprovalResource.php
│   │   │   │   │   ├── AuditLogResource.php
│   │   │   │   │   ├── NotificationResource.php
│   │   │   │   │   ├── VendorResource.php
│   │   │   │   │   └── SubcontractorResource.php
│   │   │   │   └── JsonResource.php
│   │   │   └── JsonResource.php
│   │   ├── Kernel.php
│   │   └── Controllers/
│   ├── Jobs/
│   │   ├── ProcessExpenseApproval.php
│   │   ├── GenerateProjectReport.php
│   │   ├── SendNotificationEmail.php
│   │   ├── SyncLedgerEntries.php
│   │   └── CleanupExpiredRefreshTokens.php
│   ├── Listeners/
│   │   ├── SendProjectCreatedNotification.php
│   │   ├── LogExpenseApproval.php
│   │   ├── LogUserLogin.php
│   │   └── SyncAccountBalance.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Role.php
│   │   ├── Permission.php
│   │   ├── Project.php
│   │   ├── ProjectMember.php
│   │   ├── ProjectTask.php
│   │   ├── ProjectProgress.php
│   │   ├── ProgressPhoto.php
│   │   ├── ProjectReport.php
│   │   ├── ProjectDoc.php
│   │   ├── ProjectMilestone.php
│   │   ├── Attendance.php
│   │   ├── AttendanceLog.php
│   │   ├── OvertimeRecord.php
│   │   ├── LeaveRequest.php
│   │   ├── WorkSchedule.php
│   │   ├── Schedule.php
│   │   ├── Meeting.php
│   │   ├── MeetingParticipant.php
│   │   ├── Reminder.php
│   │   ├── PettyCashFund.php
│   │   ├── PettyCashTransaction.php
│   │   ├── ExpenseCategory.php
│   │   ├── OperationalExpense.php
│   │   ├── LargeCashRequest.php
│   │   ├── LargeCashItem.php
│   │   ├── PaymentRecord.php
│   │   ├── Vendor.php
│   │   ├── Subcontractor.php
│   │   ├── ChartOfAccount.php
│   │   ├── JournalEntry.php
│   │   ├── JournalItem.php
│   │   ├── LedgerEntry.php
│   │   ├── AccountBalance.php
│   │   ├── Approval.php
│   │   ├── ApprovalHistory.php
│   │   ├── AuditLog.php
│   │   ├── Setting.php
│   │   ├── Notification.php
│   │   └── RefreshToken.php
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   ├── AuthServiceProvider.php
│   │   ├── EventServiceProvider.php
│   │   └── RouteServiceProvider.php
│   ├── Repositories/
│   │   ├── Interfaces/
│   │   │   ├── UserRepositoryInterface.php
│   │   │   ├── ProjectRepositoryInterface.php
│   │   │   ├── AttendanceRepositoryInterface.php
│   │   │   ├── FinanceRepositoryInterface.php
│   │   │   └── ReportRepositoryInterface.php
│   │   ├── UserRepository.php
│   │   ├── ProjectRepository.php
│   │   ├── AttendanceRepository.php
│   │   ├── FinanceRepository.php
│   │   └── ReportRepository.php
│   ├── Services/
│   │   ├── AuthService.php
│   │   ├── ProjectService.php
│   │   ├── AttendanceService.php
│   │   ├── FinanceService.php
│   │   ├── AccountingService.php
│   │   ├── ReportService.php
│   │   ├── ApprovalService.php
│   │   ├── NotificationService.php
│   │   ├── AuditService.php
│   │   └── FileStorageService.php
│   ├── Traits/
│   │   ├── HasRoles.php
│   │   ├── HasPermissions.php
│   │   ├── HasApprovals.php
│   │   ├── Auditable.php
│   │   └── Filterable.php
│   └── Helpers/
│       ├── ResponseHelper.php
│       ├── DateHelper.php
│       └── NumberHelper.php
├── bootstrap/
│   ├── app.php
│   └── cache/
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── cors.php
│   ├── database.php
│   ├── filesystems.php
│   ├── jwt.php
│   ├── logging.php
│   ├── mail.php
│   ├── queue.php
│   ├── sanctum.php
│   ├── services.php
│   ├── session.php
│   └── view.php
├── database/
│   ├── factories/
│   │   ├── UserFactory.php
│   │   ├── ProjectFactory.php
│   │   ├── AttendanceFactory.php
│   │   └── ExpenseFactory.php
│   ├── migrations/
│   │   ├── 2024_01_01_000000_create_users_table.php
│   │   ├── 2024_01_01_000001_create_roles_table.php
│   │   ├── 2024_01_01_000002_create_permissions_table.php
│   │   ├── 2024_01_01_000003_create_role_permissions_table.php
│   │   ├── 2024_01_01_000004_create_refresh_tokens_table.php
│   │   ├── 2024_01_01_000005_create_password_resets_table.php
│   │   ├── 2024_01_01_000006_create_projects_table.php
│   │   ├── 2024_01_01_000007_create_project_members_table.php
│   │   ├── 2024_01_01_000008_create_project_tasks_table.php
│   │   ├── 2024_01_01_000009_create_project_progress_table.php
│   │   ├── 2024_01_01_000010_create_progress_photos_table.php
│   │   ├── 2024_01_01_000011_create_project_reports_table.php
│   │   ├── 2024_01_01_000012_create_project_docs_table.php
│   │   ├── 2024_01_01_000013_create_project_milestones_table.php
│   │   ├── 2024_01_01_000014_create_attendances_table.php
│   │   ├── 2024_01_01_000015_create_attendance_logs_table.php
│   │   ├── 2024_01_01_000016_create_overtime_records_table.php
│   │   ├── 2024_01_01_000017_create_leave_requests_table.php
│   │   ├── 2024_01_01_000018_create_work_schedules_table.php
│   │   ├── 2024_01_01_000019_create_schedules_table.php
│   │   ├── 2024_01_01_000020_create_meetings_table.php
│   │   ├── 2024_01_01_000021_create_meeting_participants_table.php
│   │   ├── 2024_01_01_000022_create_reminders_table.php
│   │   ├── 2024_01_01_000023_create_petty_cash_funds_table.php
│   │   ├── 2024_01_01_000024_create_petty_cash_transactions_table.php
│   │   ├── 2024_01_01_000025_create_expense_categories_table.php
│   │   ├── 2024_01_01_000026_create_operational_expenses_table.php
│   │   ├── 2024_01_01_000027_create_large_cash_requests_table.php
│   │   ├── 2024_01_01_000028_create_large_cash_items_table.php
│   │   ├── 2024_01_01_000029_create_payment_records_table.php
│   │   ├── 2024_01_01_000030_create_vendors_table.php
│   │   ├── 2024_01_01_000031_create_subcontractors_table.php
│   │   ├── 2024_01_01_000032_create_chart_of_accounts_table.php
│   │   ├── 2024_01_01_000033_create_journal_entries_table.php
│   │   ├── 2024_01_01_000034_create_journal_items_table.php
│   │   ├── 2024_01_01_000035_create_ledger_entries_table.php
│   │   ├── 2024_01_01_000036_create_account_balances_table.php
│   │   ├── 2024_01_01_000037_create_approvals_table.php
│   │   ├── 2024_01_01_000038_create_approval_histories_table.php
│   │   ├── 2024_01_01_000039_create_audit_logs_table.php
│   │   ├── 2024_01_01_000040_create_settings_table.php
│   │   └── 2024_01_01_000041_create_notifications_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── RoleSeeder.php
│       ├── PermissionSeeder.php
│       ├── RolePermissionSeeder.php
│       ├── UserSeeder.php
│       ├── ChartOfAccountSeeder.php
│       ├── ExpenseCategorySeeder.php
│       └── SettingSeeder.php
├── public/
│   ├── index.php
│   └── storage/
├── resources/
│   ├── lang/
│   └── views/
├── routes/
│   ├── api.php
│   ├── channels.php
│   ├── console.php
│   └── web.php
├── storage/
│   ├── app/
│   ├── framework/
│   └── logs/
├── tests/
│   ├── Feature/
│   │   ├── AuthTest.php
│   │   ├── ProjectTest.php
│   │   ├── AttendanceTest.php
│   │   ├── FinanceTest.php
│   │   └── ReportTest.php
│   ├── Unit/
│   │   ├── ProjectServiceTest.php
│   │   ├── FinanceServiceTest.php
│   │   └── AccountingServiceTest.php
│   └── TestCase.php
├── .env.example
├── .gitignore
├── artisan
├── composer.json
├── composer.lock
├── package.json
├── phpunit.xml
├── README.md
└── server.php
```

---

## 3. FRONTEND STRUCTURE (Next.js 14)

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── director/
│   │   │   └── page.tsx
│   │   ├── accounting/
│   │   │   └── page.tsx
│   │   ├── administration/
│   │   │   └── page.tsx
│   │   ├── project-manager/
│   │   │   └── page.tsx
│   │   └── employee/
│   │       └── page.tsx
│   ├── projects/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── overview/
│   │   │   │   └── page.tsx
│   │   │   ├── progress/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── daily/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── weekly/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── monthly/
│   │   │   │       └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   └── team/
│   │   │       └── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   ├── attendance/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── check-in/
│   │   │   └── page.tsx
│   │   ├── check-out/
│   │   │   └── page.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── employees/
│   │       │   └── page.tsx
│   │       └── reports/
│   │           └── page.tsx
│   ├── scheduling/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   └── page.tsx
│   │   ├── employees/
│   │   │   └── page.tsx
│   │   ├── meetings/
│   │   │   └── page.tsx
│   │   └── reminders/
│   │       └── page.tsx
│   ├── cash-flow/
│   │   ├── layout.tsx
│   │   ├── operational/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── petty-cash/
│   │   │   │   └── page.tsx
│   │   │   ├── expenses/
│   │   │   │   └── page.tsx
│   │   │   └── reports/
│   │   │       └── page.tsx
│   │   └── large/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── requests/
│   │       │   └── page.tsx
│   │       ├── approvals/
│   │       │   └── page.tsx
│   │       └── history/
│   │           └── page.tsx
│   ├── accounting/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── chart-of-accounts/
│   │   │   └── page.tsx
│   │   ├── journal/
│   │   │   └── page.tsx
│   │   ├── ledger/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── reports/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── cash-flow/
│   │   │   └── page.tsx
│   │   ├── profit-loss/
│   │   │   └── page.tsx
│   │   ├── balance-sheet/
│   │   │   └── page.tsx
│   │   ├── ledger/
│   │   │   └── page.tsx
│   │   └── journal/
│   │       └── page.tsx
│   ├── approvals/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── pending/
│   │   │   └── page.tsx
│   │   ├── approved/
│   │   │   └── page.tsx
│   │   ├── rejected/
│   │   │   └── page.tsx
│   │   └── history/
│   │       └── page.tsx
│   ├── users/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── roles/
│   │       └── page.tsx
│   ├── settings/
│   │   ├── layout.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── security/
│   │   │   └── page.tsx
│   │   └── notifications/
│   │       └── page.tsx
│   ├── audit/
│   │   ├── layout.tsx
│   │   ├── logs/
│   │   │   └── page.tsx
│   │   └── reports/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── loading.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── calendar.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   ├── switch.tsx
│   │   ├── toast.tsx
│   │   ├── alert.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── popover.tsx
│   │   ├── tooltip.tsx
│   │   ├── form.tsx
│   │   ├── pagination.tsx
│   │   └── data-table.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   ├── mobile-nav.tsx
│   │   └── user-menu.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   ├── reset-password-form.tsx
│   │   └── change-password-form.tsx
│   ├── dashboard/
│   │   ├── stats-card.tsx
│   │   ├── chart-card.tsx
│   │   ├── activity-feed.tsx
│   │   ├── approval-widget.tsx
│   │   ├── director-dashboard.tsx
│   │   ├── accounting-dashboard.tsx
│   │   ├── administration-dashboard.tsx
│   │   ├── project-manager-dashboard.tsx
│   │   └── employee-dashboard.tsx
│   ├── projects/
│   │   ├── project-card.tsx
│   │   ├── project-list.tsx
│   │   ├── project-form.tsx
│   │   ├── project-detail.tsx
│   │   ├── progress-form.tsx
│   │   ├── progress-timeline.tsx
│   │   ├── photo-uploader.tsx
│   │   ├── team-member-list.tsx
│   │   └── task-list.tsx
│   ├── attendance/
│   │   ├── attendance-calendar.tsx
│   │   ├── check-in-form.tsx
│   │   ├── check-out-form.tsx
│   │   ├── attendance-stats.tsx
│   │   ├── leave-request-form.tsx
│   │   └── attendance-report.tsx
│   ├── scheduling/
│   │   ├── calendar-view.tsx
│   │   ├── schedule-form.tsx
│   │   ├── meeting-form.tsx
│   │   ├── reminder-form.tsx
│   │   └── event-card.tsx
│   ├── finance/
│   │   ├── expense-form.tsx
│   │   ├── expense-list.tsx
│   │   ├── petty-cash-form.tsx
│   │   ├── large-cash-form.tsx
│   │   ├── approval-request.tsx
│   │   ├── payment-form.tsx
│   │   └── vendor-form.tsx
│   ├── accounting/
│   │   ├── coa-tree.tsx
│   │   ├── coa-form.tsx
│   │   ├── journal-form.tsx
│   │   ├── journal-list.tsx
│   │   ├── ledger-view.tsx
│   │   └── balance-view.tsx
│   ├── reports/
│   │   ├── report-filters.tsx
│   │   ├── cash-flow-report.tsx
│   │   ├── profit-loss-report.tsx
│   │   ├── balance-sheet-report.tsx
│   │   ├── ledger-report.tsx
│   │   └── export-button.tsx
│   ├── approvals/
│   │   ├── approval-list.tsx
│   │   ├── approval-card.tsx
│   │   ├── approval-actions.tsx
│   │   └── approval-history.tsx
│   ├── users/
│   │   ├── user-list.tsx
│   │   ├── user-form.tsx
│   │   ├── user-card.tsx
│   │   ├── role-selector.tsx
│   │   └── permission-matrix.tsx
│   ├── audit/
│   │   ├── audit-log-table.tsx
│   │   ├── log-filters.tsx
│   │   └── activity-timeline.tsx
│   ├── shared/
│   │   ├── data-table.tsx
│   │   ├── data-table-column-header.tsx
│   │   ├── data-table-pagination.tsx
│   │   ├── data-table-toolbar.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-boundary.tsx
│   │   ├── confirm-dialog.tsx
│   │   ├── file-upload.tsx
│   │   ├── image-preview.tsx
│   │   ├── date-range-picker.tsx
│   │   └── search-input.tsx
│   └── providers/
│       ├── theme-provider.tsx
│       ├── auth-provider.tsx
│       ├── query-provider.tsx
│       └── toast-provider.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── attendance.ts
│   │   ├── scheduling.ts
│   │   ├── finance.ts
│   │   ├── accounting.ts
│   │   ├── reports.ts
│   │   ├── approvals.ts
│   │   ├── users.ts
│   │   ├── audit.ts
│   │   └── settings.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-projects.ts
│   │   ├── use-attendance.ts
│   │   ├── use-finance.ts
│   │   ├── use-accounting.ts
│   │   ├── use-reports.ts
│   │   ├── use-approvals.ts
│   │   ├── use-users.ts
│   │   └── use-audit.ts
│   ├── store/
│   │   ├── auth-store.ts
│   │   ├── project-store.ts
│   │   ├── ui-store.ts
│   │   └── notification-store.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── date.ts
│   │   ├── number.ts
│   │   ├── validation.ts
│   │   ├── format.ts
│   │   └── constants.ts
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── project.ts
│   │   ├── attendance.ts
│   │   ├── finance.ts
│   │   └── user.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── project.ts
│   │   ├── attendance.ts
│   │   ├── finance.ts
│   │   ├── accounting.ts
│   │   ├── user.ts
│   │   └── common.ts
│   └── config/
│       ├── api.ts
│       └── constants.ts
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── placeholder.svg
│   ├── icons/
│   └── fonts/
├── styles/
│   └── globals.css
├── .env.example
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── components.json
└── README.md
```

---

## 4. SHARED CONFIGURATION

### 4.1 Environment Variables

#### Backend (.env)
```env
APP_NAME=EMTS
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://api.emts.com

LOG_CHANNEL=daily
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=emts_db
DB_USERNAME=emts_user
DB_PASSWORD=secure_password

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@emts.com"
MAIL_FROM_NAME="${APP_NAME}"

JWT_SECRET=your_jwt_secret_key
JWT_TTL=1440
JWT_REFRESH_TTL=20160

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_APP_NAME=EMTS
NEXT_PUBLIC_API_URL=https://api.emts.com/api/v1
NEXT_PUBLIC_APP_URL=https://emts.com

NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_SENTRY=false
```

---

## 5. DOCKER STRUCTURE

```
docker/
├── nginx/
│   ├── nginx.conf
│   └── sites-available/
│       └── emts.conf
├── php/
│   ├── Dockerfile
│   └── php.ini
├── postgresql/
│   ├── Dockerfile
│   └── init.sql
└── redis/
    └── Dockerfile
```

---

## 6. DOCUMENTATION STRUCTURE

```
docs/
├── api/
│   ├── authentication.md
│   ├── projects.md
│   ├── attendance.md
│   ├── finance.md
│   ├── accounting.md
│   ├── reports.md
│   ├── approvals.md
│   ├── users.md
│   └── audit.md
├── deployment/
│   ├── backend.md
│   ├── frontend.md
│   ├── database.md
│   └── monitoring.md
├── development/
│   ├── setup.md
│   ├── coding-standards.md
│   ├── testing.md
│   └── git-workflow.md
├── architecture/
│   ├── overview.md
│   ├── database.md
│   ├── security.md
│   └── scalability.md
└── user/
    ├── getting-started.md
    ├── user-guide.md
    └── faq.md
```

---

## 7. SCRIPTS STRUCTURE

```
scripts/
├── deploy/
│   ├── deploy-backend.sh
│   ├── deploy-frontend.sh
│   └── deploy-all.sh
├── backup/
│   ├── backup-database.sh
│   ├── backup-storage.sh
│   └── restore-database.sh
├── maintenance/
│   ├── clear-cache.sh
│   ├── optimize.sh
│   └── migrate.sh
└── development/
    ├── seed-database.sh
    ├── test-all.sh
    └── lint.sh
```

---

## 8. NAMING CONVENTIONS

### 8.1 Backend (Laravel)
- **Classes**: PascalCase (e.g., `ProjectService`)
- **Methods**: camelCase (e.g., `getProjectById`)
- **Variables**: camelCase (e.g., `$projectId`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PROJECTS`)
- **Tables**: snake_case (e.g., `project_members`)
- **Columns**: snake_case (e.g., `project_id`)

### 8.2 Frontend (Next.js)
- **Components**: PascalCase (e.g., `ProjectCard`)
- **Files**: kebab-case (e.g., `project-card.tsx`)
- **Functions**: camelCase (e.g., `getProjectById`)
- **Variables**: camelCase (e.g., `projectId`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `Project`)

---

## 9. FILE SIZE GUIDELINES

- **Controllers**: Max 500 lines
- **Services**: Max 400 lines
- **Components**: Max 300 lines
- **Utilities**: Max 200 lines
- **Types**: Max 150 lines per file

If a file exceeds these limits, consider splitting it into smaller, focused modules.

---

## 10. DEPENDENCY MANAGEMENT

### 10.1 Backend (composer.json)
```json
{
  "require": {
    "php": "^8.2",
    "laravel/framework": "^11.0",
    "tymon/jwt-auth": "^2.0",
    "spatie/laravel-permission": "^6.0",
    "barryvdh/laravel-dompdf": "^2.0",
    "maatwebsite/excel": "^3.1",
    "intervention/image": "^3.0",
    "predis/predis": "^2.2",
    "guzzlehttp/guzzle": "^7.8"
  },
  "require-dev": {
    "phpunit/phpunit": "^11.0",
    "fakerphp/faker": "^1.23",
    "laravel/pint": "^1.13",
    "laravel/sail": "^1.27"
  }
}
```

### 10.2 Frontend (package.json)
```json
{
  "dependencies": {
    "next": "^14.1",
    "react": "^18.2",
    "react-dom": "^18.2",
    "@radix-ui/react-*": "^1.0",
    "class-variance-authority": "^0.7",
    "clsx": "^2.1",
    "tailwind-merge": "^2.2",
    "lucide-react": "^0.344",
    "recharts": "^2.12",
    "react-hook-form": "^7.51",
    "zod": "^3.22",
    "@hookform/resolvers": "^3.3",
    "axios": "^1.6",
    "zustand": "^4.5",
    "@tanstack/react-query": "^5.28",
    "date-fns": "^3.3",
    "react-day-picker": "^8.10",
    "cmdk": "^1.0",
    "sonner": "^1.4"
  },
  "devDependencies": {
    "typescript": "^5.3",
    "@types/node": "^20.11",
    "@types/react": "^18.2",
    "@types/react-dom": "^18.2",
    "autoprefixer": "^10.4",
    "postcss": "^8.4",
    "tailwindcss": "^3.4",
    "eslint": "^8.56",
    "eslint-config-next": "^14.1",
    "prettier": "^3.2",
    "prettier-plugin-tailwindcss": "^0.5"
  }
}
```

---

## DOCUMENT VERSION

- **Version**: 1.0
- **Date**: 2024
- **Author**: Elyn MMT Tech System
- **Status**: Approved
