from bin.pipeline import AssetPipeline

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

# bypass key check for prompt generation only
import os
os.environ['STABILITY_API_KEY'] = 'dummy'
os.environ['GEMINI_API_KEY'] = 'dummy'

p = AssetPipeline(test_tasks=tasks)
for i, t in enumerate(p.select_tasks()):
    kw = t['keyword']
    mod = t['mod']
    prompt = f"Ultra high quality transparent PNG asset of {kw}, {mod}, isolated object, centered composition, no background, crystal clear edges, premium commercial stock asset, soft studio lighting, highly detailed, fully usable for design production, professional PNG material"
    neg = "abstract, symbol, icon, circle, star, geometric shape, blurry, cropped, deformed, low detail, watercolor, painting, text, logo, noise, background, frame, fake object, multiple objects, cutoff"
    print(f"{i+1}. Keyword: {kw}\\n   Prompt: {prompt}\\n")
