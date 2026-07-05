# EMTS - Database ERD & Schema Documentation
## PostgreSQL Database Design

---

## 1. ENTITY RELATIONSHIP DIAGRAM (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USERS & AUTHENTICATION                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │     roles       │       │  permissions     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │───┐   │ id (PK)         │
│ role_id (FK)    │───┼──►│ name            │   │   │ name            │
│ name            │   │   │ code            │   │   │ code            │
│ email           │   │   │ description     │   │   │ description     │
│ password        │   │   │ level           │   │   │ module          │
│ phone           │   │   └─────────────────┘   │   └─────────────────┘
│ avatar          │   │                         │           │
│ status          │   │                         │           │
│ last_login_at   │   │                         │           │
│ created_at      │   │                         │           │
│ updated_at      │   │                         │           │
└─────────────────┘   │                         │           │
                      │                         │           │
                      │       ┌─────────────────┴───────────┘
                      │       │
                      │       ▼
                      │   ┌─────────────────┐
                      │   │ role_permission │
                      │   ├─────────────────┤
                      │   │ role_id (FK)    │───┐
                      │   │ permission_id   │───┘
                      └───│ (FK)            │
                          └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            PROJECT MANAGEMENT                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    projects     │       │ project_members │       │  project_tasks  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │───┐   │ id (PK)         │
│ project_number  │   │   │ project_id (FK) │───┼──►│ project_id (FK) │
│ name            │   │   │ user_id (FK)    │───┘   │ user_id (FK)    │
│ client_name     │   │   │ role            │       │ title           │
│ location        │   │   │ joined_at       │       │ description     │
│ contract_value  │   │   └─────────────────┘       │ status          │
│ start_date      │   │                             │ priority        │
│ end_date        │   │                             │ due_date        │
│ manager_id (FK) │───┘                             │ completed_at    │
│ status          │                                 │ created_at      │
│ progress        │                                 │ updated_at      │
│ description     │                                 └─────────────────┘
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ project_progress│       │ progress_photos │       │ project_reports │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │───┐   │ id (PK)         │
│ project_id (FK) │───┼──►│ progress_id (FK)│───┼──►│ project_id (FK) │
│ date            │   │   │ photo_type      │   │   │ report_type     │
│ percentage      │   │   │ photo_url       │   │   │ period_start    │
│ description     │   │   │ caption         │   │   │ period_end      │
│ challenges      │   │   │ uploaded_at     │   │   │ generated_at    │
│ solutions       │   │   └─────────────────┘   │   │ file_url        │
│ created_by (FK) │   │                         │   │ created_by (FK) │
│ created_at      │   │                         │   └─────────────────┘
└─────────────────┘   │                         │
                      │                         │
                      │                         │
                      ▼                         ▼
              ┌─────────────────┐       ┌─────────────────┐
              │ project_docs    │       │ project_milestones│
              ├─────────────────┤       ├─────────────────┤
              │ id (PK)         │       │ id (PK)         │
              │ project_id (FK) │       │ project_id (FK) │
              │ doc_type        │       │ name            │
              │ doc_url         │       │ description     │
              │ title           │       │ target_date     │
              │ uploaded_at     │       │ status          │
              │ uploaded_by (FK)│       │ completed_at    │
              └─────────────────┘       └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            ATTENDANCE                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   attendances   │       │ attendance_logs │       │  leave_requests │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │───┐   │ attendance_id   │───┐   │ user_id (FK)    │
