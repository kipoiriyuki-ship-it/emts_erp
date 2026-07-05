# EMTS - Engineering Management & Tracking System
## System Analysis Document

---

## 1. SYSTEM OVERVIEW

### 1.1 System Identity
- **Name**: EMTS (Elyn MMT Tech System)
- **Tagline**: One Platform For Project, Operation, Finance And Accounting Management
- **Type**: Enterprise Web Application
- **Target Industries**: Engineering, Fabrication, Manufacturing, Construction, Technical Services

### 1.2 System Objectives
- Centralized project management and tracking
- Operational administration automation
- Financial and accounting management
- Employee attendance and scheduling
- Multi-level approval workflow
- Real-time reporting and analytics
- Audit trail and activity logging

### 1.3 Target Users
1. **Direktur Utama** - Strategic oversight, approvals, financial overview
2. **Akuntansi** - Financial management, reporting, accounting
3. **Administrasi** - Daily operations, attendance, petty cash
4. **Manager Proyek** - Project execution, progress tracking
5. **Karyawan** - Task management, attendance, scheduling

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Technology Stack

#### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Context + Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns

#### Backend
- **Framework**: Laravel 12
- **Language**: PHP 8.2+
- **API Type**: REST API
- **Authentication**: JWT (tymon/jwt-auth)
- **Validation**: Laravel Validation
- **File Storage**: Local + Cloud Ready (S3)
- **Queue**: Redis + Laravel Queue
- **Cache**: Redis

#### Database
- **DBMS**: PostgreSQL 15+
- **ORM**: Eloquent ORM
- **Migrations**: Laravel Migrations

#### Deployment
- **Server**: Ubuntu VPS (22.04 LTS)
- **Web Server**: Nginx
- **PHP Manager**: PHP-FPM
- **Process Manager**: Supervisor
- **SSL**: Let's Encrypt

### 2.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Desktop  │  │  Laptop  │  │  Tablet  │  │ Mobile   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│                   Next.js + TypeScript                       │
│              Tailwind CSS + Shadcn UI                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API GATEWAY                            │
│                      REST API Layer                          │
│                    JWT Authentication                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC                          │
│                    Laravel 12 Services                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Project  │ │ Finance  │ │  HR      │ │ Approval │       │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│                    PostgreSQL Database                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Users    │ │ Projects │ │ Finance  │ │ Audit    │       │
│  │          │ │          │ │          │ │ Trail    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Nginx    │ │ PHP-FPM  │ │ Redis    │ │ File     │       │
│  │          │ │          │ │          │ │ Storage  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. SYSTEM FLOWCHARTS

### 3.1 Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     ▼
┌──────────────┐
│ Login Page   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Enter Email  │
│ & Password   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Validate     │
│ Credentials  │
└──────┬───────┘
       │
    ┌──┴──┐
    │     │
    ▼     ▼
┌────┐ ┌──────┐
│Valid││Invalid│
└─┬──┘ └───┬──┘
  │        │
  ▼        ▼
┌──────┐ ┌──────────┐
│Generate││ Show     │
│ JWT   ││ Error    │
└───┬──┘ └──────────┘
    │
    ▼
┌──────────┐
│ Store    │
│ Token    │
│ (Local   │
│ Storage) │
└────┬─────┘
     │
     ▼
┌──────────┐
│ Redirect │
│ to       │
│ Dashboard│
└──────────┘
```

### 3.2 Project Approval Flow

```
┌──────────────┐
│ Manager      │
│ Creates      │
│ Expense      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Save as      │
│ Draft        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Submit for   │
│ Approval     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Status:      │
│ Submitted    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Notify       │
│ Director     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Director     │
│ Reviews      │
└──────┬───────┘
       │
    ┌──┴──┐
    │     │
    ▼     ▼
┌────┐ ┌──────┐
│Approve││Reject│
└─┬──┘ └───┬──┘
  │        │
  ▼        ▼
