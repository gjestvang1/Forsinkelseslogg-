// Casino animations (and the December Christmas look). Purely decorative.
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  let q = location.search + location.hash;
  try { q += window.parent.location.search + window.parent.location.hash; } catch (e) {}
  const jul = new Date().getMonth() === 11 || /jul/.test(q);
  if (jul) root.classList.add("jul");
  if (still) return;
  root.classList.add("fx");
  setTimeout(() => root.classList.add("fxdone"), 2500); // play entrance animations only once

  // 1. Slot-machine count-up whenever a big number changes.
  const last = new Map();
  let busy = false;
  function roll(el, key) {
    const m = el.textContent.match(/^(\d+)(\D*)$/);
    if (!m) return;
    const to = +m[1], suf = m[2], from = last.has(key) ? last.get(key) : 0;
    last.set(key, to);
    if (from === to) return;
    const t0 = performance.now(), dur = Math.min(900, 300 + Math.abs(to - from) * 8);
    el.classList.add("rolling");
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      busy = true; el.textContent = Math.round(from + (to - from) * e) + suf; busy = false;
      if (k < 1) requestAnimationFrame(step); else el.classList.remove("rolling");
    };
    requestAnimationFrame(step);
  }
  const watch = (sel, keyOf) => {
    const scan = () => { if (busy) return; document.querySelectorAll(sel).forEach((el) => { if (!el.classList.contains("rolling")) roll(el, keyOf(el)); }); };
    new MutationObserver(scan).observe(document.querySelector("main"), { subtree: true, childList: true, characterData: true });
    scan();
  };
  watch("#wk, .player b, .rank b, #rDay, #rWk", (el) => el.id || (el.parentNode.querySelector("span") || {}).textContent || el.textContent);

  // 2. Chips fly up when a bet is placed.
  function chips(btn) {
    const r = btn.getBoundingClientRect(), n = 6;
    for (let i = 0; i < n; i++) {
      const c = document.createElement("i");
      c.className = jul ? "fxgift" : "fxchip";
      if (jul) c.textContent = ["🎁", "❄️", "⭐", "🎄"][i % 4];
      c.style.left = r.left + r.width / 2 - 11 + "px";
      c.style.top = r.top + r.height / 2 - 11 + "px";
      document.body.appendChild(c);
      const dx = (Math.random() - 0.5) * 220, dy = -120 - Math.random() * 120, rot = (Math.random() - 0.5) * 720;
      c.animate([
        { transform: "translate(0,0) rotate(0) scale(.6)", opacity: 1 },
        { transform: `translate(${dx * 0.6}px,${dy}px) rotate(${rot / 2}deg) scale(1)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px,${dy + 90}px) rotate(${rot}deg) scale(.8)`, opacity: 0 },
      ], { duration: 900 + i * 60, easing: "cubic-bezier(.2,.7,.3,1)", delay: i * 35 }).onfinish = () => c.remove();
    }
    btn.animate([{ transform: "scale(1)" }, { transform: "scale(.95)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }], { duration: 380 });
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("#ynGo,#minGo,#save");
    if (b) setTimeout(() => { if (!document.querySelector(".err:not(:empty)")) chips(b); }, 0);
    if (e.target.closest(".chip,.seg button,.player,.go") && navigator.vibrate) { try { navigator.vibrate(12); } catch (x) {} } // Android only
    const c = e.target.closest(".chip,.seg button,.player");
    if (c) c.animate([{ transform: "scale(.9)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 260, easing: "ease-out" });
  });

  // Helpers the pages call when something happens.
  window.fx = {
    shake(el) { el && el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px) rotate(-1deg)" }, { transform: "translateX(7px) rotate(1deg)" }, { transform: "translateX(-4px)" }, { transform: "translateX(0)" }], { duration: 480, easing: "ease-out" }); },
    stampIn(el) { el.animate([{ transform: "rotate(-7deg) scale(2.6)", opacity: 0 }, { transform: "rotate(-7deg) scale(.92)", opacity: 1, offset: 0.7 }, { transform: "rotate(-7deg) scale(1)", opacity: 1 }], { duration: 520, easing: "cubic-bezier(.3,1.4,.5,1)", delay: 300, fill: "backwards" });
      setTimeout(() => { const box = el.parentNode; box && box.animate([{ transform: "translateY(0)" }, { transform: "translateY(3px)" }, { transform: "translateY(0)" }], { duration: 180 }); }, 680); },
    slide(el, rows) { el.animate([{ transform: `translateY(${rows * 100}%)`, background: "rgba(229,182,74,.15)" }, { transform: "translateY(0)", background: "transparent" }], { duration: 700, easing: "cubic-bezier(.2,.8,.3,1)" }); },
    flash(el) { el.animate([{ boxShadow: "0 0 0 0 rgba(123,224,166,0)" }, { boxShadow: "0 0 0 4px rgba(123,224,166,.8), 0 0 30px rgba(123,224,166,.6)" }, { boxShadow: "0 0 0 0 rgba(123,224,166,0)" }], { duration: 1400, iterations: 2 }); },
    jackpot(won) {
      const banner = document.createElement("div");
      banner.className = "fxjack"; banner.textContent = (jul ? "🎁 " : "🎰 ") + "+" + won + " cr";
      document.body.appendChild(banner);
      banner.animate([{ transform: "translate(-50%,-50%) scale(.3)", opacity: 0 }, { transform: "translate(-50%,-50%) scale(1.1)", opacity: 1, offset: 0.25 }, { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: 0.8 }, { transform: "translate(-50%,-60%) scale(1)", opacity: 0 }], { duration: 2400, easing: "ease-out" }).onfinish = () => banner.remove();
      for (let i = 0; i < 36; i++) {
        const c = document.createElement("i");
        c.className = "fxcoin"; c.style.left = Math.random() * innerWidth + "px";
        document.body.appendChild(c);
        c.animate([{ transform: `translateY(-40px) rotateY(0)` }, { transform: `translateY(${innerHeight + 40}px) rotateY(${720 + Math.random() * 720}deg)` }], { duration: 1400 + Math.random() * 1000, delay: Math.random() * 700, easing: "cubic-bezier(.4,0,.8,.6)", fill: "backwards" }).onfinish = () => c.remove();
      }
    },
  };
})();
