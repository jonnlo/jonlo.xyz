#!/bin/zsh

EXP_DIR="${0:A:h}"
PROJECT_DIR="${EXP_DIR:h}"
EXP_URL="http://127.0.0.1:8000/exp/"

cd "$PROJECT_DIR" || exit 1

if lsof -nP -iTCP:8000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port 8000 is already in use. Close that server before starting Exp."
  read -k 1 '?Press any key to close this window...'
  exit 1
fi

echo "Starting the local Exp preview at $EXP_URL"
echo "Keep this Terminal window open. Press Ctrl-C to stop the server."

python3 -m http.server 8000 --bind 127.0.0.1 &
EXP_SERVER_PID=$!
trap 'kill -TERM "$EXP_SERVER_PID" 2>/dev/null' EXIT INT TERM
sleep 1
open "$EXP_URL"
wait "$EXP_SERVER_PID"
