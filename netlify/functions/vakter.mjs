import { getStore } from "@netlify/blobs";

// Planned shifts entered in Settings. One blob ("plan") maps "YYYY-MM-DD" to a shift code,
// or "FRI" for a day off. These override the built-in schedule in public/vakter.js.
// Only dates and codes are stored, never names.
const store = () => getStore({ name: "vakter", consistency: "strong" });
const CODES = ["D", "DPOL1", "DPOL3", "DPOL5", "FAGD", "A1", "A2", "FRI"];
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

  if (req.method === "GET") return json({ plan });

  if (!authorized(req)) return json({ error: "Feil skrivekode" }, 401);

  // { days: { "2026-12-01": "D", "2026-12-02": "FRI", "2026-12-03": "" } } – "" removes the override.
  if (req.method === "PUT") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "Ugyldig data" }, 400); }
    const days = b && typeof b.days === "object" ? b.days : null;
    if (!days || Object.keys(days).length > 62) return json({ error: "Ugyldig data" }, 400);
    for (const [d, c] of Object.entries(days)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return json({ error: "Ugyldig dato" }, 400);
      if (c === "" || c == null) delete plan[d];
      else if (CODES.includes(c)) plan[d] = c;
      else return json({ error: "Ukjent vaktkode" }, 400);
    }
    await s.setJSON("plan", plan);
    return json({ plan });
  }

  return json({ error: "Ikke støttet" }, 405);
};

export const config = { path: "/api/vakter" };