┌──────┐ ┌──────────┐
│Status:││ Status:  │
│Approved││ Rejected │
└───┬──┘ └────┬─────┘
    │         │
    ▼         ▼
┌──────┐ ┌──────────┐
│Process││ Notify   │
│Payment││ Manager  │
└──────┘ └──────────┘
```

### 3.3 Attendance Flow

```
┌─────────┐
│ Employee│
└────┬────┘
     │
     ▼
┌──────────────┐
│ Open App     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Check In     │
│ - Capture    │
│   GPS        │
│ - Take       │
│   Selfie     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Submit       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Record       │
│ Attendance   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Work Day     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Check Out    │
│ - Take       │
│   Selfie     │
│ - Add Notes  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Calculate    │
│ Work Hours   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Update       │
│ Attendance   │
└──────────────┘
```

### 3.4 Financial Reporting Flow

```
┌──────────────┐
│ Accountant   │
│ Selects      │
│ Report Type  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Select       │
│ Period       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ System       │
│ Aggregates   │
│ Data         │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Calculate    │
│ Totals       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Generate     │
│ Report       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Preview      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Export       │
│ - PDF        │
│ - Excel      │
└──────────────┘
```

---

## 4. SITEMAP

```
EMTS
├── / (Login)
├── /auth
│   ├── /login
│   ├── /forgot-password
│   ├── /reset-password
│   └── /change-password
├── /dashboard
│   ├── /director
│   ├── /accounting
│   ├── /administration
│   ├── /project-manager
│   └── /employee
├── /projects
│   ├── / (List)
│   ├── /[id]
│   │   ├── /overview
│   │   ├── /progress
│   │   │   ├── /daily
│   │   │   ├── /weekly
│   │   │   └── /monthly
│   │   ├── /reports
│   │   └── /team
│   └── /create
├── /attendance
│   ├── / (My Attendance)
│   ├── /check-in
│   ├── /check-out
│   ├── /history
│   └── /admin
│       ├── /overview
│       ├── /employees
│       └── /reports
├── /scheduling
│   ├── /calendar
│   ├── /projects
│   ├── /employees
│   ├── /meetings
│   └── /reminders
├── /cash-flow
│   ├── /operational
│   │   ├── /petty-cash
│   │   ├── /expenses
│   │   └── /reports
│   └── /large
│       ├── /requests
│       ├── /approvals
│       └── /history
├── /accounting
│   ├── /chart-of-accounts
│   ├── /journal
│   ├── /ledger
│   └── /settings
├── /reports
│   ├── /cash-flow
│   ├── /profit-loss
│   ├── /balance-sheet
│   ├── /ledger
│   └── /journal
├── /approvals
│   ├── /pending
│   ├── /approved
│   ├── /rejected
│   └── /history
├── /users
│   ├── / (List)
│   ├── /create
│   ├── /[id]
│   └── /roles
├── /settings
│   ├── /profile
│   ├── /security
│   └── /notifications
└── /audit
    ├── /logs
    └── /reports
