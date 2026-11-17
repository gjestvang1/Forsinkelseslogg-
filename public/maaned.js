// Månedsrapport: the first time the app is opened in a new month (within the first 10 days), a
// themed card sums up last month: minutes late, days late, shifts on time, worst day, extra
// lunch, miracles, and who won the betting. Once per device per month. Preview with ?rapport
// (last month) or ?rapport=YYYY-MM. Data comes from logg.html via window.rapportData.
(() => {
  const top = (() => { try { return window.parent.document.getElementById("track") ? window.parent : window; } catch (e) { return window; } })();
  const mk = (d, t, c, x) => { const e = d.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const pad = (n) => String(n).padStart(2, "0");
  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const fmt = (m) => { m = Math.round(m); if (m < 60) return m + " min"; const h = Math.floor(m / 60), r = m % 60; return h + " t" + (r ? " " + r + " min" : ""); };
  const mName = (m, year) => { const [y, mo] = m.split("-").map(Number); return new Date(y, mo - 1, 1).toLocaleDateString("nb-NO", year ? { month: "long", year: "numeric" } : { month: "long" }); };
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const prevMonth = (m) => { const [y, mo] = m.split("-").map(Number), d = new Date(y, mo - 2, 1); return d.getFullYear() + "-" + pad(d.getMonth() + 1); };
  const K = "forsinkelseslogg:rapport";

  const CSS = `
.rap{position:fixed;inset:0;z-index:94;display:flex;padding:16px;overflow:auto;background:rgba(0,0,0,.62);font-family:Inter,system-ui,sans-serif;animation:rapIn .3s ease-out}
.rap.out{opacity:0;transition:opacity .3s}
@keyframes rapIn{from{opacity:0}}
.rapBox{position:relative;margin:auto;width:min(350px,100%);color:#F6EBD0;border-radius:22px;padding:22px 18px 16px;background:linear-gradient(180deg,var(--c1),var(--c2));border:3px solid var(--acc);box-shadow:0 20px 60px rgba(0,0,0,.6),inset 0 0 0 6px var(--c2),inset 0 0 0 7px color-mix(in srgb,var(--acc) 50%,transparent);animation:rapPop .5s cubic-bezier(.3,1.5,.5,1)}
@keyframes rapPop{from{transform:translateY(30px) scale(.85);opacity:0}}
.rapHead{text-align:center}
.rapIco{font-size:2.4rem;line-height:1}
.rapTop{font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--acc);font-weight:800;margin-top:6px}
.rapMon{font:900 1.6rem/1.1 'Playfair Display',Georgia,serif;margin:2px 0 12px}
.rapBig{text-align:center;margin:0 0 12px}
.rapBig b{display:block;font:900 2.4rem/1 'Playfair Display',Georgia,serif;color:var(--acc);text-shadow:0 3px 0 rgba(0,0,0,.4)}
.rapBig small{font-size:.85rem;opacity:.8}
.rapGrid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px}
.rapGrid div{background:rgba(0,0,0,.22);border-radius:10px;padding:8px 10px}
.rapGrid b{display:block;font-size:1.05rem}
.rapGrid span{font-size:.72rem;opacity:.75}
.rapWorst{background:rgba(0,0,0,.22);border-radius:10px;padding:8px 10px;margin-bottom:10px;font-size:.88rem}
.rapWorst b{color:#FF9E94}
.rapH{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--acc);font-weight:800;margin:4px 0 6px}
.rapBet{display:grid;gap:4px;font-size:.9rem;margin-bottom:6px}
.rapBet div{display:flex;justify-content:space-between;gap:8px;background:rgba(0,0,0,.2);border-radius:8px;padding:6px 10px}
.rapBet .w{outline:2px solid var(--acc)}
.rapBet .pos{color:#7BE0A6;font-weight:700}.rapBet .neg{color:#FF8A80;font-weight:700}.rapBet .zero{opacity:.7}
.rapJoke{text-align:center;font-style:italic;font-size:.86rem;opacity:.85;margin:10px 4px 4px}
.rapBtns{display:flex;gap:8px;justify-content:center;margin-top:12px}
.rapBtns button{border:0;border-radius:999px;padding:10px 20px;font-weight:800;font-size:.95rem;font-family:inherit}
.rapBtns .ok{background:var(--acc);color:#14231C}
.rapBtns .del{background:transparent;color:var(--acc);border:2px solid var(--acc)}
@media (prefers-reduced-motion:reduce){.rap,.rapBox{animation:none}}`;
  const T = {
    kasino: { c1: "#17604A", c2: "#0B2F25", acc: "#E5B64A", ico: "🎰", top: "Kasinoets månedsrapport" },
    jul: { c1: "#A51C2E", c2: "#5A0F16", acc: "#F6D36B", ico: "🎅", top: "Nissens månedsrapport" },
    paske: { c1: "#5B4A8C", c2: "#2A2045", acc: "#F7D84A", ico: "🐣", top: "Påskeharens månedsrapport" },
    mai17: { c1: "#1C4590", c2: "#0A1F45", acc: "#F2545B", ico: "🇳🇴", top: "Månedsrapport" },
    sommer: { c1: "#137089", c2: "#083846", acc: "#FFB347", ico: "☀️", top: "Sommerens månedsrapport" },
    halloween: { c1: "#3A2552", c2: "#120C1A", acc: "#FF7A1A", ico: "🎃", top: "Gresskarets månedsrapport" },
  };
  const theme = () => { const c = top.document.documentElement.classList; return c.contains("jul") ? "jul" : ["paske", "mai17", "sommer", "halloween"].find((t) => c.contains(t)) || "kasino"; };
  // Workplace conversions (casts and wrists) for the month's total.
  const joke = (m) => {
    if (!m) return "Ikke ett minutt for sent hele måneden. Noen bør sjekke om hun har en tvilling.";
    if (m >= 120) return "Det tilsvarer " + Math.floor(m / 40) + " CTS-inngrep, eller " + Math.floor(m / 15) + " gipsede hender.";
    if (m >= 30) return "Det tilsvarer " + Math.floor(m / 30) + (m >= 60 ? " håndleddsreponeringer" : " håndleddsreponering") + ", eller " + Math.floor(m / 15) + " gipsede hender.";
    if (m >= 15) return "Det tilsvarer " + Math.floor(m / 15) + (m >= 30 ? " gipsede hender." : " gipset hånd.");
    return "Det tilsvarer " + Math.floor(m / 3) + " sett med buddy loops.";
  };

  function stats(m, data) {
    const ent = (data.entries || []).filter((e) => e.date.slice(0, 7) === m), lu = (data.lunch || []).filter((e) => e.date.slice(0, 7) === m);
    const byDay = {}; ent.forEach((e) => (byDay[e.date] = (byDay[e.date] || 0) + e.min));
    const total = ent.reduce((s, e) => s + e.min, 0), days = Object.keys(byDay);
    const worst = days.sort((a, b) => byDay[b] - byDay[a] || (a < b ? -1 : 1))[0];
    // Shifts that month (vakter.js + overrides) up to today; on time = shift day without a delay.
    const [y, mo] = m.split("-").map(Number), n = new Date(y, mo, 0).getDate(), today = new Date();
    let shifts = 0, onTime = 0;
    if (window.vaktFor) for (let i = 1; i <= n; i++) {
      const d = m + "-" + pad(i); if (new Date(y, mo - 1, i) > today) break;
      if (vaktFor(d)) { shifts++; if (!byDay[d]) onTime++; }
    }
    const b = data.betting || {}, res = b.results || {};
    const miracles = Object.entries(res).filter(([d, r]) => d.slice(0, 7) === m && r.tidlig >= 5).length;
    const names = Object.fromEntries((b.profiles || []).map((p) => [p.id, p.name])), start = b.start || 100;
    const bets = (b.bets || []).filter((x) => x.date.slice(0, 7) === m);
    const bal = bets.length ? Object.entries((b.months || {})[m] || {}).map(([id, v]) => ({ navn: names[id] || id, netto: v - start })).sort((p, q) => q.netto - p.netto) : [];
    const prevTot = (data.entries || []).filter((e) => e.date.slice(0, 7) === prevMonth(m)).reduce((s, e) => s + e.min, 0);
    return { total, lateDays: days.length, worst, worstMin: worst ? byDay[worst] : 0, lunch: lu.reduce((s, e) => s + e.min, 0), shifts, onTime, miracles, bal, nBets: bets.length, prevTot, hasPrev: (data.entries || []).some((e) => e.date.slice(0, 7) === prevMonth(m)) };
  }

  function show(m, data) {
    const s = stats(m, data);
    if (!s.lateDays && !s.nBets && !s.lunch && !s.shifts) return false;
    const d = top.document, th = T[theme()], U = top.document.documentElement.classList.contains("jul") ? "pepperkaker" : "cr";
    if (!d.getElementById("rap-css")) { const st = mk(d, "style"); st.id = "rap-css"; st.textContent = CSS; d.head.appendChild(st); }
    const o = mk(d, "div", "rap"), box = mk(d, "div", "rapBox");
    ["c1", "c2", "acc"].forEach((c) => box.style.setProperty("--" + c, th[c]));
    const head = mk(d, "div", "rapHead");
    head.append(mk(d, "div", "rapIco", th.ico), mk(d, "div", "rapTop", th.top), mk(d, "div", "rapMon", cap(mName(m, true))));
    const big = mk(d, "div", "rapBig"); big.append(mk(d, "b", null, fmt(s.total)), mk(d, "small", null, "for sent til sammen" + (s.hasPrev ? " · " + (s.total === s.prevTot ? "like mye som " : s.total > s.prevTot ? fmt(s.total - s.prevTot) + " mer enn " : fmt(s.prevTot - s.total) + " mindre enn ") + mName(prevMonth(m)) : "")));
    const grid = mk(d, "div", "rapGrid");
    const cell = (v, l) => { const c = mk(d, "div"); c.append(mk(d, "b", null, v), mk(d, "span", null, l)); grid.appendChild(c); };
    cell(String(s.lateDays), s.lateDays === 1 ? "dag for sent" : "dager for sent");
    if (s.shifts) cell(s.onTime + " av " + s.shifts, "vakter i tide"); else cell(s.lateDays ? fmt(s.total / s.lateDays) : "–", "snitt per sen dag");
    cell(s.lunch ? fmt(s.lunch) : "0 min", "ekstra lunsj");
    cell(String(s.miracles), s.miracles === 1 ? "mirakel" : "mirakler");
    box.append(head, big, grid);
    if (s.worst) {
      const w = mk(d, "div", "rapWorst"), [y, mo, dd] = s.worst.split("-").map(Number), v = window.vaktFor && vaktFor(s.worst);
      w.append("Verste dag: ", mk(d, "b", null, fmt(s.worstMin)), " · " + new Date(y, mo - 1, dd).toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" }) + (v ? " (" + v.kode + ")" : ""));
      box.appendChild(w);
    }
    if (s.bal.length) {
      box.appendChild(mk(d, "div", "rapH", "Betting · " + s.nBets + (s.nBets === 1 ? " bet" : " bets")));
      const list = mk(d, "div", "rapBet"), best = s.bal[0].netto;
      s.bal.forEach((r, i) => { const n = Math.round(r.netto), row = mk(d, "div", best > 0 && r.netto === best ? "w" : null); row.append(mk(d, "span", null, (best > 0 && r.netto === best ? "🏆 " : "") + r.navn), mk(d, "span", n > 0 ? "pos" : n < 0 ? "neg" : "zero", (n > 0 ? "+" : "") + n + " " + U)); list.appendChild(row); });
      box.appendChild(list);
    }
    box.appendChild(mk(d, "p", "rapJoke", joke(s.total)));
    const btns = mk(d, "div", "rapBtns"), del = mk(d, "button", "del", "Del"), ok = mk(d, "button", "ok", "OK");
    del.type = ok.type = "button"; btns.append(del, ok); box.appendChild(btns);
    o.appendChild(box); d.body.appendChild(o);
    const close = () => { o.classList.add("out"); setTimeout(() => o.remove(), 300); };
    ok.onclick = close; o.onclick = (e) => { if (e.target === o) close(); };
    // Share as plain text (no names of the colleague; profile names are the players').
    del.onclick = async () => {
      const win = s.bal.length && s.bal[0].netto > 0 ? s.bal.filter((r) => r.netto === s.bal[0].netto).map((r) => r.navn).join(" og ") : "";
      const txt = ["Forsinkelseslogg · " + cap(mName(m, true)), "For sent: " + fmt(s.total) + " på " + s.lateDays + (s.lateDays === 1 ? " dag" : " dager"), s.shifts ? "I tide: " + s.onTime + " av " + s.shifts + " vakter" : "", s.worst ? "Verste dag: " + fmt(s.worstMin) : "", s.miracles ? "Mirakler: " + s.miracles : "", win ? "Bettingvinner: " + win + " (+" + Math.round(s.bal[0].netto) + " " + U + ")" : "", joke(s.total)].filter(Boolean).join("\n");
      try { if (navigator.share) await navigator.share({ text: txt }); else { await navigator.clipboard.writeText(txt); del.textContent = "Kopiert"; } } catch (e) {}
    };
    return true;
  }

  let tries = 0;
  function check() {
    const data = window.rapportData; if (!data) return;
    let q = location.search; try { q += top.location.search; } catch (e) {}
    const forced = q.match(/rapport(?:=(\d{4}-\d{2}))?/), now = new Date(), cur = now.getFullYear() + "-" + pad(now.getMonth() + 1), last = prevMonth(cur);
    if (forced) { if (!window.__rapportForced) { window.__rapportForced = 1; show(forced[1] || last, data); } return; }
    const seen = ls.get(K);
    if (seen === last) return;
    if (now.getDate() > 10) { ls.set(K, last); return; } // too late to bother; next month instead
    // Let the winner reveal, a miracle or a casino card finish first.
    if (top.document.querySelector(".vin,.mir,.fxcard,.ovl")) { if (tries++ < 20) setTimeout(check, 2000); return; }
    ls.set(K, last);
    show(last, data);
  }
  window.rapport = (data) => { window.rapportData = data; setTimeout(check, 2500); };
  window.visRapport = (m) => window.rapportData && show(m, window.rapportData);
  if (window.rapportData) window.rapport(window.rapportData);
})();
