import json
import os
import requests
import time

# Load env
from dotenv import load_dotenv
load_dotenv('.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET = "sukashi-assets"

def upload_and_verify(item):
    storage_key = item['image_url'].split(f"/object/public/{BUCKET}/")[1]
    local_path = os.path.join("output", storage_key)
    
    if not os.path.exists(local_path):
        print(f"Missing local file: {local_path}")
        return False
        
    # Upload
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{storage_key}"
    headers = {
        "apikey": SERVICE_ROLE,
        "Authorization": f"Bearer {SERVICE_ROLE}",
        "Content-Type": "image/png"
    }
    
    with open(local_path, "rb") as f:
        res = requests.post(url, headers=headers, data=f, timeout=30)
        if res.status_code not in [200, 201]:
            print(f"Failed to upload {storage_key}: {res.text}")
            return False
            
    print(f"Uploaded {storage_key} successfully.")
    
    # Verify
    time.sleep(1)
    verify_res = requests.head(item['image_url'])
    if verify_res.status_code == 200:
        print(f"Verified 200 OK: {item['image_url']}")
        return True
    else:
        print(f"Verification failed with {verify_res.status_code} for {item['image_url']}")
        return False

if __name__ == "__main__":
    backup_files = [f for f in os.listdir("output") if f.startswith("pending_assets_backup_")]
    latest_backup = sorted(backup_files)[-1]
    
    with open(os.path.join("output", latest_backup), "r") as f:
        assets = json.load(f)
        
    print(f"Total pending assets loaded: {len(assets)}")
    
    success_count = 0
    for item in assets[:10]:
        print(f"Recovering ID: {item['id']} / Slug: {item['slug']}")
        if upload_and_verify(item):
            success_count += 1
            
    print(f"\n10-Item Recovery Test Complete: {success_count}/10 successful.")
