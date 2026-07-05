# EMTS API Documentation
## REST API Reference

---

## BASE URL

```
Production: https://api.emts.com/api/v1
Development: http://localhost:8000/api/v1
```

---

## AUTHENTICATION

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {access_token}
```

---

## ENDPOINTS

### Authentication

#### POST /auth/login
Login user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "refresh_token_here",
    "token_type": "bearer",
    "expires_in": 1440,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": {
        "id": 1,
        "name": "Director",
        "code": "DIRECTOR",
        "level": 1
      },
      "permissions": ["PROJECT.CREATE", "PROJECT.VIEW_ALL"]
    }
  }
}
```

#### POST /auth/logout
Logout user and revoke tokens.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token",
    "refresh_token": "new_refresh_token",
    "token_type": "bearer",
    "expires_in": 1440
  }
}
```

#### GET /auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": {...},
    "permissions": [...]
  }
}
```

#### POST /auth/change-password
Change user password.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "current_password": "old_password",
  "new_password": "new_password123",
  "new_password_confirmation": "new_password123"
}
```

#### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "reset_token",
  "password": "new_password123",
  "password_confirmation": "new_password123"
}
```

---

### Dashboard

#### GET /dashboard
Get dashboard data based on user role.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {...},
    "financial": {...},
    "approvals": {...},
    "recent_projects": [...]
  }
}
```

---

### Projects

#### GET /projects
Get all projects.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status (planning, running, hold, completed, cancelled)
- `per_page` (optional): Items per page (default: 15)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 50
  }
}
```

#### POST /projects
Create new project.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "Project Name",
  "client_name": "Client Name",
  "location": "Project Location",
  "contract_value": 100000000,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "description": "Project description"
}
```

#### GET /projects/{id}
Get specific project.

**Headers:** `Authorization: Bearer {token}`

#### PUT /projects/{id}
Update project.

**Headers:** `Authorization: Bearer {token}`

#### DELETE /projects/{id}
Delete project.

**Headers:** `Authorization: Bearer {token}`

#### POST /projects/{id}/progress
Add progress to project.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "date": "2024-01-15",
  "percentage": 25,
  "description": "Progress description",
  "challenges": "Challenges faced",
  "solutions": "Solutions implemented"
}
```

#### GET /projects/{id}/members
Get project members.

**Headers:** `Authorization: Bearer {token}`

#### POST /projects/{id}/members
Add member to project.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "user_id": 5,
  "role": "Engineer"
}
```

#### DELETE /projects/{id}/members/{userId}
Remove member from project.

**Headers:** `Authorization: Bearer {token}`

---

### Attendance

#### POST /attendance/check-in
Check in for attendance.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "lat": -6.2088,
  "lng": 106.8456,
  "photo_url": "https://example.com/photo.jpg"
}
```

#### POST /attendance/check-out
Check out for attendance.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "lat": -6.2088,
  "lng": 106.8456,
  "photo_url": "https://example.com/photo.jpg",
  "notes": "Work completed"
}
```

#### GET /attendance/my
Get my attendance records.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (optional): Filter start date
- `end_date` (optional): Filter end date
- `per_page` (optional): Items per page

#### GET /attendance/all
Get all attendance records (admin only).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (optional): Filter start date
- `end_date` (optional): Filter end date
- `status` (optional): Filter by status
- `user_id` (optional): Filter by user
- `per_page` (optional): Items per page

#### POST /attendance/leave
Request leave.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "type": "annual",
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "reason": "Family vacation"
}
```

---

### Finance - Operational Expenses

#### GET /operational-expenses
Get operational expenses.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (optional): Filter start date
- `end_date` (optional): Filter end date
- `status` (optional): Filter by status
- `category_id` (optional): Filter by category
- `per_page` (optional): Items per page

#### POST /operational-expenses
Create operational expense.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "category_id": 1,
  "date": "2024-01-15",
  "amount": 50000,
  "description": "Office supplies",
  "receipt_url": "https://example.com/receipt.jpg"
}
```

#### PUT /operational-expenses/{id}
Update operational expense.

**Headers:** `Authorization: Bearer {token}`

#### DELETE /operational-expenses/{id}
Delete operational expense.

**Headers:** `Authorization: Bearer {token}`

#### POST /operational-expenses/{id}/approve
Approve operational expense.

**Headers:** `Authorization: Bearer {token}`

#### POST /operational-expenses/{id}/reject
Reject operational expense.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reason": "Invalid receipt"
}
```

---

### Finance - Large Cash Requests

#### GET /large-cash-requests
Get large cash requests.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status
- `type` (optional): Filter by type
- `project_id` (optional): Filter by project
- `per_page` (optional): Items per page

