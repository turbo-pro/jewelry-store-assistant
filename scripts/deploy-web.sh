#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SERVER_HOST="${SERVER_HOST:-47.99.128.154}"
SERVER_PORT="${SERVER_PORT:-22}"
SERVER_USER="${SERVER_USER:-root}"
DEPLOY_DIR="${DEPLOY_DIR:-/home/jewelry-store-assistant}"
SSH_KEY="${SSH_KEY:-$ROOT_DIR/.deploy/jewelry_store_deploy}"
SOURCE_DIR="${SOURCE_DIR:-$ROOT_DIR/apps/web}"
RELOAD_NGINX="${RELOAD_NGINX:-0}"
NGINX_BIN="${NGINX_BIN:-/usr/local/nginx/sbin/nginx}"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
  echo "Install the public key first, or set SSH_KEY=/path/to/key." >&2
  exit 1
fi

if [[ ! -f "$SOURCE_DIR/index.html" ]]; then
  echo "Web source is invalid: $SOURCE_DIR/index.html not found." >&2
  exit 1
fi

SSH_OPTS=(
  -i "$SSH_KEY"
  -p "$SERVER_PORT"
  -o StrictHostKeyChecking=accept-new
)

RSYNC_SSH="ssh -i $SSH_KEY -p $SERVER_PORT -o StrictHostKeyChecking=accept-new"

echo "Deploying $SOURCE_DIR/ to $SERVER_USER@$SERVER_HOST:$DEPLOY_DIR/"

ssh "${SSH_OPTS[@]}" "$SERVER_USER@$SERVER_HOST" "mkdir -p '$DEPLOY_DIR'"
rsync -az --delete -e "$RSYNC_SSH" "$SOURCE_DIR/" "$SERVER_USER@$SERVER_HOST:$DEPLOY_DIR/"

if [[ "$RELOAD_NGINX" == "1" ]]; then
  ssh "${SSH_OPTS[@]}" "$SERVER_USER@$SERVER_HOST" "NGINX_BIN='$NGINX_BIN'; if [ ! -x \"\$NGINX_BIN\" ]; then NGINX_BIN=\$(command -v nginx || true); fi; [ -n \"\$NGINX_BIN\" ] && \"\$NGINX_BIN\" -t >/dev/null 2>&1 && \"\$NGINX_BIN\" -s reload || true"
fi

echo "Deploy complete: http://$SERVER_HOST/"
