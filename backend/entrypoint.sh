#!/bin/sh
set -e

# Admin credentials from environment variables
ADMIN_EMAIL=${BACKEND_ADMIN_EMAIL}
ADMIN_PASSWORD=${BACKEND_ADMIN_PASSWORD}

# Check that credentials are not empty
if [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
    echo "ERROR: BACKEND_ADMIN_EMAIL and BACKEND_ADMIN_PASSWORD must be set in .env!"
    exit 1
fi

pocketbase superuser upsert "$ADMIN_EMAIL" "$ADMIN_PASSWORD"

# Start PocketBase using the default entrypoint command in background
# $@ will expand to the command/arguments passed to the container
# If none are provided, fallback to 'serve'
if [ $# -eq 0 ]; then
    exec pocketbase serve --http=0.0.0.0:8090
else
    exec "$@"
fi
