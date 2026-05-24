import sys

with open("bin/pipeline.py", "r") as f:
    content = f.read()

# Replace arg parsing
old_main = """if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--test10', action='store_true')
    args = parser.parse_args()
    
    if args.test10:"""

new_main = """if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--test10', action='store_true')
    parser.add_argument('--env-check', action='store_true')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--save-pending', action='store_true')
    args = parser.parse_args()
    
    if args.env_check:
        print("\\n=== Environment Check ===")
        print(f"STABILITY_API_KEY: {'[SET]' if os.getenv('STABILITY_API_KEY') else '[NOT SET]'}")
        print(f"GEMINI_API_KEY: {'[SET]' if os.getenv('GEMINI_API_KEY') else '[NOT SET]'}")
        print("=========================\\n")
        sys.exit(0)

    if args.test10:"""
content = content.replace(old_main, new_main)

# Add dry_run and save_pending logic to AssetPipeline
old_init = """    def __init__(self, category=None, count=1, auto_mode=False, output_dir="output", test_tasks=None):"""
new_init = """    def __init__(self, category=None, count=1, auto_mode=False, output_dir="output", test_tasks=None, dry_run=False, save_pending=False):
        self.dry_run = dry_run
        self.save_pending = save_pending"""
content = content.replace(old_init, new_init)

# Fix instance creation in __main__
old_instance = """pipeline = AssetPipeline(test_tasks=tasks)"""
new_instance = """pipeline = AssetPipeline(test_tasks=tasks, dry_run=args.dry_run, save_pending=args.save_pending)"""
content = content.replace(old_instance, new_instance)

# Modify DB/Storage logic (dummy for now since we don't have DB/Storage methods actually implemented fully in the rewritten pipeline, wait, I removed insert_to_db and upload_to_storage in the previous layer 4 rewrite? Let me check.)
