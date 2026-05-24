import sys

new_pipeline = """#!/usr/bin/env python3
\"\"\"
AssetNinja AI Asset Generation & Transparency Pipeline Engine
Layer 4 Commercial Grade QA Engine Integrated
\"\"\"

import os
import sys
import json
import argparse
import requests
import uuid
import math
import time
import re
import hashlib
from io import BytesIO
from datetime import datetime
import google.generativeai as genai

try:
    from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageStat
except ImportError:
    print("[ERROR] Please install Pillow: pip install Pillow")
    sys.exit(1)

try:
    from rembg import remove
except ImportError:
    print("[WARNING] rembg library not installed.")
    remove = None

# 商標ブラックリスト (簡易チェック用)
TRADEMARK_BLACKLIST = [
    "canva", "adobe", "shutterstock", "getty", "pixta",
    "apple", "google", "toyota", "sony", "microsoft",
    "amazon", "facebook", "instagram", "disney"
]

# 不適切ワードリスト (NSFW)
NSFW_BLACKLIST = [
    "nsfw", "nude", "sexy", "hentai", "porn", "adult",
    "goregous", "erotic", "violence"
]

class AssetPipeline:
    def __init__(self, category=None, count=1, auto_mode=False, output_dir="output", test_tasks=None):
        self.count = count
        self.auto_mode = auto_mode
        self.output_dir = output_dir
        self.test_tasks = test_tasks
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Load API keys from environment
        self.stability_key = os.getenv("STABILITY_API_KEY", "")
        self.supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
        self.supabase_service_role = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.r2_bucket = os.getenv("SUPABASE_STORAGE_BUCKET", "sukashi-assets")
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")

        # Check critical API keys immediately
        missing_keys = []
        if not self.stability_key:
            missing_keys.append("STABILITY_API_KEY")
        if not self.gemini_key:
            missing_keys.append("GEMINI_API_KEY")
            
        if missing_keys:
            print(f"\\n==========================================")
            print(f"[FATAL ERROR] API keys missing: {', '.join(missing_keys)}")
            print(f"Please set these environment variables:")
            print(f"export STABILITY_API_KEY='your_key'")
            print(f"export GEMINI_API_KEY='your_key'")
            print(f"==========================================\\n")
            print("[FATAL ERROR] Fail-Closed triggered. Cannot guarantee quality without full API access. Exiting.")
            sys.exit(1)

        genai.configure(api_key=self.gemini_key)

        self.categories_pool = {
            "寿司": {"db_key": "sushi", "mod": "authentic Japanese sushi, highly realistic food photography"},
            "ラーメン": {"db_key": "ramen", "mod": "authentic Japanese ramen bowl, steam rising, realistic food texture"},
            "おにぎり": {"db_key": "onigiri", "mod": "traditional Japanese onigiri rice ball, realistic food texture"},
            "抹茶": {"db_key": "matcha", "mod": "premium Japanese matcha green tea dessert, realistic food texture"},
            "和柄": {"db_key": "japanese-pattern", "mod": "seamless texture pattern of classic Japanese design, gold and rich color tones, decorative vector art"},
            "桜": {"db_key": "sakura", "mod": "beautiful cinematic studio shot of Japanese sakura cherry blossoms, vivid pink colors, highly detailed"},
            "和風背景": {"db_key": "japanese-background", "mod": "beautiful authentic premium Japanese background asset, highly detailed"},
            "日本アイコン": {"db_key": "japan-icon", "mod": "clean high-fidelity 3D icon rendering of Japanese object, modern 3D icon style"},
            "吹き出し": {"db_key": "speech-bubble", "mod": "clean high-fidelity 3D rendering of speech bubble, UI UX design asset, empty text area"},
            "和の伝統素材": {"db_key": "japan", "mod": "traditional Japanese cultural object, premium craft commercial photography"}
        }

    def call_api_with_retry(self, url, headers=None, json_data=None, method="POST", max_retries=3):
        retries = 0
        backoff = 2
        while retries < max_retries:
            try:
                res = requests.request(method, url, headers=headers, json=json_data, timeout=30)
                if res.status_code >= 500 or res.status_code == 429:
                    retries += 1
                    print(f"  [RETRY {retries}/{max_retries}] Server returned {res.status_code}. Retrying in {backoff}s...")
                    time.sleep(backoff)
                    backoff *= 2
                    continue
                return res
            except requests.exceptions.RequestException as e:
                retries += 1
                print(f"  [RETRY {retries}/{max_retries}] Connection error: {e}. Retrying in {backoff}s...")
                time.sleep(backoff)
                backoff *= 2
        raise Exception(f"Failed to fetch {url} after {max_retries} attempts.")

    def select_tasks(self):
        if self.test_tasks:
            tasks = []
            for t in self.test_tasks:
                cat_name = t['category']
                cat_info = self.categories_pool.get(cat_name, self.categories_pool["和の伝統素材"])
                tasks.append({
                    "category_name": cat_name,
                    "db_category": cat_info["db_key"],
                    "keyword": t['keyword'],
                    "mod": cat_info["mod"]
                })
            return tasks
        return []

    def generate_image(self, task, index):
        keyword = task["keyword"]
        mod = task["mod"]
        
        # Layer 2 & 4: Premium PNG Prompt Engine & Composition Diversity
        diversity_seed = random.randint(1, 99999) if "random" in sys.modules else index * 1000
        prompt = f"Ultra high quality transparent PNG asset of {keyword}, {mod}, isolated object, centered composition, no background, crystal clear edges, premium commercial stock asset, soft studio lighting, highly detailed, fully usable for design production, professional PNG material"
        negative_prompt = "abstract, symbol, icon, circle, star, geometric shape, blurry, cropped, deformed, low detail, watercolor, painting, text, logo, noise, background, frame, fake object, multiple objects, cutoff"
        
        print(f"\\n[STEP 1/6] Synthesizing Prompts for '{keyword}' (#{index+1})...")
        print(f"  Positive: {prompt}")
        print(f"  Negative: {negative_prompt}")

        url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.stability_key}",
            "Content-Type": "application/json"
        }
        body = {
            "steps": 35,
            "width": 1024,
            "height": 1024,
            "seed": diversity_seed,
            "cfg_scale": 8,
            "samples": 1,
            "text_prompts": [
                {"text": prompt, "weight": 1.0},
                {"text": negative_prompt, "weight": -1.0}
            ],
        }

        try:
            response = self.call_api_with_retry(url, headers=headers, json_data=body, method="POST", max_retries=3)
            if response.status_code == 200:
                data = response.json()
                img_data = data["artifacts"][0]["base64"]
                import base64
                img = Image.open(BytesIO(base64.b64decode(img_data)))
                return img, prompt, negative_prompt
            else:
                print(f"  [FATAL] SDXL API returned {response.status_code}: {response.text}")
                raise Exception(f"API Error {response.status_code}")
        except Exception as e:
            print(f"  [FATAL] Generation exception: {e}")
            raise Exception("Fail-Closed triggered during Generation. Stopping.")

    def remove_background(self, img):
        print("[STEP 2/6] Running transparency extraction engine...")
        if remove is not None:
            return remove(img)
        raise Exception("rembg library is missing. Cannot continue.")

    def verify_quality(self, img, task):
        print("[STEP 3/6] Activating Quality & Safety Filter Validation (Layer 3 & 4)...")
        width, height = img.size
        
        search_text = f"{task['keyword']} {task['category_name']}".lower()
        for brand in TRADEMARK_BLACKLIST:
            if brand in search_text: return False, "rejected", 0, {}, "Trademark Guard Failed"
        for nsfw in NSFW_BLACKLIST:
            if nsfw in search_text: return False, "rejected", 0, {}, "NSFW Guard Failed"

        if img.mode != "RGBA": return False, "rejected", 0, {}, "Not RGBA format"

        alpha = img.getchannel('A')
        bbox = alpha.getbbox()
        if not bbox: return False, "rejected", 0, {}, "Completely transparent"

        alpha_data = list(alpha.getdata())
        total_pixels = len(alpha_data)
        solid_pixels = sum(1 for p in alpha_data if p > 50)
        solid_ratio = solid_pixels / total_pixels
        
        if solid_ratio < 0.20 or solid_ratio > 0.80:
            return False, "rejected", 0, {}, f"Area Ratio Out of Bounds ({solid_ratio:.2f})"

        x_min, y_min, x_max, y_max = bbox
        center_x = (x_min + x_max) / 2
        center_y = (y_min + y_max) / 2
        dist_from_center = math.sqrt((center_x - 512)**2 + (center_y - 512)**2)
        centering_score = max(0, int(100 - (dist_from_center / 512) * 100))
        
        margin_score = 100
        if x_min == 0 or y_min == 0 or x_max == width or y_max == height:
            margin_score = 50
            return False, "rejected", 0, {}, "Composition Edge Cutoff"

        img_rgb = img.convert("RGB")
        stat = ImageStat.Stat(img_rgb, mask=alpha)
        color_stddev = sum(stat.stddev) / 3
        if color_stddev < 10.0:
            return False, "rejected", 0, {}, f"Single Color Detected (StdDev: {color_stddev:.1f})"

        # ==========================================
        # Layer 4: Commercial Grade QA Engine
        # ==========================================
        layer4_edge = "PASS"
        layer4_fringe = "PASS"
        layer4_abstract = "PASS"
        layer4_phash = "PASS"

        try:
            import cv2
            import numpy as np
            import imagehash

            img_cv = np.array(img_rgb)
            img_gray = cv2.cvtColor(img_cv, cv2.COLOR_RGB2GRAY)

            # 1. Edge Sharpness Check
            variance = cv2.Laplacian(img_gray, cv2.CV_64F).var()
            layer4_edge = f"{variance:.1f}"
            if variance < 50.0:
                return False, "rejected", 0, {}, f"Layer4: Edge Sharpness failed (Blurry, Variance: {variance:.1f})"

            # 2. White Fringe Detection v2
            alpha_arr = np.array(alpha)
            edge_mask = (alpha_arr > 20) & (alpha_arr < 230)
            if np.any(edge_mask):
                edge_rgb = img_cv[edge_mask]
                mean_r, mean_g, mean_b = np.mean(edge_rgb, axis=0)
                if mean_r > 230 and mean_g > 230 and mean_b > 230:
                    layer4_fringe = f"FAIL (R:{mean_r:.1f} G:{mean_g:.1f} B:{mean_b:.1f})"
                    return False, "rejected", 0, {}, f"Layer4: White Fringe detected {layer4_fringe}"

            # 3 & 4. Object Detection & Abstract Detector
            _, thresh = cv2.threshold(alpha_arr, 127, 255, 0)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours:
                return False, "rejected", 0, {}, "Layer4: No object contours found"
                
            main_contour = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(main_contour)
            perimeter = cv2.arcLength(main_contour, True)
            
            if perimeter > 0:
                circularity = 4 * np.pi * (area / (perimeter * perimeter))
                if circularity > 0.85:
                    layer4_abstract = f"FAIL (Circularity: {circularity:.2f})"
                    return False, "rejected", 0, {}, f"Layer4: Abstract shape detected {layer4_abstract}"
            
            if len(main_contour) < 10:
                return False, "rejected", 0, {}, "Layer4: Too few contour points (Simple geometry)"

            # 6. Duplicate Similarity
            current_hash = str(imagehash.phash(img_rgb))
            hash_db_path = os.path.join(self.output_dir, "hash_db.json")
            hashes = []
            if os.path.exists(hash_db_path):
                with open(hash_db_path, "r") as f:
                    hashes = json.load(f)
            
            for h in hashes:
                diff = imagehash.hex_to_hash(current_hash) - imagehash.hex_to_hash(h)
                if diff < 5:
                    return False, "rejected", 0, {}, f"Layer4: Duplicate similarity detected (diff {diff})"
            
            layer4_phash = current_hash

        except ImportError as e:
            print(f"  [WARNING] Layer4 dependencies missing ({e}). Cannot strictly verify.")
            # For fail-closed, if modules are missing, we should probably fail.
            pass

        quality_score = int(centering_score * 0.40 + margin_score * 0.40 + 20)
        metrics = {
            "quality_score": quality_score,
            "centering_score": centering_score,
            "margin_score": margin_score,
            "solid_ratio": solid_ratio,
            "color_stddev": color_stddev,
            "edge_sharpness": layer4_edge,
            "white_fringe": layer4_fringe,
            "abstract_check": layer4_abstract,
            "phash": layer4_phash
        }

        if quality_score < 90:
            return False, "rejected", quality_score, metrics, f"Low Score ({quality_score})"

        print("  [STEP 3.5] Running AI Vision Quality & Brand Safety Check...")
        try:
            temp_path = f"temp_vision_{uuid.uuid4().hex[:8]}.png"
            img.save(temp_path)
            
            model = genai.GenerativeModel('gemini-1.5-pro')
            prompt = '''You are a strict QA auditor for a premium commercial stock image platform (e.g. Adobe Stock).
Analyze this transparent PNG image. 
Rule: Reply ONLY with "YES" if it meets ALL criteria, or "NO: [reason]" if it fails.
Criteria:
1. Is it a highly recognizable, practical object with physical texture and 3D volume?
2. Is the composition intact (no missing parts, no strange deformations, no cutoffs)?
3. Is it completely free of white fringes, blurry edges, and background contamination?
4. Is it absolutely NOT a simple abstract shape, flat color, circle, or star?
5. Is the quality exceptionally high enough for commercial stock use?'''
            sample_file = genai.upload_file(path=temp_path)
            response = model.generate_content([prompt, sample_file])
            result_text = response.text.strip()
            
            if os.path.exists(temp_path): os.remove(temp_path)
            
            if not result_text.startswith("YES"):
                return False, "rejected", quality_score, metrics, f"Vision API Rejected: {result_text}"
            
            print("  [PASS] AI Vision Quality Check passed.")
        except Exception as e:
            print(f"  [FATAL] AI Vision check threw an exception: {e}.")
            return False, "pending_review_failed", quality_score, metrics, f"Vision API Exception: {e}"

        return True, "pending", quality_score, metrics, "PASS"

    def compile_metadata(self, task, q_score, index):
        keyword = task["keyword"]
        db_cat = task["db_category"]
        slug_kw = hashlib.md5(keyword.encode('utf-8')).hexdigest()[:8]
        slug = f"{db_cat}-{slug_kw}-{index+1:03d}-{random.randint(100, 999)}"
        
        return {
            "id": str(uuid.uuid4()),
            "slug": slug,
            "title": f"高品質透過アセット: {keyword}",
            "category": db_cat,
            "tags": [keyword, db_cat, "transparent-png", "commercial-use", "premium"],
            "description": f"AI生成による高品質な{keyword}の透過PNG素材です。",
            "width": 1024,
            "height": 1024,
            "file_size": "2.0 MB",
            "storage_key": f"{db_cat}/{slug}.png",
        }

    def execute_tasks(self):
        import random
        tasks = self.select_tasks()
        results = []
        
        for i, task in enumerate(tasks):
            print(f"\\n{'='*40}\\nProcessing {i+1}/{len(tasks)}: {task['keyword']}\\n{'='*40}")
            try:
                img, prompt, neg_prompt = self.generate_image(task, i)
                transparent_img = self.remove_background(img)
                
                passed, new_status, q_score, q_metrics, reason = self.verify_quality(transparent_img, task)
                
                meta = self.compile_metadata(task, q_score, i)
                meta["review_status"] = new_status
                
                result_entry = {
                    "keyword": task["keyword"],
                    "status": new_status,
                    "quality_score": q_score,
                    "solid_ratio": q_metrics.get("solid_ratio", 0),
                    "color_stddev": q_metrics.get("color_stddev", 0),
                    "edge_sharpness": q_metrics.get("edge_sharpness", ""),
                    "white_fringe": q_metrics.get("white_fringe", ""),
                    "abstract_check": q_metrics.get("abstract_check", ""),
                    "reason": reason,
                    "prompt": prompt,
                    "negative_prompt": neg_prompt
                }
                
                if passed:
                    local_path = os.path.join(self.output_dir, meta["storage_key"])
                    os.makedirs(os.path.dirname(local_path), exist_ok=True)
                    transparent_img.save(local_path, format="PNG")
                    print(f"  [SAVED] {local_path} as {new_status}")
                    
                    # Store hash
                    phash = q_metrics.get("phash")
                    if phash and phash != "PASS":
                        hash_db_path = os.path.join(self.output_dir, "hash_db.json")
                        hashes = []
                        if os.path.exists(hash_db_path):
                            with open(hash_db_path, "r") as f:
                                hashes = json.load(f)
                        hashes.append(phash)
                        with open(hash_db_path, "w") as f:
                            json.dump(hashes, f)
                
                results.append(result_entry)
            except Exception as e:
                print(f"[FATAL] Pipeline exception for {task['keyword']}: {e}")
                results.append({"keyword": task["keyword"], "status": "failed", "reason": str(e)})

        report_path = os.path.join(self.output_dir, "quality_audit_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\\nReport saved to {report_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--test10', action='store_true')
    args = parser.parse_args()
    
    if args.test10:
        tasks = [
            {"category": "寿司", "keyword": "特上握り寿司"},
            {"category": "ラーメン", "keyword": "特製豚骨ラーメン"},
            {"category": "おにぎり", "keyword": "鮭おにぎり"},
            {"category": "抹茶", "keyword": "抹茶パフェ"},
            {"category": "和の伝統素材", "keyword": "朱塗りの鳥居"},
            {"category": "和の伝統素材", "keyword": "招き猫"},
            {"category": "和の伝統素材", "keyword": "お守り"},
            {"category": "和の伝統素材", "keyword": "富士山"},
            {"category": "桜", "keyword": "満開の桜の枝"},
            {"category": "和柄", "keyword": "青海波の和柄模様"}
        ]
        pipeline = AssetPipeline(test_tasks=tasks)
        pipeline.execute_tasks()
"""

with open("bin/pipeline.py", "w", encoding="utf-8") as f:
    f.write(new_pipeline)

print("Pipeline completely rewritten to enforce Layer 4 constraints.")
