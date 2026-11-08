// A pretend canvas that keeps its pixels, for tests that check the colours the game draws (loadGame({canvas:
// pixelCanvas})): solid fills (a see-through one blended over what's there, as a browser does), clearing, one canvas
// drawn onto another, and reading and writing pixels (getImageData, putImageData), with save, restore, translate and
// rectangular clips (even-odd too). Anything else (paths, text, gradients) draws nothing. Only as exact as the tests
// need: a fill covers the pixels whose middles are inside it.
'use strict';

const COLOURS = new Map();
function rgba(style){   // a colour, as [r, g, b, a] (a from 0 to 1)
  let c = COLOURS.get(style);
  if (c) return c;
  c = [0, 0, 0, 1];
  const s = String(style).trim();
  if (s[0] === '#'){
    const h = s.slice(1), long = h.length >= 6;
    const at = i => long ? parseInt(h.slice(i * 2, i * 2 + 2), 16) : parseInt(h[i] + h[i], 16);
    c = [at(0), at(1), at(2), (long ? h.length === 8 : h.length === 4) ? at(3) / 255 : 1];
  } else {
    const m = /rgba?\(([^)]*)\)/.exec(s);
    if (m){ const p = m[1].split(',').map(Number); c = [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
  }
  COLOURS.set(style, c);
  return c;
}

const NOTHING = new Proxy(function(){}, {get: (t, k) => k === Symbol.toPrimitive ? () => 0 : NOTHING, apply: () => NOTHING});

function pixelCanvas(){
  let width = 300, height = 150, data = new Uint8ClampedArray(width * height * 4);
  let tx = 0, ty = 0, inside = null, path = [], stack = [];   // (where it's drawn from, its clip, the rectangles of the path, and what save() kept)
  const canvas = {
    style: {}, classList: {add(){}, remove(){}, toggle(){}, contains: () => false}, dataset: {},
    get width(){ return width; }, set width(w){ width = Math.max(0, Math.floor(w)); data = new Uint8ClampedArray(width * height * 4); reset(); },
    get height(){ return height; }, set height(h){ height = Math.max(0, Math.floor(h)); data = new Uint8ClampedArray(width * height * 4); reset(); },
    get pixels(){ return data; },
    getContext: () => proxy, toDataURL: () => '', addEventListener(){}, getBoundingClientRect: () => ({left: 0, top: 0, width, height})
  };
  // One pixel (i, its index), a colour of alpha a blended over it.
  const blend = (i, r, g, b, a, out) => {
    if (out){ data[i + 3] = data[i + 3] * (1 - a); return; }
    if (a >= 1 || !data[i + 3]){ data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a * 255; return; }
    const da = data[i + 3] / 255, oa = a + da * (1 - a), k = da * (1 - a);
    data[i] = (r * a + data[i] * k) / oa; data[i + 1] = (g * a + data[i + 1] * k) / oa; data[i + 2] = (b * a + data[i + 2] * k) / oa; data[i + 3] = oa * 255;
  };
  const box = (x, y, w, h) => {   // the pixels a rectangle covers, on the canvas
    if (w < 0){ x += w; w = -w; } if (h < 0){ y += h; h = -h; }
    return [Math.max(0, Math.round(x + tx)), Math.max(0, Math.round(y + ty)), Math.min(width, Math.round(x + w + tx)), Math.min(height, Math.round(y + h + ty))];
  };
  const ctx = {
    canvas, fillStyle: '#000000', strokeStyle: '#000000', globalAlpha: 1, globalCompositeOperation: 'source-over', lineWidth: 1,
    imageSmoothingEnabled: false, font: '10px sans-serif', textAlign: 'start', textBaseline: 'alphabetic', filter: 'none',
    save(){ stack.push({tx, ty, inside, fillStyle: ctx.fillStyle, globalAlpha: ctx.globalAlpha, op: ctx.globalCompositeOperation}); },
    restore(){ const s = stack.pop(); if (s){ ({tx, ty, inside} = s); ctx.fillStyle = s.fillStyle; ctx.globalAlpha = s.globalAlpha; ctx.globalCompositeOperation = s.op; } },
    translate(x, y){ tx += x; ty += y; },
    setTransform(a, b, c, d, e = 0, f = 0){ tx = e; ty = f; },
    resetTransform(){ tx = 0; ty = 0; },
    beginPath(){ path = []; },
    rect(x, y, w, h){ path.push([x + tx, y + ty, w, h]); },
    clip(rule){   // (the rectangles of the path; with 'evenodd', where an odd number of them overlap, such as all but a hole)
      const rects = path, was = inside, odd = rule === 'evenodd';
      const n = (x, y) => rects.reduce((k, [rx, ry, rw, rh]) => k + (x + .5 >= rx && y + .5 >= ry && x + .5 < rx + rw && y + .5 < ry + rh ? 1 : 0), 0);
      inside = odd ? (x, y) => n(x, y) % 2 === 1 && (!was || was(x, y)) : (x, y) => rects.some(([rx, ry, rw, rh]) => x + .5 >= rx && y + .5 >= ry && x + .5 < rx + rw && y + .5 < ry + rh) && (!was || was(x, y));
    },
    fillRect(x, y, w, h){
      const [r, g, b, a] = rgba(ctx.fillStyle), alpha = a * ctx.globalAlpha, out = ctx.globalCompositeOperation === 'destination-out';
      if (alpha <= 0) return;
      const [x0, y0, x1, y1] = box(x, y, w, h);
      for (let py = y0; py < y1; py++) for (let px = x0, i = (py * width + x0) * 4; px < x1; px++, i += 4) if (!inside || inside(px, py)) blend(i, r, g, b, alpha, out);
    },
    clearRect(x, y, w, h){
      const [x0, y0, x1, y1] = box(x, y, w, h);
      for (let py = y0; py < y1; py++) for (let px = x0; px < x1; px++) if (!inside || inside(px, py)) data.fill(0, (py * width + px) * 4, (py * width + px) * 4 + 4);
    },
    getImageData(x, y, w, h){
      const out = new Uint8ClampedArray(w * h * 4), x0 = Math.max(0, x), x1 = Math.min(width, x + w);
      if (x1 > x0) for (let py = Math.max(0, y); py < Math.min(height, y + h); py++) out.set(data.subarray((py * width + x0) * 4, (py * width + x1) * 4), ((py - y) * w + x0 - x) * 4);
      return {width: w, height: h, data: out};
    },
    putImageData(img, x, y){
      const x0 = Math.max(0, x), x1 = Math.min(width, x + img.width);
      if (x1 > x0) for (let py = Math.max(0, y); py < Math.min(height, y + img.height); py++) data.set(img.data.subarray(((py - y) * img.width + x0 - x) * 4, ((py - y) * img.width + x1 - x) * 4), (py * width + x0) * 4);
    },
    createImageData(w, h){ return {width: w, height: h, data: new Uint8ClampedArray(w * h * 4)}; },
    drawImage(src, ...a){   // (src, dx, dy), (src, dx, dy, dw, dh) or (src, sx, sy, sw, sh, dx, dy, dw, dh), nearest pixel
      const from = src && src.pixels; if (!(from instanceof Uint8ClampedArray)) return;
      const SW = src.width, SH = src.height, ga = ctx.globalAlpha, out = ctx.globalCompositeOperation === 'destination-out';
      const [sx, sy, sw, sh, dx, dy, dw, dh] = a.length >= 8 ? a : a.length >= 4 ? [0, 0, SW, SH, a[0], a[1], a[2], a[3]] : [0, 0, SW, SH, a[0], a[1], SW, SH];
      const X = Math.round(dx + tx), Y = Math.round(dy + ty), W = Math.round(dw), H = Math.round(dh);
      for (let py = Math.max(0, -Y); py < Math.min(H, height - Y); py++){
        const fy = Math.floor(sy + (py + .5) * sh / H); if (fy < 0 || fy >= SH) continue;
        for (let px = Math.max(0, -X); px < Math.min(W, width - X); px++){
          const fx = Math.floor(sx + (px + .5) * sw / W); if (fx < 0 || fx >= SW) continue;
          const j = (fy * SW + fx) * 4; if (!from[j + 3] || (inside && !inside(X + px, Y + py))) continue;
          blend(((Y + py) * width + X + px) * 4, from[j], from[j + 1], from[j + 2], from[j + 3] / 255 * ga, out);
        }
      }
    }
  };
  function reset(){ tx = 0; ty = 0; inside = null; path = []; stack = []; Object.assign(ctx, {fillStyle: '#000000', globalAlpha: 1, globalCompositeOperation: 'source-over'}); }
  const proxy = new Proxy(ctx, {get: (t, k) => k in t ? t[k] : typeof k === 'string' ? () => NOTHING : undefined});   // (anything else: draws nothing)
  return canvas;
}

module.exports = {pixelCanvas, rgba};
