import { getStore } from "@netlify/blobs";

// Fewer Blobs reads: every item stays its own blob (the source of truth, nothing is moved or
// deleted), but a full list is also kept as one snapshot blob per prefix, tagged with the store's
// revision. Every write through openStore() bumps the revision after the item is written, so a
// stale snapshot is never served: a list made while a write happens carries the older revision
// and is rebuilt on the next read. Keys starting with "_" are this cache and never listed.
const REV = "_rev";
const newRev = () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

export function openStore(name) {
  const s = getStore({ name, consistency: "strong" });
  const bump = () => s.setJSON(REV, { rev: newRev() });
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
