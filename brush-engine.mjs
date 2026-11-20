// orange-3d-brushed/brush-source/src/types.ts
var widthOf = (a, b) => ((a.w ?? 1) + (b.w ?? 1)) / 2;
var alphaOf = (a, b) => ((a.o ?? 1) + (b.o ?? 1)) / 2;
var colorOf = (a, strokeColor) => a.c ?? strokeColor;

// orange-3d-brushed/brush-source/src/grain.ts
function hash2(x, y) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) | 0;
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
var noiseGrain = (x, y) => vnoise(x * 0.17, y * 0.17) * 0.55 + vnoise(x * 0.85, y * 0.85) * 0.25 + hash2(x, y) * 0.2;

// orange-3d-brushed/brush-source/src/presets.ts
var avgPressure = (a, b) => (a.pressure + b.pressure) / 2;
var lerp = (a, b, t) => a + (b - a) * t;
function makePencil(opts = {}) {
  const grain = opts.grain ?? noiseGrain;
  const tooth = opts.tooth ?? 0.3;
  const density = opts.density ?? 0.9;
  return {
    id: opts.id ?? "pencil",
    name: opts.name ?? "Pencil",
    start({ ctx, color, size, scale, rng = Math.random }) {
      return (a, b) => {
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
        if (len < 0.3) return;
        const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
        const p = avgPressure(a, b);
        const w = size * scale * (0.4 + 0.8 * p) * widthOf(a, b);
        const dot = 0.9 * scale;
        const n = Math.ceil(len * w / (scale * scale) * density);
        ctx.save();
        ctx.fillStyle = colorOf(a, color);
        ctx.globalAlpha = 0.85 * alphaOf(a, b);
        for (let i = 0; i < n; i++) {
          const s = rng() * len;
          const off = (rng() + rng() - 1) * w * 0.5;
          const x = a.x + ux * s + nx * off, y = a.y + uy * s + ny * off;
          if (grain(x, y) < tooth + 0.55 * p) ctx.fillRect(x, y, dot, dot);
        }
        ctx.restore();
      };
    }
  };
}
function makeCrayon(opts = {}) {
  const grain = opts.grain ?? noiseGrain;
  const count = opts.bristles ?? 8;
  return {
    id: opts.id ?? "crayon",
    name: opts.name ?? "Crayon",
    start({ ctx, color, size, scale, rng = Math.random }) {
      const bristles = Array.from({ length: count }, () => ({ o: rng() - 0.5, j: rng() }));
      return (a, b) => {
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
        if (len < 0.3) return;
        const nx = -dy / len, ny = dx / len;
        const p = avgPressure(a, b);
        const w = size * scale * (0.45 + 0.8 * p) * widthOf(a, b);
        ctx.save();
        ctx.strokeStyle = colorOf(a, color);
        ctx.lineWidth = scale;
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.9 * alphaOf(a, b);
        ctx.beginPath();
        for (const br of bristles) {
          const off = br.o * w;
          const mx = (a.x + b.x) / 2 + nx * off, my = (a.y + b.y) / 2 + ny * off;
          if (grain(mx, my) < 0.3 + 0.5 * p + br.j * 0.1) {
            ctx.moveTo(a.x + nx * off, a.y + ny * off);
            ctx.lineTo(b.x + nx * off, b.y + ny * off);
          }
        }
        ctx.stroke();
        ctx.restore();
      };
    }
  };
}
function makeWaxCrayon(opts = {}) {
  const grain = opts.grain ?? noiseGrain;
  const wax = opts.wax ?? 0.6;
  return {
    id: opts.id ?? "crayon",
    name: opts.name ?? "Crayon",
    start({ ctx, color, size, scale, rng = Math.random }) {
      return (a, b) => {
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
        if (len < 0.3) return;
        const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
        const p = avgPressure(a, b);
        const w = size * scale * (0.55 + 0.6 * p) * widthOf(a, b);
        const thick = 1.2 * scale, flake = 1.1 * scale;
        const n = Math.ceil(len * w / (thick * flake * 2) * 4);
        const fill = 0.3 + 0.3 * wax + 0.2 * p;
        ctx.save();
        ctx.strokeStyle = colorOf(a, color);
        ctx.globalAlpha = 0.9 * alphaOf(a, b);
        ctx.lineWidth = thick;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const s = rng() * len;
          const e = rng() * 2 - 1;
          const x = a.x + ux * s + nx * e * w * 0.5, y = a.y + uy * s + ny * e * w * 0.5;
          const edge = Math.abs(e) > 0.65 ? (Math.abs(e) - 0.65) * 1.4 : 0;
          if (grain(x, y) > fill - edge) continue;
          const h = flake * (0.4 + rng() * 0.6);
          ctx.moveTo(x - ux * h, y - uy * h);
          ctx.lineTo(x + ux * h, y + uy * h);
        }
        ctx.stroke();
        ctx.restore();
      };
    }
  };
}
function tint(src, color) {
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = color;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}
function makeStamp(o) {
  const spacing = o.spacing ?? 0.25;
  const rotJ = o.rotationJitter ?? 0.3;
  const sizeJ = o.sizeJitter ?? 0.2;
  const opacity = o.opacity ?? 0.6;
  const follow = o.followDirection ?? true;
  const grain = o.grain, grainAmount = grain ? o.grainAmount ?? 0 : 0;
  const aspect = o.shape.height / o.shape.width;
  const cache = /* @__PURE__ */ new Map();
  const tinted = (color) => {
    let c = cache.get(color);
    if (!c) {
      c = tint(o.shape, color);
      cache.set(color, c);
      if (cache.size > 64) cache.delete(cache.keys().next().value);
    }
    return c;
  };
  const drawDab = (g, d, ox = 0, oy = 0) => {
    g.globalAlpha = d.alpha;
    g.setTransform(1, 0, 0, 1, d.x - ox, d.y - oy);
    g.rotate(d.rot);
    g.drawImage(d.img, -d.w / 2, -d.w * aspect / 2, d.w, d.w * aspect);
  };
  return {
    id: o.id,
    name: o.name,
    start({ ctx, color, size, scale, rng = Math.random }) {
      let carry = 0;
      let layer = null;
      return (a, b) => {
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
        if (len < 0.1) return;
        const step = Math.max(1, size * scale * spacing);
        const dir = Math.atan2(dy, dx);
        const dabs = [];
        let s = step - carry;
        while (s <= len) {
          const t = s / len;
          const p = a.pressure + (b.pressure - a.pressure) * t;
          const k = lerp(a.w ?? 1, b.w ?? 1, t), flow = lerp(a.o ?? 1, b.o ?? 1, t);
          const w = size * scale * (0.5 + 0.7 * p) * k * (1 + (rng() - 0.5) * 2 * sizeJ);
          const alpha = opacity * (0.4 + 0.6 * p) * flow;
          const rot = (follow ? dir : 0) + (rng() - 0.5) * 2 * rotJ;
          dabs.push({ x: a.x + dx * t, y: a.y + dy * t, rot, w, alpha, img: tinted(t < 0.5 ? colorOf(a, color) : colorOf(b, color)) });
          s += step;
        }
        carry = len - (s - step);
        if (!dabs.length) return;
        ctx.save();
        if (!grainAmount) {
          for (const d of dabs) drawDab(ctx, d);
          ctx.restore();
          return;
        }
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const d of dabs) {
          const r = d.w / 2 * Math.hypot(1, aspect) + 1;
          x0 = Math.min(x0, d.x - r);
          y0 = Math.min(y0, d.y - r);
          x1 = Math.max(x1, d.x + r);
          y1 = Math.max(y1, d.y + r);
        }
        const bx = Math.floor(x0), by = Math.floor(y0), bw = Math.ceil(x1) - bx, bh = Math.ceil(y1) - by;
        if (!layer) layer = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
        const lc = layer.canvas;
        if (lc.width < bw || lc.height < bh) {
          lc.width = Math.max(lc.width, bw);
          lc.height = Math.max(lc.height, bh);
        }
        layer.setTransform(1, 0, 0, 1, 0, 0);
        layer.globalAlpha = 1;
        layer.clearRect(0, 0, bw, bh);
        for (const d of dabs) drawDab(layer, d, bx, by);
        const img = layer.getImageData(0, 0, bw, bh), px = img.data;
        for (let y = 0; y < bh; y++)
          for (let x = 0; x < bw; x++) {
            const i = (y * bw + x) * 4 + 3;
            if (px[i]) px[i] = Math.round(px[i] * Math.max(0, 1 - grainAmount * grain(bx + x, by + y)));
          }
        layer.putImageData(img, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.drawImage(lc, 0, 0, bw, bh, bx, by, bw, bh);
        ctx.restore();
      };
    }
  };
}

