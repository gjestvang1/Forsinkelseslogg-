// Winner reveal: the first time the app is opened after a day has been settled, a themed
// animation shows who won. window.vinner({dag, resultat, rader:[{navn, netto}], enhet})
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = (() => { try { return window.parent.document.getElementById("track") ? window.parent : window; } catch (e) { return window; } })();
  const mk = (d, t, c, x) => { const e = d.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const CSS = `
.vin{position:fixed;inset:0;z-index:95;display:grid;place-items:center;padding:20px;background:radial-gradient(circle at 50% 40%,rgba(0,0,0,.35),rgba(0,0,0,.8));font-family:Inter,system-ui,sans-serif;animation:vinIn .3s ease-out}
.vin.out{opacity:0;transition:opacity .3s}
@keyframes vinIn{from{opacity:0}}
.vinBox{position:relative;width:min(340px,100%);text-align:center;color:#F6EBD0;border-radius:22px;padding:26px 18px 18px;background:linear-gradient(180deg,#17604A,#0B2F25);border:3px solid #E5B64A;box-shadow:0 20px 60px rgba(0,0,0,.6),inset 0 0 0 6px #0E3B2E,inset 0 0 0 7px rgba(229,182,74,.5);animation:vinPop .5s cubic-bezier(.3,1.5,.5,1)}
@keyframes vinPop{from{transform:scale(.6) rotate(-3deg);opacity:0}}
.vinBox::before{content:"";position:absolute;inset:-3px;border-radius:22px;pointer-events:none;background:radial-gradient(circle,#FFF4C2 0 2.2px,transparent 2.8px) 0 0/14px 14px;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;padding:5px;animation:vinChase .5s steps(2) infinite}
@keyframes vinChase{50%{background-position:7px 0;filter:brightness(1.6)}}
.vinTop{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:#E5B64A;font-weight:700}
.vinDay{font:900 1.25rem 'Playfair Display',Georgia,serif;margin:4px 0 2px}
.vinRes{font-size:.92rem;color:#A9C2B5;margin-bottom:14px}
.vinReels{display:flex;gap:6px;justify-content:center;margin:0 auto 14px;padding:8px;border-radius:12px;background:#0B1F18;box-shadow:inset 0 3px 10px #000;width:max-content}
.vinReel{width:78px;height:64px;overflow:hidden;border-radius:8px;background:linear-gradient(180deg,#d9cfb4,#FBF3DC 30%,#FBF3DC 70%,#d9cfb4);position:relative}
.vinReel ul{list-style:none;margin:0;padding:0}
.vinReel li{height:64px;display:grid;place-items:center;font-size:2rem}
.vinWin{font:900 2rem/1.1 'Playfair Display',Georgia,serif;color:#E5B64A;text-shadow:0 0 18px rgba(229,182,74,.6),0 3px 0 #000;margin:4px 0 2px}
.vinAmt{font-size:1.1rem;font-weight:800;color:#7BE0A6}
.vinList{margin:14px 0 4px;display:grid;gap:4px;font-size:.9rem}
.vinList div{display:flex;justify-content:space-between;background:rgba(0,0,0,.2);border-radius:8px;padding:6px 10px}
.vinList .pos{color:#7BE0A6;font-weight:700}.vinList .neg{color:#FF8A80;font-weight:700}.vinList .zero{color:#A9C2B5}
.vinBtn{margin-top:12px;background:#E5B64A;color:#0B2F25;border:0;border-radius:999px;padding:11px 26px;font-weight:800;font-size:1rem}
.vinHide{opacity:0}.vinShow{animation:vinUp .5s cubic-bezier(.3,1.4,.5,1) both}
@keyframes vinUp{from{opacity:0;transform:translateY(14px) scale(.9)}}
.vinCoin{position:fixed;top:-30px;width:22px;height:22px;border-radius:50%;z-index:96;pointer-events:none;background:radial-gradient(circle at 35% 30%,#FFF3C4,#E5B64A 45%,#A87B1E);box-shadow:0 0 0 2px #C89A35 inset}
.vinStage{display:flex;gap:14px;justify-content:center;margin:2px auto 14px;height:72px;align-items:center}
.vinProp{font-size:3rem;line-height:1;display:inline-block}
.vinT .vinTop,.vinT .vinWin{color:var(--acc)}.vinT .vinWin{text-shadow:0 0 18px rgba(0,0,0,.4),0 3px 0 #000}
.vinT .vinBtn{background:var(--acc)}.vinT::before{display:none}
.vinFall{position:fixed;top:-40px;z-index:96;pointer-events:none;font-style:normal;font-size:24px}
@media (prefers-reduced-motion:reduce){.vin,.vinBox,.vinBox::before,.vinShow{animation:none}}`;
  // Themes: the page's <html> carries jul (fx.js) or tema + name (tema.js).
  const T = {
    kasino: null, // slot machine reels
    jul: { c1: "#A51C2E", c2: "#5A0F16", acc: "#F6D36B", top: "Nissen har talt", props: ["🎁", "🎁", "🎁"], win: ["🎅", "⭐", "🎄"], lose: ["🧦", "🪨", "🧦"], anim: "shake", fall: ["❄️", "🍪", "⭐", "❄️"], btn: "Ho ho … OK" },
    paske: { c1: "#5B4A8C", c2: "#2A2045", acc: "#F7D84A", top: "Påskeharen har talt", props: ["🥚", "🥚", "🥚"], win: ["🐣", "🐣", "🐣"], lose: ["🥚", "🍳", "🥚"], anim: "wobble", fall: ["🐣", "🍬", "🌷", "🥚"], btn: "Kykeliky … OK" },
    mai17: { c1: "#1C4590", c2: "#0A1F45", acc: "#F2545B", top: "Hurra for vinneren", props: ["🥁", "🎺", "🥁"], win: ["🇳🇴", "🎉", "🇳🇴"], lose: ["🌧️", "🎺", "🌧️"], anim: "march", fall: ["🇳🇴", "🎈", "🍦", "🎉"], btn: "Hipp hipp … OK" },
    sommer: { c1: "#137089", c2: "#083846", acc: "#FFB347", top: "Sommeren har talt", props: ["☀️", "🌊", "☀️"], win: ["🏆", "🍹", "🏖️"], lose: ["🌧️", "🦀", "🌧️"], anim: "sunset", fall: ["🏐", "🐚", "⭐", "🍹"], btn: "Skål … OK" },
    halloween: { c1: "#3A2552", c2: "#120C1A", acc: "#FF7A1A", top: "Gresskaret har talt", props: ["🎃", "🎃", "🎃"], win: ["🎃", "👑", "🎃"], lose: ["💀", "🕸️", "💀"], anim: "glow", fall: ["🦇", "🍬", "🦇", "🍂"], btn: "Bø … OK" },
  };
  const theme = () => { const c = document.documentElement.classList; return c.contains("jul") ? "jul" : ["paske", "mai17", "sommer", "halloween"].find((t) => c.contains(t)) || "kasino"; };
  const KF = {
    shake: [{ transform: "rotate(0)" }, { transform: "rotate(-14deg) translateY(-4px)" }, { transform: "rotate(12deg)" }, { transform: "rotate(-8deg) translateY(-6px)" }, { transform: "rotate(0)" }],
    wobble: [{ transform: "rotate(0)" }, { transform: "rotate(-18deg)" }, { transform: "rotate(16deg)" }, { transform: "rotate(-10deg) scale(1.05)" }, { transform: "rotate(0)" }],
    march: [{ transform: "translateY(0)" }, { transform: "translateY(-14px) rotate(-6deg)" }, { transform: "translateY(0)" }, { transform: "translateY(-14px) rotate(6deg)" }, { transform: "translateY(0)" }],
    sunset: [{ transform: "translateY(-10px)", filter: "brightness(1.3)" }, { transform: "translateY(18px)", filter: "brightness(.7) saturate(1.6)" }, { transform: "translateY(-10px)", filter: "brightness(1.3)" }],
    glow: [{ filter: "brightness(.35) grayscale(.6)" }, { filter: "brightness(.5)" }, { filter: "brightness(1.6) drop-shadow(0 0 14px #FF7A1A)" }, { filter: "brightness(.6)" }, { filter: "brightness(1.8) drop-shadow(0 0 18px #FF7A1A)" }],
  };
  window.vinner = (info) => {
    const d = top.document, th = T[theme()];
    if (!d.getElementById("vin-css")) { const st = mk(d, "style"); st.id = "vin-css"; st.textContent = CSS; d.head.appendChild(st); }
    const o = mk(d, "div", "vin"), box = mk(d, "div", "vinBox");
    if (th) { box.style.background = `linear-gradient(180deg,${th.c1},${th.c2})`; box.style.borderColor = th.acc; box.style.boxShadow = `0 20px 60px rgba(0,0,0,.6),inset 0 0 0 6px ${th.c2},inset 0 0 0 7px ${th.acc}80`; box.style.setProperty("--acc", th.acc); box.classList.add("vinT"); }
    const best = info.rader.filter((r) => r.netto > 0).sort((a, b) => b.netto - a.netto);
    const win = best.length ? best.filter((r) => r.netto === best[0].netto) : [];
    box.append(mk(d, "div", "vinTop", th ? th.top : "Dagen er avgjort"), mk(d, "div", "vinDay", info.dag), mk(d, "div", "vinRes", info.resultat));
    // Slot machine: three reels of suits/cherries that stop on 7-7-7 (someone won) or a mix (no winner).
    const SYM = ["🍒", "♠️", "🔔", "♦️", "🍋", "♣️", "⭐", "♥️"], end = win.length ? ["7️⃣", "7️⃣", "7️⃣"] : ["🍋", "🍒", "♣️"];
    const reels = mk(d, "div", th ? "vinStage" : "vinReels"), uls = [], props = [];
    if (th) (th.props).forEach((e) => { const x = mk(d, "span", "vinProp", e); reels.appendChild(x); props.push(x); });
    else end.forEach((e) => { const r = mk(d, "div", "vinReel"), ul = mk(d, "ul"); for (let i = 0; i < 14; i++) ul.appendChild(mk(d, "li", null, SYM[(i * 3 + uls.length) % SYM.length])); ul.appendChild(mk(d, "li", null, e)); r.appendChild(ul); reels.appendChild(r); uls.push(ul); });
    box.appendChild(reels);
    const wTxt = mk(d, "div", "vinWin vinHide", win.length ? win.map((r) => r.navn).join(" og ") + (win.length > 1 ? " vant!" : " vant!") : "Ingen vinner");
    const aTxt = mk(d, "div", "vinAmt vinHide", win.length ? "+" + Math.round(win[0].netto) + " " + info.enhet : "Innsatsen går tilbake til alle");
    const list = mk(d, "div", "vinList vinHide");
    info.rader.forEach((r) => { const row = mk(d, "div"); const n = Math.round(r.netto); row.append(mk(d, "span", null, r.navn), mk(d, "span", n > 0 ? "pos" : n < 0 ? "neg" : "zero", (n > 0 ? "+" : "") + n + " " + info.enhet)); list.appendChild(row); });
    const btn = mk(d, "button", "vinBtn vinHide", th ? th.btn : win.length ? "Jackpot … OK" : "OK"); btn.type = "button";
    box.append(wTxt, aTxt, list, btn); o.appendChild(box); d.body.appendChild(o);
    const close = () => { o.classList.add("out"); setTimeout(() => o.remove(), 300); };
    btn.onclick = close; o.onclick = (e) => { if (e.target === o) close(); };
    const reveal = () => {
      [wTxt, aTxt, list, btn].forEach((x, i) => setTimeout(() => { x.classList.remove("vinHide"); x.classList.add("vinShow"); }, i * 220));
      if (th) props.forEach((x, i) => { x.textContent = (win.length ? th.win : th.lose)[i]; if (!still) x.animate([{ transform: "scale(.3) rotate(-20deg)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }], { duration: 450, delay: i * 120, easing: "cubic-bezier(.3,1.6,.5,1)", fill: "backwards" }); });
      if (!win.length || still) return;
      if (th) {
        for (let i = 0; i < 34; i++) {
          const c = mk(d, "i", "vinFall", th.fall[i % th.fall.length]); c.style.left = Math.random() * top.innerWidth + "px"; d.body.appendChild(c);
          c.animate([{ transform: "translateY(0) rotate(0)" }, { transform: `translate(${(Math.random() - 0.5) * 80}px,${top.innerHeight + 60}px) rotate(${(Math.random() - 0.5) * 540}deg)` }], { duration: 2200 + Math.random() * 1400, delay: Math.random() * 1000, easing: "cubic-bezier(.4,.1,.7,.9)", fill: "backwards" }).onfinish = () => c.remove();
        }
        return;
      }
      for (let i = 0; i < 40; i++) {
        const c = mk(d, "i", "vinCoin"); c.style.left = Math.random() * top.innerWidth + "px"; d.body.appendChild(c);
        c.animate([{ transform: "translateY(0) rotateY(0)" }, { transform: `translateY(${top.innerHeight + 60}px) rotateY(${720 + Math.random() * 720}deg)` }], { duration: 1600 + Math.random() * 1200, delay: Math.random() * 900, easing: "cubic-bezier(.4,0,.8,.6)", fill: "backwards" }).onfinish = () => c.remove();
      }
    };
    if (still) { uls.forEach((ul) => (ul.style.transform = "translateY(-" + 14 * 64 + "px)")); return reveal(); }
    if (th) { props.forEach((x, i) => x.animate(KF[th.anim], { duration: 700, iterations: 3, delay: 300 + i * 120, easing: "ease-in-out" })); setTimeout(reveal, 300 + 2100 + 240 + 100); return; }
    uls.forEach((ul, i) => ul.animate([{ transform: "translateY(0)" }, { transform: "translateY(-" + 14 * 64 + "px)" }], { duration: 1200 + i * 450, easing: "cubic-bezier(.2,.6,.3,1.04)", fill: "forwards", delay: 300 }));
    setTimeout(reveal, 300 + 1200 + 2 * 450 + 150);
  };
})();
