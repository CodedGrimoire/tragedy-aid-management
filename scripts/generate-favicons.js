const sharp = require('sharp');
const fs = require('fs').promises;

async function generateFavicons() {
  const sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'favicon-48x48.png': 48,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512
  };

  const inputSvg = await fs.readFile('./public/favicon.svg');

  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(inputSvg)
      .resize(size, size)
      .toFile(`./public/${filename}`);
  }

  // Generate ICO file (contains multiple sizes)
  await sharp(inputSvg)
    .resize(32, 32)
    .toFile('./public/favicon.ico');
}

generateFavicons().catch(console.error);