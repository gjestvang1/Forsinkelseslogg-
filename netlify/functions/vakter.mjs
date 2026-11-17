import { openStore } from "../lib/snap.mjs";
import { state as betState, notifyResult, store as betStore } from "../lib/betting.mjs";

// Planned shifts entered in Settings. One blob ("plan") maps "YYYY-MM-DD" to a shift code,
// or "FRI" for a day off. These override the built-in schedule in public/vakter.js.
// Only dates and codes are stored, never names.
const store = () => openStore("vakter");
// SYK = sick (G5): like FRI it leaves the day out of the streak, and bets on it are refunded.
const CODES = ["D", "DPOL1", "DPOL3", "DPOL5", "FAGD", "A1", "A2", "FRI", "SYK"];
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
const writeCode = () =>
  String(globalThis.Netlify?.env?.get("SKRIVEKODE") ?? process.env.SKRIVEKODE ?? "").trim();
const authorized = (req) => {
  const code = writeCode();
  if (!code) return true;
  return (req.headers.get("x-skrivekode") || "").trim() === code;
};

export default async (req) => {
  const s = store();
  const plan = (await s.get("plan", { type: "json" })) || {};

  // K6: the yearly «gipsdag» (MM-DD) when the plaster theme switches on by itself.
  const innst = async () => (await s.get("innst", { type: "json" })) || {};
  if (req.method === "GET") return json({ plan, gipsdag: (await innst()).gipsdag || "" });

  if (!authorized(req)) return json({ error: "Feil skrivekode" }, 401);

  // { days: { "2026-12-01": "D", "2026-12-02": "FRI", "2026-12-03": "" } } – "" removes the override.
  if (req.method === "PUT") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "Ugyldig data" }, 400); }
    if (b && typeof b.gipsdag === "string" && !b.days) {
      if (b.gipsdag && !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(b.gipsdag)) return json({ error: "Ugyldig dato" }, 400);
      await s.setJSON("innst", { ...(await innst()), gipsdag: b.gipsdag });
      return json({ plan, gipsdag: b.gipsdag });
    }
    const days = b && typeof b.days === "object" ? b.days : null;
    if (!days || Object.keys(days).length > 62) return json({ error: "Ugyldig data" }, 400);
    for (const [d, c] of Object.entries(days)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return json({ error: "Ugyldig dato" }, 400);
      if (c === "" || c == null) delete plan[d];
      else if (CODES.includes(c)) plan[d] = c;
      else return json({ error: "Ukjent vaktkode" }, 400);
    }
    // Days that become sick/off and have open bets: tell everyone the stakes come back.
    const voided = Object.entries(days).filter(([, c]) => c === "SYK" || c === "FRI").map(([d]) => d);
    const before = voided.length ? await betState().catch(() => null) : null;
    await s.setJSON("plan", plan);
    if (before) for (const d of voided) if (!before.res[d] && before.bets.some((x) => x.date === d)) await notifyResult(betStore(), d).catch(() => {});
    return json({ plan, gipsdag: (await innst()).gipsdag || "" });
  }

  return json({ error: "Ikke støttet" }, 405);
};

export const config = { path: "/api/vakter" };
