// K6: decorations for the plaster/hospital theme, drawn once on the shell over all three pages.
// Pills and capsules drift slowly upwards, and now and then a big syringe slides in, pushes its
// plunger and drips. Only shown while <html> has the class «gips» (tema.js switches it live).
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) return;
  const root = document.documentElement;
  const st = document.createElement("style");
  st.textContent = `
#gipsFx{position:fixed;inset:0;z-index:5;pointer-events:none;overflow:hidden;display:none}
.gips #gipsFx{display:block}
.gips #snow,.gips #sleigh{display:none!important}
#gipsFx .gf{position:absolute;bottom:-60px;opacity:.32;animation:gfUp linear infinite;will-change:transform}
#gipsFx .gf svg{display:block;animation:gfSpin ease-in-out infinite alternate}
@keyframes gfUp{to{transform:translate(var(--dx),calc(-100vh - 120px))}}
@keyframes gfSpin{from{transform:rotate(var(--r0))}to{transform:rotate(var(--r1))}}
#gipsFx .syr{position:absolute;right:-180px;top:0;width:170px;filter:drop-shadow(0 6px 10px rgba(11,80,90,.3));opacity:0}
#gipsFx .syr svg{transform:scaleX(-1)}
#gipsFx .syr.go{animation:gsIn 5.2s ease-in-out forwards}
#gipsFx .syr.go .plunger{animation:gsPush 5.2s ease-in-out forwards}
#gipsFx .syr.go .liquid{animation:gsEmpty 5.2s ease-in-out forwards;transform-origin:118px 0}
#gipsFx .drop{position:absolute;width:8px;height:11px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#5FD3E0;opacity:0}
#gipsFx .drop.go{animation:gsDrop 1.1s ease-in forwards}
@keyframes gsIn{0%{opacity:0;transform:translateX(0) rotate(-18deg)}12%{opacity:1;transform:translateX(-150px) rotate(-18deg)}22%,72%{opacity:1;transform:translateX(-170px) rotate(-22deg)}88%{opacity:1;transform:translateX(-150px) rotate(-18deg)}100%{opacity:0;transform:translateX(0) rotate(-18deg)}}
@keyframes gsPush{0%,25%{transform:translateX(0)}65%,100%{transform:translateX(44px)}}
@keyframes gsEmpty{0%,25%{transform:scaleX(1)}65%,100%{transform:scaleX(.08)}}
@keyframes gsDrop{0%{opacity:.9;transform:translateY(0) scale(.6)}100%{opacity:0;transform:translateY(110px) scale(1)}}`;
  document.head.appendChild(st);

  const capsule = (c) => `<svg width="34" height="16" viewBox="0 0 34 16"><path d="M8 1h9v14H8A7 7 0 0 1 8 1z" fill="${c}"/><path d="M17 1h9a7 7 0 0 1 0 14h-9z" fill="#fff" stroke="${c}" stroke-width="1.2"/><path d="M6 4h9" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/></svg>`;
  const tablet = (c) => `<svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="${c}" stroke="rgba(0,0,0,.12)"/><path d="M4 11h14" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/><ellipse cx="8" cy="7" rx="3" ry="1.6" fill="#fff" opacity=".6"/></svg>`;
  const mini = `<svg width="40" height="14" viewBox="0 0 40 14"><rect x="1" y="5" width="3" height="4" rx="1" fill="#7A8C90"/><rect x="4" y="6" width="5" height="2" fill="#7A8C90"/><rect x="9" y="2" width="18" height="10" rx="2" fill="rgba(255,255,255,.75)" stroke="#5E7A80" stroke-width="1.2"/><rect x="16" y="3.5" width="10" height="7" fill="#5FD3E0"/><path d="M27 7h12" stroke="#5E7A80" stroke-width="1.2" stroke-linecap="round"/></svg>`;
  const C = ["#E8566C", "#3A8DDE", "#F3C24B", "#7BC67E", "#B38AE8", "#FF8A3D"];
  const kinds = [capsule, tablet, capsule, () => mini, tablet, capsule];

  const fx = document.createElement("div");
  fx.id = "gipsFx"; fx.setAttribute("aria-hidden", "true");
  const N = innerWidth < 500 ? 11 : 16;
  for (let i = 0; i < N; i++) {
    const g = document.createElement("div");
    g.className = "gf";
    g.innerHTML = kinds[i % kinds.length](C[(i * 7) % C.length]);
    const dur = 22 + Math.random() * 20, scale = 0.8 + Math.random() * 0.7;
    g.style.left = (i / N) * 100 + Math.random() * (100 / N) + "%";
    g.style.setProperty("--dx", (Math.random() - 0.5) * 80 + "px");
    g.style.animationDuration = dur + "s";
    g.style.animationDelay = -Math.random() * dur + "s";
    g.style.zoom = scale;
    const s = g.firstChild, r = (Math.random() - 0.5) * 120;
    s.style.setProperty("--r0", r + "deg"); s.style.setProperty("--r1", r + (Math.random() > 0.5 ? 160 : -160) + "deg");
    s.style.animationDuration = 4 + Math.random() * 5 + "s";
    fx.appendChild(g);
  }
  // The big syringe: barrel with scale marks, liquid that empties as the plunger goes in, needle.
  const syr = document.createElement("div");
  syr.className = "syr";
  syr.innerHTML = `<svg viewBox="0 0 170 44" width="170" height="44">
<g class="plunger"><rect x="2" y="12" width="8" height="20" rx="3" fill="#E9F1F2" stroke="#6E8A90" stroke-width="1.5"/><rect x="10" y="19" width="44" height="6" fill="#D6E2E4" stroke="#6E8A90" stroke-width="1.2"/><rect x="52" y="13" width="6" height="18" rx="1.5" fill="#3B4A4E"/></g>
<rect x="48" y="10" width="72" height="24" rx="4" fill="rgba(255,255,255,.85)" stroke="#6E8A90" stroke-width="1.6"/>
<rect class="liquid" x="58" y="13" width="60" height="18" rx="2" fill="#5FD3E0"/>
<g stroke="#6E8A90" stroke-width="1.2"><path d="M66 10v7M76 10v5M86 10v7M96 10v5M106 10v7"/></g>
<rect x="44" y="6" width="5" height="32" rx="2" fill="#E9F1F2" stroke="#6E8A90" stroke-width="1.2"/>
<path d="M120 17h8l4 3v4l-4 3h-8z" fill="#D6E2E4" stroke="#6E8A90" stroke-width="1.2"/>
<path d="M132 22h36" stroke="#8FA3A8" stroke-width="2" stroke-linecap="round"/></svg>`;
  fx.appendChild(syr);
  const add = () => { if (document.body) document.body.appendChild(fx); else addEventListener("DOMContentLoaded", () => document.body.appendChild(fx)); };
  add();

  let timer = 0;
  const inject = () => {
    timer = setTimeout(inject, 40000 + Math.random() * 30000);
    if (document.hidden || !root.classList.contains("gips")) return;
    const top = Math.round(innerHeight * (0.15 + Math.random() * 0.5));
    syr.style.top = top + "px";
    syr.classList.remove("go"); void syr.offsetWidth; syr.classList.add("go");
    // Drops fall from the needle tip (pointing down-left, about 150 px in from the right edge) while the plunger moves.
    for (let i = 0; i < 4; i++) setTimeout(() => {
      const d = document.createElement("i");
      d.className = "drop";
      d.style.left = innerWidth - 156 + Math.random() * 6 + "px";
      d.style.top = top + 50 + "px";
      fx.appendChild(d); void d.offsetWidth; d.classList.add("go");
      setTimeout(() => d.remove(), 1200);
    }, 1700 + i * 450);
  };
  timer = setTimeout(inject, 3000);
  window.gipsSprøyte = () => { clearTimeout(timer); inject(); }; // for testing in the console
})();
