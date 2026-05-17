import os
from rembg import remove, new_session
from PIL import Image
import io

input_dir = 'import-ready/food/_raw'
output_dir = 'import-ready/food'
os.makedirs(output_dir, exist_ok=True)

# Use u2net model for general objects
model_name = "u2net"
session = new_session(model_name)

files = [f for f in os.listdir(input_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

print(f"🚀 Processing {len(files)} files from {input_dir}...")

for filename in files:
    input_path = os.path.join(input_dir, filename)
    # Output name should be .png and match the slug pattern (or just the filename with .png)
    base_name = os.path.splitext(filename)[0]
    output_path = os.path.join(output_dir, f"{base_name}.png")
    
    print(f"  🔍 Processing: {filename} -> {base_name}.png")
    
    try:
        with open(input_path, 'rb') as i:
            input_data = i.read()
            # remove background with alpha matting enabled
            output_data = remove(
                input_data, 
                session=session,
                alpha_matting=True,
                alpha_matting_foreground_threshold=240,
                alpha_matting_background_threshold=10,
                alpha_matting_erode_size=10
            )
            
            with open(output_path, 'wb') as o:
                o.write(output_data)
        print(f"    ✅ Done.")
    except Exception as e:
        print(f"    ❌ Error processing {filename}: {e}")

print("\n✨ Background removal completed.")
