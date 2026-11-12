// Runs inside each page. The pages live side by side in the shell (index.html),
// and this file feeds the finger's movement to the shell so the slide follows it 1:1.
(() => {
  const me = location.pathname.startsWith("/betting") ? 1 : 0;
  let pager = null;
  try { if (window.parent !== window) pager = window.parent.pager; } catch (e) {}
  if (!pager) { location.replace(me ? "/#betting" : "/"); return; } // opened directly: load the shell
  document.documentElement.classList.add("embedded"); // the shell already clears the status bar
  document.querySelectorAll("nav a[data-page]").forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); pager.go(+a.dataset.page); }));
  let x0 = 0, y0 = 0, dx = 0, mode = "", lastX = 0, lastT = 0, v = 0;
  document.addEventListener("touchstart", (e) => {
    mode = "";
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    x0 = lastX = t.clientX; y0 = t.clientY; lastT = e.timeStamp; dx = 0; v = 0; mode = "wait";
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (!mode) return;
    const t = e.touches[0], mx = t.clientX - x0, my = t.clientY - y0;
    if (mode === "wait") {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      if (Math.abs(mx) <= Math.abs(my)) { mode = ""; return; } // vertical: let the page scroll
      mode = "swipe"; x0 = t.clientX; pager.start();
    }
    e.preventDefault();
    dx = t.clientX - x0;
    const dt = e.timeStamp - lastT;
    if (dt > 0) { v = 0.8 * ((t.clientX - lastX) / dt) + 0.2 * v; lastX = t.clientX; lastT = e.timeStamp; }
    pager.move(dx);
  }, { passive: false });
  const end = () => { if (mode === "swipe") pager.end(dx, v); mode = ""; };
  document.addEventListener("touchend", end);
  document.addEventListener("touchcancel", end);
})();
