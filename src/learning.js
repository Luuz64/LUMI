export const STAGES = [
  ...Array.from({ length: 9 }, (_, i) => ({ id: String(i + 1), label: `${i + 1}. Schuljahr` })),
  { id: 'sek2', label: 'Sek II / Lehre' },
];
export const SUBJECTS = ['Mathematik', 'Deutsch', 'Französisch', 'Englisch', 'Natur, Mensch, Gesellschaft', 'Anderes Fach'];
export const EMPTY_EXAM = { subject: 'Mathematik', topic: '', date: '' };
export const EMPTY_NOTES = { understood: '', practice: '', next: '' };
export const MAX_IMPORT_BYTES = 12000;

export function makeLearningSheet(stage, exam, notes) {
  return {
    format: 'lumi-lernzettel', version: 1, stage,
    exam: { subject: exam.subject, topic: exam.topic, date: exam.date },
    notes: { understood: notes.understood, practice: notes.practice, next: notes.next },
  };
}

// Rebuild a whitelisted object; do not merge imported objects into application state.
export function readLearningSheet(text) {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) throw new Error('Dieser Lernzettel ist zu gross.');
  let d;
  try { d = JSON.parse(text); } catch { throw new Error('Bitte wähle einen von Lumi heruntergeladenen Lernzettel (.json).'); }
  const validText = (s, max) => typeof s === 'string' && s.length <= max;
  if (!d || d.format !== 'lumi-lernzettel' || d.version !== 1 || !STAGES.some(s => s.id === d.stage)
    || !d.exam || !SUBJECTS.includes(d.exam.subject) || !validText(d.exam.topic, 600)
    || !validText(d.exam.date, 10) || (d.exam.date && !/^\d{4}-\d{2}-\d{2}$/.test(d.exam.date))
    || !d.notes || !['understood', 'practice', 'next'].every(k => validText(d.notes[k], 1500))) {
    throw new Error('Das Format dieses Lernzettels passt nicht. Deine bisherigen Einträge bleiben erhalten.');
  }
  return makeLearningSheet(d.stage, d.exam, d.notes);
}

export function sheetAsText(stage, exam, notes) {
  return ['MEIN LUMI-LERNZETTEL', STAGES.find(s => s.id === stage)?.label || '',
    `Fach: ${exam.subject}`, `Thema: ${exam.topic || 'Noch offen'}`, `Prüfung: ${exam.date || 'Kein Datum'}`,
    '', 'Das habe ich verstanden:', notes.understood || 'Noch kein Eintrag.',
    '', 'Das möchte ich noch üben:', notes.practice || 'Noch kein Eintrag.',
    '', 'Mein nächster Schritt:', notes.next || 'Noch kein Eintrag.',
    '', 'Eigene Notizen. Keine Bewertung durch Lumi.'].join('\n');
}

export function buildContinuation(notes) {
  return `Ich möchte weiterlernen. Hier sind meine eigenen Notizen (keine Bewertung):\nVerstanden: ${notes.understood || 'Noch offen'}\nÜben: ${notes.practice || 'Noch offen'}\nNächster Schritt: ${notes.next || 'Gemeinsam festlegen'}\nBitte prüfe mit einer kleinen Aufgabe, wo ich stehe.`;
}
