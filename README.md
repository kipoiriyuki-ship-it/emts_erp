# EMTS - Engineering Management & Tracking System

**One Platform For Project, Operation, Finance And Accounting Management**

---

## 🌟 About

EMTS is a comprehensive enterprise-grade web application designed for engineering, fabrication, manufacturing, construction, and technical services companies. It provides a unified platform for project management, operational administration, attendance tracking, financial management, and accounting.

### Key Features

- **5-Level User Hierarchy**: Director, Accounting, Administration, Project Manager, Employee
- **Role-Based Access Control**: Granular permission system
- **Project Management**: Full project lifecycle tracking with progress monitoring
- **Attendance System**: GPS-enabled check-in/check-out with selfie verification
- **Financial Management**: Operational and large cash flow management with approval workflows
- **Accounting**: Complete accounting system with COA, journal entries, and reports
- **Audit Trail**: Comprehensive activity logging for compliance
- **Responsive Design**: Works on desktop, tablet, and mobile devices

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Laravel 12 (PHP 8.2+)
- PostgreSQL 15+
- Redis (caching & queues)
- JWT Authentication

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Recharts

**Deployment:**
- Ubuntu VPS
- Nginx
- PHP-FPM
- PM2

---

## 📁 Project Structure

```
EMTS/
├── backend/              # Laravel API Backend
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
├── frontend/             # Next.js Frontend
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
├── docs/                 # Documentation
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 20+
- PostgreSQL 15+
- Redis

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan db:seed
php artisan serve
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 📚 Documentation

- [System Analysis](./SYSTEM_ANALYSIS.md) - Complete system requirements and design
- [Database ERD](./DATABASE_ERD.md) - Database schema and relationships
- [Project Structure](./PROJECT_STRUCTURE.md) - Folder structure and organization
- [API Documentation](./API_DOCUMENTATION.md) - REST API reference
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Ubuntu VPS deployment
- [Backup & Restore](./BACKUP_RESTORE.md) - Backup procedures
- [Security Guide](./SECURITY_GUIDE.md) - Security implementation
- [Testing Checklist](./TESTING_CHECKLIST.md) - Testing procedures

---

## 👥 User Roles

### 1. Director Utama
- Full system access
- Strategic oversight
- Final approvals
- Financial overview

### 2. Akuntansi
- Financial management
- Reporting
- Accounting operations
- COA management

### 3. Administrasi
- Daily operations
- Attendance management
- Petty cash
- Scheduling

### 4. Manager Proyek
- Project execution
- Team management
- Progress tracking
- Resource planning

### 5. Karyawan
- Task execution
- Attendance
- Personal scheduling
- Task management

---

## 🔐 Security

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Encrypted passwords
- Audit trail for all activities

---

## 📊 Modules

### 1. Authentication
- Login/Logout
- Password reset
- Change password
- Session management

### 2. Dashboard
- Role-based dashboards
- Real-time statistics
- Activity feeds
- Approval widgets

### 3. Project Management
- Project CRUD
- Progress tracking
- Team management
- Document management
- Milestone tracking

### 4. Attendance
- GPS check-in/out
- Selfie verification
- Leave requests
- Attendance reports
- Overtime tracking

### 5. Scheduling
- Calendar view
- Project schedules
- Employee schedules
- Meeting management
- Reminders

### 6. Cash Flow - Operational
- Petty cash management
- Expense tracking
- Category management
- Approval workflow
- Receipt management

### 7. Cash Flow - Large
- Large cash requests
- Multi-level approval
- Vendor management
- Subcontractor management
- Payment tracking

### 8. Accounting
- Chart of Accounts
- Journal entries
- Ledger management
- Balance tracking
- Period closing

### 9. Reports
- Cash flow statement
- Profit & loss statement
- Balance sheet
- General ledger
- Journal report

### 10. Approvals
- Pending approvals
- Approval history
- Multi-level workflow
- Notification system

### 11. User Management
- User CRUD
- Role assignment
- Permission management
- Profile management

### 12. Audit Trail
- Activity logging
- User tracking
- IP logging
- Change history

---

## 🎨 UI Design

### Color Palette

- **Primary**: #0F172A (Slate 900)
- **Secondary**: #2563EB (Blue 600)
- **Accent**: #F59E0B (Amber 500)
- **Success**: #22C55E (Green 500)
- **Danger**: #EF4444 (Red 500)
- **Background**: #F8FAFC (Slate 50)

### Design Principles

- Modern, clean interface
- Glassmorphism effects
- Soft shadows
- Rounded corners
- Responsive layouts
- Intuitive navigation

---

## 🧪 Testing

- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical flows
- Performance testing
- Security testing

See [Testing Checklist](./TESTING_CHECKLIST.md) for details.

---

## 📦 Deployment

### Development

```bash
# Backend
php artisan serve

# Frontend
npm run dev
```

### Production

See [Deployment Guide](./DEPLOYMENT_GUIDE.md) for complete production deployment instructions.

---

## 🔄 Backup & Restore

Automated daily backups are configured. See [Backup & Restore Guide](./BACKUP_RESTORE.md) for details.

---

## 🛡️ Security

Security implementation details are documented in [Security Guide](./SECURITY_GUIDE.md).

---

## 📝 API Documentation

Complete API reference is available in [API Documentation](./API_DOCUMENTATION.md).

---

## 🤝 Contributing

This is a proprietary system. Contact the development team for contributions.

---

## 📄 License

Proprietary - All rights reserved.

---

## 👨‍💻 Development Team

**EMTS Development Team**
- System Architecture
- Backend Development
- Frontend Development
- Database Design
- Security Implementation

---

## 📞 Support

For support and inquiries:
- Email: support@emts.com
- Documentation: See docs folder

---

## 🗺️ Roadmap

### Phase 1 (Completed)
- ✅ System analysis and design
- ✅ Database schema
- ✅ Backend API
- ✅ Authentication system
- ✅ RBAC implementation
- ✅ Core modules

### Phase 2 (In Progress)
- 🔄 Frontend UI components
- 🔄 Dashboard implementation
- 🔄 Module-specific UIs
- 🔄 Testing and optimization

### Phase 3 (Planned)
- ⏳ Mobile app (React Native)
- ⏳ Advanced reporting
- ⏳ BI integration
- ⏳ API integrations
- ⏳ Performance optimization

---

## 📈 System Status

- **Backend**: ✅ Operational
- **Frontend**: ✅ Operational
- **Database**: ✅ Operational
- **API**: ✅ Operational

---

## 🎯 Success Metrics

- System uptime: 99.9%
- Response time: < 500ms
- Page load time: < 2s
- User satisfaction: > 90%
- Bug resolution: < 24 hours

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Production Ready
