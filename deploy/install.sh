#!/usr/bin/env bash
# Local, explicit deployment helper for a user-owned Linux server.
# Does not install software, edit BaoTa/Nginx/firewall settings, or obtain TLS certificates.
set -Eeuo pipefail
umask 027

APP_ROOT=/opt/fitness-site
DATA_ROOT=/var/lib/fitness-site
SERVICE=fitness-site
APP_USER=fitness-site
MARKER=fitness-site-deployment-v1
UNIT_MARKER='# Managed by fitness-site deploy/install.sh'
IMPORT_CONTENT=0
ENABLE_BACKUPS=0

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
resolve_previous_release() {
  local app_root=$1 current_path=$1/current resolved
  if [[ ! -e "$current_path" && ! -L "$current_path" ]]; then
    return 0
  fi
  [[ -L "$current_path" ]] || { printf 'current must be the managed release symlink.\n' >&2; return 1; }
  resolved=$(readlink -f -- "$current_path") || { printf 'current cannot be resolved to an existing release.\n' >&2; return 1; }
  [[ -d "$resolved" ]] || { printf 'current points to a missing release directory.\n' >&2; return 1; }
  case "$resolved" in
    "$app_root/releases/"*) printf '%s\n' "$resolved" ;;
    *) printf 'current points outside managed releases.\n' >&2; return 1 ;;
  esac
}
usage() {
  printf 'Usage: sudo env NODE_BIN=/absolute/path/to/node bash %s SOURCE_DIR [--import-content] [--enable-backup-timer]\n' "$0"
}
[[ $# -gt 0 ]] || { usage; exit 2; }
SOURCE_INPUT=$1
shift
for flag in "$@"; do
  case "$flag" in
    --import-content) IMPORT_CONTENT=1 ;;
    --enable-backup-timer) ENABLE_BACKUPS=1 ;;
    *) usage; die "Unknown option: $flag" ;;
  esac
done

[[ $EUID -eq 0 ]] || die 'Run this deployment helper with sudo/root.'
[[ "$(uname -s)" == Linux ]] || die 'This deployment helper requires Linux.'
for command_name in systemctl useradd getent runuser install tar readlink ss curl awk sed mktemp head cut cat; do
  command -v "$command_name" >/dev/null || die "Required command missing: $command_name"
done
[[ -d /run/systemd/system ]] || die 'systemd must be running as the service manager.'
SOURCE_DIR=$(readlink -f -- "$SOURCE_INPUT")
[[ -d "$SOURCE_DIR" ]] || die 'SOURCE_DIR does not exist.'
for required_file in dist/index.html server/index.mjs scripts/import-content.mjs scripts/backup-db.mjs content/seed.json package.json deploy/fitness-site.service deploy/fitness.env.example deploy/backup.sh deploy/fitness-site-backup.service deploy/fitness-site-backup.timer; do
  [[ -f "$SOURCE_DIR/$required_file" ]] || die "Missing $required_file. Build locally with npm run build before upload."
