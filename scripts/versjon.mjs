// Runs on Netlify before publishing (netlify.toml [build] command). Nothing in the repo changes.
// Each script and stylesheet the pages use is copied to /a/<name>.<content hash>.<ext> and the
// pages point there instead. Those copies never change, so phones keep them for a year without
// asking (netlify.toml headers for /a/*), and a file only downloads again when its content does.
// Without this, every app opening asked the server about each file again, once per tab page.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PUB = new URL("../public/", import.meta.url).pathname;
const pages = readdirSync(PUB).filter((f) => f.endsWith(".html"));
const assets = readdirSync(PUB).filter((f) => /\.(js|css)$/.test(f) && f !== "sw.js");
mkdirSync(join(PUB, "a"), { recursive: true });

const map = {};
for (const f of assets) {
  const buf = readFileSync(join(PUB, f));
  const h = createHash("sha256").update(buf).digest("hex").slice(0, 10);
  const out = f.replace(/\.(js|css)$/, `.${h}.$1`);
  writeFileSync(join(PUB, "a", out), buf);
  map["/" + f] = "/a/" + out;
}

// Only exact src="/x.js" and href="/x.css" attributes are rewritten.
const swap = (txt) => txt.replace(/(src|href)="(\/[\w-]+\.(?:js|css))"/g, (m, attr, url) => (map[url] ? `${attr}="${map[url]}"` : m));
let n = 0;
for (const f of pages) {
  const p = join(PUB, f), before = readFileSync(p, "utf8"), after = swap(before);
  if (after !== before) { writeFileSync(p, after); n++; }
}

// The service worker keeps the hashed copies for offline start instead of the plain names.
const swp = join(PUB, "sw.js");
const sw = readFileSync(swp, "utf8").replace(/"(\/[\w-]+\.(?:js|css))"/g, (m, url) => (map[url] ? `"${map[url]}"` : m));
writeFileSync(swp, sw);
console.log(`versjon: ${assets.length} filer hashet, ${n} sider oppdatert`);
