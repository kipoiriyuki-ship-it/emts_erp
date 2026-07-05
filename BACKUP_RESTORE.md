# EMTS Backup & Restore Guide

---

## BACKUP STRATEGY

### Automated Daily Backups
- Database: Daily at 2:00 AM
- Storage files: Daily at 2:30 AM
- Retention: 7 days

### Weekly Full Backups
- Complete system backup: Every Sunday at 3:00 AM
- Retention: 4 weeks

### Monthly Archives
- Monthly full backup: 1st of each month
- Retention: 12 months

---

## DATABASE BACKUP

### Manual Database Backup

```bash
# Backup to SQL file
PGPASSWORD=your_password pg_dump -U emts_user -h localhost emts_db > backup_$(date +%Y%m%d).sql

# Backup with compression
PGPASSWORD=your_password pg_dump -U emts_user -h localhost emts_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup specific tables
PGPASSWORD=your_password pg_dump -U emts_user -h localhost emts_db -t users roles permissions > backup_tables_$(date +%Y%m%d).sql
```

### Automated Database Backup Script

Create `/usr/local/bin/db-backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="emts_db"
DB_USER="emts_user"
DB_PASSWORD="your_password"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/emts_db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Database backup completed: emts_db_$DATE.sql.gz"
```

Make executable:
```bash
chmod +x /usr/local/bin/db-backup.sh
```

Add to crontab:
```bash
0 2 * * * /usr/local/bin/db-backup.sh
```

---

## FILE STORAGE BACKUP

### Manual File Backup

```bash
# Backup storage directory
tar -czf storage_backup_$(date +%Y%m%d).tar.gz /var/www/emts-backend/storage

# Backup specific directories
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/emts-backend/storage/app/public
```

### Automated File Backup Script

Create `/usr/local/bin/file-backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)
STORAGE_DIR="/var/www/emts-backend/storage"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup storage
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz $STORAGE_DIR

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "File backup completed: storage_$DATE.tar.gz"
```

Make executable:
```bash
chmod +x /usr/local/bin/file-backup.sh
```

Add to crontab:
```bash
30 2 * * * /usr/local/bin/file-backup.sh
```

---

## FULL SYSTEM BACKUP

### Full Backup Script

Create `/usr/local/bin/full-backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/full"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD=your_password pg_dump -U emts_user -h localhost emts_db | gzip > $BACKUP_DIR/emts_db_$DATE.sql.gz

# Backup files
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz /var/www/emts-backend/storage
tar -czf $BACKUP_DIR/frontend_$DATE.tar.gz /var/www/emts-frontend

# Backup configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /var/www/emts-backend/.env /var/www/emts-frontend/.env.local

# Create archive
tar -czf $BACKUP_DIR/emts_full_$DATE.tar.gz $BACKUP_DIR/*_$DATE.*

# Clean up individual files
rm $BACKUP_DIR/*_$DATE.*

# Keep only last 4 weeks
find $BACKUP_DIR -name "emts_full_*.tar.gz" -mtime +28 -delete

echo "Full backup completed: emts_full_$DATE.tar.gz"
```

Make executable:
```bash
chmod +x /usr/local/bin/full-backup.sh
```

Add to crontab (weekly):
```bash
0 3 * * 0 /usr/local/bin/full-backup.sh
```

---

## DATABASE RESTORE

### Restore from SQL File

```bash
# Restore from SQL file
PGPASSWORD=your_password psql -U emts_user -h localhost emts_db < backup_20240101.sql

# Restore from compressed file
gunzip -c backup_20240101.sql.gz | PGPASSWORD=your_password psql -U emts_user -h localhost emts_db
```

### Restore to New Database

```bash
# Create new database
sudo -u postgres psql
```

```sql
CREATE DATABASE emts_db_restore;
GRANT ALL PRIVILEGES ON DATABASE emts_db_restore TO emts_user;
\q
```

```bash
# Restore to new database
PGPASSWORD=your_password psql -U emts_user -h localhost emts_db_restore < backup_20240101.sql
```

---

## FILE STORAGE RESTORE

### Restore from Archive

