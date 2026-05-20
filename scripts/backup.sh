# scripts/backup.sh
#!/bin/bash

# Конфигурация
DB_NAME="${DB_NAME:-qualification_db}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="backup_${DB_NAME}_${DATE}.sql"

# Создаём директорию если нет
mkdir -p "$BACKUP_DIR"

# Бэкап
echo "[$(date)] Starting backup..."
pg_dump -U "$DB_USER" -d "$DB_NAME" -F p > "${BACKUP_DIR}/${FILENAME}"

# Проверка
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup successful: ${FILENAME}"
    # Удаляем старые бэкапы (оставляем 7 последних)
    ls -t "${BACKUP_DIR}"/backup_*.sql | tail -n +8 | xargs -r rm
    echo "[$(date)] Cleaned old backups"
else
    echo "[$(date)] Backup FAILED!"
    exit 1
fi