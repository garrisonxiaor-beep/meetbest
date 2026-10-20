#!/usr/bin/env bash
set -Eeuo pipefail
umask 027

APP_CURRENT=/opt/fitness-site/current
BACKUP_DIR=/var/lib/fitness-site/backups
NODE_BIN=${NODE_BIN:-/usr/bin/node}
export DATABASE_PATH=${DATABASE_PATH:-/var/lib/fitness-site/fitness.db}

[[ -f "$DATABASE_PATH" ]] || { echo "Database does not exist: $DATABASE_PATH" >&2; exit 1; }
[[ -d "$BACKUP_DIR" && ! -L "$BACKUP_DIR" ]] || { echo "Backup directory must exist and must not be a symlink." >&2; exit 1; }
[[ -x "$NODE_BIN" ]] || { echo "Set NODE_BIN to the installed Node.js executable." >&2; exit 1; }

backup_path="$BACKUP_DIR/fitness-$(TZ=Asia/Shanghai date +%Y%m%d-%H%M%S)-$$.sqlite"
partial_path="$backup_path.partial"
trap 'rm -f -- "$partial_path"' EXIT
"$NODE_BIN" "$APP_CURRENT/scripts/backup-db.mjs" "$partial_path"
mv -- "$partial_path" "$backup_path"
trap - EXIT

# Delete only files created by this daily backup job, and only after a successful backup.
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'fitness-????????-??????-*.sqlite' -mtime +13 -delete
printf 'Backup saved: %s\n' "$backup_path"
