import fs from 'fs';
import zlib from 'zlib';

function createSolidPng(width, height, r, g, b) {
  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: 13 bytes
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bits per channel
  ihdr.writeUInt8(2, 9); // Color type 2 (Truecolor / RGB)
  ihdr.writeUInt8(0, 10); // Compression method 0
  ihdr.writeUInt8(0, 11); // Filter method 0
  ihdr.writeUInt8(0, 12); // Interlace 0

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: height scanlines. Each scanline has 1 filter byte (0) + width * 3 bytes
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // Draw border & cross pattern
      const isBorder = x < 8 || x >= width - 8 || y < 8 || y >= height - 8;
      const isCross = (Math.abs(x - width / 2) < width / 8 && Math.abs(y - height / 2) < height / 2.8) ||
                      (Math.abs(y - height / 2) < height / 8 && Math.abs(x - width / 2) < width / 2.8);

      if (isCross) {
        // Amber #f59e0b
        rawData[pixelOffset] = 0xf5;
        rawData[pixelOffset + 1] = 0x9e;
        rawData[pixelOffset + 2] = 0x0b;
      } else if (isBorder) {
        // Slate border
        rawData[pixelOffset] = 0x33;
        rawData[pixelOffset + 1] = 0x41;
        rawData[pixelOffset + 2] = 0x55;
      } else {
        // Dark background #090d16
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeInt32BE(crc, 8 + len);
  return buf;
}

// Standard CRC32
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1;
}

const table = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c;
}

// Generate PNGs
const png192 = createSolidPng(192, 192, 9, 13, 22);
fs.writeFileSync('./public/pwa-192x192.png', png192);

const png512 = createSolidPng(512, 512, 9, 13, 22);
fs.writeFileSync('./public/pwa-512x512.png', png512);

const appleTouch = createSolidPng(180, 180, 9, 13, 22);
fs.writeFileSync('./public/apple-touch-icon.png', appleTouch);

console.log('Successfully generated valid PNG icons for PWA and iOS');
