import { openStore, listAll } from "../lib/snap.mjs";
import { store as betStore, push, dayLabel, PROFILES } from "../lib/betting.mjs";

// Extra lunch minutes. Kept in their own store so they never settle bets or count as
// late-arrival records; the log page adds them to the totals and the chart.
const store = () => openStore("lunsj");
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

// Same write code as the log (SKRIVEKODE).
const writeCode = () =>
  String(globalThis.Netlify?.env?.get("SKRIVEKODE") ?? process.env.SKRIVEKODE ?? "").trim();
const authorized = (req) => {
  const code = writeCode();
  if (!code) return true;
  return (req.headers.get("x-skrivekode") || "").trim() === code;
};

export default async (req) => {
  const s = store();

  if (req.method === "GET") {
    const entries = await listAll(s);
    return json({ entries, needsCode: !!writeCode() });
  }

  if (!authorized(req)) return json({ error: "Feil skrivekode" }, 401);

  if (req.method === "POST") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "Ugyldig data" }, 400); }
    const min = parseInt(b.min, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || "") || !(min >= 1 && min <= 300))
      return json({ error: "Ugyldig dato eller minutter" }, 400);
    const id = Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    const rec = { id, date: b.date, min, note: String(b.note || "").slice(0, 80), ts: Date.now() };
    await s.setJSON(id, rec);
    // For those who chose it (not to the one who registered it).
    const by = PROFILES.includes(b.by) ? b.by : undefined;
    await push(betStore(), { title: "Ekstra lunsj registrert", body: `${dayLabel(b.date)}: ${min} min ekstra lunsj${rec.note ? " · " + rec.note : ""}`, tag: "lunsj-" + id, kind: "lunsj", url: "/#logg" }, by).catch(() => {});
    return json(rec, 201);
  }

  // Edit an entry: date, minutes and note. No notifications.
  if (req.method === "PATCH") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id || !/^[\w-]{1,40}$/.test(id)) return json({ error: "Mangler id" }, 400);
    const old = await s.get(id, { type: "json" });
    if (!old) return json({ error: "Finnes ikke" }, 404);
    let b;
    try { b = await req.json(); } catch { return json({ error: "Ugyldig data" }, 400); }
    const min = parseInt(b.min, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || "") || !(min >= 1 && min <= 300))
      return json({ error: "Ugyldig dato eller minutter" }, 400);
    const rec = { ...old, date: b.date, min, note: String(b.note || "").slice(0, 80), edited: Date.now() };
    await s.setJSON(id, rec);
    return json(rec);
  }

  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id || !/^[\w-]{1,40}$/.test(id)) return json({ error: "Mangler id" }, 400);
    await s.delete(id);
    return json({ ok: true });
  }

  return json({ error: "Ikke støttet" }, 405);
};

export const config = { path: "/api/lunsj" };
