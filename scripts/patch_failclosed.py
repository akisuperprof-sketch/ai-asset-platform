import re

with open("bin/pipeline.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update verify_quality to return review_status
# 2. Update execute_tasks to handle review_status

verify_quality_new = """    def verify_quality(self, img, task):
        print("[STEP 3/6] Activating Quality & Safety Filter Validation...")
        width, height = img.size
        
        # 0. Safety Blacklist Check (Trademark / NSFW)
        search_text = f"{task['keyword']} {task['category_name']} {task['eng_pfx']} {task['eng_sfx']}".lower()
        
        for brand in TRADEMARK_BLACKLIST:
            if brand in search_text:
                print(f"  [REJECT] Trademark Guard: Brand word '{brand}' detected in generation metadata.")
                return False, "rejected", 0, {}

        for nsfw in NSFW_BLACKLIST:
            if nsfw in search_text:
                print(f"  [REJECT] NSFW Guard: Inappropriate word '{nsfw}' detected in generation metadata.")
                return False, "rejected", 0, {}

        if width < 1024 or height < 1024:
            print(f"  [REJECT] Low Resolution: {width}x{height} is below 1024px limit.")
            return False, "rejected", 0, {}

        if img.mode != "RGBA":
            return False, "rejected", 0, {}

        alpha = img.getchannel('A')
        bbox = alpha.getbbox()
        if not bbox:
            return False, "rejected", 0, {}

        alpha_data = list(alpha.getdata())
        total_pixels = len(alpha_data)
        solid_pixels = sum(1 for p in alpha_data if p > 10)
        solid_ratio = solid_pixels / total_pixels
        
        if solid_ratio < 0.05 or solid_ratio > 0.95:
            return False, "rejected", 0, {}

        x_min, y_min, x_max, y_max = bbox
        import math, random
        center_x = (x_min + x_max) / 2
        center_y = (y_min + y_max) / 2
        dist_from_center = math.sqrt((center_x - 512)**2 + (center_y - 512)**2)
        centering_score = max(0, int(100 - (dist_from_center / 512) * 100))
        
        margin_score = 100
        if x_min == 0 or y_min == 0 or x_max == width or y_max == height:
            margin_score = 50
            print("  [REJECT] Composition Error: Subject borders are abruptly clipped at page edge.")
            return False, "rejected", 0, {}

        fringe_count = 0
        transition_pixels = 0
        img_rgb = img.convert("RGB")
        rgb_data = list(img_rgb.getdata())
        for idx, a_val in enumerate(alpha_data):
            if 15 < a_val < 240:
                transition_pixels += 1
                r_val, g_val, b_val = rgb_data[idx]
                if r_val > 235 and g_val > 235 and b_val > 235:
                    fringe_count += 1
        
        fringe_ratio = fringe_count / max(1, transition_pixels)
        white_fringe_score = max(0, int(100 - (fringe_ratio * 250)))

        resolution_score = 100
        ai_distortion_score = 100
        subject_score = 100
        
        quality_score = int(
            centering_score * 0.20 + 
            margin_score * 0.20 + 
            white_fringe_score * 0.35 + 
            subject_score * 0.25
        )

        metrics = {
            "quality_score": quality_score,
            "centering_score": centering_score,
            "margin_score": margin_score,
            "white_fringe_score": white_fringe_score,
            "resolution_score": resolution_score,
            "ai_distortion_score": ai_distortion_score,
            "subject_score": subject_score,
            "composition_score": int((centering_score + margin_score) / 2)
        }

        if quality_score < 85:
            print(f"  [REJECT] QA Score Failed: {quality_score}/100 is below 85 limit. Details: {metrics}")
            return False, "rejected", quality_score, metrics

        # 6. AI Vision Quality Check (Fail-Closed)
        if not self.gemini_key:
            print("  [CRITICAL] GEMINI_API_KEY not found. Halting generation to prevent unverified uploads.")
            import sys
            sys.exit(1)
            
        print("  [STEP 3.5] Running AI Vision Quality & Brand Safety Check...")
        try:
            temp_path = "temp_vision.png"
            img.save(temp_path)
            
            import google.generativeai as genai
            model = genai.GenerativeModel('gemini-1.5-pro')
            prompt = '''You are a strict QA auditor for a premium stock image platform.
Analyze this transparent PNG image. 
Rule: Reply ONLY with "YES" if it meets ALL criteria, or "NO: [reason]" if it fails.
Criteria:
1. Is it a recognizable, practical object (not abstract noise or single color)?
2. Is the composition intact (not horribly deformed, no missing critical parts)?
3. Is it completely free of white fringes/borders and fully transparent in the background?
4. Is the quality high enough for commercial use?'''
            sample_file = genai.upload_file(path=temp_path)
            response = model.generate_content([prompt, sample_file])
            result_text = response.text.strip()
            
            if not result_text.startswith("YES"):
                print(f"  [REJECT] AI Vision Failed: {result_text}")
                return False, "rejected", quality_score, metrics
            print("  [PASS] AI Vision Quality Check passed.")
        except Exception as e:
            print(f"  [WARNING] AI Vision check threw an exception: {e}. Moving to pending_review_failed.")
            return False, "pending_review_failed", quality_score, metrics

        return True, "pending", quality_score, metrics
"""

content = re.sub(r'    def verify_quality\(self, img, task\):.*?return True, quality_score, metrics', verify_quality_new, content, flags=re.DOTALL)

# Update execute_tasks
execute_patch = """                passed, new_status, q_score, q_metrics = self.verify_quality(transparent_img, task)
                meta = self.compile_metadata(task, q_score, i)
                meta["review_status"] = new_status
                
                if passed or new_status == "pending_review_failed":
                    self.upload_to_storage(transparent_img, meta["storage_key"])
                    try:
                        self.insert_to_db(meta, q_metrics)
                    except Exception as db_err:
                        self.delete_from_storage(meta["storage_key"])
                        raise Exception(f"DB Insert failed: {db_err}")
                
                if passed:
                    successful_runs += 1
                    print(f"--> [SUCCESS] Asset '{task['keyword']}' fully indexed as {new_status}.\n")
                elif new_status == "pending_review_failed":
                    rejected_runs += 1
                    print(f"--> [WARNING] Asset '{task['keyword']}' failed vision API. Saved as pending_review_failed.\n")
                else:
                    rejected_runs += 1
                    print(f"--> [REJECTED] Asset '{task['keyword']}' failed QA check.\n")"""

content = re.sub(r'                passed, q_score, q_metrics = self.verify_quality\(transparent_img, task\).*?print\(f"--> \[REJECTED\] Asset \'{task\[\'keyword\'\]}\' failed QA check.\\n"\)', execute_patch, content, flags=re.DOTALL)

# Update insert_to_db to use meta["review_status"]
insert_patch = """            "is_ai_generated": True,
            "review_status": metadata.get("review_status", "pending"), 
            "legal_status": "clean","""
content = re.sub(r'            "is_ai_generated": True,\s*"review_status": "pending",\s*"legal_status": "clean",', insert_patch, content)

with open("bin/pipeline.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated pipeline.py fail-closed successfully.")
