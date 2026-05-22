import re

with open('bin/pipeline.py', 'r') as f:
    content = f.read()

# Replace delete_from_storage
old_delete = """    def delete_from_storage(self, storage_key):
        \"\"\"
        Storage rollback if DB insert fails
        \"\"\"
        print(f"  [ROLLBACK] Deleting from storage: {storage_key}")
        if boto3 and os.getenv("AWS_ACCESS_KEY_ID"):
            try:
                s3 = boto3.client(
                    's3',
                    endpoint_url=os.getenv("AWS_S3_ENDPOINT_URL"),
                    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
                )
                s3.delete_object(Bucket=self.r2_bucket, Key=storage_key)
                print("  [ROLLBACK SUCCESS] Cloud storage item deleted.")
            except Exception as e:
                print(f"  [ROLLBACK FAILED] {e}")"""

new_delete = """    def delete_from_storage(self, storage_key):
        \"\"\"
        Storage rollback if DB insert fails
        \"\"\"
        print(f"  [ROLLBACK] Deleting from storage: {storage_key}")
        if self.supabase_url and self.supabase_service_role:
            url = f"{self.supabase_url}/storage/v1/object/{self.r2_bucket}/{storage_key}"
            headers = {
                "apikey": self.supabase_service_role,
                "Authorization": f"Bearer {self.supabase_service_role}"
            }
            try:
                res = requests.delete(url, headers=headers, timeout=10)
                if res.status_code in [200, 204]:
                    print("  [ROLLBACK SUCCESS] Supabase storage item deleted.")
                else:
                    print(f"  [ROLLBACK FAILED] Status {res.status_code}: {res.text}")
            except Exception as e:
                print(f"  [ROLLBACK FAILED] {e}")"""

# Replace upload_to_storage
old_upload = """    def upload_to_storage(self, img, storage_key):
        \"\"\"
        6. Upload high fidelity transparency PNG to Cloudflare R2 / S3 (リトライ付き)
        \"\"\"
        print(f"[STEP 5/6] Uploading PNG to Storage: {storage_key}...")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        # Cache locally
        local_path = os.path.join(self.output_dir, storage_key)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        img.save(local_path, format="PNG")
        print(f"  Cached locally at: {local_path}")

        # Cloud upload
        if boto3 and os.getenv("AWS_ACCESS_KEY_ID"):
            retries = 0
            max_retries = 3
            backoff = 2
            
            while retries < max_retries:
                try:
                    s3 = boto3.client(
                        's3',
                        endpoint_url=os.getenv("AWS_S3_ENDPOINT_URL"),
                        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
                    )
                    s3.upload_fileobj(buffer, self.r2_bucket, storage_key, ExtraArgs={'ContentType': 'image/png'})
                    print("  [SUCCESS] Cloud storage upload completed successfully.")
                    return True
                except Exception as e:
                    retries += 1
                    print(f"  [WARNING] Upload failed: {e}. Retrying {retries}/{max_retries} in {backoff}s...")
                    time.sleep(backoff)
                    backoff *= 2
            raise Exception("Failed to upload to R2 storage after maximum retries.")
        else:
            print("  [SKIP] boto3 or AWS credentials not configured. Skipping cloud upload.")
            return True"""

new_upload = """    def upload_to_storage(self, img, storage_key):
        \"\"\"
        6. Upload high fidelity transparency PNG to Supabase Storage (リトライ付き)
        \"\"\"
        print(f"[STEP 5/6] Uploading PNG to Supabase Storage: {storage_key}...")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        # Cache locally
        local_path = os.path.join(self.output_dir, storage_key)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        img.save(local_path, format="PNG")
        print(f"  Cached locally at: {local_path}")

        # Cloud upload
        if self.supabase_url and self.supabase_service_role:
            retries = 0
            max_retries = 3
            backoff = 2
            
            url = f"{self.supabase_url}/storage/v1/object/{self.r2_bucket}/{storage_key}"
            headers = {
                "apikey": self.supabase_service_role,
                "Authorization": f"Bearer {self.supabase_service_role}",
                "Content-Type": "image/png"
            }
            
            while retries < max_retries:
                try:
                    buffer.seek(0)
                    res = requests.post(url, headers=headers, data=buffer, timeout=30)
                    if res.status_code in [200, 201]:
                        print("  [SUCCESS] Supabase storage upload completed successfully.")
                        return True
                    else:
                        raise Exception(f"Status {res.status_code}: {res.text}")
                except Exception as e:
                    retries += 1
                    print(f"  [WARNING] Upload failed: {e}. Retrying {retries}/{max_retries} in {backoff}s...")
                    time.sleep(backoff)
                    backoff *= 2
            raise Exception("Failed to upload to Supabase storage after maximum retries.")
        else:
            print("  [SKIP] Supabase credentials not configured. Skipping cloud upload.")
            return True"""

content = content.replace(old_delete, new_delete)
content = content.replace(old_upload, new_upload)

with open('bin/pipeline.py', 'w') as f:
    f.write(content)

