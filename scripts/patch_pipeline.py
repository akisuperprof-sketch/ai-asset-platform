import sys
import os

with open("bin/pipeline.py", "r", encoding="utf-8") as f:
    content = f.read()

# Add JSON rule loading
old_init = """    def __init__(self, category=None, count=1, auto_mode=False, output_dir="output", test_tasks=None, dry_run=False, save_pending=False):
        self.count = count"""
new_init = """    def __init__(self, category=None, count=1, auto_mode=False, output_dir="output", test_tasks=None, dry_run=False, save_pending=False):
        self.count = count
        
        # Load Design OS Rules
        rules_dir = os.path.join(os.path.dirname(__file__), "../src/design/rules")
        with open(os.path.join(rules_dir, "prompt-rules.json"), "r") as f:
            self.prompt_rules = json.load(f)
        with open(os.path.join(rules_dir, "forbidden-terms.json"), "r") as f:
            self.forbidden_terms = json.load(f)
        with open(os.path.join(rules_dir, "qa-thresholds.json"), "r") as f:
            self.qa_thresholds = json.load(f)["layer4"]
"""
content = content.replace(old_init, new_init)

# Update generate_image to use the rules
old_gen = """        prompt = f"Ultra high quality transparent PNG asset of {keyword}, {mod}, isolated object, centered composition, no background, crystal clear edges, premium commercial stock asset, soft studio lighting, highly detailed, fully usable for design production, professional PNG material"
        negative_prompt = "abstract, symbol, icon, circle, star, geometric shape, blurry, cropped, deformed, low detail, watercolor, painting, text, logo, noise, background, frame, fake object, multiple objects, cutoff\""""
new_gen = """        prompt_template = self.prompt_rules["system_prompt"]
        prompt = prompt_template.replace("{keyword}", keyword).replace("{mod}", mod)
        
        # Enforce forbidden terms in negative prompt
        negative_prompt = ", ".join(self.forbidden_terms["generation"])
"""
content = content.replace(old_gen, new_gen)

# Update verify_quality to use the rules
old_qa1 = """if solid_ratio < 0.20 or solid_ratio > 0.80:"""
new_qa1 = """if solid_ratio < self.qa_thresholds["min_solid_ratio"] or solid_ratio > self.qa_thresholds["max_solid_ratio"]:"""
content = content.replace(old_qa1, new_qa1)

old_qa2 = """if color_stddev < 10.0:"""
new_qa2 = """if color_stddev < self.qa_thresholds["min_color_stddev"]:"""
content = content.replace(old_qa2, new_qa2)

old_qa3 = """if variance < 50.0:"""
new_qa3 = """if variance < self.qa_thresholds["min_edge_sharpness_variance"]:"""
content = content.replace(old_qa3, new_qa3)

old_qa4 = """if mean_r > 230 and mean_g > 230 and mean_b > 230:"""
new_qa4 = """max_rgb = self.qa_thresholds["max_white_fringe_rgb"]
                if mean_r > max_rgb and mean_g > max_rgb and mean_b > max_rgb:"""
content = content.replace(old_qa4, new_qa4)

old_qa5 = """if circularity > 0.85:"""
new_qa5 = """if circularity > self.qa_thresholds["max_abstract_circularity"]:"""
content = content.replace(old_qa5, new_qa5)

old_qa6 = """if len(main_contour) < 10:"""
new_qa6 = """if len(main_contour) < self.qa_thresholds["min_contour_points"]:"""
content = content.replace(old_qa6, new_qa6)

old_qa7 = """if diff < 5:"""
new_qa7 = """if diff < self.qa_thresholds["max_phash_diff"]:"""
content = content.replace(old_qa7, new_qa7)

old_qa8 = """if quality_score < 90:"""
new_qa8 = """if quality_score < self.qa_thresholds["min_quality_score"]:"""
content = content.replace(old_qa8, new_qa8)


with open("bin/pipeline.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Patched pipeline.py to use JSON rules")
