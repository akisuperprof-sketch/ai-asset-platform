#!/bin/bash

# run_300_assets.sh
# Executes bin/pipeline.py for multiple categories sequentially

source /Users/akihironishi/.gemini/config/plugins/science/scripts/uv_env.sh || true
source venv/bin/activate || true

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

echo "Starting 300 Asset Expansion..."

python3 bin/pipeline.py --category "寿司" --count 30
python3 bin/pipeline.py --category "ラーメン" --count 30
python3 bin/pipeline.py --category "おにぎり" --count 20
python3 bin/pipeline.py --category "抹茶" --count 20
python3 bin/pipeline.py --category "和柄" --count 40
python3 bin/pipeline.py --category "桜" --count 40
python3 bin/pipeline.py --category "和風背景" --count 40
python3 bin/pipeline.py --category "日本アイコン" --count 30
python3 bin/pipeline.py --category "吹き出し" --count 20
python3 bin/pipeline.py --category "和の伝統素材" --count 30

echo "Finished 300 Asset Expansion."
