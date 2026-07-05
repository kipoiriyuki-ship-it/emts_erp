# EMTS Testing Checklist

---

## 1. AUTHENTICATION TESTING

### 1.1 Login Functionality
- [ ] Valid credentials login successfully
- [ ] Invalid credentials show error message
- [ ] Empty fields show validation errors
- [ ] Inactive account cannot login
- [ ] JWT token is generated and stored
- [ ] Refresh token is generated and stored
- [ ] User is redirected to correct dashboard

### 1.2 Logout Functionality
- [ ] Logout revokes access token
- [ ] Logout revokes refresh token
- [ ] User is redirected to login page
- [ ] Cannot access protected routes after logout

### 1.3 Password Reset
- [ ] Forgot password email is sent
- [ ] Reset token is valid
- [ ] Password can be reset with valid token
- [ ] Invalid token shows error
- [ ] Expired token shows error
- [ ] Password change requires current password

### 1.4 Token Refresh
- [ ] Access token refreshes automatically
- [ ] Invalid refresh token shows error
- [ ] Expired refresh token shows error
- [ ] User is logged out on refresh failure

---

## 2. AUTHORIZATION TESTING

### 2.1 Role-Based Access Control
- [ ] Director can access all modules
- [ ] Accounting can access financial modules
- [ ] Admin can access operational modules
- [ ] Project Manager can access project modules
- [ ] Employee can access basic modules
- [ ] Users cannot access modules outside their role

### 2.2 Permission Matrix
- [ ] Each permission is correctly assigned
- [ ] Permission checks work on all endpoints
- [ ] Frontend UI respects permissions
- [ ] API enforces permissions
- [ ] Permission changes take effect immediately

### 2.3 Cross-Role Access
- [ ] Users cannot access other users' data
- [ ] Project managers cannot access other projects
- [ ] Employees cannot access sensitive data
- [ ] Admin cannot access financial modules

---

## 3. PROJECT MANAGEMENT TESTING

### 3.1 Project CRUD
- [ ] Create project with valid data
- [ ] Create project validates required fields
- [ ] Update project information
- [ ] Delete project (not running)
- [ ] Cannot delete running project
- [ ] Project number is unique

### 3.2 Project Progress
- [ ] Add progress to project
- [ ] Progress updates project percentage
- [ ] Progress can include photos
- [ ] Progress shows challenges and solutions
- [ ] Progress history is maintained

### 3.3 Project Members
- [ ] Add member to project
- [ ] Remove member from project
- [ ] Member role is assigned
- [ ] Duplicate members are prevented

### 3.4 Project Status
- [ ] Status transitions work correctly
- [ ] Status changes are logged
- [ ] Status affects project visibility

---

## 4. ATTENDANCE TESTING

### 4.1 Check In
- [ ] User can check in with GPS
- [ ] User can check in with selfie
- [ ] Check in records timestamp
- [ ] Check in records location
- [ ] Duplicate check in is prevented
- [ ] Late check in is marked correctly

### 4.2 Check Out
- [ ] User can check out
- [ ] Check out records timestamp
- [ ] Check out calculates work hours
- [ ] Check out requires check in
- [ ] Check out can include notes

### 4.3 Attendance Records
- [ ] Attendance history is accurate
- [ ] Attendance can be filtered by date
- [ ] Attendance can be filtered by status
- [ ] Admin can view all attendance
- [ ] Users can only view own attendance

### 4.4 Leave Requests
- [ ] User can request leave
- [ ] Leave request requires approval
- [ ] Leave request shows status
- [ ] Leave request includes reason
- [ ] Leave dates are validated

---

## 5. FINANCIAL MODULES TESTING

### 5.1 Operational Expenses
- [ ] Create expense with valid data
- [ ] Expense requires category
- [ ] Expense requires amount
- [ ] Expense can be approved
- [ ] Expense can be rejected
- [ ] Expense status changes correctly
- [ ] Approved expense cannot be edited
- [ ] Receipt upload works correctly

### 5.2 Large Cash Requests
- [ ] Create request with items
- [ ] Request calculates total amount
- [ ] Request can be submitted
- [ ] Request requires approval
- [ ] Director can approve request
- [ ] Director can reject request
- [ ] Approval workflow works correctly
- [ ] Request status is tracked

### 5.3 Petty Cash
- [ ] Petty cash fund is created
- [ ] Petty cash transactions work
- [ ] Balance is calculated correctly
- [ ] Transactions are logged

---

## 6. ACCOUNTING TESTING