│ date            │   │   │ (FK)           │   │   │ type            │
│ check_in_time   │   │   │ log_type       │   │   │ start_date      │
│ check_out_time  │   │   │ photo_url      │   │   │ end_date        │
│ check_in_lat    │   │   │ gps_latitude   │   │   │ reason          │
│ check_in_lng    │   │   │ gps_longitude  │   │   │ status          │
│ check_out_lat   │   │   │ timestamp      │   │   │ approved_by (FK)│
│ check_out_lng   │   │   └─────────────────┘   │   │ approved_at     │
│ work_hours      │   │                         │   │ rejected_by (FK)│
│ status          │   │                         │   │ rejected_at     │
│ notes           │   │                         │   │ rejection_reason│
│ created_at      │   │                         │   └─────────────────┘
└─────────────────┘   │                         │
                      │                         │
                      │                         │
                      ▼                         ▼
              ┌─────────────────┐       ┌─────────────────┐
              │ overtime_records│       │ work_schedules  │
              ├─────────────────┤       ├─────────────────┤
              │ id (PK)         │       │ id (PK)         │
              │ attendance_id   │       │ user_id (FK)    │
              │ (FK)            │       │ date            │
              │ hours           │       │ shift_start     │
              │ reason          │       │ shift_end       │
              │ approved_by (FK)│       │ location        │
              │ approved_at     │       │ notes           │
              │ status          │       └─────────────────┘
              └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            SCHEDULING                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    schedules    │       │  meetings      │       │   reminders     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ schedule_type   │       │ title           │       │ user_id (FK)    │
│ title           │       │ description     │       │ title           │
│ description     │       │ start_datetime  │       │ description     │
│ start_datetime  │       │ end_datetime    │       │ reminder_date   │
│ end_datetime    │       │ location        │       │ reminder_time   │
│ related_id      │       │ project_id (FK) │       │ is_completed    │
│ related_type    │       │ created_by (FK) │       │ completed_at    │
│ created_by (FK) │       │ status          │       └─────────────────┘
│ status          │       └─────────────────┘
│ repeat_pattern  │
└─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        OPERATIONAL CASH FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ petty_cash_funds│       │ petty_cash_trans│       │ operational_exp│
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ fund_name       │       │ fund_id (FK)    │───┐   │ category_id (FK)│
│ balance         │       │ user_id (FK)    │   │   │ user_id (FK)    │
│ custodian_id    │       │ type            │   │   │ date            │
│ (FK)            │       │ amount          │   │   │ amount          │
│ created_at      │       │ category        │   │   │ description     │
│ updated_at      │       │ description     │   │   │ receipt_url     │
└─────────────────┘       │ receipt_url     │   │   │ approved_by (FK)│
                          │ approved_by (FK)│   │   │ approved_at     │
                          │ approved_at     │   │   │ status          │
                          │ status          │   │   └─────────────────┘
                          │ created_at      │   │
                          └─────────────────┘   │
                                                │
                                                ▼
                                        ┌─────────────────┐
                                        │ expense_categories│
                                        ├─────────────────┤
                                        │ id (PK)         │
                                        │ name            │
                                        │ code            │
                                        │ type            │
                                        │ description     │
                                        └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          LARGE CASH FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ large_cash_reqs  │       │ large_cash_items│       │ payment_records│
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │───┐   │ id (PK)         │
│ request_number  │   │   │ request_id (FK) │───┼──►│ request_id (FK) │
│ project_id (FK) │   │   │ description     │   │   │ payment_method  │
│ user_id (FK)    │   │   │ amount          │   │   │ payment_date    │
│ type            │   │   │ account_id (FK) │   │   │ amount          │
│ total_amount    │   │   │ quantity        │   │   │ reference       │
│ description     │   │   │ unit_price      │   │   │ proof_url       │
│ status          │   │   └─────────────────┘   │   │ created_by (FK) │
│ submitted_at    │   │                         │   │ created_at      │
│ reviewed_by (FK)│   │                         │   └─────────────────┘
│ reviewed_at     │   │                         │
│ approved_by (FK)│   │                         │
│ approved_at     │   │                         │
│ rejected_by (FK)│   │                         │
│ rejected_at     │   │                         │
│ rejection_reason│   │                         │
│ created_at      │   │                         │
└─────────────────┘   │                         │
                      │                         │
                      ▼                         ▼
              ┌─────────────────┐       ┌─────────────────┐
              │ vendors         │       │ subcontractors │
              ├─────────────────┤       ├─────────────────┤
              │ id (PK)         │       │ id (PK)         │
              │ name            │       │ name            │
              │ contact_person  │       │ contact_person  │
              │ phone           │       │ phone           │
              │ email           │       │ email           │
              │ address         │       │ address         │
              │ tax_id          │       │ tax_id          │
              │ payment_terms   │       │ payment_terms   │
              └─────────────────┘       └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            ACCOUNTING                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ chart_of_accounts│     │ journal_entries │       │ journal_items   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │───┐   │ id (PK)         │