```

---

## 5. USER ROLES & PERMISSIONS

### 5.1 Role Definitions

| Role | Code | Level | Description |
|------|------|-------|-------|
| Direktur Utama | DIRECTOR | 1 | Highest authority, strategic decisions, final approvals |
| Akuntansi | ACCOUNTING | 2 | Financial management, reporting, accounting operations |
| Administrasi | ADMIN | 3 | Daily operations, attendance, petty cash management |
| Manager Proyek | PROJECT_MANAGER | 4 | Project execution, team management, progress tracking |
| Karyawan | EMPLOYEE | 5 | Task execution, attendance, personal scheduling |

### 5.2 Permission Matrix

| Module | Feature | Director | Accounting | Admin | PM | Employee |
|--------|---------|----------|------------|-------|----|----------|
| **Authentication** | | | | | | |
| | Login | ✓ | ✓ | ✓ | ✓ | ✓ |
| | Change Password | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Dashboard** | | | | | | |
| | View Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| | View All Projects | ✓ | ✓ | ✗ | ✓ | ✗ |
| | View Financial Summary | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Projects** | | | | | | |
| | Create Project | ✓ | ✗ | ✗ | ✓ | ✗ |
| | Edit Project | ✓ | ✗ | ✗ | ✓ | ✗ |
| | Delete Project | ✓ | ✗ | ✗ | ✗ | ✗ |
| | View All Projects | ✓ | ✓ | ✓ | ✓ | ✗ |
| | View Own Projects | ✓ | ✓ | ✓ | ✓ | ✓ |
| | Update Progress | ✓ | ✗ | ✗ | ✓ | ✗ |
| | Upload Photos | ✓ | ✗ | ✗ | ✓ | ✗ |
| | Generate Reports | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Attendance** | | | | | | |
| | Check In | ✓ | ✓ | ✓ | ✓ | ✓ |
| | Check Out | ✓ | ✓ | ✓ | ✓ | ✓ |
| | View Own Attendance | ✓ | ✓ | ✓ | ✓ | ✓ |
| | View All Attendance | ✓ | ✓ | ✓ | ✓ | ✗ |
| | Manage Attendance | ✓ | ✗ | ✓ | ✗ | ✗ |
| | Generate Reports | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Scheduling** | | | | | | |
| | View Calendar | ✓ | ✓ | ✓ | ✓ | ✓ |
| | Create Schedule | ✓ | ✗ | ✓ | ✓ | ✗ |
| | Edit Schedule | ✓ | ✗ | ✓ | ✓ | ✗ |
| | Delete Schedule | ✓ | ✗ | ✓ | ✗ | ✗ |
| **Cash Flow - Operational** | | | | | | |
| | Create Expense | ✓ | ✓ | ✓ | ✓ | ✗ |
| | Edit Expense | ✓ | ✓ | ✓ | ✓ | ✗ |
| | Delete Expense | ✓ | ✓ | ✓ | ✗ | ✗ |
| | View All Expenses | ✓ | ✓ | ✓ | ✓ | ✗ |
| | Approve Expense | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Cash Flow - Large** | | | | | | |
| | Create Request | ✓ | ✓ | ✓ | ✓ | ✗ |
| | Submit Request | ✓ | ✓ | ✓ | ✓ | ✗ |
| | View Requests | ✓ | ✓ | ✓ | ✓ | ✗ |
| | Approve Request | ✓ | ✗ | ✗ | ✗ | ✗ |
| | Reject Request | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Accounting** | | | | | | |
| | Manage COA | ✓ | ✓ | ✗ | ✗ | ✗ |
| | Create Journal | ✓ | ✓ | ✗ | ✗ | ✗ |
| | Edit Journal | ✓ | ✓ | ✗ | ✗ | ✗ |
| | View Ledger | ✓ | ✓ | ✗ | ✗ | ✗ |
| | Generate Reports | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Reports** | | | | | | |
| | View Cash Flow | ✓ | ✓ | ✗ | ✗ | ✗ |
| | View Profit Loss | ✓ | ✓ | ✗ | ✗ | ✗ |
| | View Balance Sheet | ✓ | ✓ | ✗ | ✗ | ✗ |
| | Export PDF | ✓ | ✓ | ✗ | ✗ | ✗ |
| | Export Excel | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Approvals** | | | | | | |
| | View Pending | ✓ | ✓ | ✓ | ✓ | ✗ |
| | View Approved | ✓ | ✓ | ✓ | ✓ | ✗ |
| | View Rejected | ✓ | ✓ | ✓ | ✓ | ✗ |
| | Approve | ✓ | ✗ | ✗ | ✗ | ✗ |
| | Reject | ✓ | ✗ | ✗ | ✗ | ✗ |
| **User Management** | | | | | | |
| | View Users | ✓ | ✗ | ✗ | ✗ | ✗ |
| | Create User | ✓ | ✗ | ✗ | ✗ | ✗ |
| | Edit User | ✓ | ✗ | ✗ | ✗ | ✗ |
| | Delete User | ✓ | ✗ | ✗ | ✗ | ✗ |
| | Assign Roles | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Audit Trail** | | | | | | |
| | View Logs | ✓ | ✓ | ✓ | ✗ | ✗ |
| | Export Logs | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Settings** | | | | | | |
| | Edit Profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| | Change Security | ✓ | ✓ | ✓ | ✓ | ✓ |
| | Manage Notifications | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 6. DATA FLOW DIAGRAMS

### 6.1 Context Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          EMTS SYSTEM                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Director   │    │   Manager    │    │   Employee   │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Accounting  │    │  Admin       │    │   System     │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 6.2 Level 1 DFD

```
┌─────────────────────────────────────────────────────────────┐
│                         USER PROCESS                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION PROCESS                     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   PROJECT    │    │   FINANCE    │    │      HR      │
│  MANAGEMENT  │    │  MANAGEMENT  │    │  MANAGEMENT  │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA STORAGE                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Performance
- Page load time < 2 seconds
- API response time < 500ms
- Support 100+ concurrent users
- Database query optimization with indexes

