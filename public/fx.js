// Casino animations (and the December Christmas look). Purely decorative.
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  let q = location.search + location.hash;
  try { q += window.parent.location.search + window.parent.location.hash; } catch (e) {}
  const jul = new Date().getMonth() === 11 || /jul/.test(q);
  if (jul) root.classList.add("jul");

  // Sarcastic casino messages. Late / on time / bet: only every 3rd to 5th time (counted per
  // device); new record: every time. Shown on the shell so they are visible on either page.
  const MSG = {
    sent: ["All in på snooze-knappen. Igjen.", "Hun bløffer ikke. Hun er bare sen.", "Pokerfjes på plass. Klokka var visst ikke det.", "Bussen gikk visst. Det gjorde ikke hun.", "Kaffen er kald. Møtet er over. Velkommen!"],
    tide: ["Royal flush! Sannsynligheten var 1 til 649 740.", "Huset taper i dag. Nyt det, det skjer ikke ofte.", "Hun møtte opp i tide. Banken er sprengt.", "I tide. Ta et skjermbilde, ingen kommer til å tro deg.", "Hun kom i tide. Klokka på kontoret er sendt til kontroll."],
    bet: ["Smart bet. Eller rettere sagt: et trygt bet.", "Du satser mot en kvinne som bruker «snart» som klokkeslett. Modig.", "Bettet er registrert. Hennes vekkerklokke er ikke informert.", "Oddsen er god. Det er punktligheten ikke."],
    rek: ["Jackpot! Dessverre for alle andre.", "Ny rekord. Kasinoet vurderer å oppkalle et bord etter henne.", "Rekorden er slått. Det samme er alle forventninger.", "Gratulerer, du har vært vitne til historie. Treg historie."],
  };
  // December uses its own (chosen) Christmas messages, with the same rules.
  const JUL = {
    sent: ["Dersom Skogli-nissen fortsetter slik, vil ikke alle snille barn få julegave i år.", "Rudolf har rød nese av å vente på henne.", "Sleden går halv åtte. Hun valgte neste.", "Til og med pepperkakene var ferdig stekt før hun kom.", "Juletreet står klart. Kollegaen er fortsatt underveis.", "Grøten er kald. Mandelen er funnet. Hun er ikke her.", "Dette er grunnen til at hun alltid får julegaven sist.", "Et mirakel i desember ville vært at hun kom i tide. Det ble ikke i dag.", "Julebordet starter klokka 19. Vi sier 18 til henne."],
    tide: ["I tide! Nissen gnir seg i øynene og sjekker listen på nytt.", "Hun kom i tide. Det kan bare forklares med julestemning.", "Skogli-nissen leverte i tide. Det skjer bare én gang i året.", "Noen har puttet en vekkerklokke i julestrømpa hennes."],
    bet: ["Bettet er lagt under treet. Pakkes opp når hun kommer.", "Nissen noterer bettet ditt. Han vet hvem som har vært slem.", "Du satser på at hun er sen i desember. Det er som å satse på snø i Tromsø.", "Sjetongene ligger i julestrømpa. Lykke til."],
    rek: ["Ny rekord! Skogli-nissen er offisielt verdens tregeste sledefører.", "Rekorden er slått. Den lengste natten i året fikk konkurranse.", "Ny rekord. Nissen flytter henne permanent til den slemme listen.", "Gratulerer! Årets julegave til kontoret: ny rekord i forsinkelse."],
  };
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const top = (() => { try { return window.parent.document.getElementById("track") ? window.parent : window; } catch (e) { return window; } })();
  function showCard(icon, text, btn) {
    const d = top.document;
    if (top.__fxCardAt && Date.now() - top.__fxCardAt < 3000) return; // never two at once
    top.__fxCardAt = Date.now();
    if (!d.getElementById("fxcard-css")) {
      const st = d.createElement("style"); st.id = "fxcard-css";
      st.textContent = ".fxcard{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:24px;background:rgba(0,0,0,.5);animation:fxcIn .25s ease-out}.fxcard.out{opacity:0;transition:opacity .25s}.fxcard>div{max-width:340px;text-align:center;border:2px solid #E5B64A;border-radius:18px;padding:22px 20px 18px;box-shadow:0 18px 50px rgba(0,0,0,.5),inset 0 0 0 5px var(--c2),inset 0 0 0 6px rgba(229,182,74,.5);background:linear-gradient(180deg,var(--c1),var(--c2));animation:fxcPop .45s cubic-bezier(.3,1.5,.5,1)}.fxcard span{display:block;font-size:2.8rem;line-height:1}.fxcard p{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:1.25rem;line-height:1.35;color:#F6EBD0;margin:12px 0 16px}.fxcard button{font:inherit;font-family:Inter,system-ui,sans-serif;background:#E5B64A;color:#0B2F25;border:0;border-radius:999px;padding:10px 22px;font-weight:700}@keyframes fxcIn{from{opacity:0}}@keyframes fxcPop{from{transform:scale(.6) rotate(-4deg);opacity:0}}@media (prefers-reduced-motion:reduce){.fxcard,.fxcard>div{animation:none}}";
      d.head.appendChild(st);
    }
    const o = d.createElement("div"); o.className = "fxcard";
    o.style.setProperty("--c1", jul ? "#A51C2E" : "#17604A"); o.style.setProperty("--c2", jul ? "#6E1720" : "#0E3B2E");
    const box = d.createElement("div"), i = d.createElement("span"), p = d.createElement("p"), b = d.createElement("button");
    i.textContent = icon; p.textContent = "«" + text + "»"; b.type = "button"; b.textContent = btn;
    box.append(i, p, b); o.appendChild(box);
    const close = () => { o.classList.add("out"); setTimeout(() => o.remove(), 250); };
    o.onclick = close; d.body.appendChild(o); setTimeout(close, 8000);
  }
  window.nyttAar = (year) => { top.__fxCardAt = 0; showCard("🎆", "Nytt år, nye muligheter for å komme tidsnok - eller ikke", "Godt nytt år … OK"); };
  window.kasinoMsg = (kind) => {
    const list = (jul ? JUL : MSG)[kind]; if (!list) return;
    if (kind !== "rek") {
      const k = "forsinkelseslogg:msg:" + kind, st = JSON.parse(store.get(k) || "null") || { n: 0, next: 3 + Math.floor(Math.random() * 3) };
      st.n++;
      if (st.n < st.next) { store.set(k, JSON.stringify(st)); return; }
      store.set(k, JSON.stringify({ n: 0, next: 3 + Math.floor(Math.random() * 3) }));
    }
    const lk = "forsinkelseslogg:msg:last:" + kind, last = store.get(lk);
    const pool = list.length > 1 ? list.filter((t) => t !== last) : list, text = pool[Math.floor(Math.random() * pool.length)];
    store.set(lk, text);
    if (jul) showCard({ sent: "🎅", tide: "🎄", bet: "🎁", rek: "🦌" }[kind], text, "Ho ho … OK");
    else showCard({ sent: "🃏", tide: "♠️", bet: "🎰", rek: "🏆" }[kind], text, kind === "rek" ? "Jackpot … OK" : "OK");
  };

  // December: Santa's warning whenever a late arrival is registered.
  window.julMsg = () => {
    if (!jul) return;
    const o = document.createElement("div");
    o.className = "julmsg";
    o.innerHTML = '<div><span>🎅</span><p>«Dersom Skogli-nissen fortsetter slik, vil ikke alle snille barn få julegave i år»</p><button type="button">Ho ho … OK</button></div>';
    const close = () => { o.classList.add("out"); setTimeout(() => o.remove(), 250); };
    o.onclick = close;
    document.body.appendChild(o);
    setTimeout(close, 8000);
  };
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
