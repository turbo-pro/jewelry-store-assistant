#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SERVER_HOST="${SERVER_HOST:-47.99.128.154}"
SERVER_PORT="${SERVER_PORT:-22}"
SERVER_USER="${SERVER_USER:-root}"
DEPLOY_DIR="${DEPLOY_DIR:-/home/jewelry-store-assistant}"
SSH_KEY="${SSH_KEY:-$ROOT_DIR/.deploy/jewelry_store_deploy}"
WRITE_NGINX_CONF="${WRITE_NGINX_CONF:-0}"
NGINX_BIN="${NGINX_BIN:-/usr/local/nginx/sbin/nginx}"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
  echo "Install the public key first, or set SSH_KEY=/path/to/key." >&2
  exit 1
fi

SSH_OPTS=(
  -i "$SSH_KEY"
  -p "$SERVER_PORT"
  -o StrictHostKeyChecking=accept-new
)

echo "Setting up $SERVER_USER@$SERVER_HOST:$DEPLOY_DIR"

ssh "${SSH_OPTS[@]}" "$SERVER_USER@$SERVER_HOST" "bash -s -- '$DEPLOY_DIR' '$WRITE_NGINX_CONF' '$NGINX_BIN'" <<'REMOTE_SCRIPT'
set -euo pipefail

DEPLOY_DIR="$1"
WRITE_NGINX_CONF="$2"
NGINX_BIN="$3"
NGINX_CONF="/etc/nginx/conf.d/jewelry-store-assistant.conf"

detect_nginx() {
  if [[ -x "$NGINX_BIN" ]]; then
    echo "$NGINX_BIN"
  elif [[ -x /usr/local/nginx/sbin/nginx ]]; then
    echo /usr/local/nginx/sbin/nginx
  elif command -v nginx >/dev/null 2>&1; then
    command -v nginx
  else
    echo ""
  fi
}

install_nginx() {
  if [[ -n "$(detect_nginx)" ]]; then
    return
  fi

  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y nginx
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y nginx
  elif command -v yum >/dev/null 2>&1; then
    yum install -y nginx
  else
    echo "Unsupported server OS: install nginx manually, then rerun this script." >&2
    exit 1
  fi
}

mkdir -p "$DEPLOY_DIR"

if [[ "$WRITE_NGINX_CONF" != "1" ]]; then
  echo "Deploy directory is ready: $DEPLOY_DIR"
  echo "Skipped nginx changes. Set WRITE_NGINX_CONF=1 only when you intentionally want this script to manage nginx."
  exit 0
fi

install_nginx
NGINX_BIN="$(detect_nginx)"

if [[ -z "$NGINX_BIN" ]]; then
  echo "nginx binary not found. Set NGINX_BIN=/path/to/nginx." >&2
  exit 1
fi

cat > "$NGINX_CONF" <<EOF
server {
    listen 8080;
    server_name _;

    root $DEPLOY_DIR;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
    }

    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
    }

    location ~* \.(html|css|js)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
    }

    location ~* \.(png|jpg|jpeg|gif|webp|svg|ico)$ {
        expires 1h;
        add_header Cache-Control "public, max-age=3600" always;
    }
}
EOF

"$NGINX_BIN" -t

if command -v systemctl >/dev/null 2>&1; then
  systemctl enable nginx >/dev/null 2>&1 || true
  systemctl reload nginx || "$NGINX_BIN" -s reload
else
  "$NGINX_BIN" -s reload || "$NGINX_BIN"
fi

echo "Server is ready. Deploy files to $DEPLOY_DIR and open http://$(hostname -I | awk '{print $1}')/"
REMOTE_SCRIPT

echo "Done. Next run: bash scripts/deploy-web.sh"