done
case "$SOURCE_DIR" in "$APP_ROOT"|"$APP_ROOT"/*) die 'Upload to a separate staging directory, not /opt/fitness-site.' ;; esac
case "$SOURCE_DIR" in "$DATA_ROOT"|"$DATA_ROOT"/*) die 'Upload to a separate staging directory, not the database directory.' ;; esac

NODE_BIN=${NODE_BIN:-$(command -v node || true)}
[[ "$NODE_BIN" =~ ^/[A-Za-z0-9_./+-]+$ && -x "$NODE_BIN" ]] || die 'NODE_BIN must point to an existing, absolute executable path.'
NODE_BIN=$(readlink -f -- "$NODE_BIN")
[[ "$NODE_BIN" =~ ^/[A-Za-z0-9_./+-]+$ ]] || die 'Node path contains unsupported characters.'
case "$NODE_BIN" in /root/*|/home/*) die 'Node must be accessible outside home directories (systemd ProtectHome is enabled).' ;; esac
"$NODE_BIN" -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 22 || (major === 22 && minor < 13)) process.exit(1)' \
  || die 'Node.js >= 22.13 is required. Install a supported Node version explicitly; this script will not install or upgrade it.'
"$NODE_BIN" --input-type=module -e 'import { DatabaseSync } from "node:sqlite"; const db = new DatabaseSync(":memory:"); db.exec("SELECT 1"); db.close();' \
  || die 'This Node installation does not provide working node:sqlite support.'

for managed_dir in "$APP_ROOT" "$DATA_ROOT"; do
  [[ ! -L "$managed_dir" ]] || die "Refusing symlink: $managed_dir"
  if [[ -e "$managed_dir" ]]; then
    [[ -d "$managed_dir" && -f "$managed_dir/.fitness-site-managed" ]] || die "Existing unmanaged path: $managed_dir"
    [[ "$(cat "$managed_dir/.fitness-site-managed")" == "$MARKER" ]] || die "Ownership marker mismatch: $managed_dir"
  fi
done
for unit in fitness-site.service fitness-site-backup.service fitness-site-backup.timer; do
  unit_file=$(systemctl show "$unit" -p FragmentPath --value 2>/dev/null || true)
  [[ -n "$unit_file" ]] || unit_file="/etc/systemd/system/$unit"
  if [[ -e "$unit_file" ]]; then
    [[ "$(head -n 1 "$unit_file")" == "$UNIT_MARKER" ]] || die "Existing unrelated systemd unit: $unit_file"
    [[ "$unit_file" == "/etc/systemd/system/$unit" ]] || die "Managed unit is at an unexpected path: $unit_file"
  fi
done
if getent passwd "$APP_USER" >/dev/null; then
  [[ "$(getent passwd "$APP_USER" | cut -d: -f5)" == 'Fitness site service' ]] || die "Existing unrelated account: $APP_USER"
fi
previous_release=$(resolve_previous_release "$APP_ROOT") || die 'Refusing an invalid current release pointer.'
for managed_subdir in "$APP_ROOT/releases" "$APP_ROOT/shared" "$DATA_ROOT/backups"; do
  [[ ! -L "$managed_subdir" ]] || die "Refusing symlink: $managed_subdir"
  [[ ! -e "$managed_subdir" || -d "$managed_subdir" ]] || die "Expected directory: $managed_subdir"
done
[[ ! -L "$APP_ROOT/shared/fitness.env" ]] || die 'Environment file must not be a symlink.'
[[ ! -L "$DATA_ROOT/fitness.db" ]] || die 'Database file must not be a symlink.'
if [[ -e "$APP_ROOT/shared/fitness.env" ]]; then
  # The reverse proxy and health probe deliberately use this fixed loopback endpoint.
  [[ "$(awk -F= '$1=="HOST"{print $2}' "$APP_ROOT/shared/fitness.env")" == 127.0.0.1 ]] || die 'Existing HOST must be 127.0.0.1.'
  [[ "$(awk -F= '$1=="PORT"{print $2}' "$APP_ROOT/shared/fitness.env")" == 3100 ]] || die 'Existing PORT must be 3100.'
  [[ "$(awk -F= '$1=="DATABASE_PATH"{print $2}' "$APP_ROOT/shared/fitness.env")" == "$DATA_ROOT/fitness.db" ]] || die 'Existing DATABASE_PATH differs from the managed database path.'
fi
port_owner=$(ss -H -ltnp 'sport = :3100')
if [[ -n "$port_owner" ]]; then
  main_pid=$(systemctl show "$SERVICE.service" -p MainPID --value 2>/dev/null || true)
  [[ "$main_pid" =~ ^[1-9][0-9]*$ && "$port_owner" == *"pid=$main_pid,"* ]] || die 'TCP port 3100 is occupied by another process.'
fi
printf 'Preflight passed. Node: %s; loopback port: 3100. Public Nginx ports 80/443 are configured separately.\n' "$NODE_BIN"

if ! getent passwd "$APP_USER" >/dev/null; then
  useradd --system --user-group --home-dir "$DATA_ROOT" --no-create-home --shell /usr/sbin/nologin --comment 'Fitness site service' "$APP_USER"
fi
runuser -u "$APP_USER" -- "$NODE_BIN" -e 'process.exit(0)' || die 'The fitness-site account cannot execute the selected Node binary.'
install -d -m 0755 "$APP_ROOT" "$APP_ROOT/releases"
install -d -m 0750 -o root -g "$APP_USER" "$APP_ROOT/shared"
install -d -m 0700 -o "$APP_USER" -g "$APP_USER" "$DATA_ROOT" "$DATA_ROOT/backups"
printf '%s\n' "$MARKER" > "$APP_ROOT/.fitness-site-managed"
printf '%s\n' "$MARKER" > "$DATA_ROOT/.fitness-site-managed"
if [[ ! -e "$APP_ROOT/shared/fitness.env" ]]; then
  install -m 0640 -o root -g "$APP_USER" "$SOURCE_DIR/deploy/fitness.env.example" "$APP_ROOT/shared/fitness.env"
fi

release_dir=$(mktemp -d "$APP_ROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")
tar -C "$SOURCE_DIR" -cf - dist server scripts content deploy package.json | tar -C "$release_dir" -xf -
chown -R root:root "$release_dir"
chmod -R u=rwX,go=rX "$release_dir"
chmod 0755 "$release_dir"

# A consistent database snapshot is kept before any update/import.
if [[ -f "$DATA_ROOT/fitness.db" ]]; then
  pre_backup="$DATA_ROOT/backups/predeploy-$(date -u +%Y%m%dT%H%M%SZ)-$$.sqlite"
  runuser -u "$APP_USER" -- env DATABASE_PATH="$DATA_ROOT/fitness.db" \
    "$NODE_BIN" "$release_dir/scripts/backup-db.mjs" "$pre_backup"
  printf 'Pre-deployment database backup: %s\n' "$pre_backup"
fi
if [[ "$IMPORT_CONTENT" == 1 ]]; then
  runuser -u "$APP_USER" -- env DATABASE_PATH="$DATA_ROOT/fitness.db" \
    "$NODE_BIN" "$release_dir/scripts/import-content.mjs" "$release_dir/content/seed.json"
fi

for unit in fitness-site.service fitness-site-backup.service fitness-site-backup.timer; do
  if [[ "$unit" != fitness-site.service && "$ENABLE_BACKUPS" != 1 && ! -f "/etc/systemd/system/$unit" ]]; then
    continue
  fi
  unit_temp=$(mktemp)
  sed "s|@NODE_BIN@|$NODE_BIN|g" "$release_dir/deploy/$unit" > "$unit_temp"
  install -m 0644 "$unit_temp" "/etc/systemd/system/$unit"
  rm -f -- "$unit_temp"
done
ln -s "$release_dir" "$APP_ROOT/current.next"
mv -Tf "$APP_ROOT/current.next" "$APP_ROOT/current"
systemctl daemon-reload
systemctl enable "$SERVICE.service"

healthy=0
if systemctl restart "$SERVICE.service"; then
  for attempt in {1..20}; do
    if curl --silent --show-error --fail --max-time 2 http://127.0.0.1:3100/api/health > /dev/null 2>&1; then
      healthy=1
      break
    fi
    sleep 1
  done
fi
if [[ "$healthy" != 1 ]]; then
  if [[ -n "$previous_release" && -d "$previous_release" ]]; then
    ln -s "$previous_release" "$APP_ROOT/current.rollback"
    mv -Tf "$APP_ROOT/current.rollback" "$APP_ROOT/current"
    systemctl restart "$SERVICE.service" || true
    printf 'Restored previous code release: %s\n' "$previous_release" >&2
  else
    systemctl stop "$SERVICE.service" || true
  fi
  die 'Health check failed. Inspect journalctl -u fitness-site.service. Any explicit content import is retained; predeploy backup is available.'
fi
if [[ "$ENABLE_BACKUPS" == 1 ]]; then
  systemctl enable --now fitness-site-backup.timer
  systemctl start fitness-site-backup.service
fi
printf '\nApplication is healthy at http://127.0.0.1:3100/api/health\nRelease: %s\n' "$release_dir"
printf 'Next: configure a dedicated Nginx server block to proxy to 127.0.0.1:3100, then add domain/TLS.\n'
printf 'Local database snapshots are not offsite backups; configure an external destination separately.\n'
