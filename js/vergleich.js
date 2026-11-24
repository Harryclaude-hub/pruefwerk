/* Vergleichs-Werkbank: Kundenbild gegen amtliches Muster, gemeinsamer Zoom, lokal im Browser. */
(function () {
  const $ = id => document.getElementById(id);
  const W = 800, H = 600, MAXF = 15 * 1024 * 1024;
  const S = { A: null, B: null, ela: null, v: { s: 1, cx: 0.5, cy: 0.5 } };

  function draw(ctx, img) {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    if (!img) return;
    const fit = Math.min(W / img.width, H / img.height), sc = fit * S.v.s, sw = img.width * sc, sh = img.height * sc;
    ctx.drawImage(img, W / 2 - S.v.cx * sw, H / 2 - S.v.cy * sh, sw, sh);
  }
  function grid(ctx) {
    if (!$("grid").checked) return;
    ctx.save(); ctx.strokeStyle = "rgba(45,226,192,.55)"; ctx.lineWidth = 1;
    for (let i = 1; i < 10; i++) { ctx.beginPath(); ctx.moveTo(i * W / 10, 0); ctx.lineTo(i * W / 10, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * H / 10); ctx.lineTo(W, i * H / 10); ctx.stroke(); }
    ctx.restore();
  }
  function render() {
    const mode = $("mode").value, a = mode === "ela" && S.ela ? S.ela : S.A, side = mode === "side" || mode === "ela";
    $("fgA").hidden = !side; $("fgB").hidden = !side; $("fgR").hidden = side;
    $("fgA").firstChild.textContent = mode === "ela" ? "Kundenbild als Kompressionskarte (helle Stellen sind auffaellig, nur Hinweis)" : "Kundenbild";
    if (side) {
      const ga = $("cA").getContext("2d"), gb = $("cB").getContext("2d");
      draw(ga, a); draw(gb, S.B); grid(ga); grid(gb);
    } else {
      const g = $("cR").getContext("2d");
      if (mode === "blend") {
        draw(g, S.B);
        g.save(); g.globalAlpha = $("op").value / 100;
        const img = S.A; if (img) { const fit = Math.min(W / img.width, H / img.height), sc = fit * S.v.s; g.drawImage(img, W / 2 - S.v.cx * img.width * sc, H / 2 - S.v.cy * img.height * sc, img.width * sc, img.height * sc); }
        g.restore(); $("rcap").textContent = "Ueberblendet: Kunde ueber Muster";
      } else {
        draw(g, S.A); g.save(); g.globalCompositeOperation = "difference";
        const img = S.B; if (img) { const fit = Math.min(W / img.width, H / img.height), sc = fit * S.v.s; g.drawImage(img, W / 2 - S.v.cx * img.width * sc, H / 2 - S.v.cy * img.height * sc, img.width * sc, img.height * sc); }
        g.restore(); $("rcap").textContent = "Differenz: dunkel = gleich, hell = abweichend (setzt gleiche Dokumentart und gleichen Zuschnitt voraus)";
      }
      grid(g);
    }
  }

  async function load(file) {
    if (!file) return null;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > MAXF) { $("msg").textContent = "Nur JPG, PNG oder WebP bis 15 MB."; return null; }
    try { return await createImageBitmap(file); } catch (e) { $("msg").textContent = "Bild konnte nicht gelesen werden."; return null; }
  }
  async function makeEla(bmp) {
    const w = Math.min(1200, bmp.width), h = Math.round(bmp.height * w / bmp.width);
    const c = document.createElement("canvas"); c.width = w; c.height = h; c.getContext("2d").drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise(r => c.toBlob(r, "image/jpeg", 0.9)), re = await createImageBitmap(blob);
    const c2 = document.createElement("canvas"); c2.width = w; c2.height = h; c2.getContext("2d").drawImage(re, 0, 0);
    const a = c.getContext("2d").getImageData(0, 0, w, h), b = c2.getContext("2d").getImageData(0, 0, w, h), o = c2.getContext("2d").createImageData(w, h);
    for (let i = 0; i < a.data.length; i += 4) { for (let k = 0; k < 3; k++) o.data[i + k] = Math.min(255, Math.abs(a.data[i + k] - b.data[i + k]) * 18); o.data[i + 3] = 255; }
    c2.getContext("2d").putImageData(o, 0, 0); return c2;
  }
  $("fa").addEventListener("change", async e => { S.A = await load(e.target.files[0]); S.ela = S.A ? await makeEla(S.A) : null; render(); });
  $("fb").addEventListener("change", async e => { S.B = await load(e.target.files[0]); render(); });
  ["mode", "op", "grid"].forEach(id => $(id).addEventListener("input", render));
  $("zoom").addEventListener("input", () => { S.v.s = +$("zoom").value; render(); });
  $("rv").addEventListener("click", () => { S.v = { s: 1, cx: 0.5, cy: 0.5 }; $("zoom").value = 1; render(); });

  function bind(c) {
    let down = null;
    c.addEventListener("wheel", e => { e.preventDefault(); S.v.s = Math.min(12, Math.max(1, S.v.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15))); $("zoom").value = S.v.s; render(); }, { passive: false });
    c.addEventListener("pointerdown", e => { down = { x: e.clientX, y: e.clientY }; c.setPointerCapture(e.pointerId); c.style.cursor = "grabbing"; });
    c.addEventListener("pointerup", () => { down = null; c.style.cursor = ""; });
    c.addEventListener("pointermove", e => {
      if (!down) return;
      const r = c.getBoundingClientRect(), k = W / r.width, img = S.A || S.B; if (!img) return;
      const sw = img.width * Math.min(W / img.width, H / img.height) * S.v.s, sh = img.height * Math.min(W / img.width, H / img.height) * S.v.s;
      S.v.cx = Math.min(1, Math.max(0, S.v.cx - (e.clientX - down.x) * k / sw)); S.v.cy = Math.min(1, Math.max(0, S.v.cy - (e.clientY - down.y) * k / sh));
      down = { x: e.clientX, y: e.clientY }; render();
    });
  }
  ["cA", "cB", "cR"].forEach(id => bind($(id)));

  $("cap").addEventListener("click", () => {
    if (!S.A && !S.B) { $("msg").textContent = "Zuerst Bilder laden."; return; }
    const pair = document.createElement("div"); pair.className = "pair";
    [S.A, S.B].forEach(img => {
      const c = document.createElement("canvas"); c.width = W; c.height = H; draw(c.getContext("2d"), img); grid(c.getContext("2d")); pair.append(c);
    });
    const cap = document.createElement("div"); cap.className = "cap";
    const inp = document.createElement("input"); inp.placeholder = "Notiz, zum Beispiel Nachname, Schriftart, Foto-Raster"; inp.maxLength = 120;
    const del = document.createElement("button"); del.type = "button"; del.className = "btn alt"; del.textContent = "Entfernen"; del.addEventListener("click", () => pair.remove());
    cap.append(inp, del); pair.append(cap); $("gal").append(pair);
  });
  $("prt").addEventListener("click", () => window.print());
  render();
})();
