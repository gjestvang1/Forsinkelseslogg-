// Christmas greetings on the shell (index.html), each shown once per device per year:
//  • Julekort: the first time the app is opened in December. The sleigh flies over and drops a
//    present in a parachute; tap it to unwrap the card and collect 10 pepperkaker (action «gave»,
//    once per profile, server-checked).
//  • Julaften: a short extra card on 24 December.
//  • St. Lucia: on 13 December a Lucia procession walks across the dark; the last one limps in late.
// Previews (shown every time, gift button inactive outside December): ?jul ?julaften ?lucia
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ls = { get: (k) => { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const q = location.search, now = new Date(), y = String(now.getFullYear());
  const md = String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  const des = md.startsWith("12-");
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  // H7, H8, J1 and P3 from the suggestions, combined into three cards (one is drawn at random).
  const JUL = [
    { h: "Glade jul!", sub: "Sjetongene er byttet ut med pepperkaker.", txt: "Nissen rekker hele verden på én natt. Hun rekker ikke 07:30." },
    { h: "God jul!", sub: "Desember har 31 dager og like mange sjanser til å komme for sent.", txt: "Pepperkakene er ferske. Det er ikke unnskyldningene hennes." },
    { h: "Glade jul!", sub: "Sjetongene er byttet ut med pepperkaker. Desember har 31 dager og like mange sjanser til å komme for sent.", txt: "Nissen rekker hele verden på én natt. Hun rekker ikke 07:30. Pepperkakene er ferske. Det er ikke unnskyldningene hennes." },
  ];
  const JULAFTEN = [
    { h: "God julaften!", sub: "I dag er det lov å komme for sent.", txt: "Til julemiddagen, altså. Ikke på jobb. Nissen fører logg han også." },
    { h: "God julaften!", sub: "Nissen kom presis. Det er mulig.", txt: "Pepperkakene i lommeboka er dine. Forsinkelsene hennes er fortsatt våre." },
  ];
  const LUCIA = { h: "God lucia!", txt: "Lucia rakk ikke fram med lussekattene i tide. Vi skjønner hvem hun har lært det av." };

  const CSS = `
.jh{position:fixed;inset:0;z-index:94;display:grid;place-items:center;padding:20px;font-family:Inter,system-ui,sans-serif;background:radial-gradient(ellipse at 50% 30%,rgba(90,15,22,.78),rgba(20,3,6,.94));animation:jhIn .4s ease-out;overflow:hidden;-webkit-user-select:none;user-select:none}
.jh.lucia{background:radial-gradient(ellipse at 50% 85%,#2B2440,#07060E 75%)}
.jh.out{opacity:0;transition:opacity .35s}
@keyframes jhIn{from{opacity:0}}
.jhCard{position:relative;width:min(340px,100%);text-align:center;background:#FFF8E8;color:#3E0B15;border-radius:18px;padding:24px 20px 18px;border:3px double #E5B64A;box-shadow:0 22px 60px rgba(0,0,0,.6);display:grid;gap:10px;animation:jhPop .55s cubic-bezier(.3,1.5,.5,1) both}
@keyframes jhPop{from{transform:scale(.4) translateY(40px);opacity:0}}
.jhIc{font-size:2.2rem;line-height:1}
.jhH{margin:0;font:900 1.7rem/1.1 'Playfair Display',Georgia,serif;color:#8A1C2E}
.jhSub{margin:0;font:700 .98rem/1.35 'Playfair Display',Georgia,serif;color:#6B1824}
.jhTxt{margin:0;font:600 .98rem/1.45 Inter,system-ui,sans-serif}
.jhGave{margin-top:4px;border-top:1px dashed rgba(138,28,46,.35);padding-top:12px;display:grid;gap:8px;font-size:.88rem;color:#6B1824}
.jhGave .men{display:flex;justify-content:center;gap:2px;height:22px}
.jhGave .men i,.jhMan{display:block;width:18px;height:22px;background:var(--man) center/contain no-repeat;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}
.jhPick{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
.jhPick button{border:1px solid #8A1C2E;background:none;color:#8A1C2E;border-radius:999px;padding:6px 12px;font:700 .85rem Inter,system-ui,sans-serif}
.jhPick button.on{background:#8A1C2E;color:#FFF8E8}
.jhBtn{justify-self:center;border:0;border-radius:999px;padding:11px 24px;font:800 1rem Inter,system-ui,sans-serif;background:#8A1C2E;color:#FFF8E8}
.jhBtn.gold{background:#E5B64A;color:#3E0B15}
.jhBtn:disabled{opacity:.55}
.jhOk{background:none;border:0;color:#8A1C2E;font:700 .9rem Inter,system-ui,sans-serif;padding:6px;text-decoration:underline}
.jh.lucia .jhCard{background:#FFF6DC;border-color:#F2C14E}.jh.lucia .jhH{color:#7A5212}
.jh.lucia .jhBtn{background:#C8901A;color:#FFF6DC}
/* sleigh + present */
.jhSleigh{position:absolute;top:16%;left:0;font-size:34px;white-space:nowrap;transform:translateX(-220px)}
.jhDrop{position:absolute;left:50%;top:16%;width:96px;margin-left:-48px;display:grid;justify-items:center;opacity:0}
.jhChute{width:96px;height:48px;border-radius:96px 96px 0 0;background:repeating-conic-gradient(from -90deg at 50% 100%,#FFF8E8 0 22.5deg,#C62E3F 22.5deg 45deg);box-shadow:inset 0 -4px 0 rgba(0,0,0,.15);transition:opacity .4s,transform .4s}
.jhStrings{width:96px;height:34px;background:linear-gradient(to bottom right,transparent calc(50% - .6px),rgba(255,255,255,.7) 50%,transparent calc(50% + .6px)) 0 0/50% 100% no-repeat,linear-gradient(to bottom left,transparent calc(50% - .6px),rgba(255,255,255,.7) 50%,transparent calc(50% + .6px)) 100% 0/50% 100% no-repeat;transition:opacity .4s}
.jhBox{position:relative;width:76px;height:64px;cursor:pointer}
.jhBox .b{position:absolute;left:4px;right:4px;bottom:0;height:48px;background:#C62E3F;border-radius:4px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.18)}
.jhBox .l{position:absolute;left:0;right:0;top:4px;height:16px;background:#D93A4C;border-radius:4px;box-shadow:0 3px 0 rgba(0,0,0,.18)}
.jhBox .b::before,.jhBox .l::before{content:"";position:absolute;left:50%;margin-left:-6px;width:12px;top:0;bottom:0;background:#F2C14E}
.jhBox .l::after{content:"";position:absolute;left:50%;top:-14px;margin-left:-16px;width:32px;height:16px;background:radial-gradient(ellipse at 25% 60%,#F2C14E 0 38%,transparent 40%),radial-gradient(ellipse at 75% 60%,#F2C14E 0 38%,transparent 40%)}
.jhHint{position:absolute;top:calc(100% + 14px);white-space:nowrap;color:#FBF1DC;font:700 .95rem Inter,system-ui,sans-serif;text-shadow:0 2px 6px #000;opacity:0;transition:opacity .4s}
.jhTap .jhHint{opacity:1;animation:jhPulse 1.4s ease-in-out infinite}
@keyframes jhPulse{50%{opacity:.5}}
.jhFly{position:absolute;pointer-events:none}
/* Lucia procession */
.jhTrain{position:absolute;left:0;right:0;bottom:14%;height:90px;transform:scale(1.5);transform-origin:0 100%;width:66.7%}
.jhL{position:absolute;bottom:0;left:0;width:30px;height:62px;transform:translateX(-60px)}
.jhL::before{content:"";position:absolute;left:3px;right:3px;bottom:0;height:46px;border-radius:14px 14px 4px 4px;background:linear-gradient(#FFFFFF,#D9D4E8)}
.jhL::after{content:"";position:absolute;left:8px;top:2px;width:14px;height:14px;border-radius:50%;background:#F4D9C2;box-shadow:0 -6px 0 -3px #FFD86B,-5px -5px 0 -4px #FFD86B,5px -5px 0 -4px #FFD86B,0 -10px 14px 2px rgba(255,200,90,.55)}
.jhL i{position:absolute;left:12px;top:22px;width:6px;height:12px;background:#FFF;border-radius:2px;box-shadow:0 -7px 8px 1px rgba(255,210,110,.9)}
.jhL.crown::after{box-shadow:0 -7px 0 -3px #FFD86B,-5px -6px 0 -3px #FFD86B,5px -6px 0 -3px #FFD86B,-8px -2px 0 -4px #FFD86B,8px -2px 0 -4px #FFD86B,0 -12px 20px 4px rgba(255,200,90,.75)}
@media (prefers-reduced-motion:reduce){.jh,.jhCard{animation:none}}`;
  const MAN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 24'%3E%3Cg stroke='%237A3B12' stroke-width='6.4' stroke-linecap='round' fill='none'%3E%3Cpath d='M3.5 11.5H16.5M10 8v7.5M10 15.5 6 21M10 15.5 14 21'/%3E%3Ccircle cx='10' cy='5' r='1.6' stroke-width='6.6'/%3E%3C/g%3E%3Cg stroke='%23C27237' stroke-width='4.6' stroke-linecap='round' fill='none'%3E%3Cpath d='M3.5 11.5H16.5M10 8v7.5M10 15.5 6 21M10 15.5 14 21'/%3E%3Ccircle cx='10' cy='5' r='1.6' stroke-width='4.8'/%3E%3C/g%3E%3Cg fill='%23fff'%3E%3Ccircle cx='8.6' cy='4.6' r='.75'/%3E%3Ccircle cx='11.4' cy='4.6' r='.75'/%3E%3Ccircle cx='10' cy='10.6' r='.8'/%3E%3Ccircle cx='10' cy='13.4' r='.8'/%3E%3C/g%3E%3Cpath d='M8.4 6.6q1.6 1 3.2 0' stroke='%23fff' stroke-width='.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")";

  const queue = [];
  const due = (key, when, flag) => { if (flag.test(q)) return true; return when && ls.get(key) !== y; };
  if (due("forsinkelseslogg:julhilsen", des, /[?&]jul\b/)) queue.push(["forsinkelseslogg:julhilsen", jul]);
  if (due("forsinkelseslogg:lucia", md === "12-13", /lucia/)) queue.push(["forsinkelseslogg:lucia", lucia]);
  if (due("forsinkelseslogg:julaften", md === "12-24", /julaften/)) queue.push(["forsinkelseslogg:julaften", julaften]);
  if (!queue.length) return;

  // Let the pages settle first, and wait while another overlay (winner, miracle, report, fireworks) is open.
  const busy = () => document.querySelector(".vin,.mir,.rap,.jh") || [...document.body.children].some((e) => e.style && e.style.zIndex === "97");
  const next = () => {
    const it = queue.shift(); if (!it) return;
    const go = () => { if (busy()) return setTimeout(go, 1500); ls.set(it[0], y); it[1](next); };
    setTimeout(go, 1800);
  };
  addEventListener("load", next);

  function overlay(cls) {
    if (!document.getElementById("jh-css")) { const st = mk("style"); st.id = "jh-css"; st.textContent = CSS; document.head.appendChild(st); }
    const o = mk("div", "jh " + (cls || "")); o.style.setProperty("--man", MAN); document.body.appendChild(o); return o;
  }
  function close(o, done) { o.classList.add("out"); setTimeout(() => { o.remove(); done && done(); }, 380); }
  function card(o, ic, c, extra, btn, done) {
    const k = mk("div", "jhCard");
    k.append(mk("div", "jhIc", ic), mk("h2", "jhH", c.h));
    if (c.sub) k.appendChild(mk("p", "jhSub", c.sub));
    k.appendChild(mk("p", "jhTxt", c.txt));
    if (extra) k.appendChild(extra);
    const b = mk("button", "jhBtn", btn); b.type = "button"; b.onclick = () => close(o, done); k.appendChild(b);
    o.appendChild(k); return k;
  }
  function burst(o, x, y, n) {
    if (still) return;
    for (let i = 0; i < n; i++) {
      const m = mk("i", "jhMan jhFly"); m.style.left = x + "px"; m.style.top = y + "px"; o.appendChild(m);
      const a = Math.random() * Math.PI * 2, r = 90 + Math.random() * 160;
      m.animate([{ transform: "translate(-50%,-50%) scale(.4) rotate(0)", opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * r}px),calc(-50% + ${Math.sin(a) * r - 60}px)) scale(1.3) rotate(${Math.random() * 720 - 360}deg)`, opacity: 1, offset: .6 }, { transform: `translate(calc(-50% + ${Math.cos(a) * r * 1.2}px),calc(-50% + ${Math.sin(a) * r + 260}px)) scale(1) rotate(${Math.random() * 720}deg)`, opacity: 0 }], { duration: 1600 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => m.remove();
    }
  }

  // Gift: once per profile on the server. Profile names and earlier gifts come from /api/betting.
  function gave() {
    const box = mk("div", "jhGave"), men = mk("div", "men");
    for (let i = 0; i < 10; i++) men.appendChild(mk("i"));
    const p = mk("p", null, "Velkomstgave fra huset: 10 pepperkaker i lommeboka."); p.style.margin = "0";
    const pick = mk("div", "jhPick"), b = mk("button", "jhBtn gold", "Ta imot 10 pepperkaker 🍪"); b.type = "button";
    box.append(men, p, pick, b);
    let me = ls.get("forsinkelseslogg:profil"), data = null;
    const code = () => ls.get("forsinkelseslogg:kode");
    const preview = !des;
    fetch("/api/betting").then((r) => r.json()).then((d) => {
      data = d;
      const month = d.month || "", got = (pid) => (d.gaver || []).some((g) => g.month === month && g.profile === pid);
      if (!me) { // no default profile on this phone: let them pick who they are
        (d.profiles || []).forEach((pr) => { const x = mk("button", null, pr.name); x.type = "button"; x.onclick = () => { me = pr.id; [...pick.children].forEach((c) => c.classList.toggle("on", c === x)); state(); }; pick.appendChild(x); });
        b.disabled = true;
      }
      const state = () => { if (me && got(me)) { b.disabled = true; b.textContent = "Allerede hentet ✓"; } else if (me) { b.disabled = false; b.textContent = "Ta imot 10 pepperkaker 🍪"; } };
      state();
    }).catch(() => {});
    b.onclick = async () => {
      if (!me) return;
      if (preview) { p.textContent = "Forhåndsvisning: gaven kan bare hentes i desember."; b.disabled = true; return; }
      b.disabled = true; b.textContent = "Nissen teller …";
      try {
        let c = code(), r;
        for (;;) {
          r = await fetch("/api/betting", { method: "POST", headers: Object.assign({ "content-type": "application/json" }, c ? { "x-skrivekode": c } : {}), body: JSON.stringify({ action: "gave", profile: me }) });
          if (r.status !== 401) break;
          c = prompt("Skriv inn skrivekoden:"); if (!c) throw new Error("Trenger skrivekode."); c = c.trim(); ls.set("forsinkelseslogg:kode", c);
        }
        const j = await r.json().catch(() => ({}));
        if (r.status === 409) { b.textContent = "Allerede hentet ✓"; p.textContent = j.error || p.textContent; return; }
        if (!r.ok) throw new Error(j.error || "Noe gikk galt");
        b.textContent = "Lagt i lommeboka ✓"; p.textContent = "10 pepperkaker er dine. Ikke spis alle på én gang.";
        const rc = b.getBoundingClientRect(); burst(b.closest(".jh"), rc.left + rc.width / 2, rc.top, 14);
        try { const w = document.getElementById("f1").contentWindow; w.load && w.load(); } catch (e) {}
      } catch (e) { b.disabled = false; b.textContent = "Prøv igjen"; p.textContent = e.message; }
    };
    return box;
  }

  function jul(done) {
    const o = overlay(), c = rnd(JUL);
    const showCard = () => { const k = card(o, "🎄", c, gave(), "God jul! 🍪", done); const r = k.getBoundingClientRect(); burst(o, r.left + r.width / 2, r.top + 40, 22); };
    if (still) return showCard();
    // V2: the sleigh flies over and drops the present in a parachute. V3: tap it to unwrap.
    const sl = mk("div", "jhSleigh", "🦌🦌🛷🎅"), drop = mk("div", "jhDrop"), chute = mk("div", "jhChute"), str = mk("div", "jhStrings"), bx = mk("div", "jhBox"), hint = mk("div", "jhHint", "Trykk for å pakke opp");
    bx.append(mk("div", "b"), mk("div", "l"), hint); drop.append(chute, str, bx); o.append(sl, drop);
    const W = innerWidth, H = innerHeight;
    sl.animate([{ transform: "translate(-220px,0) rotate(-4deg)" }, { transform: `translate(${W * .5 - 90}px,-24px) rotate(3deg)` }, { transform: `translate(${W + 40}px,6px) rotate(-3deg)` }], { duration: 3400, easing: "ease-in-out", fill: "forwards" });
    const land = H * .5 - H * .16 - 70;
    setTimeout(() => {
      drop.style.opacity = "1";
      const a = drop.animate([{ transform: "translate(0,0) rotate(0)" }, { transform: `translate(-18px,${land * .35}px) rotate(-8deg)` }, { transform: `translate(16px,${land * .7}px) rotate(7deg)` }, { transform: `translate(0,${land}px) rotate(0)` }], { duration: 3000, easing: "ease-in-out", fill: "forwards" });
      a.onfinish = () => {
        chute.style.opacity = "0"; chute.style.transform = "translateY(-30px) scale(.8)"; str.style.opacity = "0";
        bx.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(.82) scaleX(1.1)" }, { transform: "scaleY(1.05)" }, { transform: "scaleY(1)" }], { duration: 450 });
        drop.classList.add("jhTap");
      };
    }, 1500);
    let opened = false;
    const open = () => {
      if (opened) return; opened = true; hint.remove();
      const lid = bx.querySelector(".l"), body = bx.querySelector(".b");
      bx.animate([{ transform: "rotate(0)" }, { transform: "rotate(-10deg)" }, { transform: "rotate(10deg)" }, { transform: "rotate(-6deg)" }, { transform: "rotate(0)" }], { duration: 420 });
      setTimeout(() => {
        lid.animate([{ transform: "none" }, { transform: "translate(40px,-160px) rotate(120deg)", opacity: 0 }], { duration: 700, easing: "ease-out", fill: "forwards" });
        body.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(30px) scale(.9)", opacity: 0 }], { duration: 500, delay: 200, fill: "forwards" });
        setTimeout(() => { drop.remove(); sl.remove(); showCard(); }, 450);
      }, 430);
    };
    bx.addEventListener("click", open);
    setTimeout(() => { if (!opened && document.body.contains(bx)) drop.classList.add("jhTap"); }, 6500);
  }

  function julaften(done) {
    const o = overlay(), k = card(o, "🎁", rnd(JULAFTEN), null, "God jul! 🎅", done);
    const r = k.getBoundingClientRect(); burst(o, r.left + r.width / 2, r.top + 40, 18);
  }

  function lucia(done) {
    const o = overlay("lucia");
    const showCard = () => card(o, "🕯️", LUCIA, null, "God lucia! 🕯️", done);
    if (still) return showCard();
    // W1: the procession walks across; the last one limps along far behind and stops in the middle.
    const tr = mk("div", "jhTrain"); o.appendChild(tr);
    const W = innerWidth, step = (el, dur, delay, to) => el.animate([{ transform: "translateX(-60px) translateY(0)" }, { transform: `translateX(${to * .25}px) translateY(-3px)` }, { transform: `translateX(${to * .5}px) translateY(0)` }, { transform: `translateX(${to * .75}px) translateY(-3px)` }, { transform: `translateX(${to}px) translateY(0)` }], { duration: dur, delay, easing: "linear", fill: "forwards" });
    for (let i = 0; i < 6; i++) { const l = mk("div", "jhL" + (i === 0 ? " crown" : "")); l.appendChild(mk("i")); tr.appendChild(l); step(l, 5200, i * 420, (W + 40) / 1.5); }
    const late = mk("div", "jhL"); late.appendChild(mk("i")); tr.appendChild(late);
    const mid = W / 3 - 15; // the train is drawn at 1.5×
    setTimeout(() => {
      late.animate([{ transform: "translateX(-60px) rotate(0)" }, { transform: `translateX(${mid * .3}px) rotate(-8deg)`, offset: .3 }, { transform: `translateX(${mid * .35}px) rotate(6deg)`, offset: .4 }, { transform: `translateX(${mid * .7}px) rotate(-8deg)`, offset: .7 }, { transform: `translateX(${mid * .75}px) rotate(6deg)`, offset: .8 }, { transform: `translateX(${mid}px) rotate(0)` }], { duration: 3600, easing: "ease-in-out", fill: "forwards" }).onfinish = () => setTimeout(showCard, 300);
    }, 5600);
  }
})();
