#!/bin/bash

# Start Invitation Service
# This script starts the automated invitation service as a background process
# and ensures it continues running even after the terminal is closed.

# Directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Log file for the service
LOG_FILE="logs/invitation-service.log"

# Check if the service is already running
PID_FILE="logs/invitation-service.pid"
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if ps -p "$PID" > /dev/null; then
    echo "Invitation service is already running with PID $PID"
    echo "To restart, first run: ./stop-invitation-service.sh"
    exit 1
  else
    echo "Removing stale PID file"
    rm "$PID_FILE"
  fi
fi

# Parse command line arguments
DRY_RUN=""
if [ "$1" == "--dry-run" ]; then
  DRY_RUN="--dry-run"
  echo "Starting invitation service in dry run mode (no emails will be sent)"
fi

# Start the service
echo "Starting invitation service..."
nohup node schedule-invitations.js $DRY_RUN > "$LOG_FILE" 2>&1 &
PID=$!

# Save the PID
echo $PID > "$PID_FILE"

echo "Invitation service started with PID $PID"
echo "Logs are being written to $LOG_FILE"
echo "To stop the service, run: ./stop-invitation-service.sh"

# Show the initial log output
echo ""
echo "Initial log output:"
echo "-------------------"
sleep 2
tail -n 10 "$LOG_FILE"

