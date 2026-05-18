import os
import sys
from rembg import remove, new_session

input_dir = 'generated-assets/_raw'
output_dir = 'generated-assets/_transparent'
os.makedirs(output_dir, exist_ok=True)

model_name = "u2net"
session = new_session(model_name)

files = [f for f in os.listdir(input_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

print(f"🚀 Processing {len(files)} files from {input_dir} using rembg Alpha Matting...")

for filename in files:
    input_path = os.path.join(input_dir, filename)
    base_name = os.path.splitext(filename)[0]
    output_path = os.path.join(output_dir, f"{base_name}.png")
    
    print(f"  🔍 Removing background: {filename} -> {base_name}.png")
    
    try:
        with open(input_path, 'rb') as i:
            input_data = i.read()
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
        print(f"    ❌ Error: {e}")

print("✨ All background removal completed.")