// orange-3d-brushed/brush-source/src/textures.ts
var avgP = (a, b) => (a.pressure + b.pressure) / 2;
var lerp2 = (a, b, t) => a + (b - a) * t;
function seg(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
  return { dx, dy, len, nx: len ? -dy / len : 0, ny: len ? dx / len : 0 };
}
function makeDryBrush(o = {}) {
  const grain = o.grain ?? noiseGrain;
  const n = o.bristles ?? 10;
  const reach = o.reach ?? 30;
  return {
    id: o.id ?? "dry-brush",
    name: o.name ?? "Dry brush",
    start({ ctx, color, size, scale, rng = Math.random }) {
      const br = Array.from({ length: n }, () => ({ o: rng() - 0.5, j: rng() }));
      let traveled = 0;
      return (a, b) => {
        const { len, nx, ny } = seg(a, b);
        if (len < 0.3) return;
        traveled += len;
        const p = avgP(a, b);
        const taper = Math.min(1, traveled / (size * scale * 1.2));
        const w = size * scale * (0.4 + 0.8 * p) * taper * widthOf(a, b);
        const thr = 0.8 - traveled / (size * scale * reach) + 0.25 * p;
        ctx.save();
        ctx.strokeStyle = colorOf(a, color);
        ctx.globalAlpha = 0.9 * alphaOf(a, b);
        ctx.lineCap = "butt";
        ctx.lineWidth = Math.max(0.8 * scale, w / n * 1.2);
        ctx.beginPath();
        for (const k of br) {
          const off = k.o * w;
          const mx = (a.x + b.x) / 2 + nx * off, my = (a.y + b.y) / 2 + ny * off;
          if (grain(mx, my) > thr + (k.j - 0.5) * 0.3) continue;
          ctx.moveTo(a.x + nx * off, a.y + ny * off);
          ctx.lineTo(b.x + nx * off, b.y + ny * off);
        }
        ctx.stroke();
        ctx.restore();
      };
    }
  };
}
function makeLino(o = {}) {
  const grain = o.grain ?? noiseGrain;
  const rough = o.roughness ?? 0.45;
  return {
    id: o.id ?? "lino",
    name: o.name ?? "Lino ink",
    start({ ctx, color, size, scale }) {
      let carry = 0;
      return (a, b) => {
        const { dx, dy, len } = seg(a, b);
        if (len < 0.1) return;
        const p = avgP(a, b), w = size * scale * (0.5 + 0.7 * p) * widthOf(a, b);
        const step = Math.max(scale, w * 0.2);
        ctx.save();
        ctx.globalAlpha = alphaOf(a, b);
        ctx.fillStyle = colorOf(a, color);
        ctx.beginPath();
        let s = step - carry;
        while (s <= len) {
          const x = a.x + dx * s / len, y = a.y + dy * s / len;
          const r = w / 2 * (1 - rough / 2 + grain(x * 0.6, y * 0.6) * rough);
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
          s += step;
        }
        carry = len - (s - step);
        ctx.fill();
        ctx.restore();
      };
    }
  };
}
function makeSpeckle(o = {}) {
  const density = o.density ?? 1;
  return {
    id: o.id ?? "speckle",
    name: o.name ?? "Speckle",
    start({ ctx, color, size, scale, rng = Math.random }) {
      return (a, b) => {
        const { dx, dy, len, nx, ny } = seg(a, b);
        if (len < 0.1) return;
        const p = avgP(a, b), w = size * scale * (0.8 + 0.6 * p) * widthOf(a, b);
        const expected = len * w / (scale * scale) * 0.012 * density;
        const count = Math.floor(expected) + (rng() < expected % 1 ? 1 : 0);
        ctx.save();
        ctx.globalAlpha = alphaOf(a, b);
        ctx.fillStyle = colorOf(a, color);
        for (let i = 0; i < count; i++) {
          const s = rng(), off = (rng() - 0.5) * w;
          const cx = a.x + dx * s + nx * off, cy = a.y + dy * s + ny * off;
          const r = scale * (0.6 + rng() * 1.6), sides = 4 + (rng() * 3 | 0), rot = rng() * 6;
          ctx.beginPath();
          for (let v = 0; v < sides; v++) {
            const ang = rot + v / sides * Math.PI * 2, rr = r * (0.6 + rng() * 0.6);
            if (v) ctx.lineTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
            else ctx.moveTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
          }
          ctx.fill();
        }
        ctx.restore();
      };
    }
  };
}
function makePattern(o) {
  const spacing = o.spacing ?? 1.6, scatter = o.scatter ?? 0.5, variety = o.variety ?? 0, turn = o.turn ?? 1;
  return {
    id: o.id ?? `pattern-${o.shape}`,
    name: o.name ?? { star: "Stars", dot: "Dots" }[o.shape],
    start({ ctx, color, size, scale, rng = Math.random }) {
      let carry = 0;
      return (a, b) => {
        const { dx, dy, len, nx, ny } = seg(a, b);
        if (len < 0.1) return;
        const step = size * scale * spacing;
        ctx.save();
        ctx.globalAlpha = alphaOf(a, b);
        ctx.fillStyle = colorOf(a, color);
        ctx.strokeStyle = colorOf(a, color);
        ctx.lineCap = "round";
        let s = step - carry;
        while (s <= len) {
          const t = s / len, pr = a.pressure + (b.pressure - a.pressure) * t;
          const off = (rng() - 0.5) * 2 * size * scale * scatter;
          const x = a.x + dx * t + nx * off, y = a.y + dy * t + ny * off;
          const u = rng();
          const vary = lerp2(0.7 + u * 0.6, 0.3 + u * u * 1.5, variety);
          const r = size * scale * 0.5 * vary * (0.6 + 0.6 * pr) * lerp2(a.w ?? 1, b.w ?? 1, t);
          const v = rng();
          const rot = turn >= 1 ? v * Math.PI * 2 : -Math.PI / 2 + (v - 0.5) * Math.PI * turn;
          ctx.beginPath();
          if (o.shape === "star") {
            for (let v2 = 0; v2 < 10; v2++) {
              const ang = rot + v2 / 10 * Math.PI * 2, rr = (v2 % 2 ? r * 0.42 : r) * (0.85 + rng() * 0.3);
              if (v2) ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
              else ctx.moveTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
            }
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.ellipse(x, y, r * 0.45, r * (0.35 + rng() * 0.12), rot, 0, Math.PI * 2);
            ctx.fill();
          }
          s += step;
        }
        carry = len - (s - step);
        ctx.restore();
      };
    }
  };
}
function makeGraphite(o = {}) {
  const grain = o.grain ?? noiseGrain;
  return {
    id: o.id ?? "graphite",
    name: o.name ?? "Graphite",
    start({ ctx, color, size, scale, rng = Math.random }) {
      return (a, b) => {
        const { dx, dy, len, nx, ny } = seg(a, b);
        if (len < 0.2) return;
        const p = avgP(a, b), w = (0.8 + size * 0.28) * scale * (0.75 + 0.5 * p) * widthOf(a, b), d = 0.9 * scale;
        const count = Math.ceil(len * w / (scale * scale) * 1.4);
        ctx.save();
        ctx.fillStyle = colorOf(a, color);
        ctx.globalAlpha = 0.9 * alphaOf(a, b);
        for (let i = 0; i < count; i++) {
          const s = rng(), off = (rng() + rng() - 1) * w * 0.5;
          const x = a.x + dx * s + nx * off, y = a.y + dy * s + ny * off;
          if (grain(x, y) < 0.45 + 0.35 * p) ctx.fillRect(x, y, d, d);
        }
        ctx.restore();
      };
    }
  };
}

