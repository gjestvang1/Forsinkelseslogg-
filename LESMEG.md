# Forsinkelseslogg på Netlify

Appen lagrer registreringene i Netlify Blobs via en liten serverfunksjon (`/api/entries`).
Alle som åpner lenken ser de samme dataene, og siden henter nye data hvert 10. sekund.

## Innhold
- `public/index.html` – selve appen
- `netlify/functions/entries.mjs` – serverfunksjonen (lese, legge til, slette)
- `public/betting.html` + `netlify/functions/betting.mjs` – bettingsiden (`/api/betting`). Tre profiler; hver måned er en egen runde der alle starter med 100 credits, og månedens bets kan nullstilles. Bets lagres i Netlify Blobs og deles mellom alle. Samme skrivekode gjelder.
- `netlify/functions/lunsj.mjs` – ekstra lunsj (`/api/lunsj`, Blobs-lageret «lunsj»), registreres på Logg-siden. Ekstra lunsjminutter telles med i statistikken og grafen på Logg-fanen (filter: Alt / Forsinkelser / Lunsj), men avgjør ikke bets og teller ikke i rekordene. Samme skrivekode gjelder.
- `public/reg.js` – registrering på Logg (forsinkelse og lunsj): ett trykk lagrer, «Angre» i fem sekunder, endring av registreringer, og en kø som sender endringer når telefonen er på nett igjen. Serverfunksjonene tar imot PATCH for endringer.
- `public/vakter.js` – turnus (bare datoer og vaktkoder, aldri navn). Logg viser dagens vakt med oppmøtetid, og etter oppmøte en knapp som lagrer minuttene fra vaktstart. Fridager og fravær står ikke i lista og viser ingenting. Vakter kan også legges inn under Innstillinger → Turnus (trykk vaktkode, så dager); de lagres i `/api/vakter` (`netlify/functions/vakter.mjs`, Blobs-lageret «vakter») og overstyrer lista.
- `netlify/lib/betting.mjs` – felles kode for betting og push-varsler. Hver enhet velger selv hvilke varsler den vil ha (bet plassert, resultat, forsinkelse registrert, ekstra lunsj, ny rekord) under Betting → Profil og varsler. Varslingsnøklene (VAPID) lages automatisk første gang og lagres i Blobs, så det trengs ingen oppsett.
- `public/sw.js`, `public/manifest.webmanifest`, ikonene – gjør at appen kan legges på Hjem-skjermen og få push-varsler (på iPhone krever dette iOS 16.4 eller nyere, og at appen åpnes fra Hjem-skjermen).
- `netlify.toml`, `package.json` – oppsett

## Publisere
Dra-og-slipp på app.netlify.com/drop tar ikke med serverfunksjoner, så bruk én av disse:

**A) Via GitHub (enklest å oppdatere senere)**
1. Legg mappen i et GitHub-repo.
2. I Netlify: «Add new project» → «Import an existing project» → velg repoet. Innstillingene leses fra `netlify.toml`.

**B) Via Netlify CLI fra egen maskin**
```
cd netlify-mappen
npm install
npx netlify-cli login
npx netlify-cli deploy --prod
```

## Skrivekode (anbefalt)
I Netlify: Project configuration → Environment variables → legg til `SKRIVEKODE` med en kode dere velger.
Publiser på nytt etterpå. Da kan alle lese, men bare de som kjenner koden kan legge til og slette.
Koden spørres om første gang og huskes i nettleseren. Uten `SKRIVEKODE` kan alle med lenken skrive.

### Runde 2 (november 2026)
- `/api/alt` (`netlify/functions/alt.mjs`) samler loggføringer, lunsj, betting og vakter i én forespørsel for Logg.
- Logg: «i tide»-rekke over vaktdager, tabell per vakttype, ventetid som tikker etter vaktstart, neonskilt, kort med baksiden opp mens siden laster, lyspærer rundt ferske rekorder.
- `public/runde2.js`: rulett på «Nå», vaktspesifikke meldinger, terningspådom (trykk tre ganger på ukeboksen, deretter risting), diplom ved 50/100/150/200/300/500 forsinkelser, røntgenmodus (hold på ukas tall).
- Betting: krupier-rake når en dag avgjøres, sjetonger som lander i lommeboken ved gevinst (`fx.rake`, `fx.landChips`).
- `public/tema.js`: sesongtema påske, 17. mai, sommer og Halloween (forhåndsvis med `?tema=paske|mai17|sommer|halloween`); kortstokk-animasjon ved sidebytte i `index.html`.
