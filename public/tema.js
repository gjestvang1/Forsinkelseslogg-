// Season themes besides Christmas (fx.js handles December): Easter, 17 May, summer and Halloween.
// Chosen by date; preview with ?tema=paske | mai17 | sommer | halloween. Adds class "tema <name>"
// to <html> on the shell and both pages, and sets window.TEMA.
(() => {
  let q = location.search;
  try { q += window.parent.location.search; } catch (e) {}
  const forced = (q.match(/tema=(\w+)/) || [])[1];
  // Easter Sunday (Gregorian, anonymous algorithm).
  const easter = (y) => {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, mo - 1, da);
  };
  const now = new Date(), day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const md = (now.getMonth() + 1) * 100 + now.getDate();
  const e = easter(now.getFullYear()), palm = new Date(e), mon2 = new Date(e);
  palm.setDate(e.getDate() - 7); mon2.setDate(e.getDate() + 1);
  let t = forced || "";
  if (!t) {
    if (day >= palm && day <= mon2) t = "paske";
    else if (md >= 514 && md <= 517) t = "mai17";
    else if (md >= 620 && md <= 810) t = "sommer";
    else if (md >= 1024 && md <= 1031) t = "halloween";
  }
  // K6: «gips» (plaster) is forced (?tema=gips), switched on for everyone in Innstillinger (server
  // setting «gips»), or on the yearly gipsdag. settTema(name, on) flips it live on the shell and all pages;
  // the season theme of the day comes back when it is switched off.
  window.settTema = (name, on = true) => {
    const wins = [window];
    try { const top = window.parent; if (top !== window) { wins.push(top); ["f0", "f1", "f2"].forEach((id) => { const f = top.document.getElementById(id); if (f && f.contentWindow !== window) wins.push(f.contentWindow); }); } } catch (e) {}
    wins.forEach((w) => {
      try {
        const cl = w.document.documentElement.classList;
        if (!on) {
          if (w.TEMA !== name) return;
          cl.remove(name); w.TEMA = w.SESONG || "";
          if (w.SESONG) cl.add(w.SESONG); else cl.remove("tema");
          return;
        }
        if (w.TEMA === name) return;
        if (w.SESONG) cl.remove(w.SESONG);
        w.TEMA = name; cl.add("tema", name);
        if (name === "gips" && !w.document.getElementById("gips-font")) {
          const l = w.document.createElement("link"); l.id = "gips-font"; l.rel = "stylesheet";
          l.href = "https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap"; w.document.head.appendChild(l);
        }
      } catch (e) {}
    });
  };
  // Called by each page with the server's { gips, gipsdag } (from /api/alt or /api/betting).
  // The last answer is remembered on the device so the app opens in the right theme.
  const KEY = "forsinkelseslogg:gips";
  window.gipsInnst = (o) => {
    if (!o || forced) return;
    const n = new Date(), p = (x) => String(x).padStart(2, "0");
    const on = !!o.gips || (!!o.gipsdag && o.gipsdag === p(n.getMonth() + 1) + "-" + p(n.getDate()));
    try { localStorage.setItem(KEY, on ? "1" : ""); } catch (e) {}
    window.settTema("gips", on);
  };
  let cached = false;
  try { cached = localStorage.getItem(KEY) === "1"; } catch (e) {}
  if (["paske", "mai17", "sommer", "halloween"].includes(t)) window.SESONG = t;
  if (t === "gips" || (!forced && cached)) return window.settTema("gips");
  if (!window.SESONG) return;
  window.TEMA = t;
  document.documentElement.classList.add("tema", t);
})();