// orange-3d-brushed/brush-source/src/pens.ts
function makePen(o = {}) {
  const style = o.style ?? "fineliner";
  const nib = (o.nibAngle ?? 40) % 180 * Math.PI / 180;
  return {
    id: "pen",
    name: "Pen",
    start({ ctx, color, size, scale, rng = Math.random }) {
      const lane = rng() * 1e3;
      let travelled = 0;
      return (a, b) => {
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
        if (len < 0.05) return;
        travelled += len;
        const c = colorOf(a, color), k = widthOf(a, b), alpha = alphaOf(a, b);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = c;
        ctx.strokeStyle = c;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (style === "highlighter") {
          const half = size * scale * k / 2, depth = size * scale * 0.3 * k / 2;
          const vx = Math.cos(nib) * half, vy = Math.sin(nib) * half;
          const ex = -Math.sin(nib) * depth, ey = Math.cos(nib) * depth;
          const corners = [
            [vx + ex, vy + ey],
            [vx - ex, vy - ey],
            [-vx - ex, -vy - ey],
            [-vx + ex, -vy + ey]
          ];
          for (const p of [a, b]) {
            ctx.beginPath();
            corners.forEach(([cx, cy], i) => i ? ctx.lineTo(p.x + cx, p.y + cy) : ctx.moveTo(p.x + cx, p.y + cy));
            ctx.closePath();
            ctx.fill();
          }
          for (let i = 0; i < 4; i++) {
            const [c1x, c1y] = corners[i], [c2x, c2y] = corners[(i + 1) % 4];
            ctx.beginPath();
            ctx.moveTo(a.x + c1x, a.y + c1y);
            ctx.lineTo(a.x + c2x, a.y + c2y);
            ctx.lineTo(b.x + c2x, b.y + c2y);
            ctx.lineTo(b.x + c1x, b.y + c1y);
            ctx.closePath();
            ctx.fill();
          }
        } else if (style === "nib") {
          const half = size * scale * 0.75 * k / 2, vx = Math.cos(nib) * half, vy = Math.sin(nib) * half;
          const thin = Math.max(0.6 * scale, size * scale * 0.08);
          ctx.beginPath();
          ctx.moveTo(a.x + vx, a.y + vy);
          ctx.lineTo(b.x + vx, b.y + vy);
          ctx.lineTo(b.x - vx, b.y - vy);
          ctx.lineTo(a.x - vx, a.y - vy);
          ctx.closePath();
          ctx.fill();
          ctx.lineWidth = thin;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        } else {
          let w;
          if (style === "ballpoint") w = Math.max(0.9 * scale, size * scale * 0.22 * k);
          else if (style === "marker") w = size * scale * 0.95 * k;
          else w = size * scale * 0.5 * k;
          if (style === "ballpoint") {
            const ink = vnoise(travelled / (scale * 22), lane);
            if (ink < 0.16) {
              ctx.restore();
              return;
            }
            w *= 0.75 + 0.25 * Math.min(1, ink * 1.6);
          }
          ctx.lineWidth = Math.max(0.5, w);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        ctx.restore();
      };
    }
  };
}

// orange-3d-brushed/brush-source/src/util/color.ts
var clamp01 = (v) => Math.min(1, Math.max(0, v));
var hex2 = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
var rgbToHex = (r, g, b) => `#${hex2(r)}${hex2(g)}${hex2(b)}`;
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function hexToHsv(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = (g - b) / d % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}
function hsvToHex({ h, s, v }) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return rgbToHex(f(5), f(3), f(1));
}
function shiftColor(hex, dh, ds, dv) {
  const c = hexToHsv(hex);
  return hsvToHex({ h: (c.h + dh + 360) % 360, s: clamp01(c.s + ds), v: clamp01(c.v + dv) });
}

