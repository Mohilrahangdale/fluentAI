import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal PNG generator using standard Node.js zlib
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crc ^ buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc & 1) !== 0) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'binary');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(width, height, pixelFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw Scanlines: each row starts with filter byte 0 followed by width * 4 bytes
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;

  for (let y = 0; y < height; y++) {
    scanlines[offset++] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      scanlines[offset++] = r;
      scanlines[offset++] = g;
      scanlines[offset++] = b;
      scanlines[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// FluentAI Icon Renderer
function renderIcon(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Background gradient: Emerald #059669 -> Teal #0f766e
  const bgR = Math.round(5 + (15 - 5) * ny);
  const bgG = Math.round(150 + (118 - 150) * ny);
  const bgB = Math.round(105 + (110 - 105) * ny);

  // Rounded corner mask for regular icon (not maskable which is full bleed)
  if (!isMaskable) {
    const cornerRadius = w * 0.22;
    let distFromEdge = 0;
    const inCornerX = x < cornerRadius || x > w - cornerRadius;
    const inCornerY = y < cornerRadius || y > h - cornerRadius;
    if (inCornerX && inCornerY) {
      const cx = x < cornerRadius ? cornerRadius : w - cornerRadius;
      const cy = y < cornerRadius ? cornerRadius : h - cornerRadius;
      const d = Math.hypot(x - cx, y - cy);
      if (d > cornerRadius) {
        return [0, 0, 0, 0]; // Transparent outside rounded corner
      }
    }
  }

  // Scale coordinates to normalized box inside safe-zone
  const scale = isMaskable ? 0.72 : 0.85;
  const ox = (nx - 0.5) / scale + 0.5;
  const oy = (ny - 0.5) / scale + 0.5;

  // Bubble boundaries
  const bx1 = 0.23, bx2 = 0.77, by1 = 0.20, by2 = 0.68;
  const br = 0.12;

  let inBubble = false;
  if (ox >= bx1 && ox <= bx2 && oy >= by1 && oy <= by2) {
    const leftCorner = ox < bx1 + br;
    const rightCorner = ox > bx2 - br;
    const topCorner = oy < by1 + br;
    const bottomCorner = oy > by2 - br;

    if ((leftCorner || rightCorner) && (topCorner || bottomCorner)) {
      const cx = leftCorner ? bx1 + br : bx2 - br;
      const cy = topCorner ? by1 + br : by2 - br;
      if (Math.hypot(ox - cx, oy - cy) <= br) {
        inBubble = true;
      }
    } else {
      inBubble = true;
    }
  }

  // Speech bubble pointer tail
  if (!inBubble && ox >= 0.28 && ox <= 0.45 && oy >= 0.65 && oy <= 0.82) {
    // triangle from (0.32, 0.65) to (0.28, 0.82) to (0.44, 0.65)
    const tSlope = (0.82 - 0.65) / (0.28 - 0.42);
    if (oy <= 0.65 + (ox - 0.42) * tSlope && ox >= 0.28 && ox <= 0.44) {
      inBubble = true;
    }
  }

  if (inBubble) {
    // Check voice bars inside bubble
    // 5 vertical voice bars centered horizontally
    const barWidth = 0.038;
    const barSpacing = 0.026;
    const barRadius = barWidth / 2;
    const totalBarsWidth = 5 * barWidth + 4 * barSpacing;
    const startX = 0.5 - totalBarsWidth / 2;

    const barHeights = [0.12, 0.22, 0.32, 0.22, 0.12];
    const centerY = (by1 + by2) / 2;

    for (let i = 0; i < 5; i++) {
      const barX = startX + i * (barWidth + barSpacing);
      const bHeight = barHeights[i];
      const barY1 = centerY - bHeight / 2;
      const barY2 = centerY + bHeight / 2;

      if (ox >= barX && ox <= barX + barWidth && oy >= barY1 && oy <= barY2) {
        // Rounded caps on bars
        const isTop = oy < barY1 + barRadius;
        const isBottom = oy > barY2 - barRadius;
        const bcx = barX + barRadius;
        if (isTop && Math.hypot(ox - bcx, oy - (barY1 + barRadius)) > barRadius) continue;
        if (isBottom && Math.hypot(ox - bcx, oy - (barY2 - barRadius)) > barRadius) continue;

        // Bar gradient: Emerald #059669 -> Sky blue #0284c7
        const barRatio = i / 4;
        const barR = Math.round(5 + (2 - 5) * barRatio);
        const barG = Math.round(150 + (132 - 150) * barRatio);
        const barB = Math.round(105 + (199 - 105) * barRatio);
        return [barR, barG, barB, 255];
      }
    }

    // Sparkle star near top right
    const sx = 0.71, sy = 0.26, sr = 0.03;
    const sDist = Math.hypot(ox - sx, oy - sy);
    if (sDist < sr) {
      const angle = Math.atan2(oy - sy, ox - sx);
      const starR = sr * (0.35 + 0.65 * Math.pow(Math.abs(Math.cos(2 * angle)), 3));
      if (sDist <= starR) {
        return [16, 185, 129, 255];
      }
    }

    // White bubble surface
    return [255, 255, 255, 255];
  }

  // Background
  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate all standard PWA icon resolutions
console.log('Generating pwa-192x192.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, (x, y, w, h) => renderIcon(x, y, w, h, false)));

console.log('Generating pwa-512x512.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, false)));

console.log('Generating pwa-maskable-512x512.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, true)));

console.log('Generating apple-touch-icon.png (180x180)...');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, (x, y, w, h) => renderIcon(x, y, w, h, false)));

// Also create a 48x48 icon for favicon
fs.writeFileSync(path.join(publicDir, 'favicon.png'), createPng(48, 48, (x, y, w, h) => renderIcon(x, y, w, h, false)));

console.log('All icons generated successfully!');
