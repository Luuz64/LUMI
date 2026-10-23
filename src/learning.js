export const STAGES = [
  ...Array.from({ length: 9 }, (_, i) => ({ id: String(i + 1), label: `${i + 1}. Schuljahr` })),
  { id: 'sek2', label: 'Sek II / Lehre' },
];
export const SUBJECTS = ['Mathematik', 'Deutsch', 'Französisch', 'Englisch', 'Natur, Mensch, Gesellschaft', 'Anderes Fach'];

// Self-assessment only. Lumi never sets these; the learner chooses them.
export const LEVELS = [
  { id: 'unsure', label: 'Noch unsicher', short: 'Unsicher' },
  { id: 'okay', label: 'Geht so', short: 'Geht so' },
  { id: 'solid', label: 'Sitzt', short: 'Sitzt' },
];
export const MAX_TOPICS = 12;
export const MAX_TOPIC_LENGTH = 120;
export const EMPTY_EXAM = { subject: 'Mathematik', date: '', topics: [] };
export const EMPTY_NOTES = { understood: '', practice: '', next: '' };
export const MAX_IMPORT_BYTES = 12000;

const LEVEL_IDS = ['', ...LEVELS.map(l => l.id)];
let topicCounter = 0;
export const newTopicId = () => `t${Date.now().toString(36)}${(topicCounter++).toString(36)}`;

export function makeTopic(text, level = '') {
  return { id: newTopicId(), text: String(text).trim().slice(0, MAX_TOPIC_LENGTH), level: LEVEL_IDS.includes(level) ? level : '' };
}

/** Topics ordered for practice: unsure first, then not yet rated, then okay, solid last. */
export function practiceOrder(topics) {
  const rank = { unsure: 0, '': 1, okay: 2, solid: 3 };
  return [...topics].sort((a, b) => rank[a.level] - rank[b.level]);
}

/** Short topic string for the server context (max 600 chars). */
export function topicsAsContext(topics) {
  return practiceOrder(topics).map(t => t.text).join(', ').slice(0, 600);
}

export function levelLabel(level) {
  return LEVELS.find(l => l.id === level)?.label || 'Noch nicht eingeschätzt';
}

/** Whole days from today (local time) until an ISO date. null if no valid date. */
export function daysUntil(iso, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - now) / 86400000);
}

export function countdownText(iso, today) {
  const days = daysUntil(iso, today);
  if (days === null) return '';
  if (days === 0) return 'heute';
  if (days === 1) return 'morgen';
  if (days > 1) return `in ${days} Tagen`;
  if (days === -1) return 'war gestern';
  return `war vor ${-days} Tagen`;
}

export function formatDate(iso) {
  if (daysUntil(iso) === null) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function makeLearningSheet(stage, exam, notes) {
  return {
    format: 'lumi-lernzettel', version: 2, stage,
    exam: { subject: exam.subject, date: exam.date, topics: exam.topics.map(t => ({ text: t.text, level: t.level })) },
    notes: { understood: notes.understood, practice: notes.practice, next: notes.next },
  };
}

// Rebuild a whitelisted object; do not merge imported objects into application state.
// Returns application state (topics carry fresh ids). Version 1 files are still accepted.
export function readLearningSheet(text) {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) throw new Error('Dieser Lernzettel ist zu gross.');
  let d;
  try { d = JSON.parse(text); } catch { throw new Error('Bitte wähle einen von Lumi heruntergeladenen Lernzettel (.json).'); }
  const validText = (s, max) => typeof s === 'string' && s.length <= max;
  const formatError = () => new Error('Das Format dieses Lernzettels passt nicht. Deine bisherigen Einträge bleiben erhalten.');
  if (!d || typeof d !== 'object' || Array.isArray(d) || d.format !== 'lumi-lernzettel' || ![1, 2].includes(d.version)
    || !STAGES.some(s => s.id === d.stage) || !d.exam || typeof d.exam !== 'object' || !SUBJECTS.includes(d.exam.subject)
    || !validText(d.exam.date, 10) || (d.exam.date && !/^\d{4}-\d{2}-\d{2}$/.test(d.exam.date))
    || !d.notes || typeof d.notes !== 'object' || !['understood', 'practice', 'next'].every(k => validText(d.notes[k], 1500))) {
    throw formatError();
  }
  let topics;
  if (d.version === 1) {
    if (!validText(d.exam.topic, 600)) throw formatError();
    topics = d.exam.topic.split(/[,;\n]/).map(s => s.trim()).filter(Boolean).slice(0, MAX_TOPICS).map(s => makeTopic(s));
  } else {
    if (!Array.isArray(d.exam.topics) || d.exam.topics.length > MAX_TOPICS
      || !d.exam.topics.every(t => t && typeof t === 'object' && validText(t.text, MAX_TOPIC_LENGTH) && t.text.trim() && LEVEL_IDS.includes(t.level))) throw formatError();
    topics = d.exam.topics.map(t => makeTopic(t.text, t.level));
  }
  return {
    stage: d.stage,
    exam: { subject: d.exam.subject, date: d.exam.date, topics },
    notes: { understood: d.notes.understood, practice: d.notes.practice, next: d.notes.next },
  };
}

