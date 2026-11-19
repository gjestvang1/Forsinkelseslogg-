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
    sent: ["All in på snooze-knappen. Igjen.", "Hun bløffer ikke. Hun er bare sen.", "Pokerfjes på plass. Klokka var visst ikke det.", "Bussen gikk visst. Det gjorde ikke hun.", "Kaffen er kald. Møtet er over. Velkommen!", "Forsinkelsen er registrert. Unnskyldningen er under utarbeidelse.", "Huset vinner alltid. Vekkerklokka vinner aldri.", "Noen gipser hender. Andre gipser seg fast i madrassen.", "Det var ikke trafikken. Det har aldri vært trafikken.", "Det tar fem minutter å tilpasse en Aircast. Hun brukte lenger tid på å finne nøklene.", "Sjetongene ruller. Det gjør ikke hun.", "Velkommen! Vi har gjort halve jobben din. Den kjedelige halvdelen.", "Buddy loops holder to fingre sammen. Ingenting holder henne til klokka.", "Hun er som en hemoroide: dukker opp når det passer henne, og ingen vil snakke om det.", "Hun er treg som et urinkateter i januar.", "Hun er som en pung en kald morgen. Trekker seg tilbake og nekter å komme ut.", "Hun er som en ingrodd tånegl. Vondt for alle rundt henne.", "Kaffemaskinen står og damper og venter, som en singel 35-åring på julebord."],
    tide: ["Royal flush! Sannsynligheten var 1 til 649 740.", "Huset taper i dag. Nyt det, det skjer ikke ofte.", "Hun møtte opp i tide. Banken er sprengt.", "I tide. Ta et skjermbilde, ingen kommer til å tro deg.", "Hun kom i tide. Klokka på kontoret er sendt til kontroll.", "Punktlig. Enten er klokka hennes stilt fram, eller så er hun byttet ut.", "I tide! Noen bør ringe Guinness. Eller i det minste avdelingslederen.", "Hun kom i tide, og ingen var forberedt. Kaffen var ikke engang ferdig.", "Ingen forsinkelse i dag. Snooze-knappen er sykmeldt.", "Hun var her 07:30. Vi måtte spørre hva hun het.", "I tide. Kom like brått og uventet som en diaré.", "I tide! Like overraskende som en ekstra testikkel.", "I tide! Like sjeldent som at begge kommer samtidig."],
    bet: ["Smart bet. Eller rettere sagt: et trygt bet.", "Du satser mot en kvinne som bruker «snart» som klokkeslett. Modig.", "Bettet er registrert. Hennes vekkerklokke er ikke informert.", "Oddsen er god. Det er punktligheten ikke.", "Bettet er låst. Det er ikke morgenrutinen hennes.", "Du satser på statistikk. Hun satser på flaks.", "Trygt bet. Som å satse på at gips er hvitt.", "En investeringsrådgiver ville kalt dette en sikker plassering."],
    lunsj: ["Lunsjen var visst all inclusive.", "Hun satset alt på dessert. Huset vant ikke.", "Kantina stenger klokka 13. Hun tok det som et forslag.", "Matpakka er spist. Pausen fortsetter.", "Ekstra lunsj registrert. Kasinoet tar ikke betalt for minuttene. Det burde det.", "Lunsjen er 30 minutter. Hennes var en spillefilm.", "Hun tok lunsj. Lunsjen tok henne.", "Ekstra lunsj registrert. Matpakka har fått overtid.", "Hun gikk for å spise. Hun ble for å fordøye.", "Pausen ble forlenget. Ingen spurte, ingen godkjente.", "En hel håndleddsreponering, brukt på dessert.", "Kantina vurderer å gi henne fast plass med navneskilt.", "Hun spiste sakte. Det er sunt, sier de. Ikke for avdelingen.", "Buddy loops på tre pasienter kunne vært gjort. Hun valgte en yoghurt til.", "Hun er som forhuden – trekker seg rolig tilbake."],
    rek: ["Jackpot! Dessverre for alle andre.", "Ny rekord. Kasinoet vurderer å oppkalle et bord etter henne.", "Rekorden er slått. Det samme er alle forventninger.", "Gratulerer, du har vært vitne til historie. Treg historie.", "Ny rekord! Bildet hennes henges opp i kasinoets æresgalleri.", "Rekorden er slått. Vekkerklokka har levert oppsigelse.", "Ny rekord. Dette er ikke lenger en forsinkelse, det er en prestasjon.", "Historisk dag. Vi kommer alltid til å huske hvor vi var da hun ikke var her.", "Ny rekord. Pokalen er bestilt. Den kommer sikkert litt sent.", "Rekord! Vi rakk å savne henne. Nesten.", "Dette blir pensum for nyansatte: «Slik gjør du det ikke».", "Gratulerer. Den gamle rekorden hadde aldri en sjanse."],
  };
  // December uses its own (chosen) Christmas messages, with the same rules.
  const JUL = {
    sent: ["Dersom Skogli-nissen fortsetter slik, vil ikke alle snille barn få julegave i år.", "Rudolf har rød nese av å vente på henne.", "Sleden går halv åtte. Hun valgte neste.", "Til og med pepperkakene var ferdig stekt før hun kom.", "Juletreet står klart. Kollegaen er fortsatt underveis.", "Grøten er kald. Mandelen er funnet. Hun er ikke her.", "Dette er grunnen til at hun alltid får julegaven sist.", "Et mirakel i desember ville vært at hun kom i tide. Det ble ikke i dag.", "Julebordet starter klokka 19. Vi sier 18 til henne.", "Pepperkakehusene er ferdige. Hun er fortsatt under dyna.", "Julekalenderen åpnet en luke. Hun åpnet ikke øynene.", "Nissen jobber én natt i året, og selv han er mer presis.", "Grøten har stivnet som gips.", "Reinsdyrene har spurt om hun trenger skyss.", "Nissen har mer rumpe å flytte, og han kommer likevel fram i tide."],
    tide: ["I tide! Nissen gnir seg i øynene og sjekker listen på nytt.", "Hun kom i tide. Det kan bare forklares med julestemning.", "Skogli-nissen leverte i tide. Det skjer bare én gang i året.", "Noen har puttet en vekkerklokke i julestrømpa hennes.", "Hun kom i tide. Legg det i julestrømpa som bevis.", "Nissen har flyttet henne til den snille listen. På prøve."],
    bet: ["Bettet er lagt under treet. Pakkes opp når hun kommer.", "Nissen noterer bettet ditt. Han vet hvem som har vært slem.", "Du satser på at hun er sen i desember. Det er som å satse på snø i Tromsø.", "Sjetongene ligger i julestrømpa. Lykke til.", "Du satser pepperkaker på en som har glemt hva klokka er. Det er julestemning, det."],
    lunsj: ["Ribba tar tid. Spesielt på arbeidstid.", "Julelunsj er tradisjon. Å komme tilbake i tide er det visst ikke.", "Risengrynsgrøten var visst verdt et ekstra kvarter.", "Nissen tar også lange pauser, men han jobber bare én natt i året.", "Julelunsjen varte lenger enn adventstida.", "Ribbe, pinnekjøtt og en halvtime ingen kan forklare.", "Hun er som forhuden – trekker seg rolig tilbake."],
    rek: ["Ny rekord! Skogli-nissen er offisielt verdens tregeste sledefører.", "Rekorden er slått. Den lengste natten i året fikk konkurranse.", "Ny rekord. Nissen flytter henne permanent til den slemme listen.", "Gratulerer! Årets julegave til kontoret: ny rekord i forsinkelse.", "Ny rekord! Nissen sjekker listen en tredje gang.", "Julegaven i år blir en vekkerklokke. Med to bjeller.", "Nissen har vært oppe i pipa kortere enn dette."],
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
  window.fxCard = (icon, text, btn) => { top.__fxCardAt = 0; showCard(icon, text, btn); };
  window.nyttAar = (year) => { top.__fxCardAt = 0; showCard("🎆", "Nytt år, nye muligheter for å komme tidsnok - eller ikke", "Godt nytt år … OK"); };
  // Season themes (tema.js) and the gips theme get their own lines for late / on time; about
  // two times in three a themed line is used, otherwise the ordinary casino one.
  const TEMA_MSG = {
    paske: { sent: ["Påskeharen gjemte eggene. Hun gjemte seg under dyna.", "Det ble visst langfredag i senga.", "Påskeegget er åpnet. Det var ingen vekkerklokke i det."], tide: ["Hun kom i tide. Hele påskeroen er brukt opp."] },
    mai17: { sent: ["Barnetoget gikk i tide. Det gjorde ikke hun.", "Hipp hipp … hvor er hun?", "Bunaden har visst 40 knapper. Hver eneste en tok ett minutt."], tide: ["Hurra for punktligheten! Den er sjelden, så rop høyt."] },
    sommer: { sent: ["Sola sto opp 04:00. Hun sto opp 07:25.", "Det er visst fellesferie i hodet hennes.", "Lyse morgener er bortkastet på henne."], tide: ["Det må være heten. Folk gjør rare ting i varmen."] },
    halloween: { sent: ["Hun er sen. Det skumleste vi har sett i dag.", "Knask eller knep? Vi fikk forsinkelse.", "Zombiene kom tidligere enn henne."], tide: ["Er det henne, eller en heks i forkledning?"] },
    gips: { sent: ["Diagnose: kronisk forsinkelse. Behandling: gips på snooze-armen.", "Gipsen har herdet. Kollegaen er fortsatt underveis.", "Forsinkelsen er reponert, men ikke stabil. Ny kontroll i morgen 07:30.", "Vi gipset armene hennes fast til vekkerklokka. Hun slo den av med nesa."], tide: ["I tide! Før det inn i journalen før noen tviler."] },
  };
  const TEMA_IC = { paske: { sent: "🐣", tide: "🌷" }, mai17: { sent: "🇳🇴", tide: "🎉" }, sommer: { sent: "☀️", tide: "🌞" }, halloween: { sent: "🎃", tide: "👻" }, gips: { sent: "🩼", tide: "🩺" } };
  // Other moments: sick day marked, a bet lost or won, an almost empty wallet, and a save from «Hun kom nå».
  const EXTRA = {
    syk: ["Syk? Vi håper det ikke er snooze-albue."],
    tapt: ["Sjetongene er borte. Det samme er stoltheten."],
    taptTide: ["Du tapte. Hun kom i tide bare for å ødelegge for deg.", "Sjetongene er borte. Det samme er stoltheten."],
    vunnet: ["Du vant! Takk henne neste gang hun er sen. Altså i morgen.", "Gevinsten er utbetalt. Den er hennes skyld, men du får æren."],
    tom: ["Lommeboka er nesten tom. Hun har kostet deg mer enn kaffen i dag."],
    kom: ["Registrert. Vi sukker videre.", "Klokka er stoppet. Den har ventet lenge nok."],
  };
  const EXTRA_IC = { syk: "🤒", tapt: "💸", taptTide: "💸", vunnet: "💰", tom: "👛", kom: "⏱️" };
  // «Hun kom nå» (Logg) fills in or saves the minutes; the next «sent» message within 10 min uses the kom lines.
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest("#vNow")) top.__komNaa = Date.now(); }, true);
  // Never on top of the winner reveal, the Mirakel or the monthly report: wait until they are closed.
  const overlayOpen = () => !!top.document.querySelector(".vin,.mir,.rap");
  const later = (fn, tries = 0) => overlayOpen() && tries < 120 ? setTimeout(() => later(fn, tries + 1), 1000) : fn();
  window.kasinoMsg = (kind) => {
    if (kind === "sent" && top.__komNaa && Date.now() - top.__komNaa < 600000) { top.__komNaa = 0; kind = "kom"; }
    const tema = window.TEMA || "", tl = TEMA_MSG[tema] && TEMA_MSG[tema][kind];
    const useTema = tl && (tema === "gips" || !jul) && Math.random() < 0.67;
    const list = useTema ? tl : EXTRA[kind] || (jul ? JUL : MSG)[kind]; if (!list) return;
    if (!["rek", "syk", "tom"].includes(kind)) {
      const k = "forsinkelseslogg:msg:" + kind, st = JSON.parse(store.get(k) || "null") || { n: 0, next: 3 + Math.floor(Math.random() * 3) };
      st.n++;
      if (st.n < st.next) { store.set(k, JSON.stringify(st)); return; }
      store.set(k, JSON.stringify({ n: 0, next: 3 + Math.floor(Math.random() * 3) }));
    }
    const lk = "forsinkelseslogg:msg:last:" + kind, last = store.get(lk);
    const pool = list.length > 1 ? list.filter((t) => t !== last) : list, text = pool[Math.floor(Math.random() * pool.length)];
    store.set(lk, text);
    later(() => {
      if (useTema) showCard(TEMA_IC[tema][kind], text, "OK");
      else if (EXTRA[kind]) showCard(EXTRA_IC[kind], text, "OK");
      else if (jul) showCard({ sent: "🎅", tide: "🎄", bet: "🎁", rek: "🦌", lunsj: "🍖" }[kind], text, "Ho ho … OK");
      else showCard({ sent: "🃏", tide: "♠️", bet: "🎰", rek: "🏆", lunsj: "🥪" }[kind], text, kind === "rek" ? "Jackpot … OK" : "OK");
    });
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
  watch("#wk, #lwk, .player b, .rank b, #rDay, #rWk", (el) => el.id || (el.parentNode.querySelector("span") || {}).textContent || el.textContent);

  // 2. Chips fly up when a bet is placed.
  function chips(btn) {
    const r = btn.getBoundingClientRect(), n = 6;
    for (let i = 0; i < n; i++) {
      const c = document.createElement("i");
      c.className = jul ? "fxgift" : "fxchip";
      if (jul) c.textContent = ["🎁", "❄️", "⭐", "🎄"][i % 4];
      else if (root.classList.contains("gips")) c.style.setProperty("--c", ["#E8566C", "#3A8DDE", "#F3C24B", "#7BC67E", "#B38AE8"][i % 5]); // K6: pills fly instead of chips
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
    rain(label) {
      const banner = document.createElement("div");
      banner.className = "fxjack"; banner.textContent = label;
      document.body.appendChild(banner);
      banner.animate([{ transform: "translate(-50%,-50%) scale(.3)", opacity: 0 }, { transform: "translate(-50%,-50%) scale(1.05)", opacity: 1, offset: 0.25 }, { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: 0.8 }, { transform: "translate(-50%,-60%)", opacity: 0 }], { duration: 2400 }).onfinish = () => banner.remove();
      for (let i = 0; i < 40; i++) {
        const c = document.createElement("i"); c.className = "fxchip"; c.style.left = Math.random() * innerWidth + "px"; c.style.top = "-30px";
        document.body.appendChild(c);
        c.animate([{ transform: "translateY(0) rotate(0)" }, { transform: `translateY(${innerHeight + 60}px) rotate(${360 + Math.random() * 720}deg)` }], { duration: 1500 + Math.random() * 1000, delay: Math.random() * 600, easing: "cubic-bezier(.4,0,.8,.6)", fill: "backwards" }).onfinish = () => c.remove();
      }
    },
    // D5: the croupier's rake sweeps across the table when a day is settled.
    rake() {
      const r = document.createElement("div"); r.className = "rake"; document.body.appendChild(r);
      const chips = [];
      for (let i = 0; i < 5; i++) { const c = document.createElement("i"); c.className = jul ? "fxgift" : "fxchip"; if (jul) c.textContent = "🍪"; c.style.top = innerHeight * 0.46 + 24 + (i % 2) * 10 + "px"; c.style.left = innerWidth * (0.25 + i * 0.1) + "px"; document.body.appendChild(c); chips.push(c); }
      r.animate([{ transform: `translateX(${innerWidth + 20}px)` }, { transform: "translateX(-180px)" }], { duration: 1300, easing: "cubic-bezier(.5,0,.4,1)" }).onfinish = () => r.remove();
      chips.forEach((c, i) => {
        const x0 = parseFloat(c.style.left), hit = (innerWidth + 20 - x0) / (innerWidth + 200);
        c.animate([{ transform: "translateX(0)", opacity: 1 }, { transform: "translateX(0)", opacity: 1, offset: Math.max(0.05, Math.min(0.9, hit)) }, { transform: `translateX(${-x0 - 60}px) rotate(-200deg)`, opacity: 1 }], { duration: 1300, easing: "linear" }).onfinish = () => c.remove();
      });
    },
    // D6: winnings fall as chips and land on your wallet, which bounces.
    landChips(target, n) {
      if (!target) return;
      const r = target.getBoundingClientRect(), tx = r.left + r.width / 2 - 11, ty = r.top + r.height / 2 - 11;
      for (let i = 0; i < Math.min(18, Math.max(6, n)); i++) {
        const c = document.createElement("i"); c.className = jul ? "fxgift" : "fxchip"; if (jul) c.textContent = "🍪";
        c.style.left = tx + "px"; c.style.top = ty + "px"; document.body.appendChild(c);
        const sx = (Math.random() - 0.5) * innerWidth, sy = -ty - 60 - Math.random() * 80;
        c.animate([{ transform: `translate(${sx}px,${sy}px) rotate(0)`, opacity: 1 }, { transform: `translate(0,0) rotate(${360 + Math.random() * 360}deg)`, opacity: 1, offset: 0.85 }, { transform: "translate(0,-6px) scale(.6)", opacity: 0 }], { duration: 1100 + Math.random() * 500, delay: i * 70, easing: "cubic-bezier(.55,0,.8,.5)", fill: "backwards" }).onfinish = () => c.remove();
      }
      setTimeout(() => target.animate([{ transform: "scale(1)" }, { transform: "scale(1.08) translateY(2px)" }, { transform: "scale(1)" }], { duration: 300, iterations: 3 }), 1100);
    },
    jackpot(won) {
      const banner = document.createElement("div");
      banner.className = "fxjack"; banner.textContent = (jul ? "🎁 " : "🎰 ") + "+" + won + (jul ? " pepperkaker" : " cr");
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