│ account_number  │       │ journal_number  │   │   │ journal_id (FK) │
│ account_name    │       │ date            │   │   │ account_id (FK) │
│ account_type    │       │ description     │   │   │ debit           │
│ parent_id (FK)  │       │ period          │   │   │ credit          │
│ level           │       │ status          │   │   │ description     │
│ balance_type    │       │ created_by (FK) │   │   └─────────────────┘
│ is_active       │       │ approved_by (FK)│   │
│ created_at      │       │ approved_at     │   │
└─────────────────┘       └─────────────────┘   │
         │                                       │
         │                                       │
         ▼                                       ▼
┌─────────────────┐                       ┌─────────────────┐
│ ledger_entries  │                       │ account_balances│
├─────────────────┤                       ├─────────────────┤
│ id (PK)         │                       │ id (PK)         │
│ account_id (FK) │                       │ account_id (FK) │
│ journal_item_id │                       │ period          │
│ (FK)            │                       │ opening_balance │
│ date            │                       │ debit_total     │
│ debit           │                       │ credit_total    │
│ credit          │                       │ closing_balance │
│ balance         │                       │ updated_at      │
│ description     │                       └─────────────────┘
│ created_at      │
└─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            APPROVAL SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐
│  approvals      │       │ approval_histories│
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ approvable_type │       │ approval_id (FK) │
│ approvable_id   │       │ action          │
│ approver_id (FK)│       │ actor_id (FK)   │
│ status          │       │ notes           │
│ action_at       │       │ created_at      │
│ notes           │       └─────────────────┘
│ current_level   │
│ required_level  │
└─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            AUDIT TRAIL                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  audit_logs     │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ action          │
│ module          │
│ description     │
│ ip_address      │
│ user_agent      │
│ old_values      │
│ new_values      │
│ created_at      │
└─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            SETTINGS & CONFIG                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐
│  settings       │       │ notifications  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ key             │       │ user_id (FK)    │
│ value           │       │ type            │
│ type            │       │ title           │
│ description     │       │ message         │
│ updated_at      │       │ is_read         │
└─────────────────┘       │ created_at      │
                          └─────────────────┘

┌─────────────────┐
│  refresh_tokens │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ token           │
│ expires_at      │
│ revoked_at      │
│ created_at      │
└─────────────────┘
```

---

## 2. TABLE DEFINITIONS

### 2.1 Users & Authentication

#### users
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_status ON users(status);
```

#### roles
```sql
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    level INTEGER NOT NULL UNIQUE CHECK (level > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_code ON roles(code);
```

#### permissions
```sql
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    module VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_code ON permissions(code);
```

#### role_permissions
```sql
CREATE TABLE role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT uk_role_permission UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_rp_role ON role_permissions(role_id);
```

#### refresh_tokens
```sql
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_rt_token ON refresh_tokens(token);
CREATE INDEX idx_rt_user ON refresh_tokens(user_id);
```

#### password_resets
```sql
CREATE TABLE password_resets (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_pr_email ON password_resets(email);
CREATE INDEX idx_pr_token ON password_resets(token);
```

---

### 2.2 Project Management

#### projects
```sql
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    project_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    location TEXT,
    contract_value DECIMAL(20, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    manager_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'running', 'hold', 'completed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_projects_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_projects_number ON projects(project_number);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager ON projects(manager_id);
```

#### project_members
```sql
CREATE TABLE project_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(100) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_project_user UNIQUE (project_id, user_id)
);

CREATE INDEX idx_pm_project ON project_members(project_id);
CREATE INDEX idx_pm_user ON project_members(user_id);
```

#### project_tasks
```sql
CREATE TABLE project_tasks (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pt_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_pt_project ON project_tasks(project_id);
CREATE INDEX idx_pt_user ON project_tasks(user_id);
CREATE INDEX idx_pt_status ON project_tasks(status);
```

