
import os

def update_references(root_dir):
    # 1. Identify all WebP files and their counterparts.
    # Map: 'original_fragment' -> 'new_fragment'
    # e.g., 'images/bg_1.jpg' -> 'images/bg_1.webp'
    
    replacements = {}
    
    img_dir = 'images'
    for root, dirs, files in os.walk(img_dir):
        for file in files:
            if file.endswith('.webp'):
                # Found a webp file.
                base_name = os.path.splitext(file)[0]
                webp_path = os.path.join(root, file).replace('\\', '/')
                
                # Assume original images were in the same directory
                # Possible extensions to replace
                extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']
                
                for ext in extensions:
                    original_name = base_name + ext
                    original_path = os.path.join(root, original_name).replace('\\', '/')
                    
                    # Store the replacement
                    # We accept both relative from root (images/...) and potentially absolute or other relative paths
                    # But for now, let's just replace the exact path string if found.
                    replacements[original_path] = webp_path

    # Also consider CSS specific paths (../images/...)
    # But usually simple string replacement of "images/foo.jpg" works even for "../images/foo.jpg"
    # because "images/foo.jpg" is the common substring.
    
    # 2. Update files
    extensions_to_check = ['.html', '.css', '.js']
    
    for root, dirs, files in os.walk(root_dir):
        # Skip node_modules and .git
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
            
        for file in files:
            if any(file.endswith(ext) for ext in extensions_to_check):
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    changes_count = 0
                    
                    # Sort replacements by length descending to avoid partial matches being replaced first
                    # e.g. logo.png vs logo.png.bak (if that existed)
                    sorted_keys = sorted(replacements.keys(), key=len, reverse=True)
                    
                    for old_path in sorted_keys:
                        new_path = replacements[old_path]
                        
                        # Check for exact path match
                        if old_path in new_content:
                            new_content = new_content.replace(old_path, new_path)
                            changes_count += 1
                    
                    if new_content != content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Updated {file}: {changes_count} replacements")
                        
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    update_references('.')
