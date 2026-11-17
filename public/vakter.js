// Turnus: bare datoer og vaktkoder (ingen navn). Fridager (F1/F2) og fravær står ikke her.
// Tillegg som O (overtid), T (tillegg) og E (ekstra) endrer ikke tidene, så de er utelatt.
// Nye måneder: legg til linjer i VAKTER med "ÅÅÅÅ-MM-DD": "KODE".
window.VAKTKODER = {
  D: ["07:30", "15:00"], DPOL1: ["07:30", "15:30"], DPOL3: ["07:30", "15:30"], DPOL5: ["07:30", "15:00"],
  FAGD: ["07:30", "15:30"], A1: ["12:00", "20:00"], A2: ["13:00", "21:00"],
};
window.VAKTER = {
  // November 2026 (2.–3. nov fravær)
  "2026-11-01": "D", "2026-11-04": "A2", "2026-11-05": "A2", "2026-11-06": "D", "2026-11-09": "D",
  "2026-11-10": "A2", "2026-11-11": "D", "2026-11-12": "D", "2026-11-13": "D", "2026-11-16": "A2",
  "2026-11-17": "DPOL5", "2026-11-18": "D", "2026-11-21": "A2", "2026-11-22": "D", "2026-11-24": "A2",
  "2026-11-25": "A2", "2026-11-26": "A2",
  // Desember 2026 (30. nov–5. des fravær)
  "2026-12-07": "A1", "2026-12-08": "D", "2026-12-10": "DPOL1", "2026-12-11": "A2", "2026-12-12": "A2",
  "2026-12-13": "D", "2026-12-15": "D", "2026-12-16": "A2", "2026-12-17": "A2", "2026-12-19": "A2",
  "2026-12-22": "A2", "2026-12-23": "A1", "2026-12-24": "D", "2026-12-25": "A2", "2026-12-31": "A2",
  // Januar 2027
  "2027-01-01": "A2", "2027-01-02": "A2", "2027-01-03": "D", "2027-01-05": "D", "2027-01-06": "D",
  "2027-01-07": "A2", "2027-01-08": "D",
};
// Vakter lagt inn under Innstillinger (/api/vakter) overstyrer lista over. "FRI" = fri, "SYK" = syk.
window.VAKTPLAN = window.VAKTPLAN || {};
window.vaktKode = (date) => {
  const o = window.VAKTPLAN[date];
  if (o) return o === "FRI" || o === "SYK" ? "" : o;
  return window.VAKTER[date] || "";
};
// What the turnus editor shows: like vaktKode, but a sick day shows as "SYK".
window.vaktRaw = (date) => {
  const o = window.VAKTPLAN[date];
  if (o) return o === "FRI" ? "" : o;
  return window.VAKTER[date] || "";
};
// G5: "syk" for a day marked sick, "fri" for a planned shift that was taken off or swapped away.
window.vaktStatus = (date) => {
  const o = window.VAKTPLAN[date];
  return o === "SYK" ? "syk" : o === "FRI" && window.VAKTER[date] ? "fri" : "";
};
// J1: the last date with a planned shift (built-in rota or Innstillinger), or "".
window.sisteVakt = () => {
  const p = window.VAKTPLAN, ks = Object.keys(window.VAKTER).filter((d) => !p[d] || (p[d] !== "FRI" && p[d] !== "SYK"));
  Object.keys(p).forEach((d) => { if (p[d] !== "FRI" && p[d] !== "SYK") ks.push(d); });
  return ks.sort().pop() || "";
};
window.vaktFor = (date) => {
  const k = window.vaktKode(date), t = k && window.VAKTKODER[k];
  return t ? { kode: k, start: t[0], slutt: t[1] } : null;
};
window.lastVakter = async () => {
  try {
    const r = await fetch("/api/vakter", { cache: "no-store" });
    if (r.ok) window.VAKTPLAN = (await r.json()).plan || {};
  } catch (e) {}
  return window.VAKTPLAN;
};
