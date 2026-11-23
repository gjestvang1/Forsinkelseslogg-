import { openStore, listAll, entriesOf } from "./snap.mjs";
import webpush from "web-push";
import { createHash } from "node:crypto";

// Shared by the betting and log functions: data, settlement and push notifications.
const store = () => openStore("betting");
const logStore = () => openStore("forsinkelser");
const START = 100;
// G3: the bank lends LOAN once a month to a nearly broke player; REPAY is taken from next month's start.
const LOAN = 20, REPAY = 25, LOAN_BELOW = 10, GAVE = 10;
// Fixed price per bet type, so every bet in a pot weighs the same.
const STAKES = { yn: 5, min: 10 };
const PROFILES = ["p1", "p2", "p3"];
const DEFAULT_NAMES = { p1: "Spiller 1", p2: "Spiller 2", p3: "Spiller 3" };
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const todayOslo = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());

const all = (s, prefix) => listAll(s, prefix);

// Result per date in minutes (0 = on time). A manual result wins; otherwise
// the day is settled by the delay log as soon as it has an entry.
// G5: a day marked sick (SYK) or taken off (FRI) in the shift plan, with bets on it and nothing
// registered, is void: everyone gets their stake back.
function results(rounds, log, plan, betDates) {
  const r = {};
  for (const e of log) r[e.date] = { min: (r[e.date]?.min || 0) + e.min, source: "logg" };
  // A hand-set "on time" may carry the arrival time (kl) and minutes before shift start (tidlig).
  for (const x of rounds) r[x.date] = { min: x.min, source: "manuell", ...(x.tidlig ? { kl: x.kl, tidlig: x.tidlig } : {}) };
  for (const d of betDates) {
    const c = plan[d];
    if (!r[d] && (c === "SYK" || c === "FRI")) r[d] = { min: 0, source: "vakt", void: c === "SYK" ? "syk" : "fri" };
  }
  return r;
}
const voidTxt = (r) => (r.void === "syk" ? "hun er syk" : "hun har fri");

// Pool betting: the losers' stakes are shared among the winners in proportion
// to what they staked. If nobody (or everybody) wins, stakes are returned.
function payPool(bets, isWinner) {
  const win = bets.filter(isWinner);
  if (!win.length || win.length === bets.length) return bets.forEach((b) => (b.payout = b.stake));
  const W = win.reduce((s, b) => s + b.stake, 0);
  const L = bets.reduce((s, b) => s + b.stake, 0) - W;
  bets.forEach((b) => (b.payout = isWinner(b) ? b.stake + (b.stake / W) * L : 0));
}

const monthOf = (d) => d.slice(0, 7);
const fresh = () => Object.fromEntries(PROFILES.map((p) => [p, START]));

// Every month is its own season: everyone starts on START and only that
// month's bets count. Returns balances per month ("YYYY-MM").
function compute(bets, res) {
  const months = { [monthOf(todayOslo())]: fresh() };
  const byKey = {};
  for (const b of bets) (byKey[b.date + "|" + b.type] ||= []).push(b);
  for (const [k, group] of Object.entries(byKey)) {
    const date = k.split("|")[0], r = res[date];
    const balances = (months[monthOf(date)] ||= fresh());
    if (!r) { group.forEach((b) => { b.payout = null; balances[b.profile] -= b.stake; }); continue; }
    if (r.void) { group.forEach((b) => (b.payout = b.stake)); continue; }
    if (group[0].type === "yn") payPool(group, (b) => b.late === (r.min > 0));
    else {
      const best = Math.min(...group.map((b) => Math.abs(b.guess - r.min)));
      payPool(group, (b) => Math.abs(b.guess - r.min) === best);
    }
    group.forEach((b) => (balances[b.profile] += b.payout - b.stake));
  }
  return months;
}

