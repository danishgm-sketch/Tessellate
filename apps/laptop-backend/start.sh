#!/bin/sh
set -eu
./node_modules/.bin/wrangler d1 migrations apply tessellate-laptop-db --local --persist-to /data
exec ./node_modules/.bin/wrangler dev --local --persist-to /data --ip 0.0.0.0 --port 8787 --inspector-port 0