#### project_progress
```sql
CREATE TABLE project_progress (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    date DATE NOT NULL,
    percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    description TEXT,
    challenges TEXT,
    solutions TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pp_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pp_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT uk_project_date UNIQUE (project_id, date)
);

CREATE INDEX idx_pp_project ON project_progress(project_id);
CREATE INDEX idx_pp_date ON project_progress(date);
```

#### progress_photos
```sql
CREATE TABLE progress_photos (
    id BIGSERIAL PRIMARY KEY,
    progress_id BIGINT NOT NULL,
    photo_type VARCHAR(20) NOT NULL CHECK (photo_type IN ('before', 'progress', 'after')),
    photo_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT kf_psp_progress FOREIGN KEY (progress_id) REFERENCES project_progress(id) ON DELETE CASCADE
);

CREATE INDEX idx_psp_progress ON progress_photos(progress_id);
```

#### project_reports
```sql
CREATE TABLE project_reports (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_url VARCHAR(500),
    created_by BIGINT NOT NULL,
    
    CONSTRAINT fk_pr_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pr_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_pr_project ON project_reports(project_id);
CREATE INDEX idx_pr_type ON project_reports(report_type);
```

#### project_docs
```sql
CREATE TABLE project_docs (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    doc_type VARCHAR(50) NOT NULL,
    doc_url VARCHAR(500) NOT NULL,
    title VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by BIGINT NOT NULL,
    
    CONSTRAINT fk_pd_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pd_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_pd_project ON project_docs(project_id);
```

#### project_milestones
```sql
CREATE TABLE project_milestones (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed')),
    completed_at TIMESTAMP,
    
    CONSTRAINT fk_pms_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_pms_project ON project_milestones(project_id);
CREATE INDEX idx_pms_status ON project_milestones(status);
```

---

### 2.3 Attendance

#### attendances
```sql
CREATE TABLE attendances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    check_in_lat DECIMAL(10, 8),
    check_in_lng DECIMAL(11, 8),
    check_out_lat DECIMAL(10, 8),
    check_out_lng DECIMAL(11, 8),
    work_hours DECIMAL(5, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'leave')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_date UNIQUE (user_id, date)
);

CREATE INDEX idx_attendance_user ON attendances(user_id);
CREATE INDEX idx_attendance_date ON attendances(date);
CREATE INDEX idx_attendance_status ON attendances(status);
```

#### attendance_logs
```sql
CREATE TABLE attendance_logs (
    id BIGSERIAL PRIMARY KEY,
    attendance_id BIGINT NOT NULL,
    log_type VARCHAR(20) NOT NULL CHECK (log_type IN ('check_in', 'check_out')),
    photo_url VARCHAR(500),
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_al_attendance FOREIGN KEY (attendance_id) REFERENCES attendances(id) ON DELETE CASCADE
);

CREATE INDEX idx_al_attendance ON attendance_logs(attendance_id);
```

#### overtime_records
```sql
CREATE TABLE overtime_records (
    id BIGSERIAL PRIMARY KEY,
    attendance_id BIGINT NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    reason TEXT,
    approved_by BIGINT,
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    CONSTRAINT fk_or_attendance FOREIGN KEY (attendance_id) REFERENCES attendances(id) ON DELETE CASCADE,
    CONSTRAINT fk_or_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_or_attendance ON overtime_records(attendance_id);
CREATE INDEX idx_or_status ON overtime_records(status);
```

#### leave_requests
```sql
CREATE TABLE leave_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('annual', 'sick', 'personal', 'unpaid', 'maternity', 'paternity')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by BIGINT,
    approved_at TIMESTAMP,
    rejected_by BIGINT,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_lr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_lr_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_lr_rejecter FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_lr_user ON leave_requests(user_id);
CREATE INDEX idx_lr_status ON leave_requests(status);
CREATE INDEX idx_lr_dates ON leave_requests(start_date, end_date);
```

#### work_schedules
```sql
CREATE TABLE work_schedules (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    
    CONSTRAINT fk_ws_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_schedule UNIQUE (user_id, date)
);

CREATE INDEX idx_ws_user ON work_schedules(user_id);
CREATE INDEX idx_ws_date ON work_schedules(date);
```

---

