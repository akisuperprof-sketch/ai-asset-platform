#!/bin/bash
for cat in bento torii sakura matcha japanese-pattern; do
  echo "Seeding category: $cat"
  curl -s -X POST "https://assetninja.jp/api/admin/seed-phase1?category=$cat" \
       -H "x-agent-token: temp-agent-token-123" > "/tmp/seed_$cat.json"
  sleep 1
done
echo "Done"