#### POST /large-cash-requests
Create large cash request.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "project_id": 1,
  "type": "material",
  "items": [
    {
      "description": "Steel plates",
      "amount": 5000000
    }
  ],
  "description": "Material purchase for foundation"
}
```

#### POST /large-cash-requests/{id}/submit
Submit large cash request for approval.

**Headers:** `Authorization: Bearer {token}`

#### POST /large-cash-requests/{id}/approve
Approve large cash request (Director only).

**Headers:** `Authorization: Bearer {token}`

#### POST /large-cash-requests/{id}/reject
Reject large cash request (Director only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reason": "Budget exceeded"
}
```

---

### Accounting

#### GET /chart-of-accounts
Get chart of accounts.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (optional): Filter by account type
- `is_active` (optional): Filter by active status

#### POST /chart-of-accounts
Create chart of account.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "account_number": "1.1.1.3",
  "account_name": "Petty Cash",
  "account_type": "asset",
  "parent_id": 3,
  "balance_type": "debit"
}
```

#### PUT /chart-of-accounts/{id}
Update chart of account.

**Headers:** `Authorization: Bearer {token}`

#### DELETE /chart-of-accounts/{id}
Delete chart of account.

**Headers:** `Authorization: Bearer {token}`

#### GET /journal-entries
Get journal entries.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status
- `period` (optional): Filter by period (YYYY-MM)
- `start_date` (optional): Filter start date
- `end_date` (optional): Filter end date
- `per_page` (optional): Items per page

#### POST /journal-entries
Create journal entry.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "date": "2024-01-15",
  "description": "Monthly rent payment",
  "items": [
    {
      "account_id": 1,
      "debit": 10000000,
      "credit": 0,
      "description": "Rent expense"
    },
    {
      "account_id": 10,
      "debit": 0,
      "credit": 10000000,
      "description": "Cash payment"
    }
  ]
}
```

#### PUT /journal-entries/{id}
Update journal entry.

**Headers:** `Authorization: Bearer {token}`

#### POST /journal-entries/{id}/post
Post journal entry.

**Headers:** `Authorization: Bearer {token}`

#### DELETE /journal-entries/{id}
Delete journal entry.

**Headers:** `Authorization: Bearer {token}`

#### GET /ledger
Get ledger entries.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `account_id` (required): Account ID
- `start_date` (optional): Filter start date
- `end_date` (optional): Filter end date

---

### Reports

#### GET /reports/cash-flow
Generate cash flow report.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (required): Report start date
- `end_date` (required): Report end date

#### GET /reports/profit-loss
Generate profit and loss report.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (required): Report start date
- `end_date` (required): Report end date

#### GET /reports/balance-sheet
Generate balance sheet report.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `as_of_date` (required): As of date

#### GET /reports/journal
Generate journal report.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (required): Report start date
- `end_date` (required): Report end date

---

### Approvals

#### GET /approvals/pending
Get pending approvals.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `per_page` (optional): Items per page

#### GET /approvals/approved
Get approved approvals.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `per_page` (optional): Items per page

#### GET /approvals/rejected
Get rejected approvals.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `per_page` (optional): Items per page

#### POST /approvals/{id}/approve
Approve request.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "notes": "Approved"
}
```

#### POST /approvals/{id}/reject
Reject request.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reason": "Not approved"
}
```

---

### Users (Director Only)

#### GET /users
Get all users.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `role_id` (optional): Filter by role
- `status` (optional): Filter by status
- `search` (optional): Search by name or email
- `per_page` (optional): Items per page

#### POST /users
Create new user.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "role_id": 4,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+628123456789",
  "status": "active"
}
```

#### PUT /users/{id}
Update user.

**Headers:** `Authorization: Bearer {token}`

#### DELETE /users/{id}
Delete user.

**Headers:** `Authorization: Bearer {token}`

#### GET /users/roles
Get all roles with permissions.

**Headers:** `Authorization: Bearer {token}`

---

### Audit Logs

#### GET /audit-logs
Get audit logs.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `user_id` (optional): Filter by user
- `action` (optional): Filter by action
- `module` (optional): Filter by module
- `start_date` (optional): Filter start date
- `end_date` (optional): Filter end date
- `search` (optional): Search in description
- `per_page` (optional): Items per page

---

## ERROR RESPONSES

All endpoints may return error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message",
  "errors": {
    "field": ["Error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Unauthorized - insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## STATUS CODES

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## RATE LIMITING

API requests are rate limited to prevent abuse:

- **100 requests per minute** per IP address
- **1000 requests per hour** per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## PAGINATION

Paginated endpoints return:

```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 50
}
```

Use `page` query parameter to navigate pages.

---

## DOCUMENT VERSION

- **Version**: 1.0
- **Date**: 2024
- **Status**: Active
