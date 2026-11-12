// Swipe sideways to move between the log and the betting page.
(() => {
  const onBet = location.pathname.startsWith("/betting");
  const target = onBet ? "/" : "/betting.html";
  const dir = onBet ? 1 : -1; // betting: swipe right to go back to the log; log: swipe left to betting
  const main = document.querySelector("main");
  if (!main) return;
  const css = document.createElement("style");
  css.textContent = "@keyframes swIn{from{opacity:0;transform:translateX(var(--sw-from))}to{opacity:1;transform:none}}main.sw-in{animation:swIn .22s ease-out}";
  document.head.appendChild(css);
  try {
    const from = sessionStorage.getItem("forsinkelseslogg:swipe");
    if (from) { sessionStorage.removeItem("forsinkelseslogg:swipe"); main.style.setProperty("--sw-from", from); main.classList.add("sw-in"); }
  } catch (e) {}
  let x0 = 0, y0 = 0, dx = 0, mode = "";
  const reset = () => { main.style.transition = "transform .2s ease"; main.style.transform = ""; main.style.opacity = ""; };
  document.addEventListener("touchstart", (e) => {
    mode = "";
    if (e.touches.length !== 1 || e.target.closest("input,select,textarea,.toast")) return;
    const t = e.touches[0];
    if (t.clientX < 24 || t.clientX > innerWidth - 24) return; // leave the edges to the browser's own back gesture
    x0 = t.clientX; y0 = t.clientY; dx = 0; mode = "wait";
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (!mode) return;
    const t = e.touches[0], mx = t.clientX - x0, my = t.clientY - y0;
    if (mode === "wait") {
      if (Math.abs(mx) < 12 && Math.abs(my) < 12) return;
      mode = Math.abs(mx) > Math.abs(my) * 1.5 && Math.sign(mx) === dir ? "swipe" : "";
      if (!mode) return;
      main.style.transition = "none";
    }
    dx = mx;
    const d = dir * Math.max(0, dir * dx);
    main.style.transform = `translateX(${d * 0.5}px)`;
    main.style.opacity = String(1 - Math.min(Math.abs(d) / innerWidth, 0.5));
  }, { passive: true });
  const end = () => {
    if (mode !== "swipe") { mode = ""; return; }
    mode = "";
    if (dir * dx > Math.min(90, innerWidth * 0.22)) {
      main.style.transition = "transform .15s ease-in, opacity .15s ease-in";
      main.style.transform = `translateX(${dir * innerWidth * 0.4}px)`;
      main.style.opacity = "0";
      try { sessionStorage.setItem("forsinkelseslogg:swipe", (-dir * 40) + "px"); } catch (e) {}
      setTimeout(() => location.assign(target), 120);
    } else reset();
  };
  document.addEventListener("touchend", end);
  document.addEventListener("touchcancel", () => { if (mode === "swipe") reset(); mode = ""; });
  addEventListener("pageshow", (e) => { if (e.persisted) { main.style.transition = "none"; main.style.transform = ""; main.style.opacity = ""; } });
})();
