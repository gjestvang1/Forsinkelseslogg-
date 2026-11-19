import { getStore } from "@netlify/blobs";

// Fewer Blobs reads: every item stays its own blob (the source of truth, nothing is moved or
// deleted), but a full list is also kept as one snapshot blob per prefix, tagged with the store's
// revision. Every write through openStore() bumps the revision after the item is written, so a
// stale snapshot is never served: a list made while a write happens carries the older revision
// and is rebuilt on the next read. Keys starting with "_" are this cache and never listed.
const REV = "_rev";
const newRev = () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

// One shared revision for all stores ("meta" store, key "rev"), bumped after every store's own
// revision. The pages' «anything new?» check reads only this one blob instead of one per store.
const meta = () => getStore({ name: "meta", consistency: "strong" });

export function openStore(name) {
  const s = getStore({ name, consistency: "strong" });
  const bump = async () => { await s.setJSON(REV, { rev: newRev() }); await meta().setJSON("rev", { rev: newRev() }); };
  return new Proxy(s, {
    get(t, k) {
      if (k === "setJSON" || k === "set" || k === "delete")
        return async (key, ...a) => { const r = await t[k](key, ...a); if (!String(key).startsWith("_")) await bump(); return r; };
      const v = t[k];
      return typeof v === "function" ? v.bind(t) : v;
    },
  });
}

// The store's current revision (one read). Created on first use.
export async function revOf(s) {
  const r = await s.get(REV, { type: "json" });
  if (r && r.rev) return r.rev;
  const rev = newRev();
  await s.setJSON(REV, { rev });
  return rev;
}

// The shared revision of all stores together (one read). Created on first use.
export async function allRev() {
  const m = meta(), r = await m.get("rev", { type: "json" });
  if (r && r.rev) return r.rev;
  const rev = newRev();
  await m.setJSON("rev", { rev });
  return rev;
}

// A full GET answer is built once per version and kept, so the other phones polling the same
// version get it with one read instead of rebuilding it from every store. `v` already includes
// the shared revision, so a stored answer for an older version is never served.
export async function cachedBody(name, v, build) {
  const m = meta(), key = "svar/" + name;
  const hit = await m.get(key, { type: "json" }).catch(() => null);
  if (hit && hit.v === v && typeof hit.body === "string") return hit.body;
  const { body, keep } = await build();
  if (keep) await m.setJSON(key, { v, body }).catch(() => {});
  return body;
}

// All items (optionally under a prefix): two reads when nothing has changed since the last list.
export async function listAll(s, prefix) {
  const rev = await revOf(s), key = "_snap/" + (prefix || "*");
  const snap = await s.get(key, { type: "json" });
  if (snap && snap.rev === rev && Array.isArray(snap.items)) return snap.items;
  const { blobs } = await s.list(prefix ? { prefix } : undefined);
  const items = (await Promise.all(blobs.filter((b) => !b.key.startsWith("_")).map((b) => s.get(b.key, { type: "json" })))).filter(Boolean);
  await s.setJSON(key, { rev, items });
  return items;
}

// J5: yearly archive for the log stores (forsinkelser, lunsj). When a year is over, its entries
// are moved into one blob per year ("arkiv/YYYY" = { year, arkiv: [entries] }), so rebuilding the
// list after a write reads one blob per old year instead of one per entry. The archive is written
// and read back before any single entry is deleted. Clients still get every entry.
const thisYear = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date()).slice(0, 4);
const ARK = "arkiv/";

// Every entry, archived or not. `loose` are the ones still stored one per blob.
export async function entriesOf(s) {
  const raw = await listAll(s), all = [], loose = [];
  for (const x of raw) {
    if (x && Array.isArray(x.arkiv)) all.push(...x.arkiv);
    else if (x && x.id && x.date) { all.push(x); loose.push(x); }
  }
  return { all, loose };
}

// Move loose entries from earlier years into their year's archive. Cheap no-op most of the year.
export async function archiveOld(s, loose) {
  const now = thisYear(), byYear = {};
  for (const e of loose) if (e.date.slice(0, 4) < now) (byYear[e.date.slice(0, 4)] ||= []).push(e);
  for (const [y, list] of Object.entries(byYear)) {
    const key = ARK + y;
    const cur = (await s.get(key, { type: "json" })) || { year: y, arkiv: [] };
    const have = new Set(cur.arkiv.map((e) => e.id));
    const merged = cur.arkiv.concat(list.filter((e) => !have.has(e.id)));
    await s.setJSON(key, { year: y, arkiv: merged });
    const back = await s.get(key, { type: "json" });
    if (!back || !Array.isArray(back.arkiv) || back.arkiv.length !== merged.length) continue;
    for (let i = 0; i < list.length; i += 10) await Promise.all(list.slice(i, i + 10).map((e) => s.delete(e.id)));
  }
}

// An archived entry by id, for edits and deletes: { key, doc, entry } or null.
export async function findArchived(s, id) {
  const { blobs } = await s.list({ prefix: ARK });
  for (const b of blobs) {
    const doc = await s.get(b.key, { type: "json" });
    const entry = doc && Array.isArray(doc.arkiv) ? doc.arkiv.find((e) => e.id === id) : null;
    if (entry) return { key: b.key, doc, entry };
  }
  return null;
}
export async function dropArchived(s, hit) {
  await s.setJSON(hit.key, { ...hit.doc, arkiv: hit.doc.arkiv.filter((e) => e.id !== hit.entry.id) });
}
