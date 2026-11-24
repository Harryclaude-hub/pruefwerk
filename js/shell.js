/* Pruefwerk Huelle: Kopfzeile mit Suche, Seitenleiste, Tableiste am Handy, Profil-Blatt.
   Nur Bedienung und Darstellung. Die Pruefungen selbst stehen in app.js, mrz.js, forensics.js, ocr.js. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const I = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    flag: '<path d="M5.5 21V4"/><path d="M5.5 4.5h11.5l-2 3.75 2 3.75H5.5"/>',
    star: '<path d="m12 3.6 2.55 5.2 5.75.83-4.16 4.05.98 5.72L12 16.7l-5.12 2.7.98-5.72L3.7 9.63l5.75-.83Z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    scan: '<path d="M4 8.5V6.5a2.5 2.5 0 0 1 2.5-2.5h2M15.5 4h2A2.5 2.5 0 0 1 20 6.5v2M20 15.5v2a2.5 2.5 0 0 1-2.5 2.5h-2M8.5 20h-2A2.5 2.5 0 0 1 4 17.5v-2"/><rect x="7.5" y="8.5" width="9" height="7" rx="1.2"/><path d="M10 13h4"/>',
    compare: '<rect x="3.5" y="5" width="7.5" height="14" rx="1.6"/><rect x="13" y="5" width="7.5" height="14" rx="1.6"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.01"/>',
    person: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    sidebar: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.6"/><path d="M9.5 4.5v15"/>',
    panel: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.6"/><path d="M14.5 4.5v15"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    chev: '<path d="m9.5 6 6 6-6 6"/>',
    back: '<path d="m14.5 6-6 6 6 6"/>',
    expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
    shrink: '<path d="M19.5 10H14V4.5M4.5 14H10v5.5M14 10l6-6M10 14l-6 6"/>',
    ext: '<path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M18 14v3.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 4 17.5v-9A2.5 2.5 0 0 1 6.5 6H10"/>',
    download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/>',
    trash: '<path d="M4.5 7h15M9.8 7V4.6h4.4V7M6.6 7l.9 12.4h9l.9-12.4"/>',
    passport: '<rect x="5" y="3.5" width="14" height="17" rx="2.2"/><circle cx="12" cy="10.5" r="3"/><path d="M9 16.2h6"/>',
    id: '<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><rect x="6" y="9" width="4.5" height="5.5" rx=".9"/><path d="M13.2 10.2h4.8M13.2 13.4h3.2"/>',
    permit: '<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="M3 9.6h18"/><circle cx="15.6" cy="14.1" r="2"/><path d="M6.5 14h4"/>',
    visa: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v2a2.5 2.5 0 0 0 0 5v2a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-2a2.5 2.5 0 0 0 0-5Z"/><path d="M9 10h6M9 14h4"/>',
    license: '<path d="M5 15.5v-3.2l1.9-4.3a1.5 1.5 0 0 1 1.4-.9h7.4a1.5 1.5 0 0 1 1.4.9l1.9 4.3v3.2Z"/><path d="M5 12.3h14M6.5 15.5v2M17.5 15.5v2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    doc: '<path d="M7 3.5h6.5L18 8v12.5H7Z"/><path d="M13.5 3.5V8H18M9.5 12.5h6M9.5 16h4"/>'
  };
  function icon(n, c) {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true"); s.setAttribute("class", "ic" + (c ? " " + c : ""));
    s.innerHTML = I[n] || ""; return s;
  }
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt !== undefined) e.textContent = txt; return e; };
  const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
  const page = document.body.getAttribute("data-page") || "";
  const onIndex = page === "laender";
  const readJSON = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } };
  const initials = n => { const p = String(n || "").trim().split(/\s+/).filter(Boolean); return p.length ? (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() : ""; };
  function avatar(p, c) {
    const a = el("span", "avatar " + (c || "") + " av-" + p.color);
    const t = initials(p.name); if (t) a.textContent = t; else a.append(icon("person"));
    return a;
  }
  function btnIcon(name, label, c) {
    const b = el("button", "iconbtn" + (c ? " " + c : "")); b.type = "button";
    b.setAttribute("aria-label", label); b.title = label; b.append(icon(name)); return b;
  }

  /* ---------- Navigation ---------- */
  const NAV = [
    ["Arbeiten", [["laender", "Länder", "flag", "index.html#laender"], ["fav", "Favoriten", "star", "index.html#favoriten"], ["hist", "Verlauf", "clock", "index.html#verlauf"]]],
    ["Werkzeuge", [["pruefen", "Ausweis prüfen", "scan", "pruefen.html"], ["werkbank", "Werkbank", "compare", "vergleich.html"]]],
    ["Hilfe", [["info", "Was wird geprüft", "info", "info.html"]]]
  ];
  const TABS = [["laender", "Länder", "flag", "index.html#laender"], ["fav", "Favoriten", "star", "index.html#favoriten"], ["pruefen", "Prüfen", "scan", "pruefen.html"], ["werkbank", "Werkbank", "compare", "vergleich.html"], ["hist", "Verlauf", "clock", "index.html#verlauf"]];
  function current() {
    if (!onIndex) return page;
    const h = location.hash.replace("#", "");
    return h === "favoriten" ? "fav" : h === "verlauf" ? "hist" : "laender";
  }
  function counts() {
    const fav = readJSON("pw_fav", []), hist = readJSON("pw_hist", []);
    return { fav: Array.isArray(fav) ? fav.length : 0, hist: Array.isArray(hist) ? hist.length : 0 };
  }
  function navLink(k, l, ic, href, cls) {
    const a = el("a", cls); a.href = href; a.dataset.k = k;
    a.append(icon(ic), el("span", "lbl", l));
    if (cls === "sb") { const n = el("span", "cnt"); n.dataset.cnt = k; a.append(n); a.title = l; }
    if (onIndex && href.startsWith("index.html#")) a.addEventListener("click", e => { e.preventDefault(); location.hash = href.split("#")[1]; });
    return a;
  }
  function syncNav() {
    const c = current(), n = counts();
    document.querySelectorAll(".sb[data-k], .tb[data-k]").forEach(a => {
      const on = a.dataset.k === c; a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.querySelectorAll("[data-cnt]").forEach(s => { const v = n[s.dataset.cnt]; s.textContent = v ? String(v) : ""; });
  }

  /* ---------- Kopfzeile ---------- */
  const head = document.getElementById("pw-head");
  head.classList.add("top");
  const left = el("div", "h-left");
  const tog = btnIcon("sidebar", "Seitenleiste ein- oder ausklappen", "h-side");
  tog.addEventListener("click", () => { const p = PWP.active(); PWP.update({ side: p.side === "open" ? "rail" : "open" }); });
  const brand = el("a", "brand"); brand.href = "index.html"; brand.setAttribute("aria-label", "Prüfwerk Startseite");
  const mark = el("img", "mark"); mark.src = "icons/zeichen.svg"; mark.alt = ""; mark.width = 30; mark.height = 30;
  const word = el("span", "word"); word.append(el("span", "w1", "Prüf"), el("span", "w2", "werk"));
  brand.append(mark, word); left.append(tog, brand);

  const sbox = el("div", "search"); sbox.setAttribute("role", "search");
  const lab = el("label", "sr", "Land oder Bereich suchen"); lab.setAttribute("for", "q");
  const q = el("input"); q.id = "q"; q.type = "search"; q.autocomplete = "off"; q.spellcheck = false;
  q.placeholder = "Land, ISO- oder MRZ-Code suchen";
  q.setAttribute("role", "combobox"); q.setAttribute("aria-expanded", "false"); q.setAttribute("aria-controls", "sres"); q.setAttribute("aria-autocomplete", "list");
  const kbd = el("kbd", "kbd", /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Strg K");
  const clr = btnIcon("x", "Suche leeren", "s-clear"); clr.hidden = true;
  const res = el("div", "sres"); res.id = "sres"; res.setAttribute("role", "listbox"); res.setAttribute("aria-label", "Suchergebnisse"); res.hidden = true;
  sbox.append(lab, icon("search", "s-ic"), q, kbd, clr, res);

  const right = el("div", "h-right"); right.id = "pw-actions";
  const go = el("a", "btn primary h-go"); go.href = "pruefen.html"; go.append(icon("scan"), el("span", "", "Ausweis prüfen"));
  if (page === "pruefen") go.hidden = true;
  const me = el("button", "h-me"); me.type = "button"; me.setAttribute("aria-label", "Profil und Anzeige"); me.title = "Profil und Anzeige";
  right.append(go, me);
  head.append(left, sbox, right);

  /* ---------- Seitenleiste und Tableiste ---------- */
  const side = document.getElementById("side");
  side.setAttribute("aria-label", "Bereiche");
  NAV.forEach(([t, items]) => {
    const g = el("div", "sgroup"); g.append(el("p", "shead", t));
    items.forEach(([k, l, ic, h]) => g.append(navLink(k, l, ic, h, "sb")));
    side.append(g);
  });
  const sme = el("button", "sme"); sme.type = "button"; side.append(sme);
  const tabs = el("nav", "pw-tabs"); tabs.setAttribute("aria-label", "Bereiche");
  TABS.forEach(([k, l, ic, h]) => tabs.append(navLink(k, l, ic, h, "tb")));
  document.body.append(tabs);

  function drawMe() {
    const p = PWP.active();
    me.replaceChildren(avatar(p));
    sme.replaceChildren(avatar(p), Object.assign(el("span", "sme-t"), {}));
    const t = sme.querySelector(".sme-t"); t.append(el("b", "", p.name || "Profil anlegen"), el("span", "", p.role || "Profil und Anzeige"));
    sme.title = "Profil und Anzeige"; sme.setAttribute("aria-label", "Profil und Anzeige: " + (p.name || "noch ohne Namen"));
  }

  /* ---------- Suche ---------- */
  const PAGES = [["Ausweis prüfen", "pruefen.html", "scan", "pruefen pruefung ausweis pass check"], ["Werkbank", "vergleich.html", "compare", "werkbank vergleich muster prado"], ["Verlauf", "index.html#verlauf", "clock", "verlauf historie protokoll csv"], ["Favoriten", "index.html#favoriten", "star", "favoriten merken"], ["Was wird geprüft", "info.html", "info", "info hilfe pruefziffer mrz"], ["Profil und Anzeige", "#profil", "person", "profil anzeige dunkel hell kontrast einstellungen"]];
  let hits = [], act = -1;
  const C = () => window.COUNTRIES || [];
  const flagImg = (a, w) => { const i = el("img", "flag"); i.src = "flags/" + a.toLowerCase() + ".svg"; i.alt = ""; i.width = w; i.height = Math.round(w * .75); i.loading = "lazy"; return i; };
  function score(c, t) {
    const n = norm(c.n), code = c.c.replace(/</g, "").toLowerCase();
    if (c.a.toLowerCase() === t || c.i.toLowerCase() === t || code === t) return 0;
    if (n.startsWith(t)) return 1;
    if (n.split(/[\s-]+/).some(w => w.startsWith(t))) return 2;
    if (n.includes(t)) return 3;
    return 9;
  }
  function openCountry(a) {
    remember(a); closeRes(); q.value = ""; clr.hidden = true;
    if (window.PW && typeof window.PW.openCountry === "function") window.PW.openCountry(a);
    else location.href = "index.html?land=" + encodeURIComponent(a);
  }
  function remember(a) {
    let r = readJSON("pw_recent", []); if (!Array.isArray(r)) r = [];
    r = [a].concat(r.filter(x => x !== a && typeof x === "string")).slice(0, 6);
    try { localStorage.setItem("pw_recent", JSON.stringify(r)); } catch (e) {}
  }
  function row(kind, data, i) {
    const o = el("div", "sr-row"); o.id = "sr-" + i; o.setAttribute("role", "option"); o.setAttribute("aria-selected", "false");
    if (kind === "c") {
      o.append(flagImg(data.a, 28), el("span", "sr-n", data.n), el("span", "sr-c", data.c.replace(/</g, "")));
    } else {
      const ic = el("span", "sr-ic"); ic.append(icon(data[2])); o.append(ic, el("span", "sr-n", data[0]), el("span", "sr-c", "Bereich"));
    }
    o.addEventListener("mousedown", e => e.preventDefault());
    o.addEventListener("click", () => pick(i));
    return o;
  }
  function section(t) { const h = el("div", "sr-h", t); h.setAttribute("role", "presentation"); return h; }
  function render() {
    const t = norm(q.value.trim());
    hits = []; res.replaceChildren();
    if (!t) {
      const rec = readJSON("pw_recent", []), fav = readJSON("pw_fav", []);
      const r = (Array.isArray(rec) ? rec : []).map(a => C().find(c => c.a === a)).filter(Boolean);
      const f = (Array.isArray(fav) ? fav : []).map(a => C().find(c => c.a === a)).filter(c => c && !r.includes(c)).slice(0, 6);
      if (r.length) { res.append(section("Zuletzt geöffnet")); r.forEach(c => { hits.push(["c", c]); res.append(row("c", c, hits.length - 1)); }); }
      if (f.length) { res.append(section("Favoriten")); f.forEach(c => { hits.push(["c", c]); res.append(row("c", c, hits.length - 1)); }); }
      if (!hits.length) res.append(el("p", "sr-empty", "Tippe einen Ländernamen, zum Beispiel Österreich, oder einen Code wie AUT, AT oder D."));
    } else {
      const cs = C().map(c => [score(c, t), c]).filter(x => x[0] < 9).sort((a, b) => a[0] - b[0] || a[1].n.localeCompare(b[1].n, "de")).slice(0, 8).map(x => x[1]);
      const ps = PAGES.filter(p => norm(p[0]).includes(t) || p[3].includes(t)).slice(0, 3);
      if (cs.length) { res.append(section("Länder")); cs.forEach(c => { hits.push(["c", c]); res.append(row("c", c, hits.length - 1)); }); }
      if (ps.length) { res.append(section("Bereiche")); ps.forEach(p => { hits.push(["p", p]); res.append(row("p", p, hits.length - 1)); }); }
      if (!hits.length) res.append(el("p", "sr-empty", "Nichts gefunden für „" + q.value.trim().slice(0, 40) + "“. Versuch es mit dem deutschen Namen oder dem ISO-Code."));
    }
    const foot = el("div", "sr-foot"); foot.append(el("span", "", "↑ ↓ wählen"), el("span", "", "Enter öffnen"), el("span", "", "Esc schließen"));
    res.append(foot);
    act = hits.length && t ? 0 : -1; mark_();
    res.hidden = false; q.setAttribute("aria-expanded", "true"); sbox.classList.add("open");
  }
  function mark_() {
    res.querySelectorAll(".sr-row").forEach((r, i) => { const on = i === act; r.setAttribute("aria-selected", String(on)); r.classList.toggle("act", on); if (on) r.scrollIntoView({ block: "nearest" }); });
    if (act >= 0) q.setAttribute("aria-activedescendant", "sr-" + act); else q.removeAttribute("aria-activedescendant");
  }
  function pick(i) {
    const h = hits[i]; if (!h) return;
    if (h[0] === "c") openCountry(h[1].a);
    else { closeRes(); q.value = ""; clr.hidden = true; q.blur(); if (h[1][1] === "#profil") openProfile(); else location.href = h[1][1]; }
  }
  function closeRes() { res.hidden = true; q.setAttribute("aria-expanded", "false"); q.removeAttribute("aria-activedescendant"); sbox.classList.remove("open"); }
  q.addEventListener("focus", render);
  q.addEventListener("input", () => { clr.hidden = !q.value; render(); });
  q.addEventListener("blur", () => setTimeout(closeRes, 120));
  q.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); if (hits.length) { act = (act + 1) % hits.length; mark_(); } }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (hits.length) { act = (act - 1 + hits.length) % hits.length; mark_(); } }
    else if (e.key === "Enter") { e.preventDefault(); pick(act >= 0 ? act : 0); }
    else if (e.key === "Escape") { if (q.value) { q.value = ""; clr.hidden = true; render(); } else { closeRes(); q.blur(); } }
  });
  clr.addEventListener("mousedown", e => e.preventDefault());
  clr.addEventListener("click", () => { q.value = ""; clr.hidden = true; q.focus(); render(); });
  document.addEventListener("keydown", e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) { e.preventDefault(); q.focus(); q.select(); }
    else if (e.key === "/" && !typing && !document.querySelector("dialog[open]")) { e.preventDefault(); q.focus(); }
  });

  /* ---------- Profil-Blatt ---------- */
  const dlg = el("dialog", "sheet"); dlg.id = "profil"; dlg.setAttribute("aria-labelledby", "pf-t");
  document.body.append(dlg);
  function seg(name, label, opts, val, on) {
    const f = el("fieldset", "seg-f"); f.append(el("legend", "", label));
    const s = el("div", "seg");
    opts.forEach(([v, l]) => {
      const id = "sg-" + name + "-" + v, i = el("input"); i.type = "radio"; i.name = name; i.id = id; i.value = v; i.checked = v === val;
      i.addEventListener("change", () => on(v));
      const lb = el("label", "", l); lb.setAttribute("for", id); s.append(i, lb);
    });
    f.append(s); return f;
  }
  function drawProfile() {
    const s = PWP.load(), p = s.list.find(x => x.id === s.active);
    dlg.replaceChildren();
    const bar = el("div", "sheet-bar"); bar.append(el("h2", "", "Profil und Anzeige"));
    bar.querySelector("h2").id = "pf-t";
    const done = el("button", "btn primary sm", "Fertig"); done.type = "button"; done.addEventListener("click", () => dlg.close());
    bar.append(done); dlg.append(bar);
    const body = el("div", "sheet-body"); dlg.append(body);

    const who = el("section", "grp");
    const top = el("div", "pf-top"); top.append(avatar(p, "lg"));
    const fl = el("div", "pf-fields");
    const l1 = el("label", "", "Name"); l1.setAttribute("for", "pf-name");
    const n = el("input"); n.id = "pf-name"; n.maxLength = 60; n.autocomplete = "off"; n.value = p.name; n.placeholder = "Vor- und Nachname";
    const l2 = el("label", "", "Rolle oder Abteilung (freiwillig)"); l2.setAttribute("for", "pf-role");
    const r = el("input"); r.id = "pf-role"; r.maxLength = 60; r.autocomplete = "off"; r.value = p.role; r.placeholder = "zum Beispiel Kundenservice";
    n.addEventListener("input", () => { PWP.update({ name: n.value }); top.firstChild.replaceWith(avatar(PWP.active(), "lg")); drawMe(); drawList(); });
    r.addEventListener("input", () => { PWP.update({ role: r.value }); drawMe(); });
    fl.append(l1, n, l2, r); top.append(fl); who.append(top);
    const cols = el("div", "swatches"); cols.setAttribute("role", "radiogroup"); cols.setAttribute("aria-label", "Farbe des Profilbilds");
    PWP.COLORS.forEach(c => {
      const b = el("button", "sw av-" + c); b.type = "button"; b.setAttribute("role", "radio"); b.setAttribute("aria-checked", String(c === p.color)); b.setAttribute("aria-label", "Farbe " + c);
      b.addEventListener("click", () => { PWP.update({ color: c }); drawProfile(); drawMe(); }); cols.append(b);
    });
    who.append(cols);
    who.append(el("p", "foot", "Der Name steht in jeder Prüfung als Prüfer/in und im Verlauf. Kein Login: das Profil liegt nur in diesem Browser."));
    body.append(who);

    body.append(el("h3", "grp-t", "Anzeige"));
    const disp = el("section", "grp");
    disp.append(seg("theme", "Erscheinungsbild", [["system", "Automatisch"], ["light", "Hell"], ["dark", "Dunkel"]], p.theme, v => PWP.update({ theme: v })));
    disp.append(seg("contrast", "Kontrast", [["system", "Automatisch"], ["normal", "Standard"], ["more", "Erhöht"]], p.contrast, v => PWP.update({ contrast: v })));
    disp.append(seg("text", "Schriftgröße", [["normal", "Standard"], ["large", "Groß"]], p.text, v => PWP.update({ text: v })));
    disp.append(seg("motion", "Bewegung", [["system", "Automatisch"], ["reduce", "Reduziert"]], p.motion, v => PWP.update({ motion: v })));
    disp.append(seg("side", "Seitenleiste", [["open", "Ausgeklappt"], ["rail", "Nur Symbole"]], p.side, v => PWP.update({ side: v })));
    disp.append(el("p", "foot", "Automatisch folgt den Einstellungen von Windows, macOS, iOS oder Android. Erhöhter Kontrast macht Texte, Linien und Fokusrahmen kräftiger."));
    body.append(disp);

    body.append(el("h3", "grp-t", "Profile auf diesem Gerät"));
    const lst = el("section", "grp plist"); lst.id = "pf-list"; body.append(lst); drawList();

    body.append(el("h3", "grp-t", "Team"));
    const team = el("section", "grp");
    team.append(el("p", "foot nomargin", "Jedes Gerät hat zurzeit seinen eigenen Verlauf. Eine gemeinsame Ansicht für alle Mitarbeiter braucht einen Server mit Login (EU-Hosting, Auftragsverarbeitung). Das ist ein eigener Ausbauschritt."));
    const inf = el("a", "rowlink"); inf.href = "info.html"; inf.append(icon("info"), el("span", "", "Was wird geprüft, und wie sicher ist das?"), icon("chev", "chev"));
    team.append(inf); body.append(team);
  }
  function drawList() {
    const lst = document.getElementById("pf-list"); if (!lst) return;
    const s = PWP.load(); lst.replaceChildren();
    s.list.forEach(p => {
      const rw = el("div", "prow" + (p.id === s.active ? " on" : ""));
      const b = el("button", "prow-b"); b.type = "button"; b.append(avatar(p), el("span", "pn", p.name || "Ohne Namen"));
      if (p.id === s.active) { b.append(icon("check", "pchk")); b.setAttribute("aria-current", "true"); }
      b.addEventListener("click", () => { PWP.use(p.id); drawProfile(); drawMe(); });
      rw.append(b);
      if (s.list.length > 1) {
        const d = btnIcon("trash", "Profil löschen: " + (p.name || "ohne Namen"), "danger");
        d.addEventListener("click", () => { if (confirm("Profil „" + (p.name || "ohne Namen") + "“ von diesem Gerät löschen? Der Verlauf bleibt erhalten.")) { PWP.remove(p.id); drawProfile(); drawMe(); } });
        rw.append(d);
      }
      lst.append(rw);
    });
    const add = el("button", "prow-add"); add.type = "button"; add.append(icon("plus"), el("span", "", "Neues Profil"));
    add.addEventListener("click", () => { if (PWP.add("")) { drawProfile(); drawMe(); const n = document.getElementById("pf-name"); if (n) n.focus(); } });
    lst.append(add);
  }
  function openProfile() { drawProfile(); if (!dlg.open) dlg.showModal(); }
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  me.addEventListener("click", openProfile); sme.addEventListener("click", openProfile);
  document.addEventListener("pw:profile", () => { drawMe(); syncNav(); });

  window.addEventListener("hashchange", syncNav);
  window.addEventListener("storage", syncNav);
  drawMe(); syncNav();
  if (location.hash === "#profil") openProfile();

  window.PWSHELL = { icon, syncNav, openProfile, remember, flagImg };
})();
