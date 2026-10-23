// Aargauer Schulsystem und Lehrplan-Grundlagen für Lumi.
//
// Quelle der Fach- und Kompetenzbereichs-Titel: Aargauer Lehrplan Volksschule auf
// https://ag.lehrplan.ch (basiert auf dem Lehrplan 21, gültig seit Schuljahr 2020/21).
// Stand der Abschrift: Oktober 2026. Sobald ein Zugang zur offiziellen Datenschnittstelle
// (api.lehrplan.ch, kanton=ag) besteht, ersetzt scripts/lp21-import.mjs diese statischen
// Daten durch einen Export (siehe docs/LEHRPLAN21-API.md). Die Struktur unten entspricht
// bewusst den Feldern der Schnittstelle (code, bezeichnung, zyklus).
//
// Wird von Browser (src/) und Server (server/) gemeinsam genutzt. Keine Abhängigkeiten.

export const CANTON = { id: 'ag', name: 'Aargau', curriculum: 'Aargauer Lehrplan Volksschule (basiert auf dem Lehrplan 21)' };

export const STAGE_GROUPS = [
  { id: 'primar', label: 'Primarschule' },
  { id: 'oberstufe', label: 'Oberstufe' },
  { id: 'sek2', label: 'Nach der Volksschule' },
];

// cycle: Zyklus nach Lehrplan 21 (1 = Kindergarten bis 2. Klasse, 2 = 3.–6. Klasse, 3 = Oberstufe).
export const STAGES = [
  ...[1, 2, 3, 4, 5, 6].map(n => ({ id: `p${n}`, label: `${n}. Klasse`, long: `${n}. Klasse Primarschule`, group: 'primar', cycle: n <= 2 ? 1 : 2, year: n })),
  ...[1, 2, 3].map(n => ({ id: `o${n}`, label: `${n}. Oberstufe`, long: `${n}. Klasse Oberstufe`, group: 'oberstufe', cycle: 3, year: n })),
  { id: 'mittelschule', label: 'Mittelschule / Gymnasium', long: 'Mittelschule oder Gymnasium (Sekundarstufe II)', group: 'sek2', cycle: null },
  { id: 'lehre', label: 'Berufslehre', long: 'Berufslehre mit Berufsfachschule (Sekundarstufe II)', group: 'sek2', cycle: null },
];
export const DEFAULT_STAGE = 'p5';

// Schultypen der Aargauer Oberstufe. Alle arbeiten an denselben Kompetenzzielen.
export const TRACKS = [
  { id: 'real', label: 'Realschule', demand: 'grundlegenden Anforderungen' },
  { id: 'sek', label: 'Sekundarschule', demand: 'erweiterten Anforderungen' },
  { id: 'bez', label: 'Bezirksschule', demand: 'hohen Anforderungen' },
];

const FS_AREAS = ['Hören', 'Lesen', 'Sprechen', 'Schreiben', 'Sprache(n) im Fokus', 'Kulturen im Fokus'];

