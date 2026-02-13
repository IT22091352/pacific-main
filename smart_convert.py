
from PIL import Image
import os

def check_and_convert(files):
    base_dir = 'images'
    converted_map = {}
    
    for f in files:
        path = os.path.join(base_dir, f)
        if not os.path.exists(path):
            print(f"Skipping {f}, not found.")
            continue
            
        try:
            img = Image.open(path)
            has_alpha = False
            
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                if img.mode == 'P':
                    img = img.convert('RGBA')
                # Check alpha channel strictly
                extrema = img.getextrema()
                # For RGBA, extrema is a list of tuples. Alpha is the 4th tuple (index 3).
                # extrema[3] is (min_alpha, max_alpha)
                if extrema[3][0] < 255:
                    has_alpha = True
            
            if not has_alpha:
                # Convert to JPG
                new_file = f.replace('.png', '.jpg')
                new_path = os.path.join(base_dir, new_file)
                rgb_img = img.convert('RGB')
                rgb_img.save(new_path, quality=75, optimize=True)
                
                old_size = os.path.getsize(path)
                new_size = os.path.getsize(new_path)
                print(f"CONVERTED: {f} -> {new_file} ({old_size/1024:.1f}KB -> {new_size/1024:.1f}KB)")
                converted_map[f] = new_file
            else:
                print(f"KEPT PNG (Has Alpha): {f}")
                # Optimize existing PNG
                img.save(path, optimize=True)
                
        except Exception as e:
            print(f"Error checking {f}: {e}")
            
    return converted_map

if __name__ == "__main__":
    files = ['taxi.png', 'taxi2.png', 'beach.png', 'teaplantation.png', 'airport.png']
    mapping = check_and_convert(files)
    if mapping:
        print("\nReplacement Mapping:")
        for k, v in mapping.items():
            print(f"{k}|{v}")
