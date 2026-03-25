const Jimp = require('jimp');

async function removeBackground() {
  const images = ['public/logo.png', 'public/favicon.png'];
  
  for (const imgPath of images) {
    try {
      const image = await Jimp.read(imgPath);
      
      // Get the background color at pixel 0,0
      const bgColor = Jimp.intToRGBA(image.getPixelColor(0, 0));
      
      const distThreshold = 40; // distance threshold
      const softenEdge = 15; // blend zone
      
      // Scan all pixels
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        const a = this.bitmap.data[idx + 3];

        // Euclidean distance in RGB color space
        const dist = Math.sqrt(
          Math.pow(r - bgColor.r, 2) +
          Math.pow(g - bgColor.g, 2) +
          Math.pow(b - bgColor.b, 2)
        );

        if (dist < distThreshold) {
          // Inner transparent zone
          this.bitmap.data[idx + 3] = 0; // Fully transparent
        } else if (dist < distThreshold + softenEdge) {
          // Anti-aliased / semi-transparent zone for smooth edges
          const alphaRatio = (dist - distThreshold) / softenEdge;
          this.bitmap.data[idx + 3] = Math.min(a, Math.floor(alphaRatio * 255));
        }
      });
      
      await image.writeAsync(imgPath);
      console.log(`Successfully made background transparent for ${imgPath}`);
    } catch (err) {
      console.error(`Error processing ${imgPath}:`, err);
    }
  }
}

removeBackground();
