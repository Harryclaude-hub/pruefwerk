/* App-Installation: Offline-Speicher und Installieren-Knopf. */
(function () {
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "127.0.0.1" || location.hostname === "localhost"))
    navigator.serviceWorker.register("sw.js").catch(() => {});
  let ev = null;
  function show() {
    const top = document.getElementById("pw-actions");
    if (!ev || !top || document.getElementById("instbtn")) return;
    const b = document.createElement("button"); b.type = "button"; b.id = "instbtn"; b.className = "btn ghost h-inst"; b.textContent = "App installieren";
    b.addEventListener("click", async () => { const e = ev; ev = null; b.remove(); e.prompt(); });
    top.prepend(b);
  }
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); ev = e; show(); });
  document.addEventListener("DOMContentLoaded", show);
})();
