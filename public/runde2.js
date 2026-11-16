// Round 2 extras for the log page (chosen by Andreas): roulette on «Nå» (D1), shift-specific remarks
// (H6), dice prophecy (H3), anniversaries (H5) and X-ray mode (H7). Motion respects reduced-motion.
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const overlay = (box, ms, onClose) => {
    const o = mk("div", "ovl"); o.appendChild(box); document.body.appendChild(o);
    let done = false;
    const close = () => { if (done) return; done = true; o.remove(); onClose && onClose(); };
    o.addEventListener("click", close); if (ms) setTimeout(close, ms);
    return { o, close };
  };

  // D1: a short roulette spin that lands on the minutes, then saves.
  window.rulett = (min, save) => {
    if (still) return save();
    const box = mk("div", "ovlbox"), wheel = mk("div", "wheel"), ball = mk("i", "ball"), p = mk("p", null, "Rien ne va plus …");
    wheel.appendChild(ball); box.append(wheel, p);
    let saved = false;
    const go = () => { if (!saved) { saved = true; save(); } };
    const ov = overlay(box, 0, go);
    const turns = 1080 + Math.random() * 360;
    wheel.animate([{ transform: "rotate(0)" }, { transform: `rotate(${turns}deg)` }], { duration: 1500, easing: "cubic-bezier(.15,.6,.25,1)", fill: "forwards" });
    ball.animate([{ transform: "rotate(0)", transformOrigin: "7px 104px" }, { transform: `rotate(${-turns * 1.4}deg)`, transformOrigin: "7px 104px" }], { duration: 1500, easing: "cubic-bezier(.2,.6,.3,1)", fill: "forwards" });
    setTimeout(() => { p.textContent = min + " min"; p.animate([{ transform: "scale(.5)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }], { duration: 400 }); }, 1500);
    setTimeout(() => ov.close(), 2300);
  };

  // H6: remarks for the shift she is late for. Shown about one time in three.
  const VMSG = {
    Dag: ["Sola sto også opp i dag. Den rakk det.", "07:30 er et klokkeslett, ikke et forslag.", "Gipsen tørker raskere enn hun kommer seg på jobb.", "Dagvakt betyr at vakta starter på dagen. Denne dagen.", "Morgenmøtet hadde vært fint. Det var i går også."],
    A1: ["Halv tolv hadde også vært et alternativ.", "Vakta starter 12. Formiddagen var visst ikke lang nok.", "Lunsjtid for alle andre. Oppmøtetid for henne. I teorien."],
    A2: ["Lunsjen er over for alle andre.", "Vakta starter klokka 13. Det er etter frokost, lunsj og en lang lur.", "Hele formiddagen til rådighet, og likevel.", "Kveldsvakt og fortsatt sen. Imponerende."],
  };
  window.vaktMsg = (kode) => {
    if (Math.random() > 0.35 || !window.fxCard) return false;
    const list = VMSG[/^A1/.test(kode) ? "A1" : /^A2/.test(kode) ? "A2" : "Dag"];
    window.fxCard(/^A/.test(kode) ? "🌙" : "🌅", pick(list) + " (" + kode + ")", "OK");
    return true;
  };

  // H3: triple-tap the week box (or shake the phone once allowed) and the dice predict the next shift.
  const hero = document.getElementById("hero");
  let rolling = false;
  function dice() {
    if (rolling || document.querySelector(".ovl")) return;
    rolling = true;
    const a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6);
    const box = mk("div", "ovlbox"), row = mk("div", "dice"), d1 = mk("div", "die", "?"), d2 = mk("div", "die", "?"), p = mk("p", null, "Krupieren kaster …"), sm = mk("small");
    row.append(d1, d2); box.append(row, p, sm);
    overlay(box, 7000, () => { rolling = false; });
    const show = () => {
      d1.textContent = a; d2.textContent = b;
      if (a === 1 && b === 1) { p.textContent = "Spådom: i tide"; sm.textContent = "Krupieren har tatt feil før."; }
      else if (a === 6 && b === 6) { p.textContent = "Spådom: 36 min"; sm.textContent = "Krupieren beklager på forhånd."; }
      else { p.textContent = "Spådom: " + a * b + " min"; sm.textContent = "Neste vakt, ifølge terningene. Krupieren tar ikke ansvar."; }
    };
    if (still) return show();
    let n = 0; const iv = setInterval(() => { d1.textContent = 1 + Math.floor(Math.random() * 6); d2.textContent = 1 + Math.floor(Math.random() * 6); if (++n > 10) { clearInterval(iv); show(); } }, 80);
    [d1, d2].forEach((d, i) => d.animate([{ transform: "rotate(0) translateY(0)" }, { transform: `rotate(${i ? -540 : 540}deg) translateY(-40px)`, offset: 0.5 }, { transform: "rotate(720deg) translateY(0)" }], { duration: 900, easing: "ease-out" }));
  }
  let taps = [], shakeOn = false, lastShake = 0, peaks = [];
  const listen = () => {
    if (shakeOn) return; shakeOn = true;
    addEventListener("devicemotion", (e) => {
      const g = e.accelerationIncludingGravity || {}, m = Math.hypot(g.x || 0, g.y || 0, g.z || 0), t = Date.now();
      if (m > 24) { peaks = peaks.filter((x) => t - x < 700); peaks.push(t); }
      if (peaks.length >= 3 && t - lastShake > 4000) { lastShake = t; peaks = []; dice(); }
    });
  };
  if (store.get("forsinkelseslogg:rist") === "1" && !(window.DeviceMotionEvent && DeviceMotionEvent.requestPermission)) listen();
  hero && hero.addEventListener("click", () => {
    const t = Date.now(); taps = taps.filter((x) => t - x < 600); taps.push(t);
    if (taps.length < 3) return;
    taps = [];
    // iPhone asks for motion access here, inside the tap; after that shaking works too.
    if (window.DeviceMotionEvent && DeviceMotionEvent.requestPermission) DeviceMotionEvent.requestPermission().then((s) => { if (s === "granted") listen(); }).catch(() => {});
    else { store.set("forsinkelseslogg:rist", "1"); listen(); }
    dice();
  });

  // H5: confetti and a diploma at 50, 100, 150, 200, 300 and 500 late arrivals (once per phone).
  const MILE = [50, 100, 150, 200, 300, 500];
  window.jubileum = (n) => {
    const K = "forsinkelseslogg:jubileum";
    const seen = store.get(K);
    if (seen == null) { store.set(K, String(MILE.filter((m) => n >= m).pop() || 0)); return; } // first visit: no old fireworks
    const hit = MILE.filter((m) => n >= m && m > +seen).pop();
    if (!hit) return;
    store.set(K, String(hit));
    setTimeout(() => {
      const box = mk("div", "diploma");
      box.append(mk("div", "seal", "🏅"), mk("h3", null, "Diplom"), mk("p", null, "tildeles for " + hit + " registrerte forsinkelser."), mk("p", null, "Utvist utholdenhet, stø kurs og en urokkelig tro på at klokka går for fort."), mk("button", null, "Takk for innsatsen"));
      overlay(box, 12000);
      if (still) return;
      const C = ["#E5B64A", "#B3212F", "#F6EBD0", "#7BE0A6", "#7CC8E8"];
      for (let i = 0; i < 80; i++) {
        const c = mk("i", "confetti"); c.style.left = Math.random() * innerWidth + "px"; c.style.background = C[i % C.length];
        document.body.appendChild(c);
        c.animate([{ transform: "translateY(0) rotate(0)" }, { transform: `translate(${(Math.random() - 0.5) * 120}px,${innerHeight + 40}px) rotate(${Math.random() * 900}deg)` }], { duration: 1800 + Math.random() * 1400, delay: Math.random() * 500, easing: "cubic-bezier(.3,.2,.7,1)", fill: "backwards" }).onfinish = () => c.remove();
      }
    }, 1200);
  };

  // H7: press and hold the week's number for X-ray mode; tap anywhere to leave.
  const wk = document.getElementById("wk");
  let hold = 0;
  const off = () => { document.documentElement.classList.remove("xray"); document.removeEventListener("click", offClick, true); };
  const offClick = (e) => { e.stopPropagation(); e.preventDefault(); off(); };
  const start = () => { clearTimeout(hold); hold = setTimeout(() => {
    document.documentElement.classList.add("xray");
    // Only listen for the "leave" tap after the finger that held is lifted (its click is ignored).
    const arm = () => { removeEventListener("touchend", arm); removeEventListener("mouseup", arm); setTimeout(() => document.addEventListener("click", offClick, true), 400); };
    addEventListener("touchend", arm); addEventListener("mouseup", arm);
    setTimeout(off, 15000);
  }, 700); };
  const stop = () => clearTimeout(hold);
  if (wk) {
    wk.addEventListener("touchstart", start, { passive: true }); wk.addEventListener("mousedown", start);
    ["touchend", "touchmove", "touchcancel", "mouseup", "mouseleave"].forEach((t) => wk.addEventListener(t, stop, { passive: true }));
    wk.addEventListener("contextmenu", (e) => e.preventDefault());
  }
})();
