#!/bin/sh
set -e

cd "$(dirname "$0")/.."

# Compose reads .env itself; Node gets it explicitly (CRLF-safe, no shell eval).
case "${1:-}" in
    dev|prod)
        mode=$1
        if [ "$mode" = "dev" ]; then other=prod; else other=dev; fi
        docker compose -f "docker-compose.$other.yml" down
        docker compose -f "docker-compose.$mode.yml" up -d --build
        if [ "$mode" = "dev" ]; then
            node --env-file=.env scripts/setup-pb.mjs
        fi
        ;;
    down)
        docker compose -f docker-compose.dev.yml down
        docker compose -f docker-compose.prod.yml down
        ;;
    *)
        echo "Usage: scripts/run.sh dev|prod|down" >&2
        exit 2
        ;;
esac
