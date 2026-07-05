# EMTS Deployment Guide
## Vercel + Render + Neon PostgreSQL

This guide is for deploying the application with:
- Frontend on Vercel
- Backend API on Render
- PostgreSQL database on Neon

---

## 1. Prerequisites

- GitHub repository connected to Vercel and Render
- Neon project with a PostgreSQL database
- Domain names or default Vercel/Render URLs
- SMTP provider for password reset and notifications (optional but recommended)

---

## 2. Backend deployment on Render

### 2.1 Create Render web service
- Connect the repository to Render.
- Set the root directory to backend-runtime.
- Use the following build command:

```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
```

- Use the following start command:

```bash
php artisan serve --host 0.0.0.0 --port $PORT
```

### 2.2 Configure environment variables
Set these in Render:

```env
APP_NAME=EMTS
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-render-app.onrender.com
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app

DB_CONNECTION=pgsql
DB_HOST=your-neon-host
DB_PORT=5432
DB_DATABASE=your-neon-database
DB_USERNAME=your-neon-user
DB_PASSWORD=your-neon-password
DB_SSLMODE=require

SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-smtp-user
MAIL_PASSWORD=your-smtp-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME=EMTS

JWT_SECRET=your-generated-jwt-secret
JWT_TTL=1440
JWT_REFRESH_TTL=20160
```

### 2.3 Generate app key and JWT secret
Run these locally or from Render shell if needed:

```bash
php artisan key:generate
php artisan jwt:secret
```

### 2.4 Verify deployment
After deployment, confirm that:
- The API health endpoint responds.
- Auth login/register works from the frontend.
- CORS accepts the Vercel origin.

---

## 3. Frontend deployment on Vercel

### 3.1 Create Vercel project
- Connect the repository and set the root directory to frontend.
- Use the framework preset for Next.js.

### 3.2 Configure environment variables
Set these in Vercel:

```env
NEXT_PUBLIC_APP_NAME=EMTS
NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com/api/v1
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 3.3 Build and deploy
```bash
npm install
npm run build
```

---

## 4. Database setup on Neon

1. Create a Neon project and database.
2. Copy the connection string and map it to Render environment variables.
3. Run migrations from the backend deployment shell:

```bash
php artisan migrate --force
```

4. Optionally seed initial data:

```bash
php artisan db:seed --force
```

---

## 5. Production checklist

- [ ] Backend uses production env values.
- [ ] Frontend uses the Render API URL instead of localhost.
- [ ] CORS allows the Vercel origin.
- [ ] SESSION cookies are secure in production.
- [ ] Mail provider is configured.
- [ ] Storage for uploaded files is configured for persistent hosting.
- [ ] Queue workers are enabled for background jobs.

> For file uploads and media storage, Render's local filesystem is not ideal for long-term persistence. Consider S3-compatible storage such as Cloudinary or AWS S3 for production.

---

## 6. Rollback and updates

To redeploy after changes:

```bash
# Backend
cd backend-runtime
composer install --optimize-autoloader --no-dev
php artisan migrate --force

# Frontend
cd frontend
npm install
npm run build
```

---

## 7. Legacy VPS notes

This document has been updated for modern deployment on Vercel, Render, and Neon. The older VPS instructions have been removed in favor of the cloud deployment path above.

For production, keep the deployment focused on:
- Vercel for the frontend
- Render for the Laravel API
- Neon for PostgreSQL
- S3-compatible storage for uploaded files and media when persistence is required

### 16.3 Check Memory Usage
```bash
free -h
htop
```

---

## DOCUMENT VERSION

- **Version**: 1.0
- **Date**: 2024
- **Status**: Active
