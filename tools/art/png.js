// PNG reading and writing, and a simple picture (Img) to draw pixels on. No packages: Node's zlib only.
const zlib = require('zlib'), fs = require('fs');

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = buf => { let c = 0xFFFFFFFF; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };

class Img {
  constructor(w, h, fill){ this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); if (fill) this.rect(0, 0, w, h, fill); }
  static load(file){
    const b = fs.readFileSync(file); let p = 8, w, h, bits, type, idat = [], plte = null, trns = null;
    while (p < b.length){
      const len = b.readUInt32BE(p), t = b.toString('ascii', p + 4, p + 8), data = b.subarray(p + 8, p + 8 + len); p += 12 + len;
      if (t === 'IHDR'){ w = data.readUInt32BE(0); h = data.readUInt32BE(4); bits = data[8]; type = data[9]; if (data[12]) throw new Error('interlaced'); }
      else if (t === 'PLTE') plte = data; else if (t === 'tRNS') trns = data; else if (t === 'IDAT') idat.push(data); else if (t === 'IEND') break;
    }
    if (bits !== 8) throw new Error('bits ' + bits);
    const ch = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[type], raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * ch, img = new Img(w, h);
    let prev = new Uint8Array(stride);
    for (let y = 0; y < h; y++){
      const f = raw[y * (stride + 1)], line = new Uint8Array(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
      for (let i = 0; i < stride; i++){
        const a = i >= ch ? line[i - ch] : 0, up = prev[i], c = i >= ch ? prev[i - ch] : 0;
        if (f === 1) line[i] += a; else if (f === 2) line[i] += up; else if (f === 3) line[i] += (a + up) >> 1;
        else if (f === 4){ const pa = Math.abs(up - c), pb = Math.abs(a - c), pc = Math.abs(a + up - 2 * c); line[i] += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      }
      for (let x = 0; x < w; x++){
        const o = (y * w + x) * 4, i = x * ch;
        if (type === 6){ img.d[o] = line[i]; img.d[o + 1] = line[i + 1]; img.d[o + 2] = line[i + 2]; img.d[o + 3] = line[i + 3]; }
        else if (type === 2){ img.d[o] = line[i]; img.d[o + 1] = line[i + 1]; img.d[o + 2] = line[i + 2]; img.d[o + 3] = 255; }
        else if (type === 3){ const k = line[i]; img.d[o] = plte[k * 3]; img.d[o + 1] = plte[k * 3 + 1]; img.d[o + 2] = plte[k * 3 + 2]; img.d[o + 3] = trns && k < trns.length ? trns[k] : 255; }
        else if (type === 0){ img.d[o] = img.d[o + 1] = img.d[o + 2] = line[i]; img.d[o + 3] = 255; }
        else { img.d[o] = img.d[o + 1] = img.d[o + 2] = line[i]; img.d[o + 3] = line[i + 1]; }
      }
      prev = line;
    }
    return img;
  }
  save(file){
    const raw = Buffer.alloc((this.w * 4 + 1) * this.h);
    for (let y = 0; y < this.h; y++){ raw[y * (this.w * 4 + 1)] = 0; Buffer.from(this.d.buffer, y * this.w * 4, this.w * 4).copy(raw, y * (this.w * 4 + 1) + 1); }
    const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(this.w, 0); ihdr.writeUInt32BE(this.h, 4); ihdr[8] = 8; ihdr[9] = 6;
    fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, {level: 9})), chunk('IEND', Buffer.alloc(0))]));
    return this;
  }
  get(x, y){ if (x < 0 || y < 0 || x >= this.w || y >= this.h) return [0, 0, 0, 0]; const o = (y * this.w + x) * 4; return [this.d[o], this.d[o + 1], this.d[o + 2], this.d[o + 3]]; }
  // put a pixel: c is [r,g,b] or [r,g,b,a 0..255]; blended over what's there if see-through
  set(x, y, c){
    x |= 0; y |= 0; if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c) return;
    const o = (y * this.w + x) * 4, a = c.length > 3 ? c[3] / 255 : 1;
    if (a >= 1 || this.d[o + 3] === 0){ this.d[o] = c[0]; this.d[o + 1] = c[1]; this.d[o + 2] = c[2]; this.d[o + 3] = a >= 1 ? 255 : Math.round(a * 255); return; }
    if (a <= 0) return;
    const ba = this.d[o + 3] / 255, oa = a + ba * (1 - a);
    this.d[o] = (c[0] * a + this.d[o] * ba * (1 - a)) / oa; this.d[o + 1] = (c[1] * a + this.d[o + 1] * ba * (1 - a)) / oa; this.d[o + 2] = (c[2] * a + this.d[o + 2] * ba * (1 - a)) / oa; this.d[o + 3] = oa * 255;
  }
  rect(x, y, w, h, c){ for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); return this; }
  // draw another picture onto this one at x, y (flip: mirrored left to right)
  blit(src, x, y, {flip = false, alpha = 1} = {}){
    for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++){
      const c = src.get(flip ? src.w - 1 - i : i, j); if (!c[3]) continue;
      this.set(x + i, y + j, alpha < 1 ? [c[0], c[1], c[2], c[3] * alpha] : c);
    }
    return this;
  }
  crop(x, y, w, h){ const o = new Img(w, h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++){ const c = this.get(x + i, y + j); if (c[3]) o.set(i, j, c); } return o; }
  scale(n){ const o = new Img(this.w * n, this.h * n); for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++){ const s = ((y / n | 0) * this.w + (x / n | 0)) * 4, t = (y * o.w + x) * 4; o.d[t] = this.d[s]; o.d[t + 1] = this.d[s + 1]; o.d[t + 2] = this.d[s + 2]; o.d[t + 3] = this.d[s + 3]; } return o; }
  clone(){ const o = new Img(this.w, this.h); o.d.set(this.d); return o; }
}
module.exports = {Img};
