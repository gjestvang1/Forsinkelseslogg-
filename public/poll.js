// Shared polling that spares the Netlify quota without being noticed:
// - only the page you are looking at fetches (both pages are loaded side by side in the shell),
// - every 10 s while someone is using the app, every 30 s after 2 idle minutes, every 60 s after 10,
//   and not at all after 30 idle minutes (a phone left open on a table): the next touch fetches at once,
// - straight away when the app is opened again, the page is swiped to, or someone touches it after a pause.
// startPoll(load, pageIndex) returns a function that fetches now.
window.startPoll = (load, me) => {
  const shell = (() => { try { return window.parent !== window && window.parent.pager ? window.parent : null; } catch (e) { return null; } })();
  const host = shell || window;
  const visible = () => !document.hidden && (!shell || shell.pager.page === me);
  let timer = 0, busy = false;
  const delay = () => { const idle = Date.now() - (host.__act || 0); return idle < 120e3 ? 10e3 : idle < 600e3 ? 30e3 : idle < 1800e3 ? 60e3 : 0; };
  const later = () => { const d = delay(); if (d) timer = setTimeout(tick, d); };
  const tick = async () => {
    clearTimeout(timer);
    if (visible() && !busy) { busy = true; try { await load(); } catch (e) {} busy = false; }
    later();
  };
  const act = () => {
    const was = host.__act || 0; host.__act = Date.now();
    if (Date.now() - was > 110e3) { clearTimeout(timer); timer = setTimeout(tick, 300); } // first touch after a pause: refresh soon
  };
  ["touchstart", "click", "keydown", "scroll"].forEach((e) => addEventListener(e, act, { passive: true }));
  host.__act = host.__act || Date.now();
  const now = () => { host.__act = Date.now(); tick(); };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) now(); });
  if (shell) shell.addEventListener("side", (e) => { if (e.detail === me) now(); });
  later();
  return now;
};

// Logg and Statistikk both show /api/alt. When the app opens, both pages ask for it at the same
// moment: the second one gets the first one's answer instead of a request of its own. Only for a
// page's very first load (no version yet) and only within 10 s, so nothing shown is ever older.
window.altHent = async (v) => {
  let host = window;
  try { if (window.parent !== window && window.parent.pager) host = window.parent; } catch (e) {}
  const c = host.__alt;
  if (!v && c && Date.now() - c.t < 10e3) return JSON.parse(await c.p);
  const p = fetch("/api/alt?v=" + encodeURIComponent(v || ""), { cache: "no-store" }).then((r) => { if (!r.ok) throw 0; return r.text(); });
  if (!v) { const me = { t: Date.now(), p }; host.__alt = me; p.catch(() => { if (host.__alt === me) host.__alt = null; }); }
  return JSON.parse(await p);
};
