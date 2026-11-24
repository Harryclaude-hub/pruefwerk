/* Hell/Dunkel-Umschalter, Wahl bleibt im Browser gespeichert. */
(function () {
  const k = "pw_theme"; let t = null;
  try { t = localStorage.getItem(k); } catch (e) {}
  if (t !== "light" && t !== "dark") t = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  const apply = v => document.documentElement.setAttribute("data-theme", v);
  apply(t);
  document.addEventListener("DOMContentLoaded", () => {
    const top = document.querySelector(".top"); if (!top) return;
    const b = document.createElement("button"); b.type = "button"; b.className = "themebtn";
    const label = () => { b.textContent = t === "light" ? "Dunkel" : "Hell"; b.setAttribute("aria-label", "Darstellung wechseln: " + (t === "light" ? "dunkel" : "hell")); };
    label();
    b.addEventListener("click", () => { t = t === "light" ? "dark" : "light"; apply(t); try { localStorage.setItem(k, t); } catch (e) {} label(); });
    top.append(b);
  });
})();