### 7.2 Security
- JWT-based authentication
- Password hashing (bcrypt)
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Input validation
- Secure file uploads

### 7.3 Scalability
- Horizontal scaling ready
- Database connection pooling
- Caching strategy (Redis)
- Queue system for background jobs
- CDN ready for static assets

### 7.4 Reliability
- 99.9% uptime target
- Automated backups
- Error logging and monitoring
- Graceful degradation

### 7.5 Usability
- Responsive design (mobile-first)
- Intuitive UI/UX
- Accessibility compliance (WCAG 2.1)
- Multi-language support ready

### 7.6 Maintainability
- Clean code architecture
- Comprehensive documentation
- Automated testing
- Version control (Git)
- CI/CD pipeline ready

---

## 8. SYSTEM CONSTRAINTS

### 8.1 Technical Constraints
- Must use PostgreSQL as primary database
- Must support modern browsers (Chrome, Firefox, Safari, Edge)
- Must be responsive for mobile devices
- API must follow REST standards

### 8.2 Business Constraints
- 5-level user hierarchy must be enforced
- Approval workflow cannot be bypassed
- Audit trail must be immutable
- Financial data must be accurate

### 8.3 Time Constraints
- System must support real-time updates
- Reports must be generated on-demand
- Attendance must be recorded in real-time

---

## 9. RISK ANALYSIS

### 9.1 Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database failure | High | Low | Regular backups, replication |
| API downtime | High | Low | Load balancing, monitoring |
| Security breach | High | Low | Security audits, encryption |
| Performance degradation | Medium | Medium | Caching, optimization |

### 9.2 Business Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User adoption | High | Medium | Training, documentation |
| Data accuracy | High | Low | Validation, audit trail |
| Regulatory compliance | Medium | Low | Legal review |

---

## 10. SUCCESS CRITERIA

### 10.1 Functional Success
- All 12 modules implemented and functional
- All user roles can perform their designated tasks
- Approval workflow works correctly
- Reports generate accurate data
- Audit trail captures all activities

### 10.2 Non-Functional Success
- System loads in < 2 seconds
- Supports 100+ concurrent users
- 99.9% uptime achieved
- Zero critical security vulnerabilities
- Mobile responsive on all devices

### 10.3 Business Success
- Users can complete tasks efficiently
- Financial data is accurate and reliable
- Project tracking is comprehensive
- Approval process is streamlined

---

## DOCUMENT VERSION

- **Version**: 1.0
- **Date**: 2024
- **Author**: Elyn MMT Tech System
- **Status**: Approved
