#!/usr/bin/env bash
# Starts the dashboard mini-service (port 3030) so it survives shell-session reaping.
# Run from the project root:  bash mini-services/dashboard-api/start.sh
cd "$(dirname "$0")"
echo "[start] launching dashboard-api on port 3030…"
# setsid detaches it into its own session so it won't be killed when the
# launching shell exits. Output is tee'd to service.log and the console.
setsid bun run dev > service.log 2>&1 < /dev/null &
disown
sleep 2
if curl -sS "http://localhost:3030/api/dashboard/health" >/dev/null 2>&1; then
  echo "[start] ✓ dashboard-api is live at http://localhost:3030"
else
  echo "[start] ✗ dashboard-api failed to start — check service.log"
  tail -10 service.log
  exit 1
fi
