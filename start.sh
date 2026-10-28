#!/usr/bin/env bash
set -Eeuo pipefail

# Validate required environment variables.
: "${NAMECHEAP_SSH_HOST:?Missing NAMECHEAP_SSH_HOST}"
: "${NAMECHEAP_SSH_USER:?Missing NAMECHEAP_SSH_USER}"
: "${NAMECHEAP_SSH_PRIVATE_KEY:?Missing NAMECHEAP_SSH_PRIVATE_KEY}"
: "${NAMECHEAP_SSH_KNOWN_HOSTS:?Missing NAMECHEAP_SSH_KNOWN_HOSTS}"
: "${NAMECHEAP_SSH_PASSWORD:?Missing NAMECHEAP_SSH_PASSWORD}"

SSH_PORT="${NAMECHEAP_SSH_PORT:-21098}"
LOCAL_PORT=55432

# Install SSH credentials in a temporary directory.
SSH_DIR="$(mktemp -d)"
chmod 700 "$SSH_DIR"

cleanup() {
  if [[ -n "${SSH_PID:-}" ]]; then
    kill "$SSH_PID" 2>/dev/null || true
    wait "$SSH_PID" 2>/dev/null || true
  fi
  rm -rf "$SSH_DIR"
}

trap cleanup EXIT INT TERM

printf '%s\n' "$NAMECHEAP_SSH_PRIVATE_KEY" > "$SSH_DIR/id_ed25519"
printf '%s\n' "$NAMECHEAP_SSH_KNOWN_HOSTS" > "$SSH_DIR/known_hosts"

chmod 600 "$SSH_DIR/id_ed25519" "$SSH_DIR/known_hosts"

# Start the SSH tunnel.
ssh -N \
  -L "127.0.0.1:${LOCAL_PORT}:127.0.0.1:5432" \
  -p "$SSH_PORT" \
  -i "$SSH_DIR/id_ed25519" \
  -o IdentitiesOnly=yes \
  -o BatchMode=yes \
  -o ExitOnForwardFailure=yes \
  -o StrictHostKeyChecking=yes \
  -o "UserKnownHostsFile=$SSH_DIR/known_hosts" \
  -o ServerAliveInterval=30 \
  -o ServerAliveCountMax=3 \
  "${NAMECHEAP_SSH_USER}@${NAMECHEAP_SSH_HOST}" &

SSH_PID=$!

# Wait for the local forwarding port to become available.
for i in $(seq 1 30); do
  if ! kill -0 "$SSH_PID" 2>/dev/null; then
    echo "ERROR: SSH tunnel exited. Check the SSH configuration."
    wait "$SSH_PID"
    exit 1
  fi

  if timeout 2 bash -c \
    'echo > /dev/tcp/127.0.0.1/55432' 2>/dev/null; then
    echo "SSH tunnel is listening on 127.0.0.1:55432"
    break
  fi

  if [[ "$i" -eq 30 ]]; then
    echo "ERROR: SSH tunnel did not become available."
    exit 1
  fi

  sleep 1
done

# Start the Next.js standalone server.
node .next/standalone/server.js