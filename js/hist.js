/* Verlauf der Pruefungen. Nur lokal im Browser, ohne Bilder und ohne Namen oder Dokumentnummern. */
window.HIST = (function () {
  const K = "pw_hist", MAX = 300;
  const load = () => { try { const a = JSON.parse(localStorage.getItem(K) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  const save = a => { try { localStorage.setItem(K, JSON.stringify(a.slice(0, MAX))); } catch (e) {} };
  return {
    list: load,
    add(e) { const a = load(); e.id = Date.now() + "-" + Math.random().toString(36).slice(2, 6); a.unshift(e); save(a); return e.id; },
    update(id, p) { const a = load(), x = a.find(i => i.id === id); if (x) { Object.assign(x, p); save(a); } },
    remove(id) { save(load().filter(i => i.id !== id)); },
    clear() { save([]); }
  };
})();
