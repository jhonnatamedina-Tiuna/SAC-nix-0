#!/bin/bash
echo "🔐 Ejecutando respaldo de seguridad cifrado GPG..."
BACKUP_DIR="/opt/onix0-server/backups"
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump onix0_central_db > "$BACKUP_DIR/onix0_backup.sql"
tar -czf "$BACKUP_DIR/onix0_backup.tar.gz" "$BACKUP_DIR/onix0_backup.sql"
gpg --symmetric --batch --passphrase "ClaveMaestraGPGSuperSegura2026!" "$BACKUP_DIR/onix0_backup.tar.gz"
rm "$BACKUP_DIR/onix0_backup.sql" "$BACKUP_DIR/onix0_backup.tar.gz"
echo "Respaldo completado con éxito."