### 2.4 Scheduling

#### schedules
```sql
CREATE TABLE schedules (
    id BIGSERIAL PRIMARY KEY,
    schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN ('project', 'employee', 'meeting', 'reminder')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    related_id BIGINT,
    related_type VARCHAR(50),
    created_by BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    repeat_pattern VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_schedules_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_schedules_type ON schedules(schedule_type);
CREATE INDEX idx_schedules_start ON schedules(start_datetime);
CREATE INDEX idx_schedules_related ON schedules(related_id, related_type);
```

#### meetings
```sql
CREATE TABLE meetings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    location VARCHAR(255),
    project_id BIGINT,
    created_by BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    
    CONSTRAINT fk_meetings_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_meetings_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_meetings_project ON meetings(project_id);
CREATE INDEX idx_meetings_start ON meetings(start_datetime);
```

#### meeting_participants
```sql
CREATE TABLE meeting_participants (
    id BIGSERIAL PRIMARY KEY,
    meeting_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
    
    CONSTRAINT fk_mp_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    CONSTRAINT fk_mp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_meeting_user UNIQUE (meeting_id, user_id)
);

CREATE INDEX idx_mp_meeting ON meeting_participants(meeting_id);
CREATE INDEX idx_mp_user ON meeting_participants(user_id);
```

#### reminders
```sql
CREATE TABLE reminders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_date DATE NOT NULL,
    reminder_time TIME NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    
    CONSTRAINT fk_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_date ON reminders(reminder_date);
```

---

### 2.5 Operational Cash Flow

#### petty_cash_funds
```sql
CREATE TABLE petty_cash_funds (
    id BIGSERIAL PRIMARY KEY,
    fund_name VARCHAR(255) NOT NULL,
    balance DECIMAL(20, 2) DEFAULT 0,
    custodian_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pcf_custodian FOREIGN KEY (custodian_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_pcf_custodian ON petty_cash_funds(custodian_id);
```

#### petty_cash_transactions
```sql
CREATE TABLE petty_cash_transactions (
    id BIGSERIAL PRIMARY KEY,
    fund_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out')),
    amount DECIMAL(20, 2) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    receipt_url VARCHAR(500),
    approved_by BIGINT,
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pct_fund FOREIGN KEY (fund_id) REFERENCES petty_cash_funds(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pct_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pct_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_pct_fund ON petty_cash_transactions(fund_id);
CREATE INDEX idx_pct_user ON petty_cash_transactions(user_id);
CREATE INDEX idx_pct_status ON petty_cash_transactions(status);
```

#### expense_categories
```sql
CREATE TABLE expense_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('operational', 'large', 'all')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ec_code ON expense_categories(code);
```

#### operational_expenses
```sql
CREATE TABLE operational_expenses (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(20, 2) NOT NULL,
    description TEXT,
    receipt_url VARCHAR(500),
    approved_by BIGINT,
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_oe_category FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_oe_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_oe_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_oe_category ON operational_expenses(category_id);
CREATE INDEX idx_oe_user ON operational_expenses(user_id);
CREATE INDEX idx_oe_date ON operational_expenses(date);
CREATE INDEX idx_oe_status ON operational_expenses(status);
```

---

### 2.6 Large Cash Flow

#### large_cash_requests
```sql
CREATE TABLE large_cash_requests (
    id BIGSERIAL PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    project_id BIGINT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('material', 'vendor', 'subcontractor', 'asset', 'project_payment')),
    total_amount DECIMAL(20, 2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP,
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP,
    approved_by BIGINT,
    approved_at TIMESTAMP,
    rejected_by BIGINT,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_lcr_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_lcr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_lcr_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_lcr_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_lcr_rejecter FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_lcr_number ON large_cash_requests(request_number);
CREATE INDEX idx_lcr_project ON large_cash_requests(project_id);
CREATE INDEX idx_lcr_user ON large_cash_requests(user_id);
CREATE INDEX idx_lcr_status ON large_cash_requests(status);
```

