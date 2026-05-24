import sys

new_pipeline = """#!/usr/bin/env python3
\"\"\"
AssetNinja AI Asset Generation & Transparency Pipeline Engine
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
    print("[WARNING] rembg library not installed. Background removal will fall back to simulation mode.")
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
            print(f"[FATAL ERROR] API keys missing: {', '.join(missing_keys)}")
            print("[FATAL ERROR] Stopping pipeline. Cannot guarantee quality without full API access.")
            sys.exit(1)

        genai.configure(api_key=self.gemini_key)

        # 9 Core Categories Mapping Config (Autonomous OS Categories)
        self.categories_pool = {
            "寿司": {"db_key": "sushi", "keywords": ["特上握り寿司", "サーモン握り", "マグロの握り", "いくら軍艦", "カリフォルニアロール", "手巻き寿司", "寿司の盛り合わせ", "炙りサーモン寿司", "えびの握り寿司", "たまご焼き寿司"], "mod": "authentic Japanese sushi"},
            "ラーメン": {"db_key": "ramen", "keywords": ["特製豚骨ラーメン", "醤油ラーメン", "味噌ラーメン", "塩ラーメン", "激辛ラーメン", "チャーシュー麺", "魚介つけ麺", "家系ラーメン", "冷やし中華", "鶏白湯ラーメン"], "mod": "authentic Japanese ramen bowl, steam rising, realistic food texture"},
            "おにぎり": {"db_key": "onigiri", "keywords": ["梅干しおにぎり", "鮭おにぎり", "ツナマヨおにぎり", "明太子おにぎり", "昆布おにぎり", "焼きおにぎり", "天むす", "塩むすび", "海苔巻きおにぎり", "三角おにぎり"], "mod": "traditional Japanese onigiri rice ball, realistic food texture"},
            "抹茶": {"db_key": "matcha", "keywords": ["濃厚抹茶ラテ", "抹茶パフェ", "抹茶アイスクリーム", "抹茶の和菓子", "抹茶ロールケーキ", "点てたお抹茶", "抹茶ティラミス", "抹茶フラペチーノ", "抹茶マカロン", "抹茶プリン"], "mod": "premium Japanese matcha green tea dessert, realistic food texture"},
            "和柄": {"db_key": "japanese-pattern", "keywords": ["青海波の和柄模様", "麻の葉の和柄テクスチャ", "市松模様の和柄", "矢絣の和柄", "七宝の和柄パターン", "亀甲の和柄", "唐草模様", "和風の花菱パターン", "霞模様のテクスチャ", "流水紋の和柄"], "mod": "seamless texture pattern of classic Japanese design, gold and rich color tones, decorative vector art"},
            "桜": {"db_key": "sakura", "keywords": ["満開の桜の枝", "舞い散る桜の花びら", "一本桜の木", "夜桜", "桜のリース", "水面に浮かぶ桜", "桜のブーケ", "桜吹雪のエフェクト", "桜の盆栽", "和風の桜装飾"], "mod": "beautiful cinematic studio shot of Japanese sakura cherry blossoms, vivid pink colors, highly detailed"},
            "和風背景": {"db_key": "japanese-background", "keywords": ["金屏風の背景", "和紙のテクスチャ背景", "竹林の背景", "枯山水の砂紋背景", "障子の背景", "和室の畳背景", "墨汁の筆文字エフェクト", "和風の水彩ぼかし背景", "紅葉の背景", "和風の雲海背景"], "mod": "beautiful authentic premium Japanese background asset, highly detailed"},
            "日本アイコン": {"db_key": "japan-icon", "keywords": ["温泉のマークアイコン", "初心者マーク", "家紋のアイコン", "和風の印鑑アイコン", "日本の硬貨アイコン", "和傘のアイコン", "折り鶴のアイコン", "手裏剣のアイコン", "扇子のアイコン", "こけしのアイコン"], "mod": "clean high-fidelity 3D icon rendering of Japanese object, modern 3D icon style"},
            "吹き出し": {"db_key": "speech-bubble", "keywords": ["和風の筆文字風吹き出し", "もこもこポップな吹き出し", "ギザギザの強調吹き出し", "シンプルな角丸吹き出し", "桜の花びら型吹き出し", "巻物風の吹き出し", "和紙テクスチャの吹き出し", "サイバーパンク風吹き出し", "ネオン輝く吹き出し", "手書き風の吹き出し"], "mod": "clean high-fidelity 3D rendering of speech bubble, UI UX design asset, empty text area"},
            "和の伝統素材": {"db_key": "japan", "keywords": ["赤提灯", "朱塗りの鳥居", "木造の神社本殿", "縁起の良いだるま人形", "日本刀（打刀）", "富士山", "金屏風", "和傘", "手裏剣", "お守り", "招き猫", "畳", "漆塗りお椀", "お祭り提灯"], "mod": "traditional Japanese cultural object, premium craft commercial photography"}
        }
        self.selected_category = category if category in self.categories_pool else "和の伝統素材"

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
            
        # fallback to regular behavior
        return []

    def generate_image(self, task, index):
        keyword = task["keyword"]
        mod = task["mod"]
        
        # Layer 2: Premium PNG Prompt Engine
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
            "seed": 0, # Force random seed in production, use 0 or something for API to pick
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
        print("[STEP 3/6] Activating Quality & Safety Filter Validation...")
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
        
        # 被写体面積チェック (20% - 80%)
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

        # 単色チェック (Shape/Color Variance Check)
        img_rgb = img.convert("RGB")
        stat = ImageStat.Stat(img_rgb, mask=alpha)
        color_stddev = sum(stat.stddev) / 3
        if color_stddev < 10.0:
            return False, "rejected", 0, {}, f"Single Color Detected (StdDev: {color_stddev:.1f})"

        quality_score = int(centering_score * 0.40 + margin_score * 0.40 + 20)
        
        metrics = {
            "quality_score": quality_score,
            "centering_score": centering_score,
            "margin_score": margin_score,
            "solid_ratio": solid_ratio,
            "color_stddev": color_stddev
        }

        if quality_score < 90:
            return False, "rejected", quality_score, metrics, f"Low Score ({quality_score})"

        print("  [STEP 3.5] Running AI Vision Quality & Brand Safety Check...")
        try:
            temp_path = f"temp_vision_{uuid.uuid4().hex[:8]}.png"
            img.save(temp_path)
            
            model = genai.GenerativeModel('gemini-1.5-pro')
            prompt = '''You are a strict QA auditor for a premium stock image platform.
Analyze this transparent PNG image. 
Rule: Reply ONLY with "YES" if it meets ALL criteria, or "NO: [reason]" if it fails.
Criteria:
1. Is it a recognizable, practical object?
2. Is the composition intact (no missing parts, no strange deformations)?
3. Is it completely free of white fringes and has a proper transparent background?
4. Is it absolutely NOT a simple abstract shape, circle, or star?
5. Is the quality high enough for commercial stock use (like Adobe Stock)?'''
            sample_file = genai.upload_file(path=temp_path)
            response = model.generate_content([prompt, sample_file])
            result_text = response.text.strip()
            
            # genai.delete_file(sample_file.name)
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
                    "reason": reason,
                    "prompt": prompt,
                    "negative_prompt": neg_prompt
                }
                
                if passed or new_status == "pending_review_failed":
                    local_path = os.path.join(self.output_dir, meta["storage_key"])
                    os.makedirs(os.path.dirname(local_path), exist_ok=True)
                    transparent_img.save(local_path, format="PNG")
                    print(f"  [SAVED] {local_path} as {new_status}")
                
                results.append(result_entry)
            except Exception as e:
                print(f"[FATAL] Pipeline exception for {task['keyword']}: {e}")
                results.append({"keyword": task["keyword"], "status": "failed", "reason": str(e)})

        # Report Generation
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

print("Pipeline completely rewritten to enforce Layer 1-3 constraints.")
