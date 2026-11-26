#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_DB_URL:?Ustaw SUPABASE_DB_URL}"
: "${AGE_PUBLIC_KEY:?Ustaw AGE_PUBLIC_KEY}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/mealini}"
RETENTION_WEEKS="${RETENTION_WEEKS:-12}"

mkdir -p "$BACKUP_DIR"
DATE=$(date -u +%Y-%m-%d)

pg_dump --format=custom --no-owner --no-privileges \
  --file="$BACKUP_DIR/mealini-${DATE}.dump" "$SUPABASE_DB_URL"

age --encrypt --recipient "$AGE_PUBLIC_KEY" \
  --output "$BACKUP_DIR/mealini-${DATE}.dump.age" \
  "$BACKUP_DIR/mealini-${DATE}.dump"

rm "$BACKUP_DIR/mealini-${DATE}.dump"

# Retencja: usuń pliki starsze niż N tygodni
find "$BACKUP_DIR" -name '*.dump.age' -mtime "+$((RETENTION_WEEKS * 7))" -delete

echo "Backup zapisany: $BACKUP_DIR/mealini-${DATE}.dump.age"