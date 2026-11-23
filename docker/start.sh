#!/bin/sh
set -eu
node /app/init-db.js
exec node /app/dist/main.js