// Fächer mit Code, Zyklen und Kompetenzbereichen (Titel wie auf ag.lehrplan.ch).
export const SUBJECTS = [
  { id: 'MA', label: 'Mathematik', cycles: [1, 2, 3], areas: ['Zahl und Variable', 'Form und Raum', 'Grössen, Funktionen, Daten und Zufall'],
    aspects: ['Operieren und Benennen', 'Erforschen und Argumentieren', 'Mathematisieren und Darstellen'] },
  { id: 'D', label: 'Deutsch', cycles: [1, 2, 3], areas: ['Hören', 'Lesen', 'Sprechen', 'Schreiben', 'Sprache(n) im Fokus', 'Literatur im Fokus'] },
  // Englisch ist im Aargau die 1. Fremdsprache. Startklasse vor dem Einsatz mit der Stundentafel prüfen.
  { id: 'FS1E', label: 'Englisch', cycles: [2, 3], minYear: { primar: 3 }, areas: FS_AREAS },
  // Französisch (2. Fremdsprache) ab der 5. Klasse Primarschule.
  { id: 'FS2F', label: 'Französisch', cycles: [2, 3], minYear: { primar: 5 }, areas: FS_AREAS },
  { id: 'NMG', label: 'Natur, Mensch, Gesellschaft', cycles: [1, 2], areas: [
    'Identität, Körper, Gesundheit – sich kennen und sich Sorge tragen', 'Tiere, Pflanzen und Lebensräume erkunden und erhalten',
    'Stoffe, Energie und Bewegungen beschreiben, untersuchen und nutzen', 'Phänomene der belebten und unbelebten Natur erforschen und erklären',
    'Technische Entwicklungen und Umsetzungen erschliessen, einschätzen und anwenden', 'Arbeit, Produktion und Konsum – Situationen erschliessen',
    'Lebensweisen und Lebensräume von Menschen erschliessen und vergleichen', 'Menschen nutzen Räume – sich orientieren und mitgestalten',
    'Zeit, Dauer und Wandel verstehen – Geschichte und Geschichten unterscheiden', 'Gemeinschaft und Gesellschaft – Zusammenleben gestalten und sich engagieren',
    'Grunderfahrungen, Werte und Normen erkunden und reflektieren', 'Religionen und Weltsichten begegnen'] },
  { id: 'NT', label: 'Natur und Technik', hint: 'Physik, Chemie, Biologie', cycles: [3], areas: [
    'Wesen und Bedeutung von Naturwissenschaften und Technik verstehen', 'Stoffe untersuchen und gewinnen', 'Chemische Reaktionen erforschen',
    'Energieumwandlungen analysieren und reflektieren', 'Mechanische und elektrische Phänomene untersuchen', 'Sinne und Signale erforschen',
    'Körperfunktionen verstehen', 'Fortpflanzung und Entwicklung analysieren', 'Ökosysteme erkunden'] },
  { id: 'RZG', label: 'Räume, Zeiten, Gesellschaften', hint: 'Geografie, Geschichte', cycles: [3], areas: [
    'Natürliche Grundlagen der Erde untersuchen', 'Lebensweisen und Lebensräume charakterisieren', 'Mensch-Umwelt-Beziehungen analysieren',
    'Sich in Räumen orientieren', 'Schweiz in Tradition und Wandel verstehen', 'Weltgeschichtliche Kontinuitäten und Umbrüche erklären',
    'Geschichtskultur analysieren und nutzen', 'Demokratie und Menschenrechte verstehen und sich dafür engagieren'] },
  { id: 'WAH', label: 'Wirtschaft, Arbeit, Haushalt', cycles: [3], areas: [
    'Produktions- und Arbeitswelten erkunden', 'Märkte und Handel verstehen – über Geld nachdenken', 'Konsum gestalten',
    'Ernährung und Gesundheit – Zusammenhänge verstehen und reflektiert handeln', 'Haushalten und Zusammenleben gestalten'] },
  { id: 'ERG', label: 'Ethik, Religionen, Gemeinschaft', cycles: [3], areas: [
    'Existentielle Grunderfahrungen reflektieren', 'Werte und Normen klären und Entscheidungen verantworten',
    'Spuren und Einfluss von Religionen in Kultur und Gesellschaft erkennen', 'Sich mit Religionen und Weltsichten auseinandersetzen',
    'Ich und die Gemeinschaft – Leben und Zusammenleben gestalten'] },
  // Im Aargau ab der 5. Klasse als eigenes Fach.
  { id: 'MI', label: 'Medien und Informatik', cycles: [2, 3], minYear: { primar: 5 }, areas: ['Medien', 'Informatik'] },
  // Sekundarstufe II: eigene Lehrpläne, kein Lehrplan 21.
  { id: 'BIO', label: 'Biologie', sek2: true }, { id: 'CH', label: 'Chemie', sek2: true }, { id: 'PH', label: 'Physik', sek2: true },
  { id: 'GE', label: 'Geschichte', sek2: true }, { id: 'GG', label: 'Geografie', sek2: true }, { id: 'WR', label: 'Wirtschaft und Recht', sek2: true },
  { id: 'ABU', label: 'Allgemeinbildender Unterricht (ABU)', sek2: ['lehre'] },
  { id: 'OTHER', label: 'Anderes Fach', always: true },
];
const SEK2_SHARED = ['MA', 'D', 'FS1E', 'FS2F'];

