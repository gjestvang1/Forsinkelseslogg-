// «Mirakel!»: a rare full-screen celebration when she turns up at least 5 minutes before her
// shift starts (shift times from vakter.js / Innstillinger → Turnus). Shown on the shell so it
// covers both pages, and once per device per day. window.mirakel({tidlig, kl, dato})
// window.tidligNaa(date) → {tidlig, kl} when it is today, she has a shift, and now is before start.
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = (() => { try { return window.parent.document.getElementById("track") ? window.parent : window; } catch (e) { return window; } })();
  const mk = (d, t, c, x) => { const e = d.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

  window.tidligNaa = (date) => {
    const n = new Date();
    if (date !== iso(n) || !window.vaktFor) return null;
    const v = vaktFor(date); if (!v) return null;
    const [h, m] = v.start.split(":").map(Number), t = h * 60 + m - (n.getHours() * 60 + n.getMinutes());
    return t > 0 && t <= 120 ? { tidlig: t, kl: pad(n.getHours()) + ":" + pad(n.getMinutes()), start: v.start } : null;
  };

  const CSS = `
.mir{position:fixed;inset:0;z-index:97;display:grid;place-items:center;padding:20px;overflow:hidden;font-family:Inter,system-ui,sans-serif;background:radial-gradient(circle at 50% 42%,var(--m1),var(--m2) 70%);animation:mirIn .4s ease-out}
.mir.out{opacity:0;transition:opacity .35s}
@keyframes mirIn{from{opacity:0}}
.mirRays{position:absolute;left:50%;top:42%;width:240vmax;height:240vmax;margin:-120vmax 0 0 -120vmax;pointer-events:none;opacity:.55;background:repeating-conic-gradient(from 0deg,var(--ray) 0 6deg,transparent 6deg 18deg);-webkit-mask:radial-gradient(circle,#000 0,#000 8%,transparent 45%);mask:radial-gradient(circle,#000 0,#000 8%,transparent 45%);animation:mirSpin 18s linear infinite}
@keyframes mirSpin{to{transform:rotate(360deg)}}
.mirBox{position:relative;width:min(330px,100%);text-align:center;color:#FFF8E6}
.mirHalo{font-size:4.6rem;line-height:1;display:inline-block;filter:drop-shadow(0 0 24px var(--acc));animation:mirFloat 2.4s ease-in-out infinite}
@keyframes mirFloat{50%{transform:translateY(-10px) rotate(4deg)}}
.mirTop{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--acc);font-weight:800;margin-top:10px}
.mirWord{font:900 3.4rem/1 'Playfair Display',Georgia,serif;margin:6px 0 8px;color:#FFF3C4;text-shadow:0 0 22px var(--acc),0 0 60px var(--acc),0 4px 0 rgba(0,0,0,.45);animation:mirPop .7s cubic-bezier(.3,1.7,.5,1) .2s both}
@keyframes mirPop{from{transform:scale(.2) rotate(-8deg);opacity:0}}
.mirTxt{font-size:1.05rem;font-weight:700;margin:0 0 4px}
.mirSub{font-size:.9rem;opacity:.8;margin:0 0 6px;font-style:italic}
.mirOdds{display:inline-block;margin:10px 0 4px;padding:6px 14px;border-radius:999px;background:rgba(0,0,0,.28);border:1px solid var(--acc);font-size:.82rem;font-weight:700;color:var(--acc)}
.mirBtn{display:block;margin:16px auto 0;background:var(--acc);color:#1B1030;border:0;border-radius:999px;padding:11px 26px;font-weight:800;font-size:1rem}
.mirFall{position:fixed;top:-40px;z-index:98;pointer-events:none;font-style:normal;font-size:22px}
@media (prefers-reduced-motion:reduce){.mir,.mirRays,.mirHalo,.mirWord{animation:none}}`;

  // Per theme: colours, the halo emoji, falling bits and a line or two.
  const T = {
    kasino: { m1: "#3B2A6B", m2: "#0D0820", ray: "rgba(255,226,140,.35)", acc: "#F5C85A", halo: "😇", top: "Huset er sprengt", fall: ["✨", "⭐", "🪙", "♠️", "♥️"], sub: ["Kasinoet stenger for i dag. Ingen kunne forutse dette.", "Krupieren har sett mye, men aldri dette.", "Royal flush, fire ess og en enhjørning. Samtidig."], btn: "Amen … OK" },
    jul: { m1: "#8E1B2E", m2: "#22060B", ray: "rgba(255,236,170,.35)", acc: "#F6D36B", halo: "⭐", top: "Et julemirakel", fall: ["❄️", "⭐", "✨", "🎄"], sub: ["Nissen har strøket henne fra den slemme listen. Midlertidig.", "Stjerna over Betlehem lyste visst over parkeringsplassen.", "Rudolf ble sendt hjem. Hun trengte ikke skyss."], btn: "Halleluja … OK" },
    paske: { m1: "#6A58A8", m2: "#1E1636", ray: "rgba(255,240,150,.35)", acc: "#F7D84A", halo: "🐣", top: "Et påskemirakel", fall: ["🐣", "✨", "🌷", "🥚"], sub: ["Hun sto opp før påskeharen.", "Steinen er rullet fra, og hun er allerede på jobb."], btn: "Halleluja … OK" },
    mai17: { m1: "#1F4FA3", m2: "#08183A", ray: "rgba(255,255,255,.3)", acc: "#F2545B", halo: "🇳🇴", top: "Et nasjonalt mirakel", fall: ["🇳🇴", "✨", "🎉", "🎈"], sub: ["Hun slo til og med barnetoget.", "Kongen vinker. Til henne."], btn: "Hurra … OK" },
    sommer: { m1: "#1A8AA6", m2: "#062A36", ray: "rgba(255,230,160,.35)", acc: "#FFB347", halo: "☀️", top: "Et sommermirakel", fall: ["✨", "🌞", "🐚", "⭐"], sub: ["Midnattssola var visst nok vekkerklokke.", "Hun kom før sola sto ordentlig opp."], btn: "Skål … OK" },
    halloween: { m1: "#4A2E6A", m2: "#0E0814", ray: "rgba(255,140,40,.35)", acc: "#FF7A1A", halo: "👻", top: "Et uhyggelig mirakel", fall: ["🦇", "✨", "🎃", "🕯️"], sub: ["Er det virkelig henne, eller et gjenferd?", "Selv gresskarene måper."], btn: "Bø … OK" },
  };
  const theme = () => { const c = top.document.documentElement.classList; return c.contains("jul") ? "jul" : ["paske", "mai17", "sommer", "halloween"].find((t) => c.contains(t)) || "kasino"; };
  // Work-flavoured comparisons for how early she was.
  const unit = (m) => m >= 40 ? "Det rekker et helt CTS-inngrep før vakta." : m >= 30 ? "Det rekker en hel håndleddsreponering før vakta." : m >= 15 ? "Det rekker å gipse en hånd før vakta." : m >= 5 ? "Det rekker å tilpasse en Aircast før vakta." : "";

  window.mirakel = (info) => {
    const dato = info.dato || iso(new Date()), k = "forsinkelseslogg:mirakel:" + dato;
    if (!info.force && ls.get(k)) return false;
    ls.set(k, "1");
    const d = top.document, th = T[theme()];
    if (!d.getElementById("mir-css")) { const st = mk(d, "style"); st.id = "mir-css"; st.textContent = CSS; d.head.appendChild(st); }
    const o = mk(d, "div", "mir");
    ["m1", "m2", "ray", "acc"].forEach((c) => o.style.setProperty("--" + c, th[c]));
    const box = mk(d, "div", "mirBox");
    const sub = th.sub[Math.floor(Math.random() * th.sub.length)];
    box.append(
      mk(d, "span", "mirHalo", th.halo),
      mk(d, "div", "mirTop", th.top),
      mk(d, "div", "mirWord", "Mirakel!"),
      mk(d, "p", "mirTxt", "Hun kom " + info.tidlig + " min før vakta" + (info.kl ? " (kl. " + info.kl + ")" : "") + "."),
      mk(d, "p", "mirSub", unit(info.tidlig) || sub),
    );
    if (unit(info.tidlig)) box.appendChild(mk(d, "p", "mirSub", sub));
    box.appendChild(mk(d, "span", "mirOdds", "Odds: 1 til " + (1000 + info.tidlig * 731).toLocaleString("nb-NO")));
    const btn = mk(d, "button", "mirBtn", th.btn); btn.type = "button"; box.appendChild(btn);
    o.append(mk(d, "div", "mirRays"), box); d.body.appendChild(o);
    const close = () => { o.classList.add("out"); setTimeout(() => { o.remove(); info.onClose && info.onClose(); }, 350); };
    btn.onclick = close; o.onclick = (e) => { if (e.target === o) close(); };
    if (navigator.vibrate) try { navigator.vibrate([60, 40, 60, 40, 200]); } catch (e) {}
    if (still) return true;
    for (let i = 0; i < 44; i++) {
      const c = mk(d, "i", "mirFall", th.fall[i % th.fall.length]); c.style.left = Math.random() * top.innerWidth + "px"; d.body.appendChild(c);
      c.animate([{ transform: "translateY(0) rotate(0)", opacity: 1 }, { transform: `translate(${(Math.random() - 0.5) * 90}px,${top.innerHeight + 60}px) rotate(${(Math.random() - 0.5) * 540}deg)`, opacity: 0.9 }], { duration: 2600 + Math.random() * 1800, delay: 300 + Math.random() * 1600, easing: "cubic-bezier(.4,.1,.7,.9)", fill: "backwards" }).onfinish = () => c.remove();
    }
    return true;
  };
  // Preview: ?mirakel or ?mirakel=17 (minutes early).
  let q = location.search; try { q += top.location.search; } catch (e) {}
  const pv = q.match(/mirakel(?:=(\d+))?/);
  if (pv && !top.__mirPreview) { top.__mirPreview = 1; setTimeout(() => window.mirakel({ tidlig: +(pv[1] || 12), kl: "07:" + pad(30 - Math.min(30, +(pv[1] || 12))), force: true }), 1500); }
})();
