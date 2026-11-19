// Small jokes and Easter eggs (chosen by Andreas). Texts always work; motion respects reduced-motion.
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const onLog = !!document.getElementById("wk");
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const monday = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const fridayAfternoon = () => { const n = new Date(); return n.getDay() === 5 && n.getHours() >= 15; };

  // Norwegian number words for small counts, otherwise digits with a decimal comma.
  const WORDS = ["null", "én", "to", "tre", "fire", "fem", "seks", "sju", "åtte", "ni", "ti", "elleve", "tolv"];
  const num = (x) => { const r = Math.round(x * 2) / 2; return Number.isInteger(r) && r <= 12 ? WORDS[r] : String(r).replace(".", ","); };
  const unit = (x, one, many) => num(x) + " " + (Math.round(x * 2) / 2 === 1 ? one : many);

  // i2: the week's minutes in other units. Work things, everyday things and pure jokes.
  const CONV = [
    (m) => m >= 15 && "= " + unit(m / 15, "gipset hånd", "gipsede hender"),
    (m) => m >= 30 && "= " + unit(m / 30, "reponert håndledd", "reponerte håndledd"),
    (m) => m >= 40 && "= " + unit(m / 40, "CTS-inngrep", "CTS-inngrep"),
    (m) => m >= 3 && "= " + unit(m / 3, "par buddy loops lagt på", "par buddy loops lagt på"),
    (m) => m >= 5 && "= " + unit(m / 5, "tilpasset Aircast", "tilpassede Aircaster"),
    (m) => m >= 20 && "= " + unit(m / 20, "tilpasset Aircast", "tilpassede Aircaster") + " og " + unit((m % 20) / 3 || 1, "par buddy loops", "par buddy loops"),
    (m) => m >= 2 && "= " + Math.round(m / 1.5) + " kopper kaffe som ble kalde",
    (m) => m >= 9 && "= " + unit(m / 9, "trykk på snooze", "trykk på snooze"),
    (m) => m >= 15 && "= " + unit(m / 30, "episode av Dagsrevyen", "episoder av Dagsrevyen"),
    (m) => m >= 6 && "= " + unit(m / 6, "bløtkokt egg", "bløtkokte egg"),
    (m) => m >= 6 && "= " + unit(m / 6, "Bohemian Rhapsody", "Bohemian Rhapsody-er") + " på repeat",
    (m) => m >= 30 && "= " + unit(m / 30, "Teams-møte som kunne vært en e-post", "Teams-møter som kunne vært en e-post"),
    (m) => m >= 20 && "= " + unit(m / 20, "powernap", "powernaps") + " (som hun sikkert tok)",
    (m) => m >= 4 && "= " + unit(m / 4, "tur i kaffekøen", "turer i kaffekøen"),
    (m) => m >= 10 && "= nok tid til å lese hele personalhåndboka (ingen har gjort det)",
    (m) => m >= 10 && "= tiden det tar å finne en ledig parkeringsplass. Kanskje.",
    (m) => m >= 25 && "= én hel lunsjpause. Uten lunsj.",
    (m) => m >= 1 && "= " + Math.round(m * 60) + " sekunder kollegaene aldri får tilbake",
    (m) => m >= 1 && "= " + Math.round(m * 70) + " hjerteslag av ren venting",
    (m) => m >= 45 && "= en halv fotballkamp. Hun ville kommet til andre omgang.",
    (m) => m >= 12 && "= " + unit(m / 12, "hånd", "hender") + " med buddy loops på alle fingrene",
    (m) => m >= 10 && "= " + unit(m / 10, "kontrollrøntgen", "kontrollrøntgen") + " av samme håndledd",
    (m) => m >= 2 && "= " + Math.round(m / 2) + " håndvasker etter smittevernreglene",
    (m) => m >= 2 && "= " + Math.round(m / 2) + " ganger noen sa «hvor er hun?»",
    (m) => m >= 7 && "= " + unit(m / 7, "tur", "turer") + " med heisen som stopper i alle etasjer",
    (m) => m >= 2 && "= " + Math.round(m / 2) + " pasienter som rakk å spørre «er det lenge igjen?»",
    (m) => m >= 60 && "= en hel ventetid på legevakta. Nesten.",
    (m) => m >= 20 && "= " + unit(m / 10, "gips", "gipser") + " som rakk å stivne",
    // Picked from the conversions artifact, 2026-11-19.
    (m) => m >= 4 && "= " + Math.round(m / 2) + " fingerskinner tapet",
    (m) => m >= 8 && "= " + Math.round(m / 4) + " runder med gipssaga, med hørselvern",
    (m) => m >= 12 && "= " + Math.round(m / 6) + " sterile felt dekket til CTS",
    (m) => m >= 12 && "= " + Math.round(m / 6) + " henvisninger skrevet (med skrivefeil)",
    (m) => m >= 6 && "= " + Math.round(m / 3) + " runder med «hvem har tatt saksa mi?»",
    (m) => m >= 8 && "= " + Math.round(m / 4) + " turer til lageret etter feil størrelse",
    (m) => m >= 20 && "= " + Math.round(m / 10) + " journalnotater som aldri blir skrevet ferdig",
    (m) => m >= 30 && "= " + Math.round(m / 15) + " HLR-øvelser med dukke",
    (m) => m >= 6 && "= " + Math.round(m / 3) + " vafler stekt",
    (m) => m >= 30 && "= " + Math.round(m / 15) + " Grandiosaer i ovnen",
    (m) => m >= 20 && "= " + Math.round(m / 10) + " isbiter som rakk å smelte",
    (m) => m >= 50 && "= en hel flytur Oslo–Bergen",
    (m) => m >= 90 && "= " + Math.round(m / 45) + " episoder av Farmen",
    (m) => m >= 100 && "= en hel spillefilm, med rulletekst",
    (m) => m >= 120 && "= en kjøretur fra Oslo til Lillehammer. Nesten.",
  ];
  const ZERO = ["0 min = 0 gipsede hender. Mistenkelig.", "0 min. Kaffen er fortsatt varm.", "0 min = tid til ingenting. Imponerende."];

  // i1: a subtitle that follows the week's total.
  const SUB = [
    [0, ["Rolig uke. Mistenkelig rolig.", "Null minutter. Noen bør sjekke at appen virker.", "Så langt, så punktlig. Vi følger med.", "Ingen forsinkelser ennå. Vi holder pusten.", "Null minutter. Appen kjeder seg.", "Rent rulleblad. Det er tidlig i uka."]],
    [15, ["Litt sent, litt søtt.", "Småsent. Nesten innenfor feilmarginen.", "Et par minutter her og der. Hvem teller? (Vi.)", "Bare noen få minutter. Sier hun.", "Små beløp, men renta løper.", "Litt sent er også sent."]],
    [45, ["Kaffemaskinen har gitt opp å vente.", "Det begynner å bli en vane.", "Klokka på veggen har begynt å sukke.", "Nå begynner det å koste.", "Snart en hel lunsjpause. Uten lunsj."]],
    [90, ["Nå snakker vi forsinkelse.", "Klokka på kontoret har begynt å ta det personlig.", "Sjefen har begynt å spørre.", "Vi har sluttet å bli overrasket.", "Uka hennes er en arbeidsdag kortere enn vår. Nesten."]],
    [1e9, ["Rekordjakt pågår.", "Dette er ikke lenger forsinkelse, det er en livsstil.", "Noen bør vurdere en vekkerklokke. Eller tre.", "Hun bør få sin egen tidssone.", "Uka går mot rekord. Hun går mot jobb. Sakte.", "Vi vurderer å flytte morgenmøtet til lunsj."]],
  ];

  function el(tag, cls, after) { let e = document.querySelector(tag + "." + cls); if (!e) { e = document.createElement(tag); e.className = cls; after.insertAdjacentElement("afterend", e); } return e; }

  let lastWeek = null, lastSub = "", lastConv = "", last30 = null, lastConv30 = "";
  function logg(entries, fresh) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const wk = monday(today).getTime();
    const week = entries.filter((e) => monday(parse(e.date)).getTime() === wk).reduce((s, e) => s + e.min, 0);
    const h1 = document.querySelector("h1"), big = document.getElementById("wk");
    if (week !== lastWeek) {
      lastWeek = week;
      const lvl = SUB.find(([max]) => week <= max)[1];
      lastSub = pick(lvl.filter((t) => t !== lastSub));
      const opts = week ? CONV.map((f) => f(week)).filter(Boolean).filter((t) => t !== lastConv) : ZERO;
      lastConv = pick(opts.length ? opts : ZERO);
    }
    el("p", "subline", h1).textContent = fridayAfternoon() ? "Hun kom kanskje sent, men går presis." : lastSub;
    el("p", "conv", big).textContent = lastConv;
    // Same kind of comment for the last 30 days, under the stats row.
    const d30 = new Date(today); d30.setDate(d30.getDate() - 30);
    const m30 = entries.filter((e) => { const t = parse(e.date); return t >= d30 && t <= today; }).reduce((s, e) => s + e.min, 0);
    if (m30 !== last30) {
      last30 = m30;
      const opts = m30 ? CONV.map((f) => f(m30)).filter(Boolean).filter((t) => t !== lastConv30 && t !== lastConv) : ZERO;
      lastConv30 = pick(opts.length ? opts : ZERO);
    }
    const stats = document.querySelector(".stats");
    if (stats) { const c = el("p", "conv30", stats); c.replaceChildren(); const b = document.createElement("b"); b.textContent = "Siste 30 dager "; c.append(b, lastConv30.replace(/^0 min /, "")); }
    // i6: no delays for a while.
    const last = entries.reduce((m, e) => (e.date > m ? e.date : m), "");
    const days = last ? Math.round((today - parse(last)) / 864e5) : 0;
    const quiet = el("p", "quiet", document.querySelector(".conv"));
    quiet.textContent = days >= 3 ? "Ingen forsinkelser på " + days + " dager. Vi har ringt for å høre om hun har det bra." : "";
    quiet.hidden = days < 3;
    // a1 / a2: snail over 15 min, melting week box over 30 min (for entries that just arrived).
    const worst = Math.max(0, ...fresh.map((e) => e.min));
    if (!still && worst > 15) snail();
    if (!still && worst > 30) melt(document.querySelector(".hero"));
  }

  function topDoc() { try { return window.parent.document.getElementById("track") ? window.parent.document : document; } catch (e) { return document; } }
  function snail() {
    const d = topDoc(), s = d.createElement("div");
    s.textContent = "🐌"; s.setAttribute("aria-hidden", "true");
    s.style.cssText = "position:fixed;left:0;bottom:calc(14px + env(safe-area-inset-bottom,0px));font-size:30px;z-index:75;pointer-events:none;transform:scaleX(-1)";
    d.body.appendChild(s);
    const w = (d.defaultView || window).innerWidth;
    s.animate([{ transform: "translateX(-40px) scaleX(-1)" }, { transform: `translateX(${w + 10}px) scaleX(-1)` }], { duration: 9000, easing: "linear" }).onfinish = () => s.remove();
  }
  function melt(box) {
    if (!box) return;
    box.animate([
      { transform: "none", borderRadius: "14px", filter: "none" },
      { transform: "scaleY(1.12) skewX(-3deg)", transformOrigin: "50% 0", borderRadius: "14px 14px 40px 60px", filter: "blur(.4px)", offset: 0.45 },
      { transform: "scaleY(1.18) skewX(2deg)", transformOrigin: "50% 0", borderRadius: "14px 14px 70px 30px", filter: "blur(.6px)", offset: 0.7 },
      { transform: "none", borderRadius: "14px", filter: "none" },
    ], { duration: 2600, easing: "ease-in-out" });
  }

  // e1: tap ♠ ♥ ♣ ♦ in that order to make it rain chips.
  const h1 = document.querySelector("h1");
  if (h1) {
    const row = document.createElement("p"); row.className = "suits";
    const seq = []; const want = "♠♥♣♦";
    for (const c of want) {
      const b = document.createElement("button"); b.type = "button"; b.textContent = c + "\uFE0E"; b.setAttribute("aria-label", "Kortsymbol " + c);
      b.onclick = () => {
        seq.push(c); if (seq.length > 4) seq.shift();
        if (!still) b.animate([{ transform: "scale(1)" }, { transform: "scale(1.5) rotate(15deg)" }, { transform: "scale(1)" }], { duration: 300 });
        if (seq.join("") === want) { seq.length = 0; if (window.fx && fx.rain) fx.rain("Huset spanderer! 🎰"); else if (window.fxCard) fxCard("🎰", "Huset spanderer!", "OK"); }
      };
      row.appendChild(b);
    }
    h1.insertAdjacentElement("beforebegin", row);
    document.documentElement.classList.add("has-suits");
  }

  // e5: Friday afternoon shimmer.
  if (fridayAfternoon()) document.documentElement.classList.add("friday");

  // e4: opening the app between 07:30 and 07:35 (any day: shift work; once a day; log page only).
  if (onLog) {
    const n = new Date(), t = n.getHours() * 60 + n.getMinutes(), k = "forsinkelseslogg:0730";
    if (t >= 450 && t < 455 && store.get(k) !== iso(n)) {
      store.set(k, iso(n));
      setTimeout(() => window.fxCard && fxCard("⏰", "Klokka er halv åtte. Hun er ikke her. Selvfølgelig.", "Som forventet"), 1200);
    }
  }

  window.fun = { logg };
})();
