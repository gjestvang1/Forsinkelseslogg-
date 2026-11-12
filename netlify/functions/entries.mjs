import { getStore } from "@netlify/blobs";
import { store as betStore, state as betState, notifyResult, push } from "../lib/betting.mjs";

// Worst single day and worst week (Monday start), summing all minutes in them.
const monday = (d) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x.toISOString().slice(0, 10); };
const isoWeek = (d) => { const t = new Date(d + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7)); return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7); };
function worst(entries) {
  const day = {}, wk = {};
  for (const e of entries) { day[e.date] = (day[e.date] || 0) + e.min; const m = monday(e.date); wk[m] = (wk[m] || 0) + e.min; }
  const top = (o) => Object.entries(o).reduce((a, x) => (x[1] > a[1] ? x : a), ["", 0]);
  return { day: top(day), week: top(wk) };
}
const fmt = (m) => (m < 60 ? m + " min" : Math.floor(m / 60) + " t" + (m % 60 ? " " + (m % 60) + " min" : ""));

// Each registration is its own blob (key = id), so two people saving at
// the same time never overwrite each other.
const store = () => getStore({ name: "forsinkelser", consistency: "strong" });
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

// Read from both the Netlify global and process.env, and ignore stray whitespace.
const writeCode = () =>
  String(globalThis.Netlify?.env?.get("SKRIVEKODE") ?? process.env.SKRIVEKODE ?? "").trim();

const authorized = (req) => {
  const code = writeCode();
  if (!code) return true; // no code set: anyone with the link may write
  return (req.headers.get("x-skrivekode") || "").trim() === code;
};

export default async (req) => {
  const s = store();

  if (req.method === "GET") {
    const { blobs } = await s.list();
    const entries = (await Promise.all(blobs.map((b) => s.get(b.key, { type: "json" })))).filter(Boolean);
    return json({ entries, needsCode: !!writeCode() });
  }

  if (!authorized(req)) return json({ error: "Feil skrivekode" }, 401);

  if (req.method === "POST") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "Ugyldig data" }, 400); }
    const min = parseInt(b.min, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || "") || !(min >= 1 && min <= 600))
      return json({ error: "Ugyldig dato eller minutter" }, 400);
    // A first delay on a day with open bets settles it, so the players get the result.
    const before = await betState();
    const settles = !before.res[b.date] && before.bets.some((x) => x.date === b.date);
    const id = Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    const rec = { id, date: b.date, min, note: String(b.note || "").slice(0, 80), ts: Date.now() };
    const { blobs } = await s.list();
    const old = (await Promise.all(blobs.map((x) => s.get(x.key, { type: "json" })))).filter(Boolean);
    await s.setJSON(id, rec);
    // New record (worst day or worst week)? Tell everyone. Only once there is history to beat.
    if (old.length) {
      const a = worst(old), z = worst([...old, rec]), parts = [];
      if (z.day[1] > a.day[1]) parts.push(`Verste dag: ${fmt(z.day[1])} (${z.day[0].split("-").reverse().slice(0, 2).join(".")})`);
      if (z.week[1] > a.week[1]) parts.push(`Verste uke: ${fmt(z.week[1])} (uke ${isoWeek(z.week[0])})`);
      if (parts.length) await push(betStore(), { title: "NY REKORD", body: parts.join(" · "), tag: "rekord", url: "/#logg", vibrate: [200, 100, 200, 100, 400] }).catch(() => {});
    }
    if (settles) await notifyResult(betStore(), b.date).catch(() => {});
    return json(rec, 201);
  }

  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id || !/^[\w-]{1,40}$/.test(id)) return json({ error: "Mangler id" }, 400);
    await s.delete(id);
    return json({ ok: true });
  }

  return json({ error: "Ikke støttet" }, 405);
};

export const config = { path: "/api/entries" };
