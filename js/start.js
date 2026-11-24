/* Pruefwerk Startseite: Laender, Favoriten, Verlauf und das Laender-Panel rechts. Alles lokal im Browser.
   Gespeichert werden wie bisher nur pw_fav (Favoriten) und der Verlauf aus hist.js. */
(function () {
  const $ = id => document.getElementById(id);
  const S = window.PWSHELL;
  const K = { fav: "pw_fav" };
  const GROUPS = [["EU", "EU"], ["Europa (ausserhalb EU)", "Europa"], ["Nordamerika", "Nordamerika"], ["Suedasien", "Südasien"], ["Weitere", "Weitere"], ["alle", "Alle"]];
  const DOCS = [["passport", "Reisepass", "MRZ mit Prüfziffern", "passport"], ["id", "ID-Karte", "MRZ mit Prüfziffern", "id"], ["permit", "Aufenthaltstitel", "MRZ mit Prüfziffern", "permit"], ["visa", "Visum", "MRZ mit Prüfziffern", "visa"], ["license", "Führerschein", "ohne MRZ, nur Daten und Bild", "license"]];
  const DOCN = { passport: "Reisepass", id: "ID-Karte", permit: "Aufenthaltstitel", visa: "Visum", license: "Führerschein" };
  const REG = { "EU": "Europäische Union", "Europa (ausserhalb EU)": "Europa außerhalb der EU", "Nordamerika": "Nordamerika", "Suedasien": "Südasien", "Weitere": "Weitere Länder und Gebiete" };
  const TOP = { ok: ["Unauffällig", "ok"], warn: ["Prüfen", "warn"], fail: ["Auffällig", "fail"] };
  const PRADO = "https://www.consilium.europa.eu/prado/en/prado-start-page.html";
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt !== undefined) e.textContent = txt; return e; };
  const flag = (a, w) => S.flagImg(a, w);
  const byA = a => window.COUNTRIES.find(c => c.a === a);
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let fav = []; try { fav = JSON.parse(get(K.fav, "[]")).filter(x => typeof x === "string").slice(0, 300); } catch (e) {}
  const saveFav = () => { set(K.fav, JSON.stringify(fav)); S.syncNav(); };
  const toggleFav = a => { fav = fav.includes(a) ? fav.filter(x => x !== a) : fav.concat(a); saveFav(); draw(); drawInsp(); };
  let group = get("pw_group", "EU"); if (!GROUPS.some(g => g[0] === group)) group = "EU";
  let sel = null, full = false;
  const view = () => { const h = location.hash.replace("#", ""); return h === "favoriten" ? "fav" : h === "verlauf" ? "hist" : "laender"; };
  const mobile = () => matchMedia("(max-width: 759px)").matches;

  /* ---------- Bausteine ---------- */
  function countryCard(c) {
    const d = el("div", "ccard" + (c.a === sel ? " on" : "")), b = el("button", "cc-b"); b.type = "button"; b.dataset.a = c.a;
    b.append(flag(c.a, 56), el("span", "cc-n", c.n), el("span", "cc-c", c.c.replace(/</g, "‹")));
    if (c.a === sel) b.setAttribute("aria-current", "true");
    b.addEventListener("click", () => openCountry(c.a));
    const on = fav.includes(c.a), s = el("button", "star" + (on ? " on" : "")); s.type = "button";
    s.setAttribute("aria-pressed", String(on)); s.setAttribute("aria-label", (on ? "Favorit entfernen: " : "Als Favorit merken: ") + c.n);
    s.append(S.icon("star")); s.addEventListener("click", () => toggleFav(c.a));
    d.append(b, s); return d;
  }
  function grid(list, letters) {
    const wrap = el("div", "cwrap");
    if (!letters || list.length < 40) { const g = el("div", "cgrid"); list.forEach(c => g.append(countryCard(c))); wrap.append(g); return wrap; }
    const by = {};
    list.forEach(c => { const L = c.n[0].normalize("NFD")[0].toUpperCase(); (by[L] = by[L] || []).push(c); });
    const keys = Object.keys(by).sort((a, b) => a.localeCompare(b, "de"));
    const jump = el("nav", "az"); jump.setAttribute("aria-label", "Springe zu Buchstabe");
    keys.forEach(L => { const a = el("a", "", L); a.href = "#az-" + L; a.addEventListener("click", e => { e.preventDefault(); const t = $("az-" + L); if (t) t.scrollIntoView({ block: "start" }); }); jump.append(a); });
    wrap.append(jump);
    keys.forEach(L => { const h = el("h3", "az-h", L); h.id = "az-" + L; const g = el("div", "cgrid"); by[L].forEach(c => g.append(countryCard(c))); wrap.append(h, g); });
    return wrap;
  }
  function pageHead(title, sub, extra) {
    const h = el("div", "phead"), t = el("div", "phead-t");
    t.append(el("h1", "", title)); if (sub) t.append(el("p", "lead", sub));
    h.append(t); if (extra) h.append(extra); return h;
  }
  function empty(ic, title, text) {
    const e = el("div", "empty"); const i = el("span", "empty-ic"); i.append(S.icon(ic));
    e.append(i, el("h2", "", title), el("p", "", text)); return e;
  }
  function histTable(rows, del) {
    const box = el("div", "tablebox"), t = el("table", "ht"), th = el("thead"), hd = el("tr");
    ["Zeit", "Fall", "Land", "Dokument", "Ergebnis", "Entscheidung", "Prüfer/in"].concat(del ? [""] : []).forEach(x => { const c = el("th", "", x); c.scope = "col"; hd.append(c); });
    th.append(hd); t.append(th); const tb = el("tbody");
    rows.forEach(r => {
      const tr = el("tr"), tp = TOP[r.top] || TOP.ok, c3 = el("td", "land"), c5 = el("td");
      if (r.a) c3.append(flag(r.a, 20)); c3.append(el("span", "", String(r.cn || "")));
      c5.append(el("span", "tag " + tp[1], tp[0]));
      const t0 = String(r.t || ""), when = t0.length >= 16 ? t0.slice(8, 10) + "." + t0.slice(5, 7) + "." + t0.slice(0, 4) + ", " + t0.slice(11, 16) : t0;
      tr.append(el("td", "num", when), el("td", "", String(r.caseId || "")), c3, el("td", "", DOCN[r.doc] || ""), c5, el("td", "", String(r.dec || "offen")), el("td", "", String(r.who || "")));
      if (del) {
        const d = el("td", "act"), b = el("button", "iconbtn danger"); b.type = "button"; b.setAttribute("aria-label", "Eintrag löschen"); b.title = "Eintrag löschen";
        b.append(S.icon("trash")); b.addEventListener("click", () => { window.HIST.remove(r.id); S.syncNav(); draw(); drawInsp(); }); d.append(b); tr.append(d);
      }
      tb.append(tr);
    });
    t.append(tb); box.append(t); return box;
  }
  const csvCell = v => { let s = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };

  /* ---------- Hauptansicht ---------- */
  function draw() {
    const v = $("view"); v.replaceChildren();
    const w = view();
    if (w === "laender") {
      const list = window.COUNTRIES.filter(c => group === "alle" ? true : c.r === group);
      const segw = el("div", "segbar"); segw.setAttribute("role", "tablist"); segw.setAttribute("aria-label", "Ländergruppe");
      GROUPS.forEach(([k, l]) => {
        const b = el("button", "", l); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", String(k === group));
        b.addEventListener("click", () => { group = k; set("pw_group", k); draw(); }); segw.append(b);
      });
      v.append(pageHead("Länder", list.length + (list.length === 1 ? " Land" : " Länder und Gebiete") + ". Land wählen, dann das Dokument.", panelToggle()));
      v.append(segw, grid(list, true));
    } else if (w === "fav") {
      const list = window.COUNTRIES.filter(c => fav.includes(c.a));
      v.append(pageHead("Favoriten", list.length ? list.length + " gemerkt." : "", panelToggle()));
      v.append(list.length ? grid(list, false) : empty("star", "Noch keine Favoriten", "Tippe bei einem Land auf den Stern. Es erscheint dann hier und oben in der Suche."));
    } else if (w === "hist") {
      const all = window.HIST.list(), bar = el("div", "toolbar");
      const ex = el("button", "btn"), cl = el("button", "btn danger-t"); ex.type = cl.type = "button";
      ex.append(S.icon("download"), el("span", "", "Als CSV speichern")); cl.append(S.icon("trash"), el("span", "", "Verlauf leeren"));
      ex.disabled = cl.disabled = !all.length; bar.append(ex, cl);
      v.append(pageHead("Verlauf", "Nur auf diesem Gerät, ohne Bilder, Namen und Ausweisnummern.", bar));
      v.append(all.length ? histTable(all, true) : empty("clock", "Noch keine Prüfungen", "Jede Prüfung landet hier mit Zeit, Land, Ergebnis und Entscheidung."));
      ex.addEventListener("click", () => {
        const rows = [["Zeit", "Fall", "Land", "Dokument", "Ergebnis", "Auffaellig", "Pruefen", "Entscheidung", "Pruefer"]].concat(all.map(r => [r.t, r.caseId, r.cn, DOCN[r.doc] || r.doc, r.top, r.fail, r.warn, r.dec, r.who]));
        const blob = new Blob(["﻿" + rows.map(r => r.map(csvCell).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
        const a = el("a"); a.href = URL.createObjectURL(blob); a.download = "pruefwerk-verlauf.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });
      cl.addEventListener("click", () => { if (confirm("Den gesamten Verlauf auf diesem Gerät löschen? Das lässt sich nicht rückgängig machen.")) { window.HIST.clear(); S.syncNav(); draw(); drawInsp(); } });
    }
  }
  function panelToggle() {
    if (!sel) return null;
    const c = byA(sel), open = document.documentElement.getAttribute("data-insp") !== "collapsed";
    const b = el("button", "btn ghost"); b.type = "button"; b.append(S.icon("panel"), el("span", "", open ? "Panel einklappen" : c.n + " anzeigen"));
    b.setAttribute("aria-expanded", String(open)); b.setAttribute("aria-controls", "insp");
    b.addEventListener("click", () => setPanel(open ? "collapsed" : "open"));
    return b;
  }

  /* ---------- Laender-Panel rechts ---------- */
  const insp = $("insp");
  function setPanel(state) {
    if (state === "full") { full = true; PWP.update({ insp: "open" }); }
    else { full = false; PWP.update({ insp: state }); }
    drawInsp(); draw();
  }
  function openCountry(a) {
    if (!byA(a)) return;
    sel = a; full = false; S.remember(a);
    const u = new URL(location.href); u.searchParams.set("land", a); history.replaceState(null, "", u);
    if (PWP.active().insp === "collapsed") PWP.update({ insp: "open" });
    draw(); drawInsp();
    const h = insp.querySelector("h2"); if (h) h.focus({ preventScroll: true });
  }
  function closeCountry() {
    const back = sel; sel = null; full = false;
    const u = new URL(location.href); u.searchParams.delete("land"); history.replaceState(null, "", u);
    draw(); drawInsp();
    const b = document.querySelector('.ccard .cc-b[data-a="' + back + '"]'); if (b) b.focus();
  }
  function drawInsp() {
    const r = document.documentElement;
    document.body.classList.toggle("has-insp", !!sel);
    r.setAttribute("data-full", full && sel ? "1" : "0");
    $("view").inert = !!(full && sel) || !!(sel && mobile());
    insp.replaceChildren();
    if (!sel) { insp.hidden = true; return; }
    insp.hidden = false;
    const c = byA(sel), collapsed = r.getAttribute("data-insp") === "collapsed" && !mobile();

    if (collapsed) {
      const b = el("button", "insp-rail"); b.type = "button"; b.setAttribute("aria-label", c.n + " öffnen"); b.title = c.n + " öffnen";
      b.setAttribute("aria-expanded", "false");
      b.append(S.icon("back"), flag(c.a, 32), el("span", "rail-n", c.n));
      b.addEventListener("click", () => setPanel("open")); insp.append(b); return;
    }
    const bar = el("div", "insp-bar");
    const close = el("button", "iconbtn"); close.type = "button";
    close.setAttribute("aria-label", "Panel schließen"); close.title = "Schließen"; close.append(S.icon(mobile() ? "back" : "x"));
    close.addEventListener("click", closeCountry);
    const on = fav.includes(c.a), st = el("button", "iconbtn star" + (on ? " on" : "")); st.type = "button";
    st.setAttribute("aria-pressed", String(on)); st.setAttribute("aria-label", on ? "Favorit entfernen" : "Als Favorit merken"); st.title = st.getAttribute("aria-label");
    st.append(S.icon("star")); st.addEventListener("click", () => toggleFav(c.a));
    const tools = el("div", "insp-tools");
    if (!mobile()) {
      const fx = el("button", "iconbtn"); fx.type = "button"; fx.setAttribute("aria-label", full ? "Auf Panel-Breite verkleinern" : "Auf volle Breite vergrößern"); fx.title = fx.getAttribute("aria-label");
      fx.append(S.icon(full ? "shrink" : "expand")); fx.addEventListener("click", () => setPanel(full ? "open" : "full"));
      const cp = el("button", "iconbtn"); cp.type = "button"; cp.setAttribute("aria-label", "Panel einklappen"); cp.title = "Panel einklappen";
      cp.setAttribute("aria-expanded", "true"); cp.append(S.icon("panel")); cp.addEventListener("click", () => setPanel("collapsed"));
      tools.append(st, fx, cp);
    } else tools.append(st);
    bar.append(close, el("span", "insp-bar-t", c.n), tools);
    insp.append(bar);

    const body = el("div", "insp-body");
    const hero = el("header", "insp-hero");
    const fw = el("div", "insp-flag"); fw.append(flag(c.a, 96));
    const ht = el("div", "insp-ht"); const h2 = el("h2", "", c.n); h2.tabIndex = -1;
    const meta = el("div", "meta");
    [["MRZ", c.c.replace(/</g, "‹")], ["ISO", c.i + " · " + c.a]].forEach(([k, v]) => { const m = el("span", "chip"); m.append(el("span", "chip-k", k), el("span", "chip-v", v)); meta.append(m); });
    ht.append(h2, el("p", "lead", REG[c.r] || ""), meta); hero.append(fw, ht); body.append(hero);

    const docs = el("section", "isec"); docs.append(el("h3", "isec-t", "Dokument prüfen"));
    const dl = el("div", "doclist");
    DOCS.forEach(([k, l, sub, ic]) => {
      const a = el("a", "docrow"); a.href = "pruefen.html?land=" + encodeURIComponent(c.i) + "&art=" + k;
      const i = el("span", "doc-ic"); i.append(S.icon(ic));
      const t = el("span", "doc-t"); t.append(el("b", "", l), el("span", "", k === "id" && c.noIdMrz ? "hier meist ohne MRZ" : sub));
      a.append(i, t, S.icon("chev", "chev")); dl.append(a);
    });
    docs.append(dl);
    if (c.noIdMrz) docs.append(el("p", "note", "Eine nationale ID-Karte mit MRZ ist hier üblicherweise nicht vorhanden. Der Reisepass ist der verlässlichere Nachweis."));

    const cmp = el("section", "isec"); cmp.append(el("h3", "isec-t", "Amtlicher Vergleich"));
    const cl = el("div", "doclist");
    const pr = el("a", "docrow"); pr.href = PRADO; pr.target = "_blank"; pr.rel = "noopener noreferrer";
    const pi = el("span", "doc-ic"); pi.append(S.icon("doc"));
    const pt = el("span", "doc-t"); pt.append(el("b", "", "Muster bei PRADO"), el("span", "", "EU-Register, öffnet in neuem Tab"));
    pr.append(pi, pt, S.icon("ext", "chev"));
    const wb = el("a", "docrow"); wb.href = "vergleich.html";
    const wi = el("span", "doc-ic"); wi.append(S.icon("compare"));
    const wt = el("span", "doc-t"); wt.append(el("b", "", "Werkbank"), el("span", "", "Kundenbild neben amtlichem Muster"));
    wb.append(wi, wt, S.icon("chev", "chev"));
    cl.append(pr, wb); cmp.append(cl);

    const last = window.HIST.list().filter(h => h.a === c.a).slice(0, 5);
    const hs = el("section", "isec wide"); hs.append(el("h3", "isec-t", "Zuletzt geprüft"));
    hs.append(last.length ? histTable(last, false) : el("p", "sub", "Für " + c.n + " gibt es auf diesem Gerät noch keine Prüfung."));

    const cols = el("div", "insp-cols"); cols.append(docs, cmp, hs); body.append(cols);
    insp.append(body);
  }

  window.PW = { openCountry };
  insp.addEventListener("keydown", e => { if (e.key === "Escape" && sel && (full || mobile())) { e.stopPropagation(); full ? setPanel("open") : closeCountry(); } });
  window.addEventListener("hashchange", () => { if (location.hash === "#profil") { S.openProfile(); return; } if (mobile() && sel) { sel = null; } draw(); drawInsp(); window.scrollTo(0, 0); });
  matchMedia("(max-width: 759px)").addEventListener("change", () => { draw(); drawInsp(); });
  document.addEventListener("pw:profile", () => { draw(); drawInsp(); });

  /* Startzustand: Land aus der Adresse (von der Suche auf anderen Seiten) */
  const p = new URLSearchParams(location.search).get("land");
  if (p && byA(p.toUpperCase())) sel = p.toUpperCase();
  draw(); drawInsp();
})();