#### large_cash_items
```sql
CREATE TABLE large_cash_items (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(20, 2) NOT NULL,
    account_id BIGINT,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit_price DECIMAL(20, 2),
    
    CONSTRAINT fk_lci_request FOREIGN KEY (request_id) REFERENCES large_cash_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_lci_account FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL
);

CREATE INDEX idx_lci_request ON large_cash_items(request_id);
```

#### payment_records
```sql
CREATE TABLE payment_records (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'check', 'other')),
    payment_date DATE NOT NULL,
    amount DECIMAL(20, 2) NOT NULL,
    reference VARCHAR(255),
    proof_url VARCHAR(500),
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pr_request FOREIGN KEY (request_id) REFERENCES large_cash_requests(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pr_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_payment_request ON payment_records(request_id);
```

#### vendors
```sql
CREATE TABLE vendors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_status ON vendors(status);
```

#### subcontractors
```sql
CREATE TABLE subcontractors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subcontractors_name ON subcontractors(name);
CREATE INDEX idx_subcontractors_status ON subcontractors(status);
```

---

### 2.7 Accounting

#### chart_of_accounts
```sql
CREATE TABLE chart_of_accounts (
    id BIGSERIAL PRIMARY KEY,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    parent_id BIGINT,
    level INTEGER NOT NULL DEFAULT 1,
    balance_type VARCHAR(10) NOT NULL CHECK (balance_type IN ('debit', 'credit')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_coa_parent FOREIGN KEY (parent_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL
);

CREATE INDEX idx_coa_number ON chart_of_accounts(account_number);
CREATE INDEX idx_coa_type ON chart_of_accounts(account_type);
CREATE INDEX idx_coa_parent ON chart_of_accounts(parent_id);
```

#### journal_entries
```sql
CREATE TABLE journal_entries (
    id BIGSERIAL PRIMARY KEY,
    journal_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
    created_by BIGINT NOT NULL,
    approved_by BIGINT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_je_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_je_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_je_number ON journal_entries(journal_number);
CREATE INDEX idx_je_date ON journal_entries(date);
CREATE INDEX idx_je_period ON journal_entries(period);
CREATE INDEX idx_je_status ON journal_entries(status);
```

#### journal_items
```sql
CREATE TABLE journal_items (
    id BIGSERIAL PRIMARY KEY,
    journal_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    debit DECIMAL(20, 2) DEFAULT 0,
    credit DECIMAL(20, 2) DEFAULT 0,
    description TEXT,
    
    CONSTRAINT fk_ji_journal FOREIGN KEY (journal_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
    CONSTRAINT fk_ji_account FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT
);

CREATE INDEX idx_ji_journal ON journal_items(journal_id);
CREATE INDEX idx_ji_account ON journal_items(account_id);
```

#### ledger_entries
```sql
CREATE TABLE ledger_entries (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    journal_item_id BIGINT NOT NULL,
    date DATE NOT NULL,
    debit DECIMAL(20, 2) DEFAULT 0,
    credit DECIMAL(20, 2) DEFAULT 0,
    balance DECIMAL(20, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_le_account FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_le_journal_item FOREIGN KEY (journal_item_id) REFERENCES journal_items(id) ON DELETE RESTRICT
);

CREATE INDEX idx_le_account ON ledger_entries(account_id);
CREATE INDEX idx_le_date ON ledger_entries(date);
```

#### account_balances
```sql
CREATE TABLE account_balances (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    period VARCHAR(7) NOT NULL,
    opening_balance DECIMAL(20, 2) DEFAULT 0,
    debit_total DECIMAL(20, 2) DEFAULT 0,
    credit_total DECIMAL(20, 2) DEFAULT 0,
    closing_balance DECIMAL(20, 2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ab_account FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
    CONSTRAINT uk_account_period UNIQUE (account_id, period)
);

CREATE INDEX idx_ab_account ON account_balances(account_id);
CREATE INDEX idx_ab_period ON account_balances(period);
```

---

### 2.8 Approval System