// orange-3d-brushed/brush-source/src/media.ts
var avgP2 = (a, b) => (a.pressure + b.pressure) / 2;
function seg2(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
  return { dx, dy, len, nx: len ? -dy / len : 0, ny: len ? dx / len : 0 };
}
var rgba = (hex, alpha) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
};
function stepper(step) {
  let carry = 0;
  return (a, b, f) => {
    const { dx, dy, len } = seg2(a, b);
    const st = step();
    let s = st - carry;
    while (s <= len) {
      const t = len ? s / len : 0;
      f(a.x + dx * t, a.y + dy * t, t);
      s += st;
    }
    carry = len - (s - st);
  };
}
function makeOil(o = {}) {
  const grain = o.grain ?? noiseGrain;
  const n = o.bristles ?? 18, load = o.load ?? 80;
  return {
    id: o.id ?? "oil",
    name: o.name ?? "Oil paint",
    start({ ctx, color, size, scale, rng = Math.random }) {
      const br = Array.from({ length: n }, (_, i) => ({
        o: (i + rng()) / n - 0.5,
        dv: (rng() - 0.5) * 0.6,
        ds: (rng() - 0.5) * 0.25,
        w: 0.5 + rng()
      }));
      let traveled = 0;
      return (a, b) => {
        const { len, nx, ny } = seg2(a, b);
        if (len < 0.3) return;
        traveled += len;
        const p = avgP2(a, b), op = alphaOf(a, b), c = colorOf(a, color);
        const w = size * scale * (0.5 + 0.7 * p) * widthOf(a, b);
        const left = Math.max(0, 1 - Math.max(0, traveled / (size * scale) - load) / (load * 0.5));
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        ctx.save();
        ctx.lineCap = "butt";
        if (left > 0.6 || grain(mx, my) < left + 0.3) {
          ctx.strokeStyle = c;
          ctx.fillStyle = c;
          ctx.globalAlpha = op;
          const bw = w * (0.6 + 0.3 * left);
          if (traveled === len) {
            ctx.beginPath();
            ctx.arc(a.x, a.y, bw / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.lineWidth = bw;
          ctx.beginPath();
          const ex = (b.x - a.x) / len * scale * 2, ey = (b.y - a.y) / len * scale * 2;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x + ex, b.y + ey);
          ctx.stroke();
        }
        ctx.lineCap = "butt";
        for (const k of br) {
          const off = k.o * w * 0.85;
          if (grain(mx + nx * off, my + ny * off) > 0.3 + 0.7 * left) continue;
          ctx.strokeStyle = shiftColor(c, 0, k.ds, k.dv);
          ctx.globalAlpha = 0.7 * op;
          ctx.lineWidth = Math.max(0.7 * scale, w / n * 0.6 * k.w);
          ctx.beginPath();
          ctx.moveTo(a.x + nx * off, a.y + ny * off);
          ctx.lineTo(b.x + nx * off, b.y + ny * off);
          ctx.stroke();
        }
        ctx.restore();
      };
    }
  };
}
function makeAirbrush(o = {}) {
  const soft = o.softness ?? 0.7, spatter = o.spatter ?? 0.3, spread = o.width ?? 1, sprinkles = o.sprinkles ?? 0;
  return {
    id: o.id ?? "airbrush",
    name: o.name ?? "Airbrush",
    start({ ctx, color, size, scale, rng = Math.random }) {
      let r = size * scale;
      const along = stepper(() => Math.max(scale, r * 0.15));
      return (a, b) => {
        const { len } = seg2(a, b);
        if (len < 0.1) return;
        const p = avgP2(a, b), op = alphaOf(a, b), c = colorOf(a, color);
        r = size * scale * 0.75 * spread * widthOf(a, b);
        ctx.save();
        along(a, b, (x, y) => {
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, rgba(c, (0.05 + 0.1 * p) * op));
          g.addColorStop(Math.max(0.01, 1 - soft), rgba(c, (0.05 + 0.1 * p) * op * 0.8));
          g.addColorStop(1, rgba(c, 0));
          ctx.fillStyle = g;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
          const drops = Math.round(spatter * 4 * rng() * (r / (scale * 10)));
          ctx.fillStyle = c;
          ctx.globalAlpha = 0.6 * op;
          for (let i = 0; i < drops; i++) {
            const ang = rng() * Math.PI * 2, dist = r * Math.sqrt(rng()) * 1.1;
            const s = scale * (0.5 + rng() * 1.2);
            ctx.fillRect(x + Math.cos(ang) * dist, y + Math.sin(ang) * dist, s, s);
          }
          if (sprinkles > 0 && rng() < sprinkles * 0.5) {
            const ang = rng() * Math.PI * 2, dist = r * (0.3 + rng() * 1.2);
            const dr = Math.max(0.8 * scale, Math.min(r * 0.05, scale * 3.5) * (0.4 + rng() * rng() * 1.2));
            ctx.globalAlpha = (0.55 + 0.4 * rng()) * op;
            ctx.beginPath();
            ctx.arc(x + Math.cos(ang) * dist, y + Math.sin(ang) * dist, dr, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        });
        ctx.restore();
      };
    }
  };
}
function makeCharcoal(o = {}) {
  const grain = o.grain ?? noiseGrain;
  const grit = o.grit ?? 0.5, smudge = o.smudge ?? 0.4;
  return {
    id: o.id ?? "charcoal",
    name: o.name ?? "Charcoal",
    start({ ctx, color, size, scale, rng = Math.random }) {
      let w = size * scale;
      const along = stepper(() => Math.max(scale, w * 0.3));
      return (a, b) => {
        const { dx, dy, len, nx, ny } = seg2(a, b);
        if (len < 0.2) return;
        const p = avgP2(a, b), op = alphaOf(a, b), c = colorOf(a, color);
        w = size * scale * (0.5 + 0.7 * p) * widthOf(a, b);
        ctx.save();
        if (smudge > 0) {
          along(a, b, (x, y) => {
            const r = w * 0.65;
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, rgba(c, 0.07 * smudge * op));
            g.addColorStop(1, rgba(c, 0));
            ctx.fillStyle = g;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
          });
        }
        ctx.fillStyle = c;
        ctx.globalAlpha = 0.85 * op;
        const count = Math.ceil(len * w / (scale * scale) * 0.7);
        for (let i = 0; i < count; i++) {
          const s = rng(), off = (rng() + rng() - 1) * w * 0.55;
          const x = a.x + dx * s + nx * off, y = a.y + dy * s + ny * off;
          const g = grain(x * 0.6, y * 0.6) * 0.6 + grain(x, y) * 0.4;
          if (g > 0.3 + 0.45 * p) continue;
          const d = scale * (0.8 + rng() * (0.6 + 2.2 * grit));
          ctx.fillRect(x, y, d, d * (0.5 + rng() * 0.8));
        }
        ctx.restore();
      };
    }
  };
}
function makeChalk(o = {}) {
  const grain = o.grain ?? noiseGrain;
  const cover = o.coverage ?? 0.55;
  return {
    id: o.id ?? "chalk",
    name: o.name ?? "Chalk pastel",
    start({ ctx, color, size, scale, rng = Math.random }) {
      return (a, b) => {
        const { dx, dy, len, nx, ny } = seg2(a, b);
        if (len < 0.2) return;
        const p = avgP2(a, b), op = alphaOf(a, b);
        const w = size * scale * (0.6 + 0.6 * p) * widthOf(a, b);
        ctx.save();
        ctx.fillStyle = colorOf(a, color);
        ctx.globalAlpha = 0.95 * op;
        const d = 1.3 * scale;
        const count = Math.ceil(len * w / (scale * scale) * 0.8);
        for (let i = 0; i < count; i++) {
          const s = rng(), off = (rng() - 0.5) * w * (0.9 + 0.2 * rng());
          const x = a.x + dx * s + nx * off, y = a.y + dy * s + ny * off;
          const g = grain(x * 0.4, y * 0.4) * 0.65 + grain(x, y) * 0.35;
          if (g < cover * 0.8 + 0.25 * p) ctx.fillRect(x, y, d, d);
        }
        ctx.restore();
      };
    }
  };
}
function makeColouredPencil(o = {}) {
  const grain = o.grain ?? noiseGrain;
  const density = o.density ?? 1, hatch = o.hatch ?? false;
  const HATCH = { x: Math.cos(-Math.PI / 4), y: Math.sin(-Math.PI / 4) };
  return {
    id: o.id ?? "coloured-pencil",
    name: o.name ?? "Coloured pencil",
    start({ ctx, color, size, scale, rng = Math.random }) {
      return (a, b) => {
        const { dx, dy, len, nx, ny } = seg2(a, b);
        if (len < 0.2) return;
        const p = avgP2(a, b), op = alphaOf(a, b), c = colorOf(a, color);
        const w = size * scale * (0.4 + 0.6 * p) * widthOf(a, b);
        const ux = hatch ? HATCH.x : dx / len, uy = hatch ? HATCH.y : dy / len;
        const shades = [c, shiftColor(c, 0, 0.05, -0.08), shiftColor(c, 0, -0.05, 0.06)];
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineWidth = 0.8 * scale;
        ctx.globalAlpha = 0.45 * op;
        const count = Math.ceil(len * w / (scale * scale) * 0.35 * density);
        const paths = shades.map(() => new Path2D());
        for (let i = 0; i < count; i++) {
          const s = rng(), off = (rng() + rng() - 1) * w * 0.5;
          const x = a.x + dx * s + nx * off, y = a.y + dy * s + ny * off;
          const l = scale * (2 + rng() * 5), k = rng() * 3 | 0;
          if (grain(x, y) > 0.4 + 0.45 * p) continue;
          paths[k].moveTo(x - ux * l * 0.5, y - uy * l * 0.5);
          paths[k].lineTo(x + ux * l * 0.5, y + uy * l * 0.5);
        }
        paths.forEach((path, k) => {
          ctx.strokeStyle = shades[k];
          ctx.stroke(path);
        });
        ctx.restore();
      };
    }
  };
}

// orange-3d-brushed/brush-source/src/engines.ts
var num = (key, label, min, max, step, def) => ({
  key,
  label,
  kind: "number",
  min,
  max,
  step,
  default: def
});
var engineList = [
  {
    id: "pencil",
    label: "Pencil",
    usesGrain: true,
    params: [num("tooth", "Paper tooth", 0, 1, 0.01, 0.3), num("density", "Density", 0.1, 3, 0.05, 0.9)],
    make: (p, m) => makePencil({ grain: m.grain, tooth: p.tooth, density: p.density })
  },
  {
    id: "wax",
    label: "Crayon",
    usesGrain: true,
    params: [num("wax", "Wax", 0, 1, 0.01, 0.6)],
    make: (p, m) => makeWaxCrayon({ grain: m.grain, wax: p.wax })
  },
  {
    // The first crayon (parallel lines); kept so drawings made with it redraw the same.
    id: "crayon",
    label: "Crayon lines",
    usesGrain: true,
    params: [num("bristles", "Bristles", 2, 30, 1, 8)],
    make: (p, m) => makeCrayon({ grain: m.grain, bristles: p.bristles })
  },
  {
    id: "dry-brush",
    label: "Dry brush",
    usesGrain: true,
    params: [num("bristles", "Bristles", 3, 30, 1, 10), num("reach", "Runs dry after", 5, 100, 1, 30)],
    make: (p, m) => makeDryBrush({ grain: m.grain, bristles: p.bristles, reach: p.reach })
  },
  {
    id: "lino",
    label: "Lino ink",
    usesGrain: true,
    params: [num("roughness", "Rough edges", 0, 1, 0.01, 0.45)],
    make: (p, m) => makeLino({ grain: m.grain, roughness: p.roughness })
  },
  {
    id: "pen",
    label: "Pen",
    usesGrain: false,
    params: [
      { key: "style", label: "Pen", kind: "choice", options: ["fineliner", "nib", "ballpoint", "marker", "highlighter"], default: "fineliner" },
      num("nibAngle", "Nib angle", 0, 180, 1, 40)
    ],
    make: (p) => makePen({ style: p.style, nibAngle: p.nibAngle })
  },
  {
    id: "speckle",
    label: "Speckle",
    usesGrain: false,
    params: [num("density", "Density", 0.1, 4, 0.05, 1)],
    make: (p) => makeSpeckle({ density: p.density })
  },
  {
    id: "pattern",
    label: "Pattern",
    usesGrain: false,
    params: [
      { key: "shape", label: "Shape", kind: "choice", options: ["star", "dot"], default: "star" },
      num("spacing", "Spacing", 0.3, 4, 0.05, 1.6),
      num("scatter", "Scatter", 0, 2, 0.05, 0.5),
      num("variety", "Size variety", 0, 1, 0.01, 0),
      num("turn", "Turn", 0, 1, 0.01, 1)
    ],
    make: (p) => makePattern({
      shape: p.shape,
      spacing: p.spacing,
      scatter: p.scatter,
      variety: p.variety,
      turn: p.turn
    })
  },
  { id: "graphite", label: "Graphite", usesGrain: true, params: [], make: (_, m) => makeGraphite({ grain: m.grain }) },
  {
    // Not in the brush list any more; kept so drawings made with it (and the Himalaya example) redraw.
    id: "oil",
    label: "Oil paint",
    usesGrain: true,
    params: [num("bristles", "Bristles", 4, 40, 1, 18), num("load", "Runs dry after", 5, 200, 1, 80)],
    make: (p, m) => makeOil({ grain: m.grain, bristles: p.bristles, load: p.load })
  },
  {
    id: "airbrush",
    label: "Airbrush",
    usesGrain: false,
    params: [
      num("softness", "Softness", 0, 1, 0.01, 0.7),
      num("spatter", "Spatter", 0, 1, 0.01, 0.3),
      num("width", "Spray width", 0.5, 3, 0.05, 1),
      num("sprinkles", "Sprinkles", 0, 1, 0.01, 0)
    ],
    make: (p) => makeAirbrush({
      softness: p.softness,
      spatter: p.spatter,
      width: p.width,
      sprinkles: p.sprinkles
    })
  },
  {
    id: "charcoal",
    label: "Charcoal",
    usesGrain: true,
    params: [num("grit", "Grit", 0, 1, 0.01, 0.5), num("smudge", "Smudge", 0, 1, 0.01, 0.4)],
    make: (p, m) => makeCharcoal({ grain: m.grain, grit: p.grit, smudge: p.smudge })
  },
  {
    id: "chalk",
    label: "Chalk pastel",
    usesGrain: true,
    params: [num("coverage", "Coverage", 0.1, 1, 0.01, 0.55)],
    make: (p, m) => makeChalk({ grain: m.grain, coverage: p.coverage })
  },
  {
    id: "coloured-pencil",
    label: "Coloured pencil",
    usesGrain: true,
    params: [num("density", "Density", 0.2, 3, 0.05, 1), { key: "hatch", label: "Hatch at an angle", kind: "boolean", default: false }],
    make: (p, m) => makeColouredPencil({ grain: m.grain, density: p.density, hatch: p.hatch })
  },
  {
    id: "stamp",
    label: "Stamp",
    usesGrain: true,
    usesTip: true,
    params: [
      num("spacing", "Spacing", 0.05, 2, 0.01, 0.25),
      num("rotationJitter", "Rotation jitter", 0, 3.14, 0.01, 0.3),
      num("sizeJitter", "Size jitter", 0, 1, 0.01, 0.2),
      { key: "followDirection", label: "Follow direction", kind: "boolean", default: true },
      num("grainAmount", "Paper grain", 0, 1, 0.01, 0),
      num("ink", "Ink", 0.1, 1, 0.01, 0.6)
    ],
    make: (p, m) => makeStamp({
      opacity: p.ink,
      grain: m.grain,
      grainAmount: p.grainAmount,
      id: "stamp",
      name: "Stamp",
      shape: m.tip,
      spacing: p.spacing,
      rotationJitter: p.rotationJitter,
      sizeJitter: p.sizeJitter,
      followDirection: p.followDirection
    })
  }
];
var ENGINES = Object.fromEntries(engineList.map((e) => [e.id, e]));
var defaultParams = (engine) => Object.fromEntries(engine.params.map((p) => [p.key, p.default]));

// orange-3d-brushed/brush-source/src/def.ts
var DEFAULT_DYNAMICS = {
  taper: { in: 0, out: 0, min: 0.15 },
  jitter: { size: 0, scatter: 0, opacity: 0 },
  colorJitter: { hue: 0, sat: 0, value: 0 },
  pressure: 0
};
function makeDef(o) {
  const engine = ENGINES[o.engine];
  if (!engine) throw new Error(`Unknown brush engine: ${o.engine}`);
  const d = o.dynamics;
  return {
    id: o.id,
    name: o.name,
    engine: o.engine,
    params: { ...defaultParams(engine), ...o.params },
    ...engine.usesGrain ? { grain: { scale: 1, ...o.grain } } : {},
    ...o.tip ? { tip: o.tip } : {},
    ...o.bold ? { bold: o.bold } : {},
    blend: o.blend === "multiply" ? "multiply" : "normal",
    opacity: o.opacity ?? 1,
    flow: o.flow ?? 1,
    dynamics: {
      taper: { ...DEFAULT_DYNAMICS.taper, ...d?.taper },
      jitter: { ...DEFAULT_DYNAMICS.jitter, ...d?.jitter },
      colorJitter: { ...DEFAULT_DYNAMICS.colorJitter, ...d?.colorJitter },
      pressure: d?.pressure ?? DEFAULT_DYNAMICS.pressure
    }
  };
}
var TIPS = { base: "/tips/" };
var spin = (spacing, sizeJitter = 0.3) => ({ spacing, rotationJitter: 3.14, sizeJitter, followDirection: false, ink: 1 });
var FIGMA_STAMPS = [
  ["dot-cloud", "Dot cloud", spin(0.45), 0.2],
  ["ink-blobs", "Ink blobs", spin(0.6), 0.3],
  ["daisy", "Daisy", spin(0.9), 0.15],
  ["ring-flower", "Ring flower", spin(1), 0.1],
  ["leaf-star", "Leaf star", spin(0.45), 0.3],
  ["grass", "Grass", { spacing: 0.35, rotationJitter: 0.15, sizeJitter: 0.3, followDirection: false, ink: 1 }, 0.1],
  ["soft-bloom", "Soft bloom", spin(0.5), 0.2],
  // The same speckled look, as other shapes (hearts and butterflies only tilt, so they stay upright).
  ["soft-hibiscus", "Soft hibiscus", spin(0.6), 0.2],
  ["soft-heart", "Soft heart", { ...spin(0.6), rotationJitter: 0.35 }, 0.2],
  ["soft-blossom", "Soft blossom", spin(0.6), 0.2],
  ["soft-sparkle", "Soft sparkle", spin(0.7), 0.2],
  ["soft-butterfly", "Soft butterfly", { ...spin(0.8), rotationJitter: 0.5 }, 0.2],
  ["sprigs", "Sprigs", spin(0.4), 0.3],
  ["smudge-star", "Smudge star", spin(0.6), 0.2]
];
var builtInBrushes = () => [
  makeDef({ id: "pencil", name: "Pencil", engine: "pencil" }),
  makeDef({ id: "crayon", name: "Crayon", engine: "wax" }),
  makeDef({ id: "dry-brush", name: "Dry brush", engine: "dry-brush" }),
  makeDef({ id: "lino", name: "Lino ink", engine: "lino" }),
  // Pens: clean ink, like writing
  makeDef({ id: "fineliner", name: "Fineliner", engine: "pen", params: { style: "fineliner" } }),
  makeDef({ id: "nib", name: "Calligraphy nib", engine: "pen", params: { style: "nib", nibAngle: 40 } }),
  makeDef({ id: "ballpoint", name: "Ballpoint", engine: "pen", params: { style: "ballpoint" } }),
  // Thin at both ends, thick in the middle (the taper settings; the end tapers in when you lift).
  makeDef({
    id: "tapered-ink",
    name: "Tapered ink",
    engine: "pen",
    params: { style: "fineliner" },
    dynamics: { taper: { in: 30, out: 30, min: 0.08 }, jitter: { size: 0, scatter: 0, opacity: 0 }, colorJitter: { hue: 0, sat: 0, value: 0 }, pressure: 0.5 }
  }),
  makeDef({ id: "highlighter", name: "Highlighter", engine: "pen", params: { style: "highlighter", nibAngle: 80 }, opacity: 0.5 }),
  makeDef({ id: "speckle", name: "Speckle", engine: "speckle" }),
  makeDef({ id: "pattern-star", name: "Stars", engine: "pattern", params: { shape: "star", variety: 0.8, turn: 0.6 } }),
  makeDef({ id: "pattern-dot", name: "Dots", engine: "pattern", params: { shape: "dot" } }),
  makeDef({ id: "graphite", name: "Graphite", engine: "graphite" }),
  makeDef({ id: "pencil-bold", name: "Pencil bold", engine: "pencil", bold: "double" }),
  // Paint
  // Wide and soft, light per pass (flow), with sprinkles of bigger drops.
  makeDef({ id: "airbrush", name: "Airbrush", engine: "airbrush", params: { width: 1.8, softness: 0.9, sprinkles: 0.5 }, flow: 0.7 }),
  // Dry media
  makeDef({ id: "charcoal", name: "Charcoal", engine: "charcoal", blend: "multiply" }),
  makeDef({ id: "chalk", name: "Chalk pastel", engine: "chalk" }),
  makeDef({ id: "coloured-pencil", name: "Coloured pencil", engine: "coloured-pencil", blend: "multiply" }),
  // Stamps of marks drawn in Figma (public/tips): each repeats one mark, in the brush colour.
  ...FIGMA_STAMPS.map(
    ([id, name, params, scatter]) => makeDef({ id, name, engine: "stamp", tip: { src: `${TIPS.base}${id}.png` }, params, dynamics: { ...DEFAULT_DYNAMICS, jitter: { size: 0, scatter, opacity: 0 } } })
  )
];
var ERASER_BRUSH = makeDef({ id: "eraser", name: "Round eraser", engine: "pen", params: { style: "marker" } });

// orange-3d-brushed/brush-source/src/rng.ts
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// orange-3d-brushed/brush-source/src/bold.ts
function doubled(base, id, name) {
  return {
    id,
    name,
    start(env, first) {
      const rng = env.rng ?? Math.random;
      const second = mulberry32(Math.floor(rng() * 4294967296));
      const r1 = base.start({ ...env, rng }, first);
      const r2 = base.start({ ...env, rng: second }, first);
      return (a, b) => {
        r1(a, b);
        r2(a, b);
      };
    }
  };
}
function thickened(base, id, name, nudge = 0.9) {
  return {
    id,
    name,
    start(env, first) {
      const r1 = base.start(env, first);
      const r2 = base.start(env, { ...first, x: first.x + nudge, y: first.y + nudge });
      return (a, b) => {
        r1(a, b);
        r2({ ...a, x: a.x + nudge, y: a.y + nudge }, { ...b, x: b.x + nudge, y: b.y + nudge });
      };
    }
  };
}

// orange-3d-brushed/brush-source/src/dynamics.ts
var NEUTRAL_PRESSURE = 0.7;
var smooth = (v) => {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
};
var pathLength = (pts) => {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return d;
};
function makeDynamics(def, color, seed, size, scale, total = Infinity) {
  const { taper, jitter, colorJitter: cj, pressure } = def.dynamics;
  const colorJitters = cj.hue > 0 || cj.sat > 0 || cj.value > 0;
  const tin = taper.in * scale, tout = taper.out * scale;
  const px = size * scale;
  const period = Math.max(4, px * 3);
  const lane = seed % 100003 * 8;
  const noise = (u, ch) => vnoise(u, lane + ch) * 2 - 1;
  let d = 0;
  let prev = null;
  return (p) => {
    if (prev) d += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
    const u = d / period;
    let t = 1;
    if (tin > 0) t = Math.min(t, smooth(d / tin));
    if (tout > 0 && Number.isFinite(total)) t = Math.min(t, smooth((total - d) / tout));
    const w = (taper.min + (1 - taper.min) * t) * Math.max(0.05, 1 + jitter.size * noise(u, 0));
    const spread = jitter.scatter * px;
    const o = def.flow * (1 - jitter.opacity * (noise(u * 1.7, 3) + 1) * 0.5);
    const c = colorJitters ? shiftColor(color, cj.hue * 40 * noise(u / 3, 4), cj.sat * 0.3 * noise(u / 3, 5), cj.value * 0.3 * noise(u / 3, 6)) : void 0;
    return {
      x: p.x + spread * noise(u, 1),
      y: p.y + spread * noise(u, 2),
      t: p.t,
      pressure: NEUTRAL_PRESSURE + ((Number.isFinite(p.pressure) ? p.pressure : NEUTRAL_PRESSURE) - NEUTRAL_PRESSURE) * pressure,
      w,
      o,
      ...c ? { c } : {}
    };
  };
}

// orange-3d-brushed/brush-source/src/stroke.ts
var emptyAssets = () => ({ grains: /* @__PURE__ */ new Map(), tips: /* @__PURE__ */ new Map() });
function buildBrush(def, assets, scale) {
  const engine = ENGINES[def.engine];
  if (!engine) return null;
  const tip = def.tip ? assets.tips.get(def.tip.src) : void 0;
  if (engine.usesTip && !tip) return null;
  const base = def.grain?.src && assets.grains.get(def.grain.src) || noiseGrain;
  const k = 2 / scale / (def.grain?.scale ?? 1);
  const grain = k === 1 ? base : (x, y) => base(x * k, y * k);
  const brush = engine.make(def.params, { grain, tip });
  if (def.bold === "double") return doubled(brush, def.id, def.name);
  if (def.bold === "thicken") return thickened(brush, def.id, def.name, 0.45 * scale);
  return brush;
}
function beginStroke(ctx, stroke, assets, scale, opts = {}) {
  const brush = buildBrush(stroke.brush, assets, scale);
  if (!brush || !stroke.points.length) return null;
  const { color, size, seed } = stroke;
  const dynamics = makeDynamics(stroke.brush, color, seed, size, scale, opts.total);
  const thin = opts.live ? stroke.brush.opacity : 1;
  const dyn = thin < 1 ? (p) => {
    const q = dynamics(p);
    q.o = (q.o ?? 1) * thin;
    return q;
  } : dynamics;
  let last = dyn(stroke.points[0]);
  const render = brush.start({ ctx, color, size, scale, rng: mulberry32(seed) }, last);
  const blend = stroke.brush.blend === "multiply" ? "multiply" : "source-over";
  return (p) => {
    const next = dyn(p);
    ctx.save();
    ctx.globalCompositeOperation = blend;
    render(last, next);
    ctx.restore();
    last = next;
  };
}
function drawStroke(ctx, stroke, assets, scale) {
  const draw = () => {
    const add = beginStroke(ctx, stroke, assets, scale, { total: pathLength(stroke.points) });
    if (add) for (let i = 1; i < stroke.points.length; i++) add(stroke.points[i]);
  };
  const opacity = stroke.brush.opacity;
  if (opacity >= 1) return draw();
  const { width, height } = ctx.canvas;
  const before = ctx.getImageData(0, 0, width, height);
  draw();
  const after = ctx.getImageData(0, 0, width, height);
  blendToward(before.data, after.data, opacity);
  ctx.putImageData(after, 0, 0);
}
function blendToward(before, after, t) {
  for (let i = 0; i < after.length; i += 4) {
    const ba = before[i + 3] / 255, aa = after[i + 3] / 255;
    if (ba === aa && before[i] === after[i] && before[i + 1] === after[i + 1] && before[i + 2] === after[i + 2]) continue;
    const oa = ba + (aa - ba) * t;
    after[i + 3] = Math.round(oa * 255);
    for (let c = 0; c < 3; c++) {
      const pb = before[i + c] * ba, pa = after[i + c] * aa;
      after[i + c] = oa > 0 ? Math.round((pb + (pa - pb) * t) / oa) : 0;
    }
  }
}
export {
  builtInBrushes,
  drawStroke,
  emptyAssets,
  makeDef,
  mulberry32
};
