# EMTS Security Implementation Guide

---

## SECURITY OVERVIEW

EMTS implements multiple layers of security to protect sensitive data and ensure system integrity.

---

## 1. AUTHENTICATION SECURITY

### 1.1 JWT Token Security

**Implementation:**
- Short-lived access tokens (24 hours)
- Refresh tokens with 14-day expiration
- Token revocation on logout
- Secure random secret keys

**Configuration:**
```env
JWT_SECRET=your_very_secure_random_secret_key_min_32_chars
JWT_TTL=1440
JWT_REFRESH_TTL=20160
```

**Best Practices:**
- Rotate JWT secrets regularly
- Use environment variables for secrets
- Never commit secrets to version control
- Implement token blacklisting for compromised tokens

### 1.2 Password Security

**Implementation:**
- Bcrypt hashing with cost factor 10
- Minimum 6 characters password length
- Password confirmation required
- Password change requires current password

**Password Policy:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Implementation in Laravel:**
```php
'password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/'
```

### 1.3 Session Security

**Configuration:**
```env
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
```

**Security Measures:**
- Redis-based session storage
- 2-hour session timeout
- Encrypted session data
- Secure cookie flags

---

## 2. AUTHORIZATION SECURITY

### 2.1 Role-Based Access Control (RBAC)

**Implementation:**
- 5-level role hierarchy
- Permission-based access control
- Middleware for role checking
- Permission matrix enforcement

**Role Levels:**
1. Director - Full access
2. Accounting - Financial access
3. Administration - Operational access
4. Project Manager - Project access
5. Employee - Basic access

**Middleware Implementation:**
```php
Route::middleware(['role:DIRECTOR'])->group(function () {
    // Director-only routes
});

Route::middleware(['permission:PROJECT.CREATE'])->group(function () {
    // Permission-protected routes
});
```

### 2.2 Permission Enforcement

**Backend:**
- Permission checks in controllers
- Service-level authorization
- Database-level constraints
- API endpoint protection

**Frontend:**
- Route protection
- Component-level permission checks
- UI element hiding based on permissions
- API request interception

---

## 3. DATA SECURITY

### 3.1 Encryption

**Data at Rest:**
- Database encryption (PostgreSQL)
- File storage encryption
- Environment variable encryption

**Data in Transit:**
- TLS/SSL for all connections
- HTTPS only
- Certificate pinning (optional)

**SSL Configuration:**
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
```

### 3.2 Input Validation

**Backend Validation:**
- Laravel validation rules
- Custom validation rules
- SQL injection prevention
- XSS protection

**Example:**
```php
$request->validate([
    'email' => 'required|email|max:255',
    'amount' => 'required|numeric|min:0',
    'date' => 'required|date|after:today',
]);
```

**Frontend Validation:**
- Zod schema validation
- React Hook Form validation
- Client-side validation
- Server-side validation as fallback

### 3.3 SQL Injection Prevention

**Eloquent ORM:**
- Parameter binding
- Query builder protection
- Raw query escaping

**Example:**
```php
// Safe
User::where('email', $email)->first();

// Unsafe (avoid)
DB::select("SELECT * FROM users WHERE email = '$email'");
```

### 3.4 XSS Protection

**Laravel:**
- Automatic XSS escaping in Blade
- CSRF protection
- Content Security Policy

**Frontend:**
- React's automatic escaping
- DOMPurify for HTML sanitization
- Content Security Policy headers

---

## 4. API SECURITY

### 4.1 Rate Limiting

**Implementation:**
- 100 requests per minute per IP
- 1000 requests per hour per user
- Rate limit headers in responses

**Laravel Throttle:**
```php
Route::middleware('throttle:100,1')->group(function () {
    // Rate-limited routes
});
```

### 4.2 API Authentication

**JWT Authentication:**
- Bearer token in Authorization header
- Token validation on every request
- Automatic token refresh
- Token expiration handling

**Middleware:**
```php
public function handle($request, Closure $next) {
    $token = $request->bearerToken();
    // Validate token
    // Check expiration
    // Verify user status
}
```

### 4.3 CORS Configuration

**Production:**
```php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['https://emts.com'],
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