```bash
# Extract storage backup
tar -xzf storage_backup_20240101.tar.gz -C /var/www/emts-backend/

# Extract to temporary location first
tar -xzf storage_backup_20240101.tar.gz -C /tmp/
cp -r /tmp/var/www/emts-backend/storage/* /var/www/emts-backend/storage/
```

### Restore Specific Files

```bash
# Restore only uploads
tar -xzf storage_backup_20240101.tar.gz --wildcards '*/storage/app/public/*' -C /tmp/
```

---

## FULL SYSTEM RESTORE

### Restore Procedure

1. **Stop Services**
```bash
sudo systemctl stop nginx
sudo systemctl stop php8.2-fpm
pm2 stop emts-frontend
```

2. **Extract Full Backup**
```bash
cd /tmp
tar -xzf /backups/full/emts_full_20240101.tar.gz
```

3. **Restore Database**
```bash
gunzip -c emts_db_20240101.sql.gz | PGPASSWORD=your_password psql -U emts_user -h localhost emts_db
```

4. **Restore Files**
```bash
tar -xzf storage_20240101.tar.gz -C /
tar -xzf frontend_20240101.tar.gz -C /
```

5. **Restore Configuration**
```bash
tar -xzf config_20240101.tar.gz -C /tmp/
cp /tmp/var/www/emts-backend/.env /var/www/emts-backend/.env
cp /tmp/var/www/emts-frontend/.env.local /var/www/emts-frontend/.env.local
```

6. **Set Permissions**
```bash
sudo chown -R www-data:www-data /var/www/emts-backend
sudo chown -R www-data:www-data /var/www/emts-frontend
sudo chmod -R 755 /var/www/emts-backend
sudo chmod -R 755 /var/www/emts-frontend
```

7. **Restart Services**
```bash
sudo systemctl start nginx
sudo systemctl start php8.2-fpm
pm2 start emts-frontend
sudo supervisorctl restart emts-worker:*
```

---

## CLOUD BACKUP (OPTIONAL)

### AWS S3 Backup

Install AWS CLI:
```bash
sudo apt install -y awscli
```

Configure AWS:
```bash
aws configure
```

Upload to S3:
```bash
# Upload database backup
aws s3 cp /backups/database/emts_db_$(date +%Y%m%d).sql.gz s3://emts-backups/database/

# Upload file backup
aws s3 cp /backups/files/storage_$(date +%Y%m%d).tar.gz s3://emts-backups/files/
```

Automated S3 Backup Script:
```bash
#!/bin/bash

DATE=$(date +%Y%m%d)
S3_BUCKET="emts-backups"

# Upload database
aws s3 cp /backups/database/emts_db_$DATE.sql.gz s3://$S3_BUCKET/database/

# Upload files
aws s3 cp /backups/files/storage_$DATE.tar.gz s3://$S3_BUCKET/files/

# Set lifecycle policy (keep 90 days)
aws s3api put-bucket-lifecycle-configuration --bucket $S3_BUCKET --lifecycle-configuration file://lifecycle.json
```

---

## DISASTER RECOVERY

### Recovery Steps

1. **Assess Damage**
   - Check which services are affected
   - Identify data loss extent
   - Determine recovery point objective (RPO)

2. **Select Backup**
   - Choose most recent valid backup
   - Verify backup integrity
   - Document recovery point

3. **Execute Restore**
   - Follow full system restore procedure
   - Verify data integrity
   - Test application functionality

4. **Post-Recovery**
   - Monitor system performance
   - Verify all services operational
   - Update documentation
   - Review and improve backup procedures

---

## BACKUP VERIFICATION

### Regular Backup Testing

Test backup integrity monthly:

```bash
#!/bin/bash

# Test database backup
LATEST_BACKUP=$(ls -t /backups/database/*.sql.gz | head -1)
gunzip -c $LATEST_BACKUP | PGPASSWORD=your_password psql -U emts_user -h localhost -d emts_db_test

# Test file backup
LATEST_FILE=$(ls -t /backups/files/*.tar.gz | head -1)
tar -tzf $LATEST_FILE > /dev/null && echo "File backup valid" || echo "File backup corrupted"
```

---

## DOCUMENT VERSION

- **Version**: 1.0
- **Date**: 2024
- **Status**: Active
