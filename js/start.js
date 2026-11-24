/* Startseite: Laendersuche mit Favoriten (nur lokal im Browser gespeichert). */
(function () {
  const $ = id => document.getElementById(id);
  const KEY = "pw_fav";
  const GROUPS = [["fav", "Favoriten"], ["EU", "EU"], ["Europa (ausserhalb EU)", "Europa weitere"], ["Nordamerika", "Nordamerika"], ["Suedasien", "Indien, Bangladesch, Pakistan"], ["Weitere", "Weitere Laender"], ["alle", "Alle"]];
  const DOCS = [["passport", "Pass"], ["id", "ID-Karte"], ["permit", "Aufenthalt"], ["visa", "Visum"], ["license", "Fuehrerschein"]];
  let fav = []; try { fav = JSON.parse(localStorage.getItem(KEY) || "[]").filter(x => typeof x === "string").slice(0, 300); } catch (e) {}
  let group = fav.length ? "fav" : "EU";
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt !== undefined) e.textContent = txt; return e; };
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");

  function chips() {
    const box = $("chips"); box.replaceChildren();
    GROUPS.forEach(([k, label]) => {
      const b = el("button", "chip", label); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", String(k === group));
      b.addEventListener("click", () => { group = k; chips(); draw(); }); box.append(b);
    });
  }
  function card(c) {
    const d = el("article", "ccard");
    const top = el("div", "ctop");
    const im = el("img", "flag"); im.src = "flags/" + c.a.toLowerCase() + ".svg"; im.alt = ""; im.width = 28; im.height = 21; im.loading = "lazy";
    top.append(im, el("h3", "", c.n), el("span", "code", c.c.replace(/</g, "_")));
    const star = el("button", "star", fav.includes(c.a) ? "★" : "☆"); star.type = "button";
    star.setAttribute("aria-label", (fav.includes(c.a) ? "Favorit entfernen: " : "Als Favorit merken: ") + c.n);
    star.addEventListener("click", () => {
      fav = fav.includes(c.a) ? fav.filter(x => x !== c.a) : fav.concat(c.a);
      try { localStorage.setItem(KEY, JSON.stringify(fav)); } catch (e) {}
      draw();
    });
    top.append(star); d.append(top);
    const row = el("div", "docs");
    DOCS.forEach(([k, label]) => {
      const a = el("a", "docbtn", label); a.href = "pruefen.html?land=" + encodeURIComponent(c.i) + "&art=" + k; row.append(a);
    });
    d.append(row);
    if (c.f && c.noIdMrz) d.append(el("p", "sub", "Hinweis: nationale ID-Karte mit MRZ ist hier ueblicherweise nicht vorhanden."));
    return d;
  }
  function draw() {
    const q = norm($("q").value.trim());
    let list = window.COUNTRIES.filter(c => {
      if (q) return norm(c.n).includes(q) || c.i.toLowerCase() === q || c.a.toLowerCase() === q;
      if (group === "fav") return fav.includes(c.a);
      if (group === "alle") return true;
      return c.r === group;
    });
    const grid = $("grid"); grid.replaceChildren();
    list.slice(0, 120).forEach(c => grid.append(card(c)));
    $("count").textContent = list.length + " Treffer" + (list.length > 120 ? " (die ersten 120, bitte suchen)" : "") +
      (group === "fav" && !q && !list.length ? ". Noch keine Favoriten: Stern bei einem Land druecken." : "");
  }
  $("q").addEventListener("input", draw);
  chips(); draw();
})();