### 4.4 API Versioning

**Implementation:**
- URL-based versioning (/api/v1/)
- Backward compatibility
- Deprecation warnings
- Version documentation

---

## 5. FILE UPLOAD SECURITY

### 5.1 File Validation

**Validation Rules:**
- File type validation
- File size limits
- MIME type checking
- File name sanitization

**Implementation:**
```php
$request->validate([
    'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
]);
```

### 5.2 File Storage

**Security Measures:**
- Random file names
- Storage outside web root
- Access control
- Virus scanning (optional)

**Configuration:**
```php
'local' => [
    'driver' => 'local',
    'root' => storage_path('app'),
    'throw' => false,
],
```

### 5.3 File Access

**Access Control:**
- Signed URLs for temporary access
- Permission-based file access
- CDN integration for public files
- Direct S3 uploads (optional)

---

## 6. AUDIT TRAIL

### 6.1 Activity Logging

**Implementation:**
- Automatic logging of all actions
- User identification
- IP address tracking
- User agent logging
- Old/new values for updates

**Logged Actions:**
- Login/Logout
- Create/Update/Delete operations
- Approval actions
- Permission changes
- Configuration changes

### 6.2 Log Security

**Protection:**
- Immutable logs
- Log rotation
- Secure log storage
- Log backup
- Log retention policy

---

## 7. NETWORK SECURITY

### 7.1 Firewall Configuration

**UFW Rules:**
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny all        # Deny all other traffic
sudo ufw enable
```

### 7.2 DDoS Protection

**Nginx Configuration:**
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

limit_req zone=api_limit burst=20 nodelay;
```

### 7.3 SSL/TLS Configuration

**Strong Ciphers:**
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers on;
```

**HSTS:**
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## 8. ENVIRONMENT SECURITY

### 8.1 Environment Variables

**Best Practices:**
- Never commit .env files
- Use strong random values
- Rotate secrets regularly
- Separate environments
- Use secret management services

**Required Secrets:**
- APP_KEY
- DB_PASSWORD
- JWT_SECRET
- REDIS_PASSWORD
- AWS_SECRET_KEY (if using S3)

### 8.2 Server Hardening

**SSH Configuration:**
```bash
# Disable root login
PermitRootLogin no

# Use key-based authentication
PasswordAuthentication no

# Change default port
Port 2222
```

**System Updates:**
```bash
# Automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 9. DEPENDENCY SECURITY

### 9.1 Dependency Management

**Regular Updates:**
```bash
# Backend
composer update
composer audit

# Frontend
npm audit
npm audit fix
```

### 9.2 Vulnerability Scanning

**Tools:**
- Composer audit
- npm audit
- Snyk (optional)
- OWASP Dependency Check (optional)

---

## 10. MONITORING AND ALERTING

### 10.1 Security Monitoring

**Monitor:**
- Failed login attempts
- Unusual API activity
- Rate limit violations
- File upload anomalies
- Database access patterns

### 10.2 Alerting

**Alert Triggers:**
- Multiple failed logins
- Unusual data access
- System resource exhaustion
- Security vulnerabilities detected
- Backup failures

---

## 11. COMPLIANCE

### 11.1 Data Protection

**GDPR Compliance:**
- User consent management
- Data deletion requests
- Data export functionality
- Privacy policy implementation
- Cookie consent

### 11.2 Audit Requirements

**Logging:**
- Access logs
- Modification logs
- Authentication logs
- Authorization logs
- Retention policy

---

## 12. INCIDENT RESPONSE

### 12.1 Incident Response Plan

**Steps:**
1. Identify and contain
2. Eradicate threat
3. Recover systems
4. Document incident
5. Post-incident review

### 12.2 Emergency Contacts

**Team:**
- Security Lead
- System Administrator
- Development Lead
- Management

---

## DOCUMENT VERSION

- **Version**: 1.0
- **Date**: 2024
- **Status**: Active
