#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SERVER_HOST="${SERVER_HOST:-47.99.128.154}"
SERVER_PORT="${SERVER_PORT:-22}"
SERVER_USER="${SERVER_USER:-root}"
SSH_KEY="${SSH_KEY:-$ROOT_DIR/.deploy/jewelry_store_deploy}"
NGINX_BIN="${NGINX_BIN:-/usr/local/nginx/sbin/nginx}"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
  exit 1
fi

SSH_OPTS=(
  -i "$SSH_KEY"
  -p "$SERVER_PORT"
  -o StrictHostKeyChecking=accept-new
)

ssh "${SSH_OPTS[@]}" "$SERVER_USER@$SERVER_HOST" "bash -s -- '$NGINX_BIN'" <<'REMOTE_SCRIPT'
set -euo pipefail

NGINX_BIN="$1"

rm -f /etc/nginx/conf.d/jewelry-store-assistant.conf

if [[ -f /etc/nginx/conf.d/default.conf.bak && ! -f /etc/nginx/conf.d/default.conf ]]; then
  mv /etc/nginx/conf.d/default.conf.bak /etc/nginx/conf.d/default.conf
fi

if [[ -L /etc/nginx/sites-enabled/default.bak && ! -e /etc/nginx/sites-enabled/default ]]; then
  mv /etc/nginx/sites-enabled/default.bak /etc/nginx/sites-enabled/default
fi

if [[ ! -x "$NGINX_BIN" ]]; then
  NGINX_BIN="$(command -v nginx || true)"
fi

if [[ -z "$NGINX_BIN" ]]; then
  echo "nginx binary not found. Set NGINX_BIN=/path/to/nginx." >&2
  exit 1
fi

"$NGINX_BIN" -t

if command -v systemctl >/dev/null 2>&1; then
  systemctl reload nginx || "$NGINX_BIN" -s reload
else
  "$NGINX_BIN" -s reload
fi

echo "nginx restored and reloaded."
REMOTE_SCRIPT
