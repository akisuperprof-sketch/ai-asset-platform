import sys

with open("src/app/layout.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
imports = """import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { ComingSoonToast } from "@/components/ui/ComingSoonToast";
import { LivingBackground } from "@/components/layout/LivingBackground";
import { DESIGN_TOKENS } from "@/design/tokens";
import seoRules from "@/design/rules/seo-rules.json";
import "./globals.css";"""

content = content.replace('import type { Metadata } from "next";\nimport { Noto_Sans_JP } from "next/font/google";\nimport { ComingSoonToast } from "@/components/ui/ComingSoonToast";\nimport { LivingBackground } from "@/components/layout/LivingBackground";\nimport "./globals.css";', imports)

# Modify metadata keywords
old_keywords = """  keywords: ["PNG", "背景透過", "素材", "プレミアム素材", "フリー素材", "商用利用", "日本素材", "AssetNinja", "切り抜き画像", "Transparent PNG", "Premium PNG", "Japanese Assets"],"""
new_keywords = """  keywords: ["PNG", "背景透過", "素材", ...seoRules.mandatory_terms, "AssetNinja", "切り抜き画像", "Premium Japanese Assets"],"""
content = content.replace(old_keywords, new_keywords)

# Update body class
old_body = """<body className="bg-black text-foreground antialiased selection:bg-ai-purple/30">"""
new_body = """<body className={`${DESIGN_TOKENS.colors.background} ${DESIGN_TOKENS.colors.textPrimary} ${DESIGN_TOKENS.typography.body} antialiased selection:bg-white/10`}>"""
content = content.replace(old_body, new_body)

with open("src/app/layout.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("layout.tsx updated")
