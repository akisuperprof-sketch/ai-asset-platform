#!/bin/bash
HOST="https://assetninja.jp"
TOKEN="temp-agent-token-123"

echo "=== 1. Seeding Phase 1 Jobs ==="
curl -s -X POST "$HOST/api/admin/seed-phase1" \
  -H "x-agent-token: $TOKEN" \
  -H "Content-Type: application/json"

echo -e "\n\n=== 2. Verifying DB Stats ==="
curl -s -X GET "$HOST/api/admin/verify-db-stats" \
  -H "x-agent-token: $TOKEN"
