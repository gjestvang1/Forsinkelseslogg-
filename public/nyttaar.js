// K7: the first time the app is opened in a new year, fireworks go off over the whole screen with
// last year's total written in the sky. Once per device per year. Preview: ?nyttaar
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const K = "forsinkelseslogg:aar";
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const top = (() => { try { return window.parent.document.getElementById("track") ? window.parent : window; } catch (e) { return window; } })();
  let q = location.search; try { q += window.parent.location.search; } catch (e) {}
  const preview = /nyttaar/.test(q);
  const fmt = (m) => { m = Math.round(m); if (m < 60) return m + " min"; const h = Math.floor(m / 60), r = m % 60; return h + " t" + (r ? " " + r + " min" : ""); };

  window.nyttaar = (entries) => {
    const y = new Date().getFullYear(), seen = store.get(K);
    if (!preview) {
      if (!seen) { store.set(K, String(y)); return; } // first visit ever: nothing to celebrate yet
      if (+seen >= y) return;
    }
    if (top.__nyttaarShown) return;
    top.__nyttaarShown = 1;
    store.set(K, String(y));
    const last = String(y - 1), list = (entries || []).filter((e) => e.date.slice(0, 4) === last);
    const total = list.reduce((s, e) => s + e.min, 0);
    if (!list.length && !preview) return;
    show(last, total, list.length);
  };

  function show(year, total, n) {
    const d = top.document;
    const o = d.createElement("div");
    o.style.cssText = "position:fixed;inset:0;z-index:97;background:radial-gradient(ellipse at 50% 120%,#1B2547,#05070F 70%);display:grid;place-items:center;cursor:pointer;opacity:0;transition:opacity .5s";
    const cv = d.createElement("canvas"); cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    const t = d.createElement("div");
    t.style.cssText = "position:relative;text-align:center;color:#FFF3C4;font-family:'Playfair Display',Georgia,serif;padding:24px;text-shadow:0 0 18px rgba(255,210,120,.7);opacity:0;transform:scale(.8);transition:opacity 1.2s 1.4s,transform 1.2s 1.4s";
    t.innerHTML = '<div style="font:600 .8rem Inter,system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;opacity:.8">Godt nytt år</div>' +
      '<div style="font-weight:900;font-size:clamp(2.6rem,14vw,4.4rem);line-height:1;margin:8px 0 6px;color:#E5B64A"></div>' +
      '<div style="font-weight:700;font-size:clamp(1.3rem,6vw,1.8rem)"></div>' +
      '<div style="font:500 .95rem Inter,system-ui,sans-serif;margin-top:10px;opacity:.85"></div>' +
      '<div style="font:600 .8rem Inter,system-ui,sans-serif;margin-top:22px;opacity:.6">Trykk for å fortsette</div>';
    const [, big, mid, small] = t.children;
    big.textContent = year;
    mid.textContent = n ? fmt(total) + " forsinket" : "Ingen forsinkelser. Mistenkelig.";
    small.textContent = n ? n + (n === 1 ? " gang" : " ganger") + " for sent. Nytt år, nye muligheter." : "";
    o.append(cv, t); d.body.appendChild(o);
    requestAnimationFrame(() => { o.style.opacity = "1"; t.style.opacity = "1"; t.style.transform = "none"; });
    let done = false, raf = 0;
    const close = () => { if (done) return; done = true; cancelAnimationFrame(raf); o.style.opacity = "0"; setTimeout(() => o.remove(), 500); };
    o.addEventListener("click", close); setTimeout(close, 12000);
    if (still) return;
    // Canvas fireworks: rockets rise and burst into falling sparks.
    const cx = cv.getContext("2d"), dpr = Math.min(2, top.devicePixelRatio || 1);
    let W = 0, H = 0;
    const size = () => { W = o.clientWidth; H = o.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const COLS = ["#E5B64A", "#FF6B6B", "#7BE0A6", "#7CC8E8", "#F6EBD0", "#C792EA"];
    const rockets = [], sparks = [];
    let t0 = 0, next = 0;
    const launch = () => rockets.push({ x: W * (0.15 + Math.random() * 0.7), y: H, vy: -(H / 75) * (0.85 + Math.random() * 0.3), c: COLS[Math.floor(Math.random() * COLS.length)], top: H * (0.15 + Math.random() * 0.3) });
    const burst = (r) => { const n = 46 + Math.floor(Math.random() * 30); for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, s = 1.5 + Math.random() * 3.2; sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, c: Math.random() < 0.2 ? "#FFF" : r.c }); } };
    const tick = (now) => {
      const dt = Math.min(50, now - (t0 || now)) / 16; t0 = now;
      if (now > next) { launch(); next = now + 350 + Math.random() * 600; }
      cx.globalCompositeOperation = "destination-out"; cx.fillStyle = "rgba(0,0,0,.22)"; cx.fillRect(0, 0, W, H);
      cx.globalCompositeOperation = "lighter";
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]; r.y += r.vy * dt; r.vy *= 0.985;
        cx.fillStyle = r.c; cx.beginPath(); cx.arc(r.x, r.y, 2.2, 0, 6.28); cx.fill();
        if (r.y <= r.top || r.vy > -1.2) { burst(r); rockets.splice(i, 1); }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 0.05 * dt; s.vx *= 0.985; s.life -= 0.012 * dt;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        cx.globalAlpha = Math.max(0, s.life); cx.fillStyle = s.c; cx.beginPath(); cx.arc(s.x, s.y, 1.8, 0, 6.28); cx.fill();
      }
      cx.globalAlpha = 1;
      if (!done) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
})();
