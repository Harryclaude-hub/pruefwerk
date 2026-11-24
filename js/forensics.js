/* Bild- und Dateipruefung. Alles lokal im Browser. Ergebnisse sind Hinweise, keine Beweise. */
(function (root) {
  const EDITORS = ["Photoshop", "GIMP", "Canva", "Pixelmator", "Affinity", "Paint.NET", "Snapseed", "Lightroom"];
  const GENERATORS = ["Midjourney", "Stable Diffusion", "DALL-E", "DALL·E", "Firefly", "OpenAI", "c2pa", "ComfyUI"];

  function readExif(buf) {
    const v = new DataView(buf);
    const out = { jpeg: false, make: null, model: null, software: null };
    if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return out;
    out.jpeg = true;
    let p = 2;
    while (p + 4 < v.byteLength) {
      if (v.getUint8(p) !== 0xFF) break;
      const marker = v.getUint8(p + 1), len = v.getUint16(p + 2);
      if (marker === 0xE1 && v.getUint32(p + 4) === 0x45786966) { // "Exif"
        const t = p + 10, le = v.getUint16(t) === 0x4949;
        const g16 = o => v.getUint16(t + o, le), g32 = o => v.getUint32(t + o, le);
        let ifd = g32(4);
        const n = g16(ifd);
        for (let i = 0; i < n; i++) {
          const e = ifd + 2 + i * 12;
          if (t + e + 12 > v.byteLength) break;
          const tag = g16(e), type = g16(e + 2), cnt = g32(e + 4);
          if (type !== 2 || ![0x010F, 0x0110, 0x0131].includes(tag)) continue;
          const off = cnt > 4 ? g32(e + 8) : e + 8;
          let s = "";
          for (let k = 0; k < Math.min(cnt, 80) && t + off + k < v.byteLength; k++) {
            const c = v.getUint8(t + off + k); if (!c) break; s += String.fromCharCode(c);
          }
          if (tag === 0x010F) out.make = s; else if (tag === 0x0110) out.model = s; else out.software = s;
        }
        break;
      }
      if (marker === 0xDA) break;
      p += 2 + len;
    }
    return out;
  }

  function scanStrings(buf) {
    const bytes = new Uint8Array(buf, 0, Math.min(buf.byteLength, 262144));
    let s = ""; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    const lower = s.toLowerCase();
    return {
      editors: EDITORS.filter(k => lower.includes(k.toLowerCase())),
      generators: GENERATORS.filter(k => lower.includes(k.toLowerCase()))
    };
  }

  function gray(d, w, h) {
    const g = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) g[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
    return g;
  }
  function laplacianVar(g, w, h) {
    let sum = 0, sq = 0, n = 0;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const v = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w];
      sum += v; sq += v * v; n++;
    }
    const m = sum / n; return sq / n - m * m;
  }

  async function ela(canvas) {
    const w = canvas.width, h = canvas.height;
    const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.9));
    const bmp = await createImageBitmap(blob);
    const c2 = document.createElement("canvas"); c2.width = w; c2.height = h;
    const x2 = c2.getContext("2d"); x2.drawImage(bmp, 0, 0);
    const a = canvas.getContext("2d").getImageData(0, 0, w, h).data, b = x2.getImageData(0, 0, w, h).data;
    const B = 16, bw = Math.floor(w / B), bh = Math.floor(h / B), vals = [];
    for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
      let s = 0;
      for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) {
        const i = ((by * B + y) * w + bx * B + x) * 4;
        s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
      }
      vals.push(s / (B * B * 3));
    }
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
    const thr = Math.max(mean + 3 * sd, 6);
    const spots = [];
    vals.forEach((v, i) => { if (v > thr) spots.push({ x: (i % bw) * B, y: Math.floor(i / bw) * B, w: B, h: B }); });
    return { spots, share: spots.length / vals.length };
  }

  /* canvas: bereits auf Arbeitsgroesse skaliertes Bild */
  async function analyze(canvas, buf, origW, origH) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const d = ctx.getImageData(0, 0, w, h).data;
    const g = gray(d, w, h);
    let bright = 0, dark = 0;
    for (let i = 0; i < w * h; i++) {
      if (d[i * 4] >= 250 && d[i * 4 + 1] >= 250 && d[i * 4 + 2] >= 250) bright++;
      if (g[i] < 25) dark++;
    }
    const meta = readExif(buf), str = scanStrings(buf);
    const res = {
      origW, origH, meta, strings: str,
      sharpness: laplacianVar(g, w, h),
      glare: bright / (w * h),
      darkShare: dark / (w * h),
      ela: meta.jpeg ? await ela(canvas) : null
    };
    return res;
  }

  root.FORENSICS = { analyze, readExif, scanStrings };
})(window);
