/* MRZ-Pruefung nach ICAO 9303 (TD1, TD2, TD3). Reine Logik, ohne Browser-Abhaengigkeit. */
(function (root) {
  const WEIGHTS = [7, 3, 1];
  function val(c) {
    if (c === "<") return 0;
    if (c >= "0" && c <= "9") return c.charCodeAt(0) - 48;
    if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 55;
    return null;
  }
  function checkDigit(s) {
    let t = 0;
    for (let i = 0; i < s.length; i++) {
      const v = val(s[i]);
      if (v === null) return null;
      t += v * WEIGHTS[i % 3];
    }
    return String(t % 10);
  }
  function parseDate(s, kind, now) {
    if (!/^\d{6}$/.test(s)) return null;
    const yy = +s.slice(0, 2), mm = +s.slice(2, 4), dd = +s.slice(4, 6);
    let y = 2000 + yy;
    if (kind === "dob" && Date.UTC(y, mm - 1, dd) > now.getTime()) y = 1900 + yy;
    const d = new Date(Date.UTC(y, mm - 1, dd));
    if (d.getUTCFullYear() !== y || d.getUTCMonth() !== mm - 1 || d.getUTCDate() !== dd) return null;
    return d;
  }
  function names(s) {
    const p = s.split("<<");
    const sur = p[0].replace(/</g, " ").trim();
    const giv = p.slice(1).join(" ").replace(/</g, " ").replace(/\s+/g, " ").trim();
    return { sur, giv };
  }
  function splitLines(text) {
    return String(text || "").toUpperCase().replace(/[«‹]/g, "<")
      .split(/\r?\n/).map(l => l.replace(/\s+/g, "")).filter(Boolean);
  }

  /* Liefert {format, fields, checks[], problem} ; checks: {key,label,ok,expected,found} */
  function validate(text, now) {
    now = now || new Date();
    const L = splitLines(text);
    const out = { format: null, fields: {}, checks: [], problem: null, lines: L };
    const add = (key, label, ok, expected, found) => out.checks.push({ key, label, ok, expected, found });

    if (L.length === 2 && L[0].length === 44 && L[1].length === 44) out.format = "TD3";
    else if (L.length === 3 && L.every(l => l.length === 30)) out.format = "TD1";
    else if (L.length === 2 && L[0].length === 36 && L[1].length === 36) out.format = "TD2";
    else {
      out.problem = "Format nicht erkannt: erwartet werden 2 Zeilen mit 44 Zeichen (Reisepass), 3 Zeilen mit 30 (Ausweiskarte) oder 2 Zeilen mit 36 Zeichen. Gefunden: " +
        (L.length ? L.map(l => l.length).join(" / ") + " Zeichen in " + L.length + " Zeilen" : "keine Zeilen");
      return out;
    }
    if (L.some(l => /[^A-Z0-9<]/.test(l))) {
      const bad = [...new Set(L.join("").match(/[^A-Z0-9<]/g))].join(" ");
      add("charset", "Erlaubte Zeichen", false, "nur A-Z, 0-9 und <", "unerlaubt: " + bad);
    } else add("charset", "Erlaubte Zeichen", true, "nur A-Z, 0-9 und <", "ok");

    let f = {}, l1 = L[0], l2 = L[1], l3 = L[2], nameStr;
    const cdCheck = (key, label, data, given) => {
      const exp = checkDigit(data);
      const ok = exp !== null && given === exp;
      add(key, label, ok, "Pruefziffer " + (exp === null ? "?" : exp), "Pruefziffer " + given);
    };
    if (out.format === "TD3") {
      f = { type: l1.slice(0, 2), issuer: l1.slice(2, 5), docNum: l2.slice(0, 9), nat: l2.slice(10, 13),
        dob: l2.slice(13, 19), sex: l2[20], exp: l2.slice(21, 27), opt: l2.slice(28, 42) };
      nameStr = l1.slice(5, 44);
      cdCheck("cd_doc", "Pruefziffer Dokumentnummer", l2.slice(0, 9), l2[9]);
      cdCheck("cd_dob", "Pruefziffer Geburtsdatum", l2.slice(13, 19), l2[19]);
      cdCheck("cd_exp", "Pruefziffer Ablaufdatum", l2.slice(21, 27), l2[27]);
      if (l1[0] === "V") { /* Visum Typ A: kein Gesamt-Pruefziffer, Zusatzfeld 16 Zeichen */
        out.kind = "visa"; f.opt = l2.slice(28, 44);
      } else {
        const optEmpty = /^<*$/.test(f.opt);
        if (optEmpty) add("cd_opt", "Pruefziffer Zusatzfeld", l2[42] === "<" || l2[42] === "0", "< oder 0 bei leerem Feld", l2[42]);
        else cdCheck("cd_opt", "Pruefziffer Zusatzfeld", f.opt, l2[42]);
        cdCheck("cd_all", "Gesamt-Pruefziffer", l2.slice(0, 10) + l2.slice(13, 20) + l2.slice(21, 43), l2[43]);
      }
    } else if (out.format === "TD1") {
      f = { type: l1.slice(0, 2), issuer: l1.slice(2, 5), docNum: l1.slice(5, 14), opt: l1.slice(15, 30),
        dob: l2.slice(0, 6), sex: l2[7], exp: l2.slice(8, 14), nat: l2.slice(15, 18) };
      nameStr = l3;
      cdCheck("cd_doc", "Pruefziffer Dokumentnummer", l1.slice(5, 14), l1[14]);
      cdCheck("cd_dob", "Pruefziffer Geburtsdatum", l2.slice(0, 6), l2[6]);
      cdCheck("cd_exp", "Pruefziffer Ablaufdatum", l2.slice(8, 14), l2[14]);
      cdCheck("cd_all", "Gesamt-Pruefziffer", l1.slice(5, 30) + l2.slice(0, 7) + l2.slice(8, 15) + l2.slice(18, 29), l2[29]);
    } else {
      f = { type: l1.slice(0, 2), issuer: l1.slice(2, 5), docNum: l2.slice(0, 9), nat: l2.slice(10, 13),
        dob: l2.slice(13, 19), sex: l2[20], exp: l2.slice(21, 27), opt: l2.slice(28, 35) };
      nameStr = l1.slice(5, 36);
      cdCheck("cd_doc", "Pruefziffer Dokumentnummer", l2.slice(0, 9), l2[9]);
      cdCheck("cd_dob", "Pruefziffer Geburtsdatum", l2.slice(13, 19), l2[19]);
      cdCheck("cd_exp", "Pruefziffer Ablaufdatum", l2.slice(21, 27), l2[27]);
      if (l1[0] === "V") { out.kind = "visa"; f.opt = l2.slice(28, 36); } /* Visum Typ B: 8 Zeichen Zusatzfeld, keine Gesamt-Pruefziffer */
      else cdCheck("cd_all", "Gesamt-Pruefziffer", l2.slice(0, 10) + l2.slice(13, 20) + l2.slice(21, 35), l2[35]);
    }
    const n = names(nameStr);
    f.surname = n.sur; f.given = n.giv;
    f.dobDate = parseDate(f.dob, "dob", now);
    f.expDate = parseDate(f.exp, "exp", now);
    f.docNumClean = f.docNum.replace(/</g, "");
    out.fields = f;
    return out;
  }

  const api = { validate, checkDigit, parseDate, splitLines };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MRZ = api;
})(typeof window !== "undefined" ? window : globalThis);
