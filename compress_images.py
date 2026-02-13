
import os
from PIL import Image

def compress_images(directory):
    total_saved = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(root, file)
                original_size = os.path.getsize(file_path)
                
                # Only process if > 300KB
                if original_size > 300 * 1024:
                    try:
                        img = Image.open(file_path)
                        
                        # Resize if too large
                        max_dim = 1920
                        if img.width > max_dim or img.height > max_dim:
                            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                        
                        # Save back
                        if file.lower().endswith('.png'):
                            # Optimize PNG
                            # Check if it has alpha
                            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                                # Keep as PNG
                                img.save(file_path, optimize=True)
                            else:
                                # Provide option to convert to JPG? No, transparency is tricky. Just optimize.
                                img.save(file_path, optimize=True)
                                
                        elif file.lower().endswith(('.jpg', '.jpeg')):
                            # Save as JPEG with 75 quality
                            # Ensure mode is RGB
                            if img.mode != 'RGB':
                                img = img.convert('RGB')
                            img.save(file_path, quality=75, optimize=True)
                            
                        new_size = os.path.getsize(file_path)
                        saved = original_size - new_size
                        
                        if saved > 0:
                            total_saved += saved
                            print(f"Compressed {file}: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB. Saved {saved/1024:.1f}KB")
                        else:
                            print(f"Skipped {file}: No compression gain.")
                            
                    except Exception as e:
                        print(f"Error processing {file}: {e}")

    print(f"\nTotal space saved: {total_saved / (1024*1024):.2f} MB")

if __name__ == "__main__":
    print("Starting image compression...")
    compress_images('images')
