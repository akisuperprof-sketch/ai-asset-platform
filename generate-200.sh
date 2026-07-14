for i in {1..40}
do
  echo "Batch $i"
  curl -s -X POST https://assetninja.jp/api/admin/generation-jobs/run \
    -H "Content-Type: application/json" \
    -H "x-agent-token: temp-agent-token-123" \
    -d '{"limit": 5}' | jq .
  sleep 2
done
