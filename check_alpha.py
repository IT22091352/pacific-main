
from PIL import Image
import os

files = ['taxi.png', 'taxi2.png', 'beach.png', 'teaplantation.png', 'airport.png']
base_dir = 'images'

for f in files:
    path = os.path.join(base_dir, f)
    if os.path.exists(path):
        img = Image.open(path)
        has_alpha = False
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
             # check if any pixel is actually transparent
             if img.mode == 'RGBA':
                 extrema = img.getextrema()
                 if extrema[3][0] < 255:
                     has_alpha = True
        
        print(f"{f}: Mode={img.mode}, HasAlpha={has_alpha}")
    else:
        print(f"{f}: Not found")
