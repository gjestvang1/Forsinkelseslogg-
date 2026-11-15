// Shared by the log and lunch pages: registering, editing and deleting entries.
// Every change waits a few seconds in an outbox (so it can be undone), and stays there
// while the phone is offline. One outbox for the whole app, kept on the shell window.
(() => {
  let host = window;
  try { if (window.parent !== window && window.parent.document) host = window.parent; } catch (e) {}
  if (!host.__reg) host.__reg = make(host);
  window.reg = host.__reg;

  function make(top) {
    const KEY = "forsinkelseslogg:utboks", DELAY = 5000;
    const API = { sent: "/api/entries", lunsj: "/api/lunsj" };
    const store = {
      get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } },
      set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
    };
    let box = []; try { box = JSON.parse(store.get(KEY, "[]")) || []; } catch (e) {}
    let offline = false, flushing = false, timer = 0;
    const listeners = new Set(), saved = {}, editing = {};
    const emit = (type) => { store.set(KEY, JSON.stringify(box)); listeners.forEach((f) => { try { f(type); } catch (e) { listeners.delete(f); } }); };
    const uid = () => "tmp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    const fmt = (m) => { m = Math.round(m); if (m < 60) return m + " min"; const h = Math.floor(m / 60), r = m % 60; return h + " t" + (r ? " " + r + " min" : ""); };

    // Toast at the bottom of the shell, with an optional action (Angre).
    let toastEl = null, toastT = 0;
    function toast(text, action, fn) {
      const d = top.document;
      if (!d.getElementById("regtoast-css")) {
        const st = d.createElement("style"); st.id = "regtoast-css";
        st.textContent = ".regtoast{position:fixed;left:50%;transform:translateX(-50%);bottom:max(34px,calc(16px + env(safe-area-inset-bottom,0px)));width:min(520px,calc(100% - 32px));z-index:90;display:flex;align-items:center;gap:12px;background:#F6EBD0;color:#0B2F25;border-radius:12px;padding:12px 14px;font:600 15px Inter,system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.4);animation:rtIn .2s ease-out}.regtoast span{flex:1}.regtoast button{font:inherit;background:none;border:0;color:#0B2F25;text-decoration:underline;padding:6px 4px;cursor:pointer}@keyframes rtIn{from{opacity:0;transform:translate(-50%,10px)}}@media (prefers-reduced-motion:reduce){.regtoast{animation:none}}";
        d.head.appendChild(st);
      }
      if (toastEl) toastEl.remove();
      clearTimeout(toastT);
      const t = d.createElement("div"); t.className = "regtoast"; t.setAttribute("role", "status");
      const s = d.createElement("span"); s.textContent = text; t.appendChild(s);
      if (action) { const b = d.createElement("button"); b.type = "button"; b.textContent = action; b.onclick = () => { t.remove(); fn(); }; t.appendChild(b); }
      d.body.appendChild(t); toastEl = t;
      toastT = setTimeout(() => t.remove(), DELAY);
    }

    async function send(it) {
      const h = { "content-type": "application/json" }, code = store.get("forsinkelseslogg:kode", "");
      if (code) h["x-skrivekode"] = code;
      const url = API[it.kind] + (it.op === "add" ? "" : "?id=" + encodeURIComponent(it.target));
      const r = await fetch(url, { method: { add: "POST", del: "DELETE", edit: "PATCH" }[it.op], headers: h, body: it.op === "del" ? undefined : JSON.stringify(it.body) });
      if (r.status === 401) {
        const c = top.prompt(code ? "Feil skrivekode. Prøv igjen:" : "Skriv inn skrivekoden:");
        if (c && c.trim()) { store.set("forsinkelseslogg:kode", c.trim()); return send(it); }
        throw { code: true };
      }
      if (r.status === 404) return null; // already gone
      if (!r.ok) throw { status: r.status };
      return r.json();
    }

    async function flush() {
      if (flushing) return;
      flushing = true; clearTimeout(timer);
      let sent = false;
      try {
        for (const it of [...box]) {
          if (it.sendAt > Date.now()) continue;
          try {
            const res = await send(it);
            box = box.filter((x) => x.id !== it.id); offline = false; sent = true;
            if (it.op === "add" && res && saved[it.kind]) saved[it.kind].forEach((f) => { try { f(res); } catch (e) {} });
          } catch (e) {
            if (e && (e.code || e.status)) { box = box.filter((x) => x.id !== it.id); toast(e.code ? "Ikke lagret: trenger skrivekode." : "Kunne ikke lagre. Prøv igjen."); }
            else { offline = true; break; } // no network: keep it for later
          }
        }
      } finally { flushing = false; }
      emit(sent ? "sent" : "change");
      const next = box.reduce((m, x) => Math.min(m, x.sendAt), Infinity);
      if (next < Infinity) timer = setTimeout(flush, Math.max(offline ? 15000 : 0, next - Date.now()) + 50);
    }
    top.addEventListener("online", () => { offline = false; flush(); });
    top.document.addEventListener("visibilitychange", () => { if (!top.document.hidden) flush(); });

    const queue = (it) => { box.push({ id: uid(), sendAt: Date.now() + DELAY, ...it }); emit("change"); setTimeout(flush, DELAY + 50); };
    const cancel = (id) => { box = box.filter((x) => x.id !== id); emit("change"); };
    const what = (kind, min) => fmt(min) + (kind === "lunsj" ? " lunsj" : "");

    const api = {
      fmt,
      get offline() { return offline; },
      get pending() { return box.length; },
      on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      onSaved(kind, fn) { (saved[kind] ||= new Set()).add(fn); },
      flush,
      add(kind, body) {
        const by = store.get("forsinkelseslogg:profil", "");
        const it = { kind, op: "add", body: { ...body, by } };
        queue(it);
        const id = box[box.length - 1].id;
        toast("Lagret " + what(kind, body.min), "Angre", () => cancel(id));
      },
      del(kind, e) {
        const add = box.find((x) => x.op === "add" && x.id === e.id);
        if (add) { cancel(add.id); toast("Slettet " + what(kind, e.min), "Angre", () => { box.push(add); emit("change"); setTimeout(flush, Math.max(0, add.sendAt - Date.now()) + 50); }); return; }
        queue({ kind, op: "del", target: e.id });
        const id = box[box.length - 1].id;
        toast("Slettet " + what(kind, e.min), "Angre", () => cancel(id));
      },
      edit(kind, e, body) {
        const add = box.find((x) => x.op === "add" && x.id === e.id);
        if (add) { add.body = { ...add.body, ...body }; emit("change"); toast("Endret til " + what(kind, body.min)); return; }
        box = box.filter((x) => !(x.op === "edit" && x.target === e.id));
        box.push({ id: uid(), sendAt: Date.now(), kind, op: "edit", target: e.id, body });
        emit("change"); flush();
        toast("Endret til " + what(kind, body.min));
      },
      // The server's list with the outbox applied: pending adds shown, deletes hidden, edits applied.
      view(kind, list) {
        const mine = box.filter((x) => x.kind === kind);
        const gone = new Set(mine.filter((x) => x.op === "del").map((x) => x.target));
        const ed = Object.fromEntries(mine.filter((x) => x.op === "edit").map((x) => [x.target, x.body]));
        const out = list.filter((e) => !gone.has(e.id)).map((e) => (ed[e.id] ? { ...e, ...ed[e.id], pending: true } : e));
        for (const x of mine) if (x.op === "add") out.push({ id: x.id, date: x.body.date, min: x.body.min, note: x.body.note || "", ts: x.sendAt, pending: true });
        return out;
      },
      isEditing(doc) { return !!editing[docKey(doc)]; },
      // One row in a list: tap to edit, «Slett» to delete. Returns the element.
      row(doc, e, kind, opts = {}) {
        const k = docKey(doc), mk = (t, c, x) => { const n = doc.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; };
        const pd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
        if (editing[k] && editing[k].id === e.id) {
          const st = editing[k], f = mk("div", "log editrow");
          const dI = mk("input"); dI.type = "date"; dI.value = st.date; dI.setAttribute("aria-label", "Dato");
          const mI = mk("input"); mI.type = "number"; mI.min = 1; mI.max = kind === "lunsj" ? 300 : 600; mI.inputMode = "numeric"; mI.value = st.min; mI.setAttribute("aria-label", "Minutter");
          const nI = mk("input"); nI.type = "text"; nI.maxLength = 80; nI.value = st.note; nI.placeholder = "Notat"; nI.setAttribute("aria-label", "Notat");
          dI.oninput = () => (st.date = dI.value); mI.oninput = () => (st.min = mI.value); nI.oninput = () => (st.note = nI.value);
          const ok = mk("button", "go", "Lagre"), no = mk("button", "ghost", "Avbryt"), err = mk("p", "err");
          ok.type = no.type = "button";
          ok.onclick = () => {
            const min = parseInt(mI.value, 10), max = kind === "lunsj" ? 300 : 600;
            if (!dI.value || !(min >= 1 && min <= max)) { err.textContent = "Skriv inn dato og minutter (1–" + max + ")."; return; }
            delete editing[k]; api.edit(kind, e, { date: dI.value, min, note: nI.value.trim() }); opts.done && opts.done();
          };
          no.onclick = () => { delete editing[k]; opts.done && opts.done(); };
          const row1 = mk("div", "editf"); row1.append(dI, mI);
          const row2 = mk("div", "editb"); row2.append(no, ok);
          f.append(row1, nI, err, row2);
          return f;
        }
        const row = mk("div", "log" + (opts.fresh ? " fxnew" : "") + (e.pending ? " pend" : ""));
        const a = mk("div", "logt");
        a.append(pd(e.date).toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short", year: "numeric" }));
        if (opts.tag) a.append(" ", mk("span", "tag", opts.tag));
        if (e.note) a.appendChild(mk("small", null, e.note));
        if (e.pending) a.appendChild(mk("small", "pendt", offline ? "Venter på nett" : "Lagres …"));
        const b = mk("b", kind === "lunsj" && opts.tag ? "lu" : null, (opts.plus ? "+" : "") + fmt(e.min));
        const d = mk("button", "del", "Slett"); d.type = "button";
        d.onclick = (ev) => { ev.stopPropagation(); api.del(kind, e); };
        a.title = "Trykk for å endre";
        a.onclick = () => { editing[k] = { id: e.id, date: e.date, min: e.min, note: e.note || "" }; opts.done && opts.done(); };
        row.append(a, b, d);
        return row;
      },
    };
    function docKey(doc) { return doc.location.pathname; }
    setTimeout(flush, 300);
    return api;
  }
})();
