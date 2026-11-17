// K3: today's bets as a round card table seen from above. One seat per player (you at the bottom),
// a stack of chips in front of each seat for every bet, and the pot in the middle. A new or changed
// bet slides its chips from the seat to the table. Purely a view of the bets the page already has.
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = `
.bordWrap{margin:0 0 12px}
.bord{position:relative;width:100%;aspect-ratio:16/11;max-height:340px;margin:0 auto;user-select:none}
.bord .felt{position:absolute;inset:9% 4% 13%;border-radius:50%;background:radial-gradient(ellipse at 50% 40%,#1E7A5C,#0F4A37 70%);border:10px solid #6B3E12;box-shadow:0 0 0 2px #C89A35,inset 0 0 0 2px rgba(229,182,74,.55),inset 0 0 30px rgba(0,0,0,.45),0 12px 30px rgba(0,0,0,.45)}
.bord .felt::after{content:"";position:absolute;inset:14%;border-radius:50%;border:1.5px dashed rgba(246,235,208,.25)}
.bord .pot{position:absolute;left:50%;top:29%;transform:translate(-50%,-50%);text-align:center;color:#F6EBD0;line-height:1.15;pointer-events:none;width:44%}
.bord .pot small{display:block;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;opacity:.75}
.bord .pot b{display:block;font:900 1.35rem 'Playfair Display',Georgia,serif;color:#E5B64A;text-shadow:0 2px 0 rgba(0,0,0,.4)}
.bord .pot em{display:block;font-style:normal;font-size:.78rem;opacity:.85}
.bord .seat{position:absolute;transform:translate(-50%,-50%);display:grid;justify-items:center;gap:2px;width:24%;text-align:center}
.bord .av{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font:800 1.05rem Inter,system-ui,sans-serif;background:#F6EBD0;color:#0B2F25;border:3px solid #C89A35;box-shadow:0 3px 8px rgba(0,0,0,.45)}
.bord .seat.me .av{border-color:#E5B64A;box-shadow:0 0 0 3px rgba(229,182,74,.35),0 3px 8px rgba(0,0,0,.45)}
.bord .seat span{font-size:.78rem;font-weight:700;color:var(--ink,#F6EBD0);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.bord .seat small{font-size:.7rem;color:var(--mute,#A9C2B5)}
.bord .spot{position:absolute;transform:translate(-50%,-50%);display:flex;gap:4px;align-items:flex-end}
.bord .stack{position:relative;display:grid;justify-items:center;gap:3px}
.bord .chips{position:relative;width:26px;height:calc(26px + var(--n,1) * 3px)}
.bord .chips i{position:absolute;left:0;width:26px;height:26px;border-radius:50%;bottom:calc(var(--k) * 3px);background:radial-gradient(circle,var(--c) 0 34%,#F6EBD0 35% 40%,var(--c) 41%);box-shadow:0 0 0 2px var(--c),0 1px 0 2px rgba(0,0,0,.35);border:2px dashed rgba(246,235,208,.85);box-sizing:border-box}
.bord .stack.ja{--c:#B3212F}.bord .stack.nei{--c:#1D1D1D}.bord .stack.min{--c:#2A5BD7}
.bord .stack b{font-size:.66rem;font-weight:800;color:#0B2F25;background:#F6EBD0;border-radius:999px;padding:1px 6px;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,.4)}
.bord .stack.won b{background:#7BE0A6}.bord .stack.lost{opacity:.55}
.bord .stack.slide{animation:bordSlide .7s cubic-bezier(.2,.8,.3,1) both}
@keyframes bordSlide{from{transform:translate(var(--dx),var(--dy)) scale(.7);opacity:.2}}
.bord .empty{position:absolute;left:50%;top:56%;transform:translateX(-50%);font-size:.78rem;color:#F6EBD0;opacity:.7;white-space:nowrap}
.gips .bord .felt{background:radial-gradient(ellipse at 50% 40%,#FFFFFF,#E9E5DC 70%);border-color:#B9B2A3;box-shadow:0 0 0 2px #8E8778,inset 0 0 18px rgba(0,0,0,.12),0 10px 24px rgba(0,0,0,.18)}
.gips .bord .pot{color:#2B2B2B}.gips .bord .pot b{color:#1E4FC2;text-shadow:none}.gips .bord .empty{color:#2B2B2B}
`;
  const mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const seen = new Map(); // bet id → ts already shown
  let lastDate = "";
  window.bord = (root, o) => {
    if (!document.getElementById("bord-css")) { const st = mk("style"); st.id = "bord-css"; st.textContent = css; document.head.appendChild(st); }
    const freshDay = o.date !== lastDate; lastDate = o.date;
    const players = [...o.profiles].sort((a, b) => (a.id === o.me ? -1 : b.id === o.me ? 1 : a.id < b.id ? -1 : 1));
    // Seat positions (percent of the table box): you at the bottom, the others at the top corners.
    const SEATS = [[50, 93], [11, 44], [89, 44], [50, 6]];
    const C = [50, 50];
    const b = mk("div", "bord"); b.appendChild(mk("div", "felt"));
    const pot = o.bets.reduce((s, x) => s + x.stake, 0);
    const p = mk("div", "pot");
    if (o.res) p.append(mk("small", null, "Avgjort"), mk("b", null, o.resTxt(o.res)), mk("em", null, pot ? "Pott " + pot + " " + o.unit : "Ingen bets"));
    else p.append(mk("small", null, "Pott"), mk("b", null, pot + " " + o.unit), mk("em", null, o.bets.length ? o.bets.length + (o.bets.length === 1 ? " bet" : " bets") : "Ingen bets ennå"));
    b.appendChild(p);
    const W = root.clientWidth || 340, H = W * 11 / 16;
    players.forEach((pl, i) => {
      const [sx, sy] = SEATS[i] || SEATS[3];
      const s = mk("div", "seat" + (pl.id === o.me ? " me" : "")); s.style.left = sx + "%"; s.style.top = sy + "%";
      s.append(mk("div", "av", (pl.name || "?").trim().charAt(0).toUpperCase()), mk("span", null, pl.name), mk("small", null, Math.round(pl.balance) + " " + o.unit));
      b.appendChild(s);
      const mine = o.bets.filter((x) => x.profile === pl.id).sort((x, y) => (x.type < y.type ? 1 : -1));
      if (!mine.length) return;
      // The betting spot: a bit over halfway from the seat towards the middle.
      // Bet spots: in front of you a little below the middle, the others to the left and right of it.
      const [px, py] = i === 0 ? [50, 66] : i === 1 ? [33, 50] : i === 2 ? [67, 50] : [50, 30];
      const spot = mk("div", "spot"); spot.style.left = px + "%"; spot.style.top = py + "%";
      mine.forEach((x) => {
        const kind = x.type === "min" ? "min" : x.late ? "ja" : "nei";
        const st = mk("div", "stack " + kind + (x.payout != null && o.res && !o.res.void ? (x.payout > x.stake ? " won" : x.payout < x.stake ? " lost" : "") : ""));
        const n = Math.max(1, Math.min(8, Math.ceil(x.stake / 10))), ch = mk("div", "chips"); ch.style.setProperty("--n", n);
        for (let k = 0; k < n; k++) { const c = mk("i"); c.style.setProperty("--k", k); ch.appendChild(c); }
        const g = x.type === "min" ? o.guessOf(x) : null;
        const lbl = (x.type === "min" ? (g == null ? "? min" : g + " min") : x.late ? "Ja" : "Nei") + " · " + x.stake;
        st.append(ch, mk("b", null, lbl));
        const was = seen.get(x.id);
        if (!still && !freshDay && was !== x.ts) {
          st.classList.add("slide");
          st.style.setProperty("--dx", ((sx - px) / 100 * W) + "px"); st.style.setProperty("--dy", ((sy - py) / 100 * H) + "px");
        }
        seen.set(x.id, x.ts);
        spot.appendChild(st);
      });
      b.appendChild(spot);
    });
    if (freshDay) o.bets.forEach((x) => seen.set(x.id, x.ts));
    if (!o.bets.length && !o.res) b.appendChild(mk("div", "empty", "Legg det første bettet under"));
    root.replaceChildren(b);
  };
})();
