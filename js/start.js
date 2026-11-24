/* Pruefwerk Startseite: Suche oben, Seitenleiste links, Ansicht rechts. Alles lokal im Browser. */
(function () {
  const $ = id => document.getElementById(id);
  const K = { fav: "pw_fav", who: "pw_who" };
  const GROUPS = [["EU", "EU"], ["Europa (ausserhalb EU)", "Europa weitere"], ["Nordamerika", "Nordamerika"], ["Suedasien", "Indien, Bangladesch, Pakistan"], ["Weitere", "Weitere Laender"], ["alle", "Alle"]];
  const DOCS = [["passport", "Reisepass", "mit MRZ-Pruefziffern"], ["id", "ID-Karte", "mit MRZ-Pruefziffern"], ["permit", "Aufenthaltstitel", "mit MRZ-Pruefziffern"], ["visa", "Visum", "mit MRZ-Pruefziffern"], ["license", "Fuehrerschein", "ohne MRZ, nur Daten und Bild"]];
  const DOCN = { passport: "Reisepass", id: "ID-Karte", permit: "Aufenthaltstitel", visa: "Visum", license: "Fuehrerschein" };
  const TOP = { ok: ["Unauffaellig", "ok"], warn: ["Pruefen", "warn"], fail: ["Auffaellig", "fail"] };
  const PRADO = "https://www.consilium.europa.eu/prado/en/prado-start-page.html";
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt !== undefined) e.textContent = txt; return e; };
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
  const flag = (a, w) => { const i = el("img", "flag"); i.src = "flags/" + a.toLowerCase() + ".svg"; i.alt = ""; i.width = w || 28; i.height = Math.round((w || 28) * 0.75); i.loading = "lazy"; return i; };
  const byA = a => window.COUNTRIES.find(c => c.a === a);
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let fav = []; try { fav = JSON.parse(get(K.fav, "[]")).filter(x => typeof x === "string").slice(0, 300); } catch (e) {}
  const saveFav = () => set(K.fav, JSON.stringify(fav));
  let view = "start", sel = null, group = "EU";

  /* ---------- Seitenleiste ---------- */
  const SIDE = [["start", "Start", "⌂"], ["fav", "Favoriten", "★"], ["hist", "Verlauf", "⧖"], ["profil", "Profil", "☺"]];
  function drawSide() {
    const s = $("side"); s.replaceChildren();
    SIDE.forEach(([k, l, ic]) => {
      const b = el("button", "sb" + (view === k || (view === "land" && k === "start") ? " on" : "")); b.type = "button";
      b.append(el("span", "ic", ic), el("span", "", l + (k === "hist" ? " (" + window.HIST.list().length + ")" : k === "fav" ? " (" + fav.length + ")" : "")));
      b.addEventListener("click", () => go(k)); s.append(b);
    });
    [["pruefen.html", "Ausweis pruefen"], ["vergleich.html", "Werkbank"], ["info.html", "Info"]].forEach(([h, l]) => { const a = el("a", "sb", l); a.href = h; s.append(a); });
  }
  function go(v, a) { view = v; if (a) sel = a; drawSide(); draw(); window.scrollTo(0, 0); }

  /* ---------- Kleine Bausteine ---------- */
  function countryCard(c) {
    const d = el("div", "ccard2"), b = el("button", "cc2"); b.type = "button";
    b.append(flag(c.a, 44), el("b", "", c.n), el("span", "code", c.c.replace(/</g, "_")));
    b.addEventListener("click", () => go("land", c.a));
    const s = el("button", "star", fav.includes(c.a) ? "★" : "☆"); s.type = "button";
    s.setAttribute("aria-label", (fav.includes(c.a) ? "Favorit entfernen: " : "Favorit: ") + c.n);
    s.addEventListener("click", () => { fav = fav.includes(c.a) ? fav.filter(x => x !== c.a) : fav.concat(c.a); saveFav(); drawSide(); draw(); });
    d.append(b, s); return d;
  }
  function grid(list) { const g = el("div", "cgrid2"); list.forEach(c => g.append(countryCard(c))); return g; }
  function table(rows, del) {
    const t = el("table", "ht"), hd = el("tr");
    ["Zeit", "Fall", "Land", "Dokument", "Ergebnis", "Entscheidung", "Pruefer/in"].concat(del ? [""] : []).forEach(x => hd.append(el("th", "", x)));
    t.append(hd);
    rows.forEach(r => {
      const tr = el("tr"), tp = TOP[r.top] || TOP.ok, c3 = el("td"), c5 = el("td");
      if (r.a) c3.append(flag(r.a, 20), " "); c3.append(String(r.cn || ""));
      c5.append(el("span", "tag " + tp[1], tp[0]));
      tr.append(el("td", "", (r.t || "").slice(0, 16).replace("T", " ")), el("td", "", String(r.caseId || "")), c3, el("td", "", DOCN[r.doc] || ""), c5, el("td", "", String(r.dec || "offen")), el("td", "", String(r.who || "")));
      if (del) { const d = el("td"), b = el("button", "star", "✕"); b.type = "button"; b.setAttribute("aria-label", "Eintrag loeschen"); b.addEventListener("click", () => { window.HIST.remove(r.id); drawSide(); draw(); }); d.append(b); tr.append(d); }
      t.append(tr);
    });
    return t;
  }
  const csvCell = v => { let s = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };

  /* ---------- Ansichten ---------- */
  function draw() {
    const v = $("view"); v.replaceChildren();
    const q = norm($("q").value.trim());
    if (q) {
      const list = window.COUNTRIES.filter(c => norm(c.n).includes(q) || c.i.toLowerCase() === q || c.a.toLowerCase() === q);
      v.append(el("h1", "", list.length + " Treffer fuer „" + $("q").value.trim().slice(0, 40) + "“"));
      v.append(list.length ? grid(list.slice(0, 80)) : el("p", "sub", "Kein Land gefunden.")); return;
    }
    if (view === "start") {
      v.append(el("h1", "", "Land waehlen"));
      const chips = el("div", "chips", "");
      GROUPS.forEach(([k, l]) => { const b = el("button", "chip", l); b.type = "button"; b.setAttribute("aria-selected", String(k === group)); b.addEventListener("click", () => { group = k; draw(); }); chips.append(b); });
      v.append(chips);
      const list = window.COUNTRIES.filter(c => group === "alle" ? true : c.r === group);
      v.append(grid(list));
    } else if (view === "fav") {
      v.append(el("h1", "", "Favoriten"));
      const list = window.COUNTRIES.filter(c => fav.includes(c.a));
      v.append(list.length ? grid(list) : el("p", "sub", "Noch keine. Stern bei einem Land druecken."));
    } else if (view === "land") drawLand(v);
    else if (view === "hist") drawHist(v);
    else if (view === "profil") drawProfil(v);
  }

  function drawLand(v) {
    const c = byA(sel); if (!c) { go("start"); return; }
    const back = el("button", "btn alt", "← Alle Laender"); back.type = "button"; back.addEventListener("click", () => go("start")); v.append(back);
    const head = el("div", "lhead"); head.append(flag(c.a, 84), el("h1", "", c.n), el("span", "code", "MRZ-Code " + c.c.replace(/</g, "_")));
    v.append(head);
    v.append(el("h2", "", "Dokument pruefen"));
    const g = el("div", "dgrid");
    DOCS.forEach(([k, l, sub]) => {
      const a = el("a", "dcard"); a.href = "pruefen.html?land=" + encodeURIComponent(c.i) + "&art=" + k;
      a.append(el("b", "", l), el("span", "", k === "id" && c.noIdMrz ? "hier meist ohne MRZ" : sub)); g.append(a);
    });
    v.append(g);
    if (c.noIdMrz) v.append(el("p", "note", "Eine nationale ID-Karte mit MRZ ist hier ueblicherweise nicht vorhanden. Der Reisepass ist der verlaesslichere Nachweis."));
    v.append(el("h2", "", "Amtlicher Vergleich"));
    const row = el("div", "docs");
    const pr = el("a", "docbtn big", "Muster bei PRADO ansehen"); pr.href = PRADO; pr.target = "_blank"; pr.rel = "noopener noreferrer";
    const wb = el("a", "docbtn big", "Werkbank: Kunde gegen Muster"); wb.href = "vergleich.html";
    row.append(pr, wb); v.append(row);
    const last = window.HIST.list().filter(h => h.a === c.a).slice(0, 5);
    v.append(el("h2", "", "Zuletzt geprueft"));
    v.append(last.length ? table(last, false) : el("p", "sub", "Noch nichts."));
  }

  function drawHist(v) {
    v.append(el("h1", "", "Verlauf"));
    const all = window.HIST.list(), bar = el("div", "bar");
    const ex = el("button", "btn alt", "Als CSV speichern"), cl = el("button", "btn alt", "Leeren"); ex.type = cl.type = "button";
    bar.append(ex, cl); v.append(bar);
    v.append(all.length ? table(all, true) : el("p", "sub", "Noch keine Pruefungen."));
    v.append(el("p", "sub", "Nur auf diesem Geraet, ohne Bilder, Namen und Ausweisnummern."));
    ex.addEventListener("click", () => {
      const rows = [["Zeit", "Fall", "Land", "Dokument", "Ergebnis", "Auffaellig", "Pruefen", "Entscheidung", "Pruefer"]].concat(all.map(r => [r.t, r.caseId, r.cn, DOCN[r.doc] || r.doc, r.top, r.fail, r.warn, r.dec, r.who]));
      const blob = new Blob(["﻿" + rows.map(r => r.map(csvCell).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
      const a = el("a"); a.href = URL.createObjectURL(blob); a.download = "pruefwerk-verlauf.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    cl.addEventListener("click", () => { if (confirm("Den gesamten Verlauf auf diesem Geraet loeschen?")) { window.HIST.clear(); drawSide(); draw(); } });
  }

  function drawProfil(v) {
    v.append(el("h1", "", "Profil"));
    const c = el("div", "card"), l = el("label", "", "Dein Name als Pruefer/in"); l.setAttribute("for", "who");
    const i = el("input"); i.id = "who"; i.maxLength = 60; i.value = get(K.who, ""); i.autocomplete = "off";
    i.addEventListener("input", () => set(K.who, i.value.slice(0, 60)));
    c.append(l, i, el("p", "sub", "Wird in der Pruefung als Pruefer/in vorbelegt und steht im Verlauf. Nur auf diesem Geraet gespeichert."));
    v.append(c);
    const t = el("div", "card");
    t.append(el("h3", "", "Gemeinsame Ansicht fuers Team"), el("p", "sub", "Zurzeit hat jedes Geraet seinen eigenen Verlauf. Eine gemeinsame Ansicht fuer alle Mitarbeiter braucht einen Server mit Login (EU-Hosting, Auftragsverarbeitung). Das ist der naechste Ausbauschritt, kein Knopf in dieser Seite."));
    v.append(t);
  }

  $("q").addEventListener("input", () => { view = "start"; drawSide(); draw(); });
  $("q").addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const q = norm($("q").value.trim()); if (!q) return;
    const c = window.COUNTRIES.find(x => norm(x.n).includes(q) || x.i.toLowerCase() === q || x.a.toLowerCase() === q);
    if (c) { $("q").value = ""; go("land", c.a); }
  });
  drawSide(); draw();
})();
