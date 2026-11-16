import entries from "./entries.mjs";
import lunsj from "./lunsj.mjs";
import betting from "./betting.mjs";
import vakter from "./vakter.mjs";

// Everything the log page shows, in one request instead of four (it polls every ten seconds).
// Each part is fetched with the same GET handler as its own endpoint; a part that fails is null.
const part = async (fn, path) => {
  try {
    const r = await fn(new Request("http://localhost" + path, { method: "GET" }), {});
    return r.ok ? await r.json() : null;
  } catch (e) {
    return null;
  }
};

export default async (req) => {
  if (req.method !== "GET") return new Response("Ikke støttet", { status: 405 });
  const [e, l, b, v] = await Promise.all([
    part(entries, "/api/entries"), part(lunsj, "/api/lunsj"), part(betting, "/api/betting"), part(vakter, "/api/vakter"),
  ]);
  return new Response(JSON.stringify({ entries: e, lunsj: l, betting: b, vakter: v }), {
    status: e ? 200 : 503,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
};

export const config = { path: "/api/alt" };
