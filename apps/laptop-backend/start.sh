#!/bin/sh
set -eu
./node_modules/.bin/wrangler d1 migrations apply tessellate-laptop-db --local --persist-to /data
node -e 'require("node:fs").writeFileSync("/tmp/tessellate-api-started-at", String(Date.now()), { mode: 0o600 })'
exec ./node_modules/.bin/wrangler dev --local --persist-to /data --ip 0.0.0.0 --port 8787 --inspector-port 0
