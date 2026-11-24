/* Kommandozentrum: Laender links, Arbeitsflaeche rechts (Land, Verlauf, Werkzeuge). Alles lokal im Browser. */
(function () {
  const $ = id => document.getElementById(id);
  const FAV = "pw_fav", SEL = "pw_sel";
  const GROUPS = [["fav", "Favoriten"], ["EU", "EU"], ["Europa (ausserhalb EU)", "Europa weitere"], ["Nordamerika", "Nordamerika"], ["Suedasien", "Indien, Bangladesch, Pakistan"], ["Weitere", "Weitere Laender"], ["alle", "Alle"]];
  const DOCS = [["passport", "Reisepass"], ["id", "ID-Karte"], ["permit", "Aufenthaltstitel"], ["visa", "Visum"], ["license", "Fuehrerschein"]];
  const DOCN = { passport: "Reisepass", id: "ID-Karte", permit: "Aufenthaltstitel", visa: "Visum", license: "Fuehrerschein" };
  const TOP = { ok: ["Unauffaellig", "ok"], warn: ["Pruefen", "warn"], fail: ["Auffaellig", "fail"] };
  const PRADO = "https://www.consilium.europa.eu/prado/en/prado-start-page.html";
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt !== undefined) e.textContent = txt; return e; };
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
  const flag = (a, w) => { const i = el("img", "flag"); i.src = "flags/" + a.toLowerCase() + ".svg"; i.alt = ""; i.width = w || 28; i.height = Math.round((w || 28) * 0.75); i.loading = "lazy"; return i; };
  let fav = []; try { fav = JSON.parse(localStorage.getItem(FAV) || "[]").filter(x => typeof x === "string").slice(0, 300); } catch (e) {}
  let selA = null; try { selA = localStorage.getItem(SEL); } catch (e) {}
  let group = fav.length ? "fav" : "EU", tab = "land";
  const byA = a => window.COUNTRIES.find(c => c.a === a);
  const saveFav = () => { try { localStorage.setItem(FAV, JSON.stringify(fav)); } catch (e) {} };

  /* ---------- links: Laenderliste ---------- */
  function drawList() {
    const q = norm($("q").value.trim());
    const list = window.COUNTRIES.filter(c => {
      if (q) return norm(c.n).includes(q) || c.i.toLowerCase() === q || c.a.toLowerCase() === q;
      if (group === "fav") return fav.includes(c.a);
      if (group === "alle") return true;
      return c.r === group;
    });
    const ul = $("list"); ul.replaceChildren();
    list.forEach(c => {
      const li = el("li", "crow" + (c.a === selA ? " on" : ""));
      const b = el("button", "cbtn"); b.type = "button"; b.append(flag(c.a, 24), el("span", "cn", c.n), el("span", "code", c.c.replace(/</g, "_")));
      b.addEventListener("click", () => { selA = c.a; try { localStorage.setItem(SEL, c.a); } catch (e) {} setTab("land"); drawList(); });
      const s = el("button", "star", fav.includes(c.a) ? "★" : "☆"); s.type = "button";
      s.setAttribute("aria-label", (fav.includes(c.a) ? "Favorit entfernen: " : "Als Favorit merken: ") + c.n);
      s.addEventListener("click", () => { fav = fav.includes(c.a) ? fav.filter(x => x !== c.a) : fav.concat(c.a); saveFav(); drawList(); });
      li.append(b, s); ul.append(li);
    });
    $("count").textContent = list.length + " Treffer" + (group === "fav" && !q && !list.length ? ". Stern bei einem Land druecken, um es hier zu merken." : "");
  }
  (function groups() {
    const g = $("grp");
    GROUPS.forEach(([k, l]) => { const o = el("option", "", l); o.value = k; g.append(o); });
    g.value = group;
    g.addEventListener("change", () => { group = g.value; drawList(); });
    $("q").addEventListener("input", drawList);
  })();

  /* ---------- rechts: Tabs ---------- */
  function setTab(t) {
    tab = t;
    ["land", "hist", "tools"].forEach(k => { $("p-" + k).hidden = k !== t; });
    [...$("tabs").children].forEach(b => b.setAttribute("aria-selected", String(b.dataset.k === t)));
    if (t === "land") drawLand(); if (t === "hist") drawHist(); if (t === "tools") drawTools();
  }
  function tabs() {
    const box = $("tabs"); box.replaceChildren();
    [["land", "Land"], ["hist", "Verlauf (" + window.HIST.list().length + ")"], ["tools", "Werkzeuge"]].forEach(([k, l]) => {
      const b = el("button", "", l); b.type = "button"; b.dataset.k = k; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", String(k === tab));
      b.addEventListener("click", () => setTab(k)); box.append(b);
    });
  }

  function drawLand() {
    const p = $("p-land"); p.replaceChildren();
    const c = selA && byA(selA);
    if (!c) {
      p.append(el("h2", "", "Willkommen im Kommandozentrum"), el("p", "sub", "Links ein Land waehlen. Dann siehst du hier die Dokumentarten, die letzten Pruefungen und den Weg zum amtlichen Vergleich."));
      const t = el("div", "tiles");
      [["pruefen.html", "Ausweis pruefen", "Foto oder Daten, Pruefziffern, Bericht."], ["vergleich.html", "Vergleichs-Werkbank", "Kundenbild neben amtlichem Muster, Schrift und Foto zoomen."], ["info.html", "Info", "Was geprueft wird und wo die Grenzen sind."]].forEach(([h, a, b]) => {
        const l = el("a", "tile"); l.href = h; l.append(el("b", "", a), el("span", "", b)); t.append(l);
      });
      p.append(t); return;
    }
    const head = el("div", "lhead"); head.append(flag(c.a, 56), el("h2", "", c.n), el("span", "code", "MRZ-Code " + c.c.replace(/</g, "_") + " / " + c.i));
    p.append(head);
    p.append(el("h3", "", "Dokument pruefen"));
    const row = el("div", "docs");
    DOCS.forEach(([k, l]) => { const a = el("a", "docbtn big", l); a.href = "pruefen.html?land=" + encodeURIComponent(c.i) + "&art=" + k; row.append(a); });
    p.append(row);
    if (c.noIdMrz) p.append(el("p", "note", "Hinweis: Eine nationale ID-Karte mit MRZ ist hier ueblicherweise nicht vorhanden. Der Reisepass ist der verlaesslichere Nachweis."));
    p.append(el("h3", "", "Vergleich mit amtlichem Muster"));
    const cmp = el("p", "sub"); cmp.append("Mitarbeiter holen das amtliche Muster beim EU-Register PRADO (Abbildung und Sicherheitsmerkmale je Dokument) und legen es in der Werkbank neben das Kundenbild. ");
    const pr = el("a", "docbtn", "PRADO oeffnen"); pr.href = PRADO; pr.target = "_blank"; pr.rel = "noopener noreferrer";
    const wb = el("a", "docbtn", "Vergleichs-Werkbank"); wb.href = "vergleich.html";
    cmp.append(pr, " ", wb); p.append(cmp);
    const last = window.HIST.list().filter(h => h.a === c.a).slice(0, 5);
    p.append(el("h3", "", "Letzte Pruefungen dieses Landes"));
    if (!last.length) p.append(el("p", "sub", "Noch keine."));
    else p.append(table(last, false));
  }

  /* ---------- Verlauf ---------- */
  function table(rows, del) {
    const t = el("table", "ht"), hd = el("tr");
    ["Zeit", "Fall", "Land", "Dokument", "Ergebnis", "Entscheidung", "Pruefer/in"].concat(del ? [""] : []).forEach(x => hd.append(el("th", "", x)));
    t.append(hd);
    rows.forEach(r => {
      const tr = el("tr"), tp = TOP[r.top] || TOP.ok;
      const c1 = el("td", "", (r.t || "").slice(0, 16).replace("T", " "));
      const c3 = el("td"); if (r.a) c3.append(flag(r.a, 20), " "); c3.append(String(r.cn || ""));
      const c5 = el("td"); c5.append(el("span", "tag " + tp[1], tp[0] + (r.fail || r.warn ? " (" + (r.fail || 0) + "/" + (r.warn || 0) + ")" : "")));
      tr.append(c1, el("td", "", String(r.caseId || "")), c3, el("td", "", DOCN[r.doc] || ""), c5, el("td", "", String(r.dec || "offen")), el("td", "", String(r.who || "")));
      if (del) { const d = el("td"), b = el("button", "star", "✕"); b.type = "button"; b.setAttribute("aria-label", "Eintrag loeschen"); b.addEventListener("click", () => { window.HIST.remove(r.id); tabs(); drawHist(); }); d.append(b); tr.append(d); }
      t.append(tr);
    });
    return t;
  }
  const csvCell = v => { let s = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  function drawHist() {
    const p = $("p-hist"); p.replaceChildren();
    p.append(el("h2", "", "Verlauf"));
    p.append(el("p", "sub", "Nur auf diesem Geraet gespeichert, ohne Bilder, Namen und Ausweisnummern. Bis zu 300 Eintraege."));
    const all = window.HIST.list();
    const bar = el("div", "bar"), only = el("label", "chk"), cb = el("input"); cb.type = "checkbox"; cb.checked = !!selA;
    only.append(cb, " nur gewaehltes Land" + (selA && byA(selA) ? " (" + byA(selA).n + ")" : ""));
    const ex = el("button", "btn alt", "Als CSV speichern"); ex.type = "button";
    const cl = el("button", "btn alt", "Verlauf leeren"); cl.type = "button";
    bar.append(only, ex, cl); p.append(bar);
    const box = el("div"); p.append(box);
    const cur = () => (cb.checked && selA ? all.filter(h => h.a === selA) : all);
    const rd = () => { box.replaceChildren(); const rs = cur(); box.append(rs.length ? table(rs, true) : el("p", "sub", "Keine Eintraege.")); };
    cb.addEventListener("change", rd);
    ex.addEventListener("click", () => {
      const rows = [["Zeit", "Fall", "Land", "Dokument", "Ergebnis", "Auffaellig", "Pruefen", "Entscheidung", "Pruefer"]].concat(cur().map(r => [r.t, r.caseId, r.cn, DOCN[r.doc] || r.doc, r.top, r.fail, r.warn, r.dec, r.who]));
      const blob = new Blob(["﻿" + rows.map(r => r.map(csvCell).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
      const a = el("a"); a.href = URL.createObjectURL(blob); a.download = "pruefwerk-verlauf.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    cl.addEventListener("click", () => { if (confirm("Den gesamten Verlauf auf diesem Geraet loeschen?")) { window.HIST.clear(); tabs(); drawHist(); } });
    rd();
  }

  function drawTools() {
    const p = $("p-tools"); p.replaceChildren(); p.append(el("h2", "", "Werkzeuge"));
    const t = el("div", "tiles");
    [["pruefen.html", "Ausweis pruefen", "Foto oder Daten, Pruefziffern, Datumslogik, Bildhinweise, manuelle Checkliste."], ["vergleich.html", "Vergleichs-Werkbank", "Kundenbild neben amtlichem Muster: gleichzeitig zoomen, ueberblenden, Differenz, Ausschnitte fuer Schriftvergleich."], ["info.html", "Info: was wird geprueft", "Erklaerung jeder Pruefung und der Grenzen."]].forEach(([h, a, b]) => {
      const l = el("a", "tile"); l.href = h; l.append(el("b", "", a), el("span", "", b)); t.append(l);
    });
    p.append(t);
  }

  tabs(); setTab("land"); drawList();
})();