export const stageById = id => STAGES.find(s => s.id === id);
export const trackById = id => TRACKS.find(t => t.id === id);
export const subjectByLabel = label => SUBJECTS.find(s => s.label === label);
export const needsTrack = stageId => stageById(stageId)?.group === 'oberstufe';

/** Subjects offered for a stage, in display order. */
export function subjectsFor(stageId) {
  const stage = stageById(stageId);
  if (!stage) return [];
  return SUBJECTS.filter(s => {
    if (s.always) return true;
    if (stage.group === 'sek2') return SEK2_SHARED.includes(s.id) || s.sek2 === true || (Array.isArray(s.sek2) && s.sek2.includes(stage.id));
    if (!s.cycles?.includes(stage.cycle)) return false;
    const min = s.minYear?.[stage.group];
    return !min || stage.year >= min;
  });
}

/** Keep a subject if it exists for the stage, otherwise pick the closest replacement. */
export function fitSubject(stageId, label) {
  const offered = subjectsFor(stageId);
  if (offered.some(s => s.label === label)) return label;
  const stage = stageById(stageId);
  const science = stage?.group === 'sek2' ? 'Biologie' : stage?.cycle === 3 ? 'Natur und Technik' : 'Natur, Mensch, Gesellschaft';
  const bridge = { 'Natur, Mensch, Gesellschaft': science, 'Natur und Technik': science, Biologie: science }[label];
  if (bridge && offered.some(s => s.label === bridge)) return bridge;
  return offered[0]?.label || 'Anderes Fach';
}

export function stageLabel(stageId, trackId = '') {
  const stage = stageById(stageId);
  if (!stage) return '';
  const track = needsTrack(stageId) ? trackById(trackId) : null;
  return track ? `${stage.label}, ${track.label}` : stage.label;
}

/** Text block for the model: where the learner stands in the Aargau system and what the curriculum says. */
export function curriculumContext({ stage: stageId, track: trackId = '', subject: subjectLabel }) {
  const stage = stageById(stageId);
  const subject = subjectByLabel(subjectLabel);
  if (!stage) return '';
  const lines = [`Kanton ${CANTON.name}.`];
  if (stage.group === 'sek2') {
    lines.push(`Stufe: ${stage.long}. Hier gilt nicht der Lehrplan 21, sondern der Lehrplan der jeweiligen Schule bzw. des Berufs. Frage nach Schule oder Beruf, wenn es für die Aufgabe wichtig ist.`);
  } else {
    lines.push(`Stufe: ${stage.long}, ${stage.cycle}. Zyklus.`, `Lehrplan: ${CANTON.curriculum}.`);
    if (stage.group === 'oberstufe') {
      const track = trackById(trackId);
      lines.push(track
        ? `Schultyp: ${track.label} mit ${track.demand}. Real-, Sekundar- und Bezirksschule arbeiten an denselben Kompetenzzielen; passe Tempo, Abstraktion und Schwierigkeit an diesen Schultyp an.`
        : 'Schultyp (Real-, Sekundar- oder Bezirksschule) unbekannt. Frage danach, wenn die Schwierigkeit davon abhängt.');
    }
  }
  if (subject && !subject.always) {
    lines.push(`Fach: ${subject.label}${subject.hint ? ` (${subject.hint})` : ''}.`);
    if (subject.areas && stage.group !== 'sek2') lines.push(`Kompetenzbereiche im Lehrplan: ${subject.areas.join('; ')}.`);
    if (subject.aspects && stage.group !== 'sek2') lines.push(`Handlungsaspekte: ${subject.aspects.join('; ')}.`);
  } else {
    lines.push('Fach: nicht festgelegt. Frage nach, um welches Fach es geht, wenn es unklar ist.');
  }
  return lines.join('\n');
}

