npx next dev -p 3006 > dev.log 2>&1 &
PID=$!
echo "Waiting for server to start..."
sleep 15
for i in {1..15}
do
  echo "Batch $i"
  curl -s -X POST http://localhost:3006/api/admin/generation-jobs/run \
    -H "Content-Type: application/json" \
    -H "x-agent-token: temp-agent-token-123" \
    -d '{"limit": 5}' | jq -c '.results[] | {id: .id, status: .status}'
  sleep 2
done
kill $PID
