import os
import requests

from dotenv import load_dotenv
load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": SERVICE_ROLE,
    "Authorization": f"Bearer {SERVICE_ROLE}"
}

# 1. DB pending count
res_pending = requests.get(f"{SUPABASE_URL}/rest/v1/assets?review_status=eq.pending&select=id", headers=headers)
pending_count = len(res_pending.json())

# 2. DB published count
res_published = requests.get(f"{SUPABASE_URL}/rest/v1/assets?review_status=eq.approved&select=id", headers=headers)
published_count = len(res_published.json())

# 3. DB rejected count
res_rejected = requests.get(f"{SUPABASE_URL}/rest/v1/assets?review_status=eq.rejected&select=id", headers=headers)
rejected_count = len(res_rejected.json())

# 4. Check for broken images in pending
res_pending_full = requests.get(f"{SUPABASE_URL}/rest/v1/assets?review_status=eq.pending&select=id,image_url,slug", headers=headers)
assets = res_pending_full.json()

broken_count = 0
for item in assets:
    try:
        r = requests.head(item['image_url'], timeout=5)
        if r.status_code != 200:
            broken_count += 1
    except:
        broken_count += 1

# 5. Duplicate slug check
slugs = [item['slug'] for item in assets]
duplicates = len(slugs) - len(set(slugs))

print(f"Pending Count: {pending_count}")
print(f"Published Count: {published_count}")
print(f"Rejected Count: {rejected_count}")
print(f"Broken Images in Pending: {broken_count}")
print(f"Duplicate Slugs: {duplicates}")

