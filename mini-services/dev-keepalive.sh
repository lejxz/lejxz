#!/usr/bin/env bash
# dev-keepalive.sh — keeps the Next.js dev server alive.
# The sandbox reaps detached processes; this loop restarts on exit.
cd /home/z/my-project
while true; do
  nohup bun run dev > /tmp/dev-keepalive.log 2>&1 &
  PID=$!
  # wait for the process to exit
  wait $PID 2>/dev/null
  echo "[$(date)] dev server (PID $PID) exited, restarting in 3s…" >> /tmp/dev-keepalive.log
  sleep 3
done
