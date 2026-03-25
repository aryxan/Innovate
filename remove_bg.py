import sys
from PIL import Image
import numpy as np

def make_transparent(img_path):
    img = Image.open(img_path).convert("RGBA")
    data = np.array(img)

    # Get background color from the corner
    bg_color = data[0, 0, :3]
    print(f"Background color detected: {bg_color}")
    
    r, g, b, a = data.T
    
    # Calculate Euclidean distance to the background color
    dist = np.sqrt((r - bg_color[0])**2 + (g - bg_color[1])**2 + (b - bg_color[2])**2)
    
    threshold = 20
    # Create smooth alpha channel
    # Where dist is very small, alpha should be 0. Where dist is large, alpha should be 255.
    alpha = np.clip((dist - threshold) * 8, 0, 255).astype(np.uint8)
    
    # Original alpha shouldn't exceed its previous value (in case it already had some transparency)
    data[..., 3] = np.minimum(data[..., 3], alpha.T)
    
    Image.fromarray(data).save(img_path)
    print(f"Processed: {img_path}")

make_transparent("public/logo.png")
make_transparent("public/favicon.png")
