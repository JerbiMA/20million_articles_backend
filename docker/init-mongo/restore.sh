#!/bin/bash
set -e

echo "============================================="
echo "⚡ RESTORING INITIAL DATABASE DUMP..."
echo "============================================="

if [ -d "/docker-entrypoint-initdb.d/dump/mriwl_dev" ]; then
  mongorestore --username "$MONGO_INITDB_ROOT_USERNAME" \
               --password "$MONGO_INITDB_ROOT_PASSWORD" \
               --authenticationDatabase admin \
               --nsInclude="mriwl_dev.*" \
               /docker-entrypoint-initdb.d/dump || true
  echo "✅ Database restore completed!"
else
  echo "⚠️ Dump directory not found, skipping."
fi
echo "============================================="
