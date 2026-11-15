// Runs inside each page. The pages live side by side in the shell (index.html),
// and this file feeds the finger's movement to the shell so the slide follows it 1:1.
(() => {
  const me = ["/logg", "/betting"].findIndex((p) => location.pathname.startsWith(p));
  const hash = ["#logg", "#betting"][me] || "";
  let pager = null;
  try { if (window.parent !== window) pager = window.parent.pager; } catch (e) {}
  if (!pager) { location.replace(me > 0 ? "/" + hash : "/"); return; } // opened directly: load the shell
  document.documentElement.classList.add("embedded");
  // The page runs up behind the status bar; pad its content by the status bar height measured in the shell.
  const sat = () => { try { const c = window.parent.document.getElementById("cap"); document.documentElement.style.setProperty("--sat-in", (c ? c.offsetHeight : 0) + "px"); } catch (e) {} };
  sat(); addEventListener("resize", sat); setTimeout(sat, 500);
  document.querySelectorAll("nav a[data-page]").forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); pager.go(+a.dataset.page); }));
  // The gear opens the settings, which live on the betting page.
  const gear = document.getElementById("gear");
  if (gear && me !== 1) gear.addEventListener("click", () => {
    pager.go(1);
    try { const w = window.parent.document.getElementById("f1").contentWindow; w.openSettings && w.openSettings(); } catch (e) {}
  });
  // Swipe detection. The pages only let the browser pan vertically (touch-action: pan-y in
  // theme.css), so horizontal moves always reach us. A swipe is decided after a few pixels if the
  // finger moves at least about as much sideways as up/down; the release speed is measured over
  // the last ~100 ms so a short flick is enough.
  // The page itself slides with the finger, so its own clientX would follow along and shrink the
  // swipe. Measure in the shell's coordinates instead (page offset + clientX).
  const fe = window.frameElement;
  const X = (t) => t.clientX + (fe ? fe.getBoundingClientRect().left : 0);
  let x0 = 0, y0 = 0, dx = 0, mode = "", samples = [];
  document.addEventListener("touchstart", (e) => {
    mode = "";
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    x0 = X(t); y0 = t.clientY; dx = 0; samples = [[x0, performance.now()]]; mode = "wait";
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (!mode) return;
    const t = e.touches[0], x = X(t), mx = x - x0, my = t.clientY - y0;
    if (mode === "wait") {
      if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
      if (Math.abs(mx) < Math.abs(my) * 0.85) { mode = ""; return; } // mostly vertical: let the page scroll
      mode = "swipe"; pager.start(); // keep x0: the whole movement counts
    }
    if (e.cancelable) e.preventDefault();
    dx = x - x0;
    const now = performance.now(); samples.push([x, now]);
    while (samples.length > 2 && now - samples[0][1] > 100) samples.shift();
    pager.move(dx);
  }, { passive: false });
  const end = () => {
    if (mode === "swipe") {
      const a = samples[0], z = samples[samples.length - 1], dt = z[1] - a[1];
      pager.end(dx, dt > 0 ? (z[0] - a[0]) / dt : 0);
    }
    mode = "";
  };
  document.addEventListener("touchend", end);
  document.addEventListener("touchcancel", end);
})();