// Lernzettel und alte Clients nutzten bis Oktober 2026 die Stufen-IDs '1'–'9' und 'sek2'.
export function migrateStage(oldId) {
  if (stageById(oldId)) return oldId;
  if (/^[1-6]$/.test(oldId)) return `p${oldId}`;
  if (/^[7-9]$/.test(oldId)) return `o${Number(oldId) - 6}`;
  if (oldId === 'sek2') return 'mittelschule';
  return null;
}

// Sprache und Ton je Stufe. Konkrete Vorgaben statt nur «altersgerecht».
const TONE = {
  early: 'Das Kind ist 6–8 Jahre alt und liest vielleicht noch langsam. Sehr kurze Sätze mit höchstens etwa 10 Wörtern, nur bekannte Alltagswörter, ein einziger Schritt pro Nachricht, kleine Zahlen und Beispiele aus dem Alltag (Spielsachen, Znüni, Tiere). Keine Fachwörter.',
  middle: 'Das Kind ist etwa 8–10 Jahre alt. Kurze Sätze, einfache Wörter, höchstens zwei Schritte pro Nachricht. Ein neues Fachwort nur mit kurzer Erklärung in Klammern.',
  upper: 'Das Kind ist etwa 10–12 Jahre alt. Kurze, klare Sätze. Fachbegriffe aus dem Unterricht verwenden und beim ersten Mal kurz erklären.',
  teen: 'Jugendliche ab etwa 12 Jahren. Sprich sie respektvoll und nicht kindlich an, ohne Jugendsprache nachzuahmen. Fachbegriffe sind normal; erkläre sie, wenn sie neu sein könnten.',
  adult: 'Junge Erwachsene in Ausbildung. Sachlich und auf Augenhöhe, Fachsprache des Fachs bzw. Berufs. Kein Schulkinder-Ton.',
};
export function toneFor(stageId) {
  const stage = stageById(stageId);
  if (!stage) return '';
  if (stage.group === 'sek2') return TONE.adult;
  if (stage.group === 'oberstufe') return TONE.teen;
  if (stage.year <= 2) return TONE.early;
  return stage.year <= 4 ? TONE.middle : TONE.upper;
}

const pad = n => String(n).padStart(2, '0');
/** Today's date in Zurich as YYYY-MM-DD, independent of the server's time zone. */
export function zurichToday(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
const longDate = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('de-CH', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };

/** Date context for the model: today, and how much time is left until an exam. */
export function timeContext(examDate = '', now = new Date()) {
  const today = zurichToday(now);
  const lines = [`Heute ist ${longDate(today)}.`];
  if (/^\d{4}-\d{2}-\d{2}$/.test(examDate)) {
    const toUtc = iso => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
    const days = Math.round((toUtc(examDate) - toUtc(today)) / 86400000);
    if (days < 0) {
      lines.push('Das angegebene Prüfungsdatum liegt in der Vergangenheit. Erwähne es nicht, ausser das Kind spricht es an.');
    } else {
      const when = days === 0 ? 'heute' : days === 1 ? 'morgen' : `in ${days} Tagen`;
      lines.push(`Die Prüfung ist ${when} (${longDate(examDate)}).`);
      lines.push(days <= 3
        ? 'Wenig Zeit: Konzentriere dich auf das Wiederholen und Festigen des Wichtigsten. Fang keine grossen neuen Themen an und bleib ruhig und ermutigend, ohne Druck zu machen.'
        : days <= 14
          ? 'Etwas Zeit: Übe gezielt die unsicheren Themen und plane bei Bedarf kurze Übungseinheiten über die verbleibenden Tage.'
          : 'Genug Zeit: Verständnis aufbauen ist wichtiger als Auswendiglernen. Kein Zeitdruck.');
    }
  }
  return lines.join('\n');
}
