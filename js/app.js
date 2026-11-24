/* Pruefwerk: Regeln, Bericht und Markierung. Nichts wird hochgeladen, alles laeuft lokal. */
(function () {
  const $ = id => document.getElementById(id);
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) { if (k === "class") e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
    kids.flat().forEach(c => { if (c !== null && c !== undefined && c !== false) e.append(c); });
    return e;
  }
  const RANK = { ok: 0, info: 1, warn: 2, fail: 3 };
  const LABEL = { ok: "In Ordnung", info: "Hinweis", warn: "Pruefen", fail: "Auffaellig" };
  const MAX_FILE = 15 * 1024 * 1024;
  let state = { file: null, buf: null, bmp: null };

  /* ---------- Auswahl ---------- */
  (function fillCountries() {
    const sel = $("country"), groups = {};
    window.COUNTRIES.forEach(c => { (groups[c.r] = groups[c.r] || []).push(c); });
    Object.keys(groups).forEach(r => {
      const og = h("optgroup", { label: r });
      groups[r].forEach(c => og.append(h("option", { value: c.c }, c.n + " (" + c.c.replace(/</g, "") + ")")));
      sel.append(og);
    });
  })();

  $("file").addEventListener("change", async e => {
    const f = e.target.files[0];
    state = { file: null, buf: null, bmp: null };
    $("fileinfo").textContent = "";
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { $("fileinfo").textContent = "Nur JPG, PNG oder WebP (kein HEIC oder PDF)."; e.target.value = ""; return; }
    if (f.size > MAX_FILE) { $("fileinfo").textContent = "Datei zu gross (max. 15 MB)."; e.target.value = ""; return; }
    try {
      state.file = f; state.buf = await f.arrayBuffer(); state.bmp = await createImageBitmap(f);
      $("fileinfo").textContent = f.name.slice(0, 60) + " (" + state.bmp.width + " x " + state.bmp.height + " px)";
    } catch (err) { $("fileinfo").textContent = "Bild konnte nicht gelesen werden."; state = { file: null, buf: null, bmp: null }; }
  });
  $("form").addEventListener("submit", e => e.preventDefault());
  $("reset").addEventListener("click", () => { $("form").reset(); state = { file: null, buf: null, bmp: null }; $("fileinfo").textContent = ""; $("result").hidden = true; });
  $("print").addEventListener("click", () => window.print());

  /* ---------- Hilfen ---------- */
  const fmt = d => d ? d.toISOString().slice(0, 10) : "?";
  const parseInput = s => { if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return null; const d = new Date(s + "T00:00:00Z"); return isNaN(d) ? null : d; };
  function normNames(s) {
    const base = s.toUpperCase().replace(/ß/g, "SS");
    const a = base.normalize("NFD").replace(/[̀-ͯ]/g, "");
    const b = base.replace(/Ä/g, "AE").replace(/Ö/g, "OE").replace(/Ü/g, "UE").normalize("NFD").replace(/[̀-ͯ]/g, "");
    return [a, b].map(x => x.replace(/[^A-Z]/g, ""));
  }
  const years = (a, b) => (b - a) / (365.25 * 86400000);

  /* ---------- Regeln ---------- */
  function evaluate(inp, mrz, img, now) {
    const F = [];
    const add = (s, t, exp, got, why, adv, zone) => F.push({ s, t, exp, got, why, adv, zone: zone || null });
    const isPass = inp.doc === "passport";
    const cinfo = window.COUNTRIES.find(c => c.c === inp.country);

    /* MRZ */
    if (mrz.problem) {
      add("fail", "Maschinenlesbare Zone (MRZ) nicht lesbar", isPass ? "2 Zeilen mit je 44 Zeichen" : "3 Zeilen mit je 30 Zeichen", mrz.problem,
        "Ohne lesbare MRZ koennen Pruefziffern und Felder nicht abgeglichen werden. Oft liegt es an Unschaerfe, Reflexion oder abgeschnittenem Rand.",
        "Bessere Aufnahme der ganzen Seite anfordern, alle MRZ-Zeilen sichtbar, ohne Glanz.", "mrz");
    } else {
      const f = mrz.fields;
      const expFmt = isPass ? "TD3" : "TD1";
      if (mrz.format !== expFmt && !(!isPass && mrz.format === "TD2"))
        add("fail", "MRZ-Format passt nicht zur Dokumentart", isPass ? "Reisepass: TD3 (2 x 44)" : "ID-Karte: TD1 (3 x 30)", "gefunden: " + mrz.format,
          "Jede Dokumentart hat ein festes MRZ-Format. Eine Abweichung spricht fuer ein falsches Dokument oder eine falsche Angabe.", "Dokumentart pruefen oder Dokument neu anfordern.", "mrz");
      const t0 = f.type[0];
      if (isPass ? t0 !== "P" : !["I", "A", "C"].includes(t0))
        add("fail", "Dokumenttyp-Kennung falsch", isPass ? "beginnt mit P" : "beginnt mit I, A oder C", "gefunden: " + f.type.replace(/</g, "_"),
          "Der erste MRZ-Buchstabe nennt die Dokumentart (P = Pass).", "Anderes Dokument anfordern.", "mrz");
      if (f.issuer !== inp.country)
        add("fail", "Ausstellerland passt nicht zum gewaehlten Land", "Code " + inp.country.replace(/</g, "_") + " (" + (cinfo ? cinfo.n : "?") + ")", "MRZ nennt: " + f.issuer.replace(/</g, "_"),
          "Der Dreibuchstaben-Code des ausstellenden Staates muss zum Land des Dokuments passen. Deutschland verwendet D<<.",
          "Land pruefen. Passt es weiter nicht, Dokument nicht akzeptieren.", "mrz");
      else add("ok", "Ausstellerland stimmt", inp.country.replace(/</g, "_"), f.issuer.replace(/</g, "_"), "", "", "mrz");
      if (isPass && f.nat !== f.issuer)
        add("warn", "Staatsangehoerigkeit weicht vom Aussteller ab", "bei Reisepaessen meist gleich", f.issuer.replace(/</g, "_") + " / " + f.nat.replace(/</g, "_"),
          "Selten legitim (z. B. Fremdenpass). Haeufiger ein Hinweis auf zusammengesetzte MRZ-Daten.", "Zusatzdokument anfordern.", "mrz");

      const bad = mrz.checks.filter(c => !c.ok);
      if (!bad.length) add("ok", "Alle Pruefziffern stimmen", "7-3-1-Formel nach ICAO 9303", "alle " + mrz.checks.length + " Pruefungen bestanden", "", "", "mrz");
      bad.forEach(c => add("fail", c.label + " falsch", c.expected, c.found,
        "Die Pruefziffer wird mit der Gewichtung 7-3-1 aus den Daten berechnet. Wurde ein Feld nachtraeglich geaendert oder von Hand getippt, stimmt die Ziffer meist nicht mehr.",
        "Erst bessere Aufnahme anfordern, falls die Zeile falsch gelesen wurde. Bei klarem Bild und falscher Ziffer: nicht akzeptieren.", "mrz"));

      /* Datumslogik */
      if (!f.dobDate) add("fail", "Geburtsdatum in der MRZ ungueltig", "gueltiges Datum JJMMTT", f.dob, "Das Feld ist kein reales Datum.", "Neue Aufnahme anfordern.", "mrz");
      else {
        const age = years(f.dobDate, now);
        if (age < 0 || age > 115) add("fail", "Geburtsdatum unplausibel", "Alter zwischen 0 und 115", fmt(f.dobDate), "Das Datum liegt in der Zukunft oder ergibt ein unmoegliches Alter.", "Nicht akzeptieren.", "mrz");
        else add("ok", "Geburtsdatum plausibel", "reales Datum", fmt(f.dobDate) + " (Alter " + Math.floor(age) + ")", "", "", "mrz");
      }
      if (!f.expDate) add("fail", "Ablaufdatum in der MRZ ungueltig", "gueltiges Datum JJMMTT", f.exp, "Das Feld ist kein reales Datum.", "Neue Aufnahme anfordern.", "mrz");
      else if (f.expDate < now) add("fail", "Dokument abgelaufen", "Ablaufdatum in der Zukunft", fmt(f.expDate),
        "Ein abgelaufenes Dokument ist als Nachweis ungueltig. Wurde in der Sichtzone ein anderes Datum gezeigt, spricht das fuer Manipulation.", "Gueltiges Dokument anfordern.", "mrz");
      else {
        const left = (f.expDate - now) / 86400000;
        if (left < 180) add("info", "Laeuft bald ab", "mind. 6 Monate Restlaufzeit (haeufige Vorgabe)", fmt(f.expDate) + " (noch " + Math.round(left) + " Tage)", "Viele Anbieter verlangen eine Restgueltigkeit.", "Je nach Ihren Regeln akzeptieren oder neues Dokument anfordern.", "mrz");
        else add("ok", "Ablaufdatum in Ordnung", "in der Zukunft", fmt(f.expDate), "", "", "mrz");
      }
      /* Ausstellungsdatum (Sichtzone, freiwillig) */
      const issue = parseInput(inp.issue);
      if (issue && f.expDate) {
        const y = years(issue, f.expDate);
        if (issue > now || issue > f.expDate) add("fail", "Ausstellungsdatum unmoeglich", "vor Ablauf und nicht in der Zukunft", fmt(issue), "Ausstellung nach Ablauf oder in der Zukunft ist nicht moeglich.", "Nicht akzeptieren.", null);
        else if (f.dobDate && issue < f.dobDate) add("fail", "Ausstellung vor der Geburt", "nach dem Geburtsdatum", fmt(issue), "Ein Dokument kann nicht vor der Geburt ausgestellt sein.", "Nicht akzeptieren.", null);
        else if (isPass && y > window.MAX_PASSPORT_YEARS + 0.1) add("warn", "Gueltigkeitsdauer ungewoehnlich lang", "hoechstens " + window.MAX_PASSPORT_YEARS + " Jahre", y.toFixed(1) + " Jahre",
          "Reisepaesse gelten fuer Erwachsene in der Regel nicht laenger als 10 Jahre. Aeltere Modelle koennen abweichen.", "Zweites Dokument anfordern.", null);
        else add("ok", "Ausstellung und Gueltigkeitsdauer plausibel", "bis " + window.MAX_PASSPORT_YEARS + " Jahre", y.toFixed(1) + " Jahre", "", "", null);
      }

      /* Abgleich Sichtzone <-> MRZ */
      const cmp = (label, mrzV, visV, same) => {
        if (!visV) return;
        if (same) add("ok", label + " stimmt mit MRZ ueberein", mrzV, visV, "", "", null);
        else add("fail", label + " weicht von der MRZ ab", "MRZ: " + mrzV, "Sichtzone: " + visV,
          "Sichtzone und MRZ muessen dieselben Daten zeigen. Eine Abweichung ist ein klassischer Hinweis auf eine Aenderung nur an einer Stelle.", "Nicht akzeptieren oder Original per Video-Ident zeigen lassen.", null);
      };
      if (inp.surname) cmp("Nachname", f.surname, inp.surname, normNames(inp.surname).includes(f.surname.replace(/[^A-Z]/g, "")));
      if (inp.given) cmp("Vorname", f.given, inp.given, normNames(inp.given).includes(f.given.replace(/[^A-Z]/g, "")));
      if (inp.docnum) cmp("Dokumentnummer", f.docNumClean, inp.docnum.toUpperCase().replace(/\s/g, ""), inp.docnum.toUpperCase().replace(/\s/g, "") === f.docNumClean);
      const vd = parseInput(inp.dob); if (vd) cmp("Geburtsdatum", fmt(f.dobDate), fmt(vd), f.dobDate && vd.getTime() === f.dobDate.getTime());
      const ve = parseInput(inp.exp); if (ve) cmp("Ablaufdatum", fmt(f.expDate), fmt(ve), f.expDate && ve.getTime() === f.expDate.getTime());
    }
    if (!isPass && cinfo && cinfo.noIdMrz)
      add("info", "Land stellt diesen Typ ueblicherweise nicht mit MRZ aus", "ID-Karte mit MRZ", cinfo.n,
        "Fuer dieses Land ist eine nationale ID-Karte mit MRZ ungewoehnlich.", "Reisepass anfordern.", null);

    /* Bild */
    if (img) {
      if (img.origW < 800) add("warn", "Aufloesung zu niedrig", "mind. 800 Pixel Breite", img.origW + " Pixel", "Bei kleinen Bildern lassen sich Details nicht beurteilen, und Raender und Schrift sind unscharf.", "Neue Aufnahme mit mehr Aufloesung anfordern.", "image");
      else add("ok", "Aufloesung ausreichend", "mind. 800 Pixel Breite", img.origW + " Pixel", "", "", "image");
      if (img.sharpness < 60) add("warn", "Bild zu unscharf", "klare Kanten", "Schaerfewert " + img.sharpness.toFixed(0) + " (unter 60)", "Unscharfe Bilder verdecken Details und werden manchmal absichtlich gewaehlt.", "Schaerfere Aufnahme anfordern.", "image");
      if (img.glare > 0.03) add("warn", "Starke Reflexion oder Ueberbelichtung", "gleichmaessiges Licht", Math.round(img.glare * 100) + " % sehr helle Pixel", "Reflexionen koennen Sicherheitsmerkmale und Schrift verdecken.", "Aufnahme ohne Blitz und ohne Glanz anfordern.", "image");
      if (img.darkShare > 0.45) add("warn", "Bild sehr dunkel", "gut beleuchtet", Math.round(img.darkShare * 100) + " % dunkle Pixel", "Dunkle Bilder verbergen Details.", "Neue Aufnahme bei Tageslicht anfordern.", "image");
      const m = img.meta, s = img.strings;
      if (s.generators.length) add("fail", "Hinweise auf KI-Erzeugung in den Dateidaten", "keine KI-Kennzeichnung", s.generators.join(", "), "Die Datei enthaelt Kennungen von KI-Werkzeugen.", "Nicht akzeptieren.", "image");
      if (s.editors.length || (m.software && /photoshop|gimp|canva|pixelmator|affinity/i.test(m.software)))
        add("warn", "Bearbeitungssoftware in den Dateidaten", "unbearbeitete Kameradatei", (s.editors.join(", ") || m.software), "Bildbearbeitung ist nicht zwingend Betrug (manche Scan-Apps nutzen sie), aber ein haeufiger Hinweis auf Manipulation.", "Direktes Foto oder Video-Ident anfordern.", "image");
      if (m.jpeg && !m.make && !m.model) add("info", "Keine Kameradaten vorhanden", "Kameramodell in den Dateidaten", "keine", "Fehlen oft bei Screenshots oder weitergeleiteten Bildern. Allein kein Beweis.", "Original direkt von der Kamera anfordern.", "image");
      if (!m.jpeg) add("info", "Datei ist kein JPG (z. B. PNG/Screenshot)", "Kamera-JPG mit EXIF", "kein EXIF", "Screenshots haben keine Kamerainformationen. Die Fehlerniveau-Analyse laeuft nur bei JPG.", "Direkt aufgenommenes Foto anfordern.", "image");
      if (img.ela) {
        if (img.ela.share > 0.03) add("warn", "Auffaellige Kompressionsbereiche (rot markiert)", "gleichmaessiges Fehlerniveau", Math.round(img.ela.share * 1000) / 10 + " % der Flaechen auffaellig",
          "Bereiche, die nachtraeglich eingefuegt oder bearbeitet wurden, komprimieren oft anders als der Rest. Starke Hinweise brauchen eine Gegenprobe; Fotos von Papier koennen aehnlich wirken.", "Aufnahme neu anfordern und markierte Stellen zeigen lassen.", "image");
        else add("ok", "Kompression gleichmaessig", "keine auffaelligen Bereiche", Math.round(img.ela.share * 1000) / 10 + " %", "", "", "image");
      }
    }
    return F;
  }

  /* ---------- Darstellung ---------- */
  const COL = { ok: "#1fbf75", info: "#5b8def", warn: "#f0a030", fail: "#e5484d" };
  function zones(fmt) {
    const mrzH = { TD3: [0.80, 0.17], TD2: [0.74, 0.23], TD1: [0.68, 0.29] }[fmt];
    return { mrz: { x: 0.03, y: mrzH[0], w: 0.94, h: mrzH[1] }, photo: { x: 0.04, y: 0.2, w: 0.3, h: 0.45 } };
  }
  function drawOverlay(cv, img, bmp, fmtName, findings) {
    const W = Math.min(1000, bmp.width), H = Math.round(bmp.height * W / bmp.width);
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    g.drawImage(bmp, 0, 0, W, H);
    if (img && img.ela) { g.fillStyle = "rgba(229,72,77,.45)"; img.ela.spots.forEach(r => g.fillRect(r.x * W / img.ela.w, r.y * W / img.ela.w, r.w * W / img.ela.w, r.h * W / img.ela.w)); }
    const Z = zones(fmtName);
    const worst = z => findings.filter(f => f.zone === z).reduce((m, f) => RANK[f.s] > RANK[m] ? f.s : m, "ok");
    const box = (r, s, label) => {
      g.save(); g.strokeStyle = COL[s]; g.lineWidth = 3; g.setLineDash([10, 6]);
      g.strokeRect(r.x * W, r.y * H, r.w * W, r.h * H); g.setLineDash([]);
      g.font = "bold 14px sans-serif"; const tw = g.measureText(label).width + 12;
      g.fillStyle = COL[s]; g.fillRect(r.x * W, r.y * H - 22, tw, 22);
      g.fillStyle = "#fff"; g.fillText(label, r.x * W + 6, r.y * H - 6); g.restore();
    };
    box(Z.mrz, worst("mrz"), "Erwartete MRZ-Zone: " + LABEL[worst("mrz")]);
    box(Z.photo, "info", "Erwartete Fotozone (Gesicht nicht geprueft)");
  }
  function render(findings, canvasFmt) {
    const top = findings.reduce((m, f) => RANK[f.s] > RANK[m] ? f.s : m, "ok");
    const ban = $("banner");
    ban.className = "banner " + (top === "ok" || top === "info" ? "ok" : top);
    ban.textContent = top === "fail" ? "AUFFAELLIG: nicht ohne weitere Pruefung akzeptieren"
      : top === "warn" ? "PRUEFEN: es gibt Hinweise, die geklaert werden sollten"
      : "UNAUFFAELLIG bei den geprueften Punkten (kein Beweis fuer Echtheit)";
    const cnt = { fail: 0, warn: 0, info: 0, ok: 0 }; findings.forEach(f => cnt[f.s]++);
    $("summary").textContent = cnt.fail + " auffaellig, " + cnt.warn + " zu pruefen, " + cnt.info + " Hinweise, " + cnt.ok + " in Ordnung";
    const list = $("findings"); list.replaceChildren();
    findings.slice().sort((a, b) => RANK[b.s] - RANK[a.s]).forEach(f => {
      const rows = [];
      if (f.exp) rows.push(h("p", { class: "r" }, h("b", {}, "So sollte es sein: "), f.exp));
      if (f.got) rows.push(h("p", { class: "r" }, h("b", {}, "Gefunden: "), f.got));
      if (f.why) rows.push(h("p", { class: "r" }, h("b", {}, "Warum auffaellig: "), f.why));
      if (f.adv) rows.push(h("p", { class: "r adv" }, h("b", {}, "Empfehlung: "), f.adv));
      list.append(h("article", { class: "f " + f.s }, h("h3", {}, h("span", { class: "tag" }, LABEL[f.s]), " " + f.t), rows));
    });
  }

  $("run").addEventListener("click", async () => {
    $("err").textContent = "";
    const inp = {
      country: $("country").value, doc: $("doc").value, mrz: $("mrz").value,
      surname: $("surname").value.trim(), given: $("given").value.trim(), docnum: $("docnum").value.trim(),
      dob: $("dob").value, exp: $("exp").value, issue: $("issue").value
    };
    if (!inp.mrz.trim() && !state.bmp) { $("err").textContent = "Bitte ein Bild laden oder die MRZ-Zeilen eintragen."; return; }
    $("run").disabled = true;
    try {
      const now = new Date();
      const mrz = window.MRZ.validate(inp.mrz, now);
      let img = null;
      const cv = $("overlay");
      if (state.bmp) {
        const W = Math.min(1000, state.bmp.width), H = Math.round(state.bmp.height * W / state.bmp.width);
        const work = document.createElement("canvas"); work.width = W; work.height = H;
        work.getContext("2d").drawImage(state.bmp, 0, 0, W, H);
        img = await window.FORENSICS.analyze(work, state.buf, state.bmp.width, state.bmp.height);
        if (img.ela) img.ela.w = W;
      }
      const findings = evaluate(inp, mrz, img, now);
      $("result").hidden = false;
      $("metaLine").textContent = "Pruefzeit " + now.toISOString().slice(0, 16).replace("T", " ") + " UTC, Land " + (window.COUNTRIES.find(c => c.c === inp.country) || {}).n + ", " + (inp.doc === "passport" ? "Reisepass" : "ID-Karte");
      render(findings);
      cv.hidden = !state.bmp;
      if (state.bmp) drawOverlay(cv, img, state.bmp, mrz.format || (inp.doc === "passport" ? "TD3" : "TD1"), findings);
      $("result").scrollIntoView({ behavior: "smooth" });
    } catch (e) { $("err").textContent = "Fehler bei der Pruefung: " + e.message; }
    $("run").disabled = false;
  });
})();