### 6.1 Chart of Accounts
- [ ] Create account with valid data
- [ ] Account number is unique
- [ ] Account type is validated
- [ ] Parent-child relationships work
- [ ] Account can be deactivated
- [ ] Account with children cannot be deleted

### 6.2 Journal Entries
- [ ] Create journal entry
- [ ] Journal must be balanced
- [ ] Journal items are validated
- [ ] Journal can be posted
- [ ] Posted journal cannot be edited
- [ ] Journal creates ledger entries
- [ ] Journal number is unique

### 6.3 Ledger
- [ ] Ledger entries are created
- [ ] Ledger shows correct balances
- [ ] Ledger can be filtered by account
- [ ] Ledger can be filtered by date
- [ ] Ledger is accurate

### 6.4 Account Balances
- [ ] Balances are calculated correctly
- [ ] Balances are updated on posting
- [ ] Balances can be viewed by period
- [ ] Opening balance is correct
- [ ] Closing balance is correct

---

## 7. REPORTS TESTING

### 7.1 Cash Flow Report
- [ ] Report generates for date range
- [ ] Report shows correct inflows
- [ ] Report shows correct outflows
- [ ] Net cash flow is accurate
- [ ] Report can be exported to PDF
- [ ] Report can be exported to Excel

### 7.2 Profit Loss Report
- [ ] Report generates for date range
- [ ] Revenue is calculated correctly
- [ ] Expenses are calculated correctly
- [ ] Net profit is accurate
- [ ] Profit margin is calculated
- [ ] Report can be exported

### 7.3 Balance Sheet Report
- [ ] Report generates for as-of date
- [ ] Assets are calculated correctly
- [ ] Liabilities are calculated correctly
- [ ] Equity is calculated correctly
- [ ] Balance equation holds
- [ ] Report can be exported

### 7.4 Journal Report
- [ ] Report generates for date range
- [ ] All journals are included
- [ ] Journal details are correct
- [ ] Report can be filtered
- [ ] Report can be exported

---

## 8. APPROVAL SYSTEM TESTING

### 8.1 Approval Workflow
- [ ] Request creates approval
- [ ] Approval is assigned to correct user
- [ ] Approver can approve
- [ ] Approver can reject
- [ ] Approval history is maintained
- [ ] Approval status is updated

### 8.2 Approval Notifications
- [ ] Approver is notified
- [ ] Requester is notified of approval
- [ ] Requester is notified of rejection
- [ ] Notifications are read/unread

### 8.3 Approval Lists
- [ ] Pending approvals are listed
- [ ] Approved approvals are listed
- [ ] Rejected approvals are listed
- [ ] Lists can be filtered
- [ ] Lists are paginated

---

## 9. USER MANAGEMENT TESTING

### 9.1 User CRUD
- [ ] Create user with valid data
- [ ] Email is unique
- [ ] Role is assigned
- [ ] User can be updated
- [ ] User can be deleted
- [ ] Cannot delete own account

### 9.2 Role Management
- [ ] Roles can be viewed
- [ ] Permissions can be viewed
- [ ] Role-permission matrix is correct
- [ ] Role changes take effect

### 9.3 Profile Management
- [ ] User can update profile
- [ ] User can change password
- [ ] Profile image can be uploaded
- [ ] Changes are saved correctly

---

## 10. AUDIT TRAIL TESTING

### 10.1 Activity Logging
- [ ] Login is logged
- [ ] Logout is logged
- [ ] Create operations are logged
- [ ] Update operations are logged
- [ ] Delete operations are logged
- [ ] Approval actions are logged

### 10.2 Log Details
- [ ] User is recorded
- [ ] Timestamp is recorded
- [ ] IP address is recorded
- [ ] User agent is recorded
- [ ] Old values are recorded (updates)
- [ ] New values are recorded

### 10.3 Log Access
- [ ] Logs can be viewed
- [ ] Logs can be filtered
- [ ] Logs can be exported
- [ ] Logs are paginated
- [ ] Log search works

---

## 11. API TESTING

### 11.1 Endpoint Testing
- [ ] All endpoints respond correctly
- [ ] Authentication is enforced
- [ ] Authorization is enforced
- [ ] Validation errors are returned
- [ ] Error responses are consistent
- [ ] Rate limiting works

### 11.2 Request/Response Testing
- [ ] Request format is correct
- [ ] Response format is correct
- [ ] Pagination works
- [ ] Filtering works
- [ ] Sorting works
- [ ] Search works

