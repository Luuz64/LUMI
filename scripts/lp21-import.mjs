#!/usr/bin/env node
// Lädt den Aargauer Lehrplan aus der offiziellen Datenschnittstelle (api.lehrplan.ch)
// und schreibt eine kompakte Fassung nach shared/lp21-ag.json.
//
// STATUS: ENTWURF, noch nie gegen die echte Schnittstelle gelaufen.
// Grundlage ist das Manual «Datenschnittstelle_LP21-2026_02_15.pdf». Unklar ist dort vor allem,
// wie die Anmeldung technisch funktioniert. Das Skript nimmt HTTP Basic Auth an; nach Erhalt
// der Zugangsdaten bitte prüfen und bei Bedarf in `request()` anpassen.
//
// Aufruf:
//   LP21_USER=... LP21_PASSWORD=... LP21_ROOT_UID=... node scripts/lp21-import.mjs
//
// LP21_ROOT_UID ist die UID des Elements «Kompetenzaufbau» (oder «Lehrplan 21») für den Kanton AG.
// Sie steht in den Unterlagen zum Zugang bzw. lässt sich über die Startseite der Schnittstelle ermitteln.
//
// Datenschutz: Die Schnittstelle liefert nur Lehrplaninhalte, keine Personendaten.
// Nutzung nur im Rahmen der Vereinbarung mit der D-EDK-Geschäftsstelle.

import { writeFile } from 'node:fs/promises';

const BASE = 'https://api.lehrplan.ch/getData.php';
const KANTON = 'ag';
const SPRACHE = 'de';
// Fachbereichs-Codes der Schnittstelle → Fach-IDs in shared/curriculum.js
const WANTED = { MA: 'MA', D: 'D', FS1E: 'FS1E', FS2F: 'FS2F', NMG: 'NMG', NT: 'NT', RZG: 'RZG', WAH: 'WAH', ERG: 'ERG', MI: 'MI' };
const STOP_BELOW = 'Kompetenzstufe'; // tiefer (Aufzählungspunkte) brauchen wir für Lumi nicht
const DELAY_MS = 150; // Schnittstelle schonen

const { LP21_USER, LP21_PASSWORD, LP21_ROOT_UID } = process.env;
if (!LP21_USER || !LP21_PASSWORD || !LP21_ROOT_UID) {
  console.error('Bitte LP21_USER, LP21_PASSWORD und LP21_ROOT_UID setzen. Siehe docs/LEHRPLAN21-API.md.');
  process.exit(1);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
let requests = 0;

async function request(uidOrUrl) {
  const url = uidOrUrl.startsWith('http')
    ? uidOrUrl
    : `${BASE}?kanton=${KANTON}&sprache=${SPRACHE}&uid=${encodeURIComponent(uidOrUrl)}`;
  await sleep(DELAY_MS);
  requests += 1;
  const res = await fetch(url, { headers: { Authorization: `Basic ${Buffer.from(`${LP21_USER}:${LP21_PASSWORD}`).toString('base64')}`, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} für ${url}`);
  const data = await res.json();
  if (data.error) throw new Error(`Schnittstelle meldet: ${data.error} (${url})`);
  return data;
}

// hierarchie_unten kann laut Manual URLs oder UIDs enthalten, einzeln oder als Liste.
const children = el => [].concat(el.hierarchie_unten || []).filter(Boolean);
const clean = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function walk(uid, visit, depth = 0) {
  const el = await request(uid);
  const goDeeper = await visit(el, depth);
  if (goDeeper === false || el.strukturtyp === STOP_BELOW) return;
  for (const child of children(el)) await walk(child, visit, depth + 1);
}

const result = { quelle: 'api.lehrplan.ch', kanton: KANTON, sprache: SPRACHE, versionsdatum: null, abgerufen: new Date().toISOString(), faecher: {} };
let currentSubject = null, currentArea = null, currentCompetence = null;

await walk(LP21_ROOT_UID, (el, depth) => {
  if (el.Versionsdatum && !result.versionsdatum) result.versionsdatum = el.Versionsdatum;
  switch (el.strukturtyp) {
    case 'Fachbereich':
    case 'Fach': {
      const code = String(el.code || '').toUpperCase().replace(/\.$/, '');
      const id = WANTED[code];
      if (el.strukturtyp === 'Fachbereich' && !id) { currentSubject = null; return true; } // Fach darunter könnte passen (z. B. Fremdsprachen)
      if (!id) { currentSubject = null; return false; }
      currentSubject = result.faecher[id] ??= { code, bezeichnung: clean(el.bezeichnung), bereiche: [] };
      return true;
    }
    case 'Kompetenzbereich':
      if (!currentSubject) return false;
      currentArea = { code: el.code, bezeichnung: clean(el.bezeichnung), kompetenzen: [] };
      currentSubject.bereiche.push(currentArea);
      return true;
    case 'Kompetenz':
      if (!currentArea) return false;
      currentCompetence = { code: el.code, bezeichnung: clean(el.bezeichnung), stufen: [] };
      currentArea.kompetenzen.push(currentCompetence);
      return true;
    case 'Kompetenzstufe':
      if (currentCompetence) currentCompetence.stufen.push({ code: el.code, zyklus: el.zyklus, grundanspruch: el.grundanspruch === 1 || el.grundanspruch === '1', bezeichnung: clean(el.bezeichnung) });
      return false;
    default:
      return depth < 6; // Lehrplan, Kompetenzaufbau, Handlungs-/Themenaspekt usw. durchlaufen
  }
});

// Nur schreiben, wenn das Ergebnis plausibel ist – ein halber Export soll nichts überschreiben.
const missing = Object.values(WANTED).filter(id => !result.faecher[id]?.bereiche.length);
if (missing.length) {
  console.error(`Abbruch: keine Kompetenzbereiche für ${missing.join(', ')} gefunden (${requests} Anfragen). Nichts geschrieben.`);
  process.exit(2);
}
await writeFile(new URL('../shared/lp21-ag.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log(`Fertig: ${Object.keys(result.faecher).length} Fächer, Versionsdatum ${result.versionsdatum}, ${requests} Anfragen → shared/lp21-ag.json`);
