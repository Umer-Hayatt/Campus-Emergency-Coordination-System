#!/bin/bash
set -e

# Start the Python TCP server in the background
echo "[start.sh] Starting Campus Emergency TCP server on 127.0.0.1:5000..."
python3 Backend/server.py &
PYTHON_PID=$!

# Wait for TCP server to accept connections on port 5000
echo "[start.sh] Probing Python server readiness on port 5000..."
MAX_RETRIES=40
RETRY_COUNT=0
while ! nc -z 127.0.0.1 5000 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
        echo "[start.sh] Timed out waiting for Python server on port 5000"
        kill "$PYTHON_PID" 2>/dev/null || true
        exit 1
    fi
    sleep 0.25
done

echo "[start.sh] Python TCP server ready. Starting Node WebSocket bridge on port ${PORT:-8080}..."
node bridge/bridge.js &
NODE_PID=$!

# Signal handler for clean container shutdown
shutdown_handler() {
    echo "[start.sh] Stopping processes..."
    kill -TERM "$PYTHON_PID" "$NODE_PID" 2>/dev/null || true
    wait "$PYTHON_PID" 2>/dev/null || true
    wait "$NODE_PID" 2>/dev/null || true
    exit 0
}
trap shutdown_handler SIGINT SIGTERM

# Exit container if either child process terminates
wait -n "$PYTHON_PID" "$NODE_PID"
EXIT_STATUS=$?
echo "[start.sh] Process exited with status $EXIT_STATUS. Shutting down container."
kill -TERM "$PYTHON_PID" "$NODE_PID" 2>/dev/null || true
exit "$EXIT_STATUS"