#### approvals
```sql
CREATE TABLE approvals (
    id BIGSERIAL PRIMARY KEY,
    approvable_type VARCHAR(100) NOT NULL,
    approvable_id BIGINT NOT NULL,
    approver_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    action_at TIMESTAMP,
    notes TEXT,
    current_level INTEGER DEFAULT 1,
    required_level INTEGER DEFAULT 1,
    
    CONSTRAINT fk_approvals_approver FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT uk_approvable UNIQUE (approvable_type, approvable_id, approver_id)
);

CREATE INDEX idx_approvals_type ON approvals(approvable_type);
CREATE INDEX idx_approvals_id ON approvals(approvable_id);
CREATE INDEX idx_approvals_approver ON approvals(approver_id);
```

#### approval_histories
```sql
CREATE TABLE approval_histories (
    id BIGSERIAL PRIMARY KEY,
    approval_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id BIGINT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ah_approval FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE,
    CONSTRAINT fk_ah_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_ah_approval ON approval_histories(approval_id);
```

---

### 2.9 Audit Trail

#### audit_logs
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_module ON audit_logs(module);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

---

### 2.10 Settings & Notifications

#### settings
```sql
CREATE TABLE settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string' CHECK (type IN ('string', 'integer', 'boolean', 'json')),
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(key);
```

#### notifications
```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

---

## 3. DATABASE INDEXES SUMMARY

### Performance Critical Indexes
- User authentication: `users.email`, `users.status`
- Project queries: `projects.status`, `projects.manager_id`
- Attendance: `attendances.user_id`, `attendances.date`
- Financial: `journal_entries.date`, `journal_entries.period`
- Audit: `audit_logs.created_at`, `audit_logs.user_id`

### Foreign Key Indexes
All foreign keys have corresponding indexes for join performance.

---

## 4. DATABASE VIEWS

### 4.1 User Role View
```sql
CREATE VIEW v_users_with_roles AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.avatar,
    u.status,
    r.name as role_name,
    r.code as role_code,
    r.level as role_level
FROM users u
JOIN roles r ON u.role_id = r.id;
```

### 4.2 Project Summary View
```sql
CREATE VIEW v_project_summary AS
SELECT 
    p.id,
    p.project_number,
    p.name,
    p.client_name,
    p.status,
    p.progress,
    p.contract_value,
    p.start_date,
    p.end_date,
    u.name as manager_name,
    COUNT(DISTINCT pm.user_id) as team_size
FROM projects p
LEFT JOIN users u ON p.manager_id = u.id
LEFT JOIN project_members pm ON p.id = pm.project_id
GROUP BY p.id, u.name;
```

### 4.3 Attendance Summary View
```sql
CREATE VIEW v_attendance_summary AS
SELECT 
    a.id,
    a.date,
    a.status,
    a.work_hours,
    u.name as user_name,
    u.email as user_email,
    r.code as role_code
FROM attendances a
JOIN users u ON a.user_id = u.id
JOIN roles r ON u.role_id = r.id;
```

### 4.4 Financial Summary View
```sql
CREATE VIEW v_financial_summary AS
SELECT 
    DATE_FORMAT(je.date, '%Y-%m') as period,
    SUM(CASE WHEN ji.account_id IN (
        SELECT id FROM chart_of_accounts WHERE account_type = 'revenue'
    ) THEN ji.credit ELSE 0 END) as total_revenue,
    SUM(CASE WHEN ji.account_id IN (
        SELECT id FROM chart_of_accounts WHERE account_type = 'expense'
    ) THEN ji.debit ELSE 0 END) as total_expense
FROM journal_entries je
JOIN journal_items ji ON je.id = ji.journal_id
WHERE je.status = 'posted'
GROUP BY DATE_FORMAT(je.date, '%Y-%m');
```

---

## 5. STORED PROCEDURES

### 5.1 Update Account Balance
```sql
CREATE OR REPLACE FUNCTION update_account_balance(p_account_id BIGINT, p_period VARCHAR)
RETURNS VOID AS $$
BEGIN
    INSERT INTO account_balances (account_id, period, opening_balance, debit_total, credit_total, closing_balance)
    SELECT 
        p_account_id,
        p_period,
        COALESCE((SELECT closing_balance FROM account_balances 
                  WHERE account_id = p_account_id 
                  AND period = (SELECT MAX(period) FROM account_balances WHERE account_id = p_account_id AND period < p_period)), 0),
        COALESCE(SUM(le.debit), 0),
        COALESCE(SUM(le.credit), 0),
        COALESCE((SELECT closing_balance FROM account_balances 
                  WHERE account_id = p_account_id 
                  AND period = (SELECT MAX(period) FROM account_balances WHERE account_id = p_account_id AND period < p_period)), 0) 
        + COALESCE(SUM(le.debit), 0) - COALESCE(SUM(le.credit), 0)
    FROM ledger_entries le
    WHERE le.account_id = p_account_id
    AND TO_CHAR(le.date, 'YYYY-MM') = p_period
    ON CONFLICT (account_id, period) DO UPDATE SET
        debit_total = EXCLUDED.debit_total,
        credit_total = EXCLUDED.credit_total,
        closing_balance = EXCLUDED.closing_balance,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
