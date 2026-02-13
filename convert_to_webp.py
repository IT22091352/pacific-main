
import os
from PIL import Image

def convert_to_webp(directory):
    converted_files = []
    
    # Walk through all directories
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(root, file)
                file_name, file_ext = os.path.splitext(file_path)
                webp_path = file_name + ".webp"
                
                try:
                    with Image.open(file_path) as img:
                        # Convert to RGB if necessary (though WebP supports RGBA)
                        # WebP supports both lossy and lossless. 
                        # We generally want lossy for photos (like jpg) and lossless for graphics (like png)
                        # But for simplicity and size, default save is usually fine.
                        
                        img.save(webp_path, "WEBP", quality=80)
                        
                        # Store relative path for reporting
                        rel_path = os.path.relpath(file_path, start='.')
                        rel_webp_path = os.path.relpath(webp_path, start='.')
                        converted_files.append((rel_path, rel_webp_path))
                        print(f"Converted: {rel_path} -> {rel_webp_path}")
                except Exception as e:
                    print(f"Error converting {file_path}: {e}")

    return converted_files

if __name__ == "__main__":
    print("Starting WebP conversion...")
    convert_to_webp('images')