export function sheetAsText(stage, exam, notes) {
  const topicLines = exam.topics.length ? practiceOrder(exam.topics).map(t => `- ${t.text} (${levelLabel(t.level)})`) : ['Noch keine Themen eingetragen.'];
  return ['MEIN LUMI-LERNZETTEL', STAGES.find(s => s.id === stage)?.label || '', `Fach: ${exam.subject}`,
    `Prüfung: ${exam.date ? `${formatDate(exam.date)} (${countdownText(exam.date)})` : 'Kein Datum'}`,
    '', 'Themen und meine Einschätzung:', ...topicLines,
    '', 'Das habe ich verstanden:', notes.understood || 'Noch kein Eintrag.',
    '', 'Das möchte ich noch üben:', notes.practice || 'Noch kein Eintrag.',
    '', 'Mein nächster Schritt:', notes.next || 'Noch kein Eintrag.',
    '', 'Eigene Notizen und Selbsteinschätzung. Keine Bewertung durch Lumi.'].join('\n');
}

export function hasContent(exam, notes) {
  return exam.topics.length > 0 || Object.values(notes).some(v => v.trim());
}

export function buildContinuation(exam, notes) {
  const lines = ['Ich möchte weiterlernen. Hier sind meine eigenen Notizen und meine Selbsteinschätzung (keine Bewertung):'];
  if (exam.topics.length) lines.push(`Themen: ${practiceOrder(exam.topics).map(t => `${t.text} (${levelLabel(t.level)})`).join('; ')}`);
  lines.push(`Verstanden: ${notes.understood || 'Noch offen'}`, `Üben: ${notes.practice || 'Noch offen'}`, `Nächster Schritt: ${notes.next || 'Gemeinsam festlegen'}`);
  lines.push(exam.topics.length ? 'Bitte beginne mit dem Thema, bei dem ich am unsichersten bin, und prüfe mit einer kleinen Aufgabe, wo ich stehe.' : 'Bitte prüfe mit einer kleinen Aufgabe, wo ich stehe.');
  return lines.join('\n');
}

export function buildTopicStart(topic) {
  const feeling = { unsure: 'Ich fühle mich dabei noch unsicher.', okay: 'Es geht schon einigermassen.', solid: 'Ich glaube, das sitzt schon. Ich möchte es überprüfen.' }[topic.level] || '';
  return `Ich bereite mich auf meine Prüfung vor und möchte „${topic.text}“ üben. ${feeling} Bitte finde mit einer Frage heraus, was ich schon verstehe.`.replace(/\s+/g, ' ').trim();
}

export function buildExamStart(exam) {
  const first = practiceOrder(exam.topics)[0];
  return `Ich bereite mich auf meine Prüfung in ${exam.subject} vor. Themen: ${topicsAsContext(exam.topics)}. Bitte beginne mit „${first.text}“ und finde mit einer Frage heraus, was ich schon verstehe.`;
}