### 11.3 Error Handling
- [ ] 400 errors are handled
- [ ] 401 errors are handled
- [ ] 403 errors are handled
- [ ] 404 errors are handled
- [ ] 500 errors are handled
- [ ] Error messages are clear

---

## 12. FRONTEND TESTING

### 12.1 UI Testing
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Forms submit correctly
- [ ] Validation messages show
- [ ] Loading states work
- [ ] Error states work

### 12.2 Responsive Design
- [ ] Desktop view works
- [ ] Tablet view works
- [ ] Mobile view works
- [ ] Layout adapts correctly
- [ ] Touch interactions work

### 12.3 Browser Compatibility
- [ ] Chrome works
- [ ] Firefox works
- [ ] Safari works
- [ ] Edge works
- [ ] Mobile browsers work

---

## 13. PERFORMANCE TESTING

### 13.1 Load Testing
- [ ] System handles 100 concurrent users
- [ ] Response time < 500ms
- [ ] Page load time < 2s
- [ ] No memory leaks
- [ ] No database connection leaks

### 13.2 Database Performance
- [ ] Queries are optimized
- [ ] Indexes are used
- [ ] No N+1 queries
- [ ] Connection pooling works
- [ ] Query cache works

### 13.3 Frontend Performance
- [ ] Bundle size is optimized
- [ ] Images are optimized
- [ ] Lazy loading works
- [ ] Code splitting works
- [ ] Caching works

---

## 14. SECURITY TESTING

### 14.1 Authentication Security
- [ ] Passwords are hashed
- [ ] JWT tokens are secure
- [ ] Session timeout works
- [ ] Brute force protection works
- [ ] Account lockout works

### 14.2 Input Validation
- [ ] SQL injection is prevented
- [ ] XSS is prevented
- [ ] CSRF is prevented
- [ ] File upload validation works
- [ ] Input sanitization works

### 14.3 Authorization Security
- [ ] Unauthorized access is prevented
- [ ] Role escalation is prevented
- [ ] Permission bypass is prevented
- [ ] Direct object reference is prevented
- [ ] IDOR is prevented

---

## 15. INTEGRATION TESTING

### 15.1 Module Integration
- [ ] Projects integrate with finance
- [ ] Attendance integrates with HR
- [ ] Accounting integrates with finance
- [ ] Approvals integrate with all modules
- [ ] Audit trail integrates with all modules

### 15.2 Data Flow
- [ ] Data flows correctly between modules
- [ ] Data consistency is maintained
- [ ] Data integrity is preserved
- [ ] Transactions work correctly
- [ ] Rollback works on errors

---

## 16. DEPLOYMENT TESTING

### 16.1 Production Deployment
- [ ] Deployment script works
- [ ] Database migrations run
- [ ] Seed data is loaded
- [ ] Environment variables are set
- [ ] Services start correctly

### 16.2 Post-Deployment
- [ ] All features work in production
- [ ] Performance is acceptable
- [ ] No errors in logs
- [ ] Monitoring works
- [ ] Backups run

---

## 17. USER ACCEPTANCE TESTING

### 17.1 Director UAT
- [ ] Can view all projects
- [ ] Can approve large cash requests
- [ ] Can view financial reports
- [ ] Can manage users
- [ ] Can view audit logs

### 17.2 Accounting UAT
- [ ] Can manage chart of accounts
- [ ] Can create journal entries
- [ ] Can generate reports
- [ ] Can approve operational expenses
- [ ] Can view financial data

### 17.3 Admin UAT
- [ ] Can manage attendance
- [ ] Can manage operational expenses
- [ ] Can view schedules
- [ ] Can approve small expenses
- [ ] Can manage petty cash

### 17.4 Project Manager UAT
- [ ] Can create projects
- [ ] Can update progress
- [ ] Can manage team
- [ ] Can request large cash
- [ ] Can view project reports

### 17.5 Employee UAT
- [ ] Can check in/out
- [ ] Can view schedule
- [ ] Can request leave
- [ ] Can view own attendance
- [ ] Can view own tasks

---

## 18. REGRESSION TESTING

### 18.1 Critical Path Testing
- [ ] Login flow works
- [ ] Dashboard loads
- [ ] Core modules work
- [ ] Data persistence works
- [ ] Logout works

### 18.2 Bug Fixes
- [ ] Previous bugs are fixed
- [ ] No new bugs introduced
- [ ] Edge cases are handled
- [ ] Error conditions are handled

---

## DOCUMENT VERSION

- **Version**: 1.0
- **Date**: 2024
- **Status**: Active
