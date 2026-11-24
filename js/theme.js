/* Pruefwerk Profile und Anzeige. Laeuft im <head>, setzt Hell/Dunkel, Kontrast, Schrift, Bewegung und
   Seitenleiste, bevor die Seite gezeichnet wird. Nur Darstellung, keine Pruef-Logik. Alles bleibt im Browser. */
(function () {
  const KEY = "pw_profiles";
  const COLORS = ["teal", "blue", "indigo", "orange", "pink", "green", "brown", "gray"];
  const DEF = { name: "", role: "", color: "teal", theme: "system", contrast: "system", text: "normal", motion: "system", side: "open", insp: "open" };
  const ok = {
    theme: ["system", "light", "dark"], contrast: ["system", "normal", "more"], text: ["normal", "large"],
    motion: ["system", "reduce"], side: ["open", "rail"], insp: ["open", "collapsed"], color: COLORS
  };
  const read = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const uid = () => "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function clean(p) {
    const o = Object.assign({}, DEF, p || {});
    for (const k in ok) if (!ok[k].includes(o[k])) o[k] = DEF[k];
    o.name = String(o.name || "").slice(0, 60); o.role = String(o.role || "").slice(0, 60);
    o.id = typeof o.id === "string" && o.id.length < 40 ? o.id : uid();
    return o;
  }
  function load() {
    let s = null;
    try { s = JSON.parse(read(KEY) || "null"); } catch (e) { s = null; }
    if (!s || !Array.isArray(s.list) || !s.list.length) {
      /* Erststart: alten Namen und altes Farbschema uebernehmen */
      const t = read("pw_theme");
      const p = clean({ name: read("pw_who") || "", theme: t === "light" || t === "dark" ? t : "system" });
      s = { active: p.id, list: [p] };
      write(KEY, JSON.stringify(s));
    }
    s.list = s.list.slice(0, 20).map(clean);
    if (!s.list.some(p => p.id === s.active)) s.active = s.list[0].id;
    return s;
  }
  function save(s) {
    write(KEY, JSON.stringify(s));
    const a = s.list.find(p => p.id === s.active);
    if (a) write("pw_who", a.name); /* Pruefer/in-Feld in pruefen.html liest diesen Namen */
  }

  const mq = q => window.matchMedia ? matchMedia(q) : { matches: false, addEventListener() {} };
  const mDark = mq("(prefers-color-scheme: dark)"), mMore = mq("(prefers-contrast: more)"), mCalm = mq("(prefers-reduced-motion: reduce)");
  function apply() {
    const s = load(), p = s.list.find(x => x.id === s.active), r = document.documentElement;
    r.setAttribute("data-theme", p.theme === "system" ? (mDark.matches ? "dark" : "light") : p.theme);
    r.setAttribute("data-contrast", p.contrast === "system" ? (mMore.matches ? "more" : "normal") : p.contrast);
    r.setAttribute("data-text", p.text);
    r.setAttribute("data-motion", p.motion === "reduce" || mCalm.matches ? "reduce" : "normal");
    r.setAttribute("data-side", p.side);
    r.setAttribute("data-insp", p.insp);
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", r.getAttribute("data-theme") === "dark" ? "#0c0c0e" : "#f5f5f7");
    return p;
  }
  [mDark, mMore, mCalm].forEach(m => { try { m.addEventListener("change", apply); } catch (e) {} });

  window.PWP = {
    COLORS,
    load,
    active() { const s = load(); return s.list.find(p => p.id === s.active); },
    update(patch) {
      const s = load(), i = s.list.findIndex(p => p.id === s.active);
      s.list[i] = clean(Object.assign({}, s.list[i], patch)); save(s); apply();
      document.dispatchEvent(new CustomEvent("pw:profile")); return s.list[i];
    },
    add(name) {
      const s = load(), cur = s.list.find(p => p.id === s.active);
      if (s.list.length >= 20) return null;
      const p = clean({ name, color: COLORS[s.list.length % COLORS.length], theme: cur.theme, contrast: cur.contrast, text: cur.text, motion: cur.motion });
      s.list.push(p); s.active = p.id; save(s); apply(); document.dispatchEvent(new CustomEvent("pw:profile")); return p;
    },
    use(id) { const s = load(); if (s.list.some(p => p.id === id)) { s.active = id; save(s); apply(); document.dispatchEvent(new CustomEvent("pw:profile")); } },
    remove(id) {
      const s = load(); if (s.list.length < 2) return;
      s.list = s.list.filter(p => p.id !== id); if (s.active === id) s.active = s.list[0].id;
      save(s); apply(); document.dispatchEvent(new CustomEvent("pw:profile"));
    },
    apply
  };
  apply();
})();
