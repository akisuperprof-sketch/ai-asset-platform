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
        
    # Check if already verified 200 OK
    try:
        verify_res = requests.head(item['image_url'], timeout=5)
        if verify_res.status_code == 200:
            print(f"Already uploaded (200 OK): {item['image_url']}")
            return True
    except:
        pass

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
            
    # Verify
    time.sleep(0.5)
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
    fail_count = 0
    
    for idx, item in enumerate(assets):
        print(f"[{idx+1}/{len(assets)}] Recovering ID: {item['id']} / Slug: {item['slug']}")
        if upload_and_verify(item):
            success_count += 1
        else:
            fail_count += 1
            
    print(f"\nFull Recovery Complete: {success_count} successful, {fail_count} failed.")
