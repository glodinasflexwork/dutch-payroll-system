#!/bin/bash

# Stop Invitation Service
# This script stops the automated invitation service that was started
# with start-invitation-service.sh

# Directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# PID file for the service
PID_FILE="logs/invitation-service.pid"

# Check if the service is running
if [ ! -f "$PID_FILE" ]; then
  echo "Invitation service is not running (no PID file found)"
  exit 0
fi

# Get the PID
PID=$(cat "$PID_FILE")

# Check if the process exists
if ! ps -p "$PID" > /dev/null; then
  echo "Invitation service is not running (process $PID not found)"
  rm "$PID_FILE"
  exit 0
fi

# Stop the process
echo "Stopping invitation service (PID $PID)..."
kill "$PID"

# Wait for the process to stop
for i in {1..10}; do
  if ! ps -p "$PID" > /dev/null; then
    echo "Invitation service stopped successfully"
    rm "$PID_FILE"
    exit 0
  fi
  sleep 1
done

# Force kill if still running
echo "Invitation service did not stop gracefully, forcing termination..."
kill -9 "$PID"

if ! ps -p "$PID" > /dev/null; then
  echo "Invitation service terminated"
  rm "$PID_FILE"
  exit 0
else
  echo "Failed to terminate invitation service"
  exit 1
fi

