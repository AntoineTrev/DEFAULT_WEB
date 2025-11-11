#!/bin/sh
set -e

echo "🚀 Start Pocketbase"

(
  /entrypoint.sh
) > /proc/1/fd/1 2>/proc/1/fd/2 &
PB_PID=$!

echo "⏳ Waiting for PocketBase to start..."
for i in $(seq 1 60); do
    if curl -sf http://localhost:8090/api/health > /dev/null 2>&1; then
        echo "✅ PocketBase is up."
        break
    fi
    sleep 1
done

if [ -d "/fixtures" ]; then
    for fixture in /fixtures/*.json; do
        [ -e "$fixture" ] || continue
        echo "➡️ Loading fixture: $fixture"
        collection=$(basename "$fixture" .json)
        echo "📁 Importing records into '$collection' collection..."

        while IFS= read -r record; do
            echo "$record" | jq -e . >/dev/null 2>&1 || continue
            email=$(echo "$record" | jq -r '.email // empty')
            curl -s -X POST "http://localhost:8090/api/collections/${collection}/records" \
                -H "Content-Type: application/json" \
                -d "$record" > /dev/null || echo "⚠️ Failed to import record in $collection"
        done < <(jq -c '.[]' "$fixture")
    done
else
    echo "⚠️ No fixtures directory found, skipping import."
fi

echo "🏁 Fixtures import complete. Bringing PocketBase to foreground..."
wait $PB_PID