const nextMonth = (m) => { const [y, mo] = m.split("-").map(Number); return mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`; };

async function state() {
  const s = store();
  const [stored, rounds, names, log, resetList, loans, plan, gaver] = await Promise.all([
    all(s, "bet/"),
    all(s, "round/"),
    s.get("profiles", { type: "json" }),
    entriesOf(logStore()).then((x) => x.all),
    all(s, "reset/"),
    all(s, "loan/"),
    openStore("vakter").get("plan", { type: "json" }).then((p) => p || {}).catch(() => ({})),
    all(s, "gave/"),
  ]);
  // A reset voids that month's bets placed before it; they are kept, just no longer counted.
  const resets = Object.fromEntries(resetList.map((x) => [x.month, x.ts]));
  const bets = stored.filter((b) => !(resets[monthOf(b.date)] >= b.ts));
  const res = results(rounds, log, plan, new Set(bets.map((b) => b.date)));
  const months = compute(bets, res);
  // Loans: +LOAN in the month taken, −REPAY from the next month's start.
  for (const l of loans) {
    (months[l.month] ||= fresh())[l.profile] += l.amount || LOAN;
    (months[nextMonth(l.month)] ||= fresh())[l.profile] -= l.repay || REPAY;
  }
  // December welcome gift (julhilsen.js): +GAVE once per profile, in the month it was taken.
  for (const g of gaver) (months[g.month] ||= fresh())[g.profile] += g.amount || GAVE;
  const balances = months[monthOf(todayOslo())];
  return { bets, res, months, balances, resets, loans, gaver, plan, names: { ...DEFAULT_NAMES, ...(names || {}) } };
}

// Push keys are made on first use and kept in the store, so no setup is needed in Netlify.
async function vapid(s) {
  let k = await s.get("vapid", { type: "json" });
  if (!k) {
    await s.setJSON("vapid", webpush.generateVAPIDKeys());
    k = await s.get("vapid", { type: "json" }); // re-read so two first visitors agree on one key
  }
  return k;
}

const subKey = (endpoint) => "sub/" + createHash("sha256").update(endpoint).digest("hex").slice(0, 32);

const dayLabel = (d) => (d === todayOslo() ? "i dag" : d.split("-").reverse().slice(0, 2).join("."));

// What each device can be notified about, and the default for devices that never chose.
const KINDS = { bet: true, result: true, rekord: true, sent: false, lunsj: false };
const kinds = (t) => Object.fromEntries(Object.entries(KINDS).map(([k, d]) => [k, typeof t?.[k] === "boolean" ? t[k] : d]));

// Send to every subscribed device that wants this kind (msg.kind), optionally skipping one
// profile. Dead subscriptions are dropped.
async function push(s, msg, exceptProfile) {
  const subs = (await all(s, "sub/")).filter((x) => x.profile !== exceptProfile && (!msg.kind || kinds(x.types)[msg.kind]));
  if (!subs.length) return;
  const k = await vapid(s);
  const payload = JSON.stringify({ url: "/#betting", ...msg });
  await Promise.allSettled(
    subs.map((x) =>
      webpush
        .sendNotification(x.sub, payload, { vapidDetails: { subject: "https://forsinkelseslogg.netlify.app", ...k }, TTL: 3600 })
        .catch((e) => (e.statusCode === 404 || e.statusCode === 410 ? s.delete(subKey(x.sub.endpoint)) : null))
    )
  );
}

function notifyBet(s, rec, names, changed) {
  const what = rec.type === "yn" ? (rec.late ? "for sent" : "i tide") : "antall minutter";
  return push(s, {
    title: "Bet placed",
    body: `${names[rec.profile]}${changed ? " endret bettet" : ""}: ${what} (${dayLabel(rec.date)}), ${rec.stake} ${todayOslo().slice(5, 7) === "12" ? "pepperkaker" : "credits"}`,
    tag: "bet",
    kind: "bet",
  }, rec.profile);
}

// Tell everyone the outcome of a day once it is settled, with each player's net result.
async function notifyResult(s, date) {
  const { bets, res, names } = await state();
  const r = res[date];
  const day = bets.filter((b) => b.date === date);
  if (!r || !day.length) return;
  const net = {};
  for (const b of day) net[b.profile] = (net[b.profile] || 0) + b.payout - b.stake;
  const parts = PROFILES.filter((p) => p in net).map((p) => {
    const n = Math.round(net[p]);
    return `${names[p]} ${n > 0 ? "+" + n : n < 0 ? "−" + -n : "±0"}`;
  });
  return push(s, {
    title: `Resultat ${dayLabel(date)}: ${r.void ? voidTxt(r) : r.min > 0 ? r.min + " min for sent" : "i tide"}`,
    body: r.void ? "Alle får innsatsen tilbake." : parts.join(" · "),
    tag: "result-" + date,
    kind: "result",
  });
}

export { LOAN, REPAY, LOAN_BELOW, GAVE, KINDS, kinds, dayLabel, push, store, monthOf, fresh, START, STAKES, PROFILES, DATE, todayOslo, all, state, vapid, subKey, notifyBet, notifyResult };
