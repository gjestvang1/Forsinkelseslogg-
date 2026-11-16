import entries from "./entries.mjs";
import lunsj from "./lunsj.mjs";
import betting from "./betting.mjs";
import vakter from "./vakter.mjs";
import { openStore, revOf } from "../lib/snap.mjs";
import { todayOslo } from "../lib/betting.mjs";

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
  // Version of everything shown: when the page already has it, answer with a tiny "same".
  const revs = await Promise.all(["forsinkelser", "lunsj", "betting", "vakter"].map((n) => revOf(openStore(n))));
  const v = revs.join(".") + "." + todayOslo();
  if (new URL(req.url).searchParams.get("v") === v)
    return new Response(JSON.stringify({ same: true, v }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  const [e, l, b, vk] = await Promise.all([
    part(entries, "/api/entries"), part(lunsj, "/api/lunsj"), part(betting, "/api/betting"), part(vakter, "/api/vakter"),
  ]);
  return new Response(JSON.stringify({ v, entries: e, lunsj: l, betting: b, vakter: vk }), {
    status: e ? 200 : 503,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
};

export const config = { path: "/api/alt" };
