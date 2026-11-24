/* Lokale Texterkennung (Tesseract, aus vendor/). Kein Netzzugriff: alle Pfade zeigen auf eigene Dateien. */
(function (root) {
  let worker = null;
  const abs = p => new URL(p, location.href).href;

  async function get(onStatus) {
    if (worker) return worker;
    worker = await Tesseract.createWorker("eng", 1, {
      workerPath: abs("vendor/worker.min.js"),
      corePath: abs("vendor/"),
      langPath: abs("vendor/lang/"),
      workerBlobURL: false,
      gzip: true,
      logger: m => onStatus && m.status ? onStatus(m.status, m.progress) : null
    });
    return worker;
  }

  /* Liest die MRZ-Zone (relatives Rechteck) und gibt die letzten n Zeilen zurueck. */
  async function readMrz(canvas, zone, lines, onStatus) {
    const w = await get(onStatus);
    const sx = Math.max(0, zone.x - 0.02) * canvas.width, sy = Math.max(0, zone.y - 0.04) * canvas.height;
    const sw = Math.min(1 - sx / canvas.width, zone.w + 0.04) * canvas.width, sh = Math.min(1 - sy / canvas.height, zone.h + 0.07) * canvas.height;
    const sc = 2, c = document.createElement("canvas"); c.width = Math.round(sw * sc); c.height = Math.round(sh * sc);
    const g = c.getContext("2d"); g.filter = "grayscale(1) contrast(1.5)"; g.drawImage(canvas, sx, sy, sw, sh, 0, 0, c.width, c.height);
    await w.setParameters({ tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<", tessedit_pageseg_mode: "6" });
    const r = await w.recognize(c);
    await w.setParameters({ tessedit_char_whitelist: "", tessedit_pageseg_mode: "3" });
    const ls = r.data.text.split(/\r?\n/).map(l => l.replace(/\s+/g, "").toUpperCase()).filter(l => l.length >= 20);
    const want = lines === 2 ? 44 : 30;
    return ls.slice(-lines).map(l => cleanFiller(l, want)).join("\n");
  }

  /* OCR liest das Fuellzeichen < oft als K, L oder C. Nur sichere Regeln, nur bei Zeilen, die mit Fuellzeichen enden. */
  function cleanFiller(l, want) {
    l = l.replace(/[<KLC]{3,}$/, m => "<".repeat(m.length)).replace(/<[KLC]</g, "<<");
    if (l.endsWith("<") && Math.abs(l.length - want) <= 4) l = l.length > want ? l.slice(0, want) : l + "<".repeat(want - l.length);
    return l;
  }

  /* Liest den gesamten Text; liefert Woerter und Zeilen mit Rahmen (Pixel der Arbeitsleinwand). */
  async function readText(canvas, onStatus) {
    const w = await get(onStatus);
    const r = await w.recognize(canvas);
    const d = r.data;
    return { words: d.words || [], lines: d.lines || [], text: d.text || "" };
  }

  root.OCR = { readMrz, readText };
})(window);