```

### 5.2 Calculate Work Hours
```sql
CREATE OR REPLACE FUNCTION calculate_work_hours(p_attendance_id BIGINT)
RETURNS DECIMAL AS $$
DECLARE
    v_check_in TIME;
    v_check_out TIME;
    v_hours DECIMAL;
BEGIN
    SELECT check_in_time, check_out_time INTO v_check_in, v_check_out
    FROM attendances WHERE id = p_attendance_id;
    
    IF v_check_in IS NOT NULL AND v_check_out IS NOT NULL THEN
        v_hours := EXTRACT(EPOCH FROM (v_check_out - v_check_in)) / 3600;
    ELSE
        v_hours := 0;
    END IF;
    
    UPDATE attendances SET work_hours = v_hours WHERE id = p_attendance_id;
    RETURN v_hours;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. TRIGGERS

### 6.1 Audit Log Trigger
```sql
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, module, description, new_values)
        VALUES (NEW.created_by, 'CREATE', TG_TABLE_NAME, 'Created new record', row_to_json(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, module, description, old_values, new_values)
        VALUES (NEW.updated_by, 'UPDATE', TG_TABLE_NAME, 'Updated record', row_to_json(OLD), row_to_json(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, module, description, old_values)
        VALUES (OLD.deleted_by, 'DELETE', TG_TABLE_NAME, 'Deleted record', row_to_json(OLD));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 6.2 Journal Entry Balance Trigger
```sql
CREATE OR REPLACE FUNCTION journal_entry_balance_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO ledger_entries (account_id, journal_item_id, date, debit, credit, balance, description)
        SELECT 
            ji.account_id,
            ji.id,
            je.date,
            ji.debit,
            ji.credit,
            (SELECT COALESCE(SUM(debit - credit), 0) FROM ledger_entries WHERE account_id = ji.account_id) + ji.debit - ji.credit,
            ji.description
        FROM journal_items ji
        JOIN journal_entries je ON ji.journal_id = je.id
        WHERE ji.id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. DATA INTEGRITY RULES

### 7.1 Check Constraints
- All status fields use ENUM-like check constraints
- Percentage fields limited to 0-100
- Date validation (end_date >= start_date)
- Balance validation (debit must equal credit in journal)

### 7.2 Unique Constraints
- User email unique
- Project number unique
- Journal number unique
- User attendance per day unique
- Account number unique

### 7.3 Foreign Key Constraints
- All relationships properly constrained
- ON DELETE CASCADE for dependent records
- ON DELETE RESTRICT for critical records
- ON DELETE SET NULL for optional references

---

## 8. SECURITY CONSIDERATIONS

### 8.1 Row-Level Security
```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE large_cash_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for role-based access
CREATE POLICY user_read_policy ON users
    FOR SELECT
    USING (
        role_id IN (
            SELECT id FROM roles WHERE level >= 
            (SELECT level FROM roles WHERE id = (SELECT role_id FROM users WHERE id = current_user_id()))
        )
    );
```

### 8.2 Data Encryption
- Passwords hashed with bcrypt
- Sensitive data encrypted at rest
- TLS for database connections

---

## DOCUMENT VERSION

- **Version**: 1.0
- **Date**: 2024
- **Author**: Elyn MMT Tech System
- **DBMS**: PostgreSQL 15+
- **Status**: Approved
