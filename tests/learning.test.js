import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_EXAM, EMPTY_NOTES, DEFAULT_PROFILE, MAX_TOPICS, makeTopic, makeLearningSheet, readLearningSheet, sheetAsText, buildContinuation,
  buildTopicStart, buildExamStart, practiceOrder, topicsAsContext, daysUntil, countdownText, hasContent,
} from '../src/learning.js';

const withTopics = (...topics) => ({ ...EMPTY_EXAM, topics: topics.map(([text, level]) => makeTopic(text, level)) });
const strip = state => ({ ...state, exam: { ...state.exam, topics: state.exam.topics.map(({ text, level }) => ({ text, level })) } });

test('learning sheet round-trip keeps topics and notes, never chat history', () => {
  const exam = { ...withTopics(['Brüche kürzen', 'unsure'], ['Brüche erweitern', 'solid']), date: '2026-11-06', messages: ['private chat'] };
  const notes = { ...EMPTY_NOTES, understood: 'Nenner vergleichen', secret: 'not exported' };
  const sheet = makeLearningSheet({ stage: 'o2', track: 'bez' }, exam, notes);
  const json = JSON.stringify(sheet);
  assert.equal(sheet.version, 2);
  assert.deepEqual(strip(readLearningSheet(json)), { profile: { stage: 'o2', track: 'bez' }, exam: { subject: 'Mathematik', date: '2026-11-06', topics: [{ text: 'Brüche kürzen', level: 'unsure' }, { text: 'Brüche erweitern', level: 'solid' }] }, notes: { understood: 'Nenner vergleichen', practice: '', next: '' } });
  assert.equal(json.includes('private chat'), false);
  assert.equal(json.includes('not exported'), false);
  assert.equal(json.includes('"id"'), false);
});

test('version 1 sheets still load and their topic text becomes a topic list', () => {
  const v1 = { format: 'lumi-lernzettel', version: 1, stage: '6', exam: { subject: 'Deutsch', topic: 'Kommas, Nomen erkennen', date: '' }, notes: { understood: 'a', practice: 'b', next: 'c' } };
  const loaded = readLearningSheet(JSON.stringify(v1));
  assert.deepEqual(loaded.exam.topics.map(t => [t.text, t.level]), [['Kommas', ''], ['Nomen erkennen', '']]);
  assert.deepEqual(loaded.profile, { stage: 'p6', track: '' });
});

test('import rejects oversized, malformed and incompatible files', () => {
  for (const text of ['{', 'null', '[]', '{}', 'x'.repeat(12001)]) assert.throws(() => readLearningSheet(text));
  const mutations = [
    d => d.stage = 'admin', d => d.track = 'gymnasium', d => d.version = 3, d => d.notes.next = [], d => d.exam.subject = 'untrusted', d => d.notes.next = 'x'.repeat(1501),
    d => d.exam.topics = 'Brüche', d => d.exam.topics = [{ text: 'x', level: 'genius' }], d => d.exam.topics = [{ text: '   ', level: '' }],
    d => d.exam.topics = [{ text: 'x'.repeat(121), level: '' }], d => d.exam.topics = Array.from({ length: MAX_TOPICS + 1 }, () => ({ text: 'x', level: '' })),
  ];
  for (const mutation of mutations) {
    const d = makeLearningSheet(DEFAULT_PROFILE, withTopics(['Brüche', 'okay']), EMPTY_NOTES); mutation(d);
    assert.throws(() => readLearningSheet(JSON.stringify(d)));
  }
});

test('import does not spread injected object properties', () => {
  const d = makeLearningSheet(DEFAULT_PROFILE, withTopics(['Brüche', '']), EMPTY_NOTES);
  const malicious = JSON.stringify(d)
    .replace('"notes":{', '"notes":{"__proto__":{"polluted":true},"unexpected":"value",')
    .replace('{"text":"Brüche"', '{"__proto__":{"polluted":true},"extra":1,"text":"Brüche"');
  const loaded = readLearningSheet(malicious);
  assert.equal(Object.hasOwn(loaded.notes, '__proto__'), false);
  assert.equal(Object.hasOwn(loaded.notes, 'unexpected'), false);
  assert.equal(Object.hasOwn(loaded.exam.topics[0], 'extra'), false);
  assert.equal({}.polluted, undefined);
});

test('practice starts with the least certain topic and context stays within server limits', () => {
  const exam = withTopics(['Sitzt schon', 'solid'], ['Offen', ''], ['Schwierig', 'unsure'], ['Mittel', 'okay']);
  assert.deepEqual(practiceOrder(exam.topics).map(t => t.text), ['Schwierig', 'Offen', 'Mittel', 'Sitzt schon']);
  assert.match(buildExamStart(exam), /beginne mit „Schwierig“/);
  assert.match(buildTopicStart(exam.topics[2]), /„Schwierig“ üben\. Ich fühle mich dabei noch unsicher\./);
  const many = { ...EMPTY_EXAM, topics: Array.from({ length: MAX_TOPICS }, (_, i) => makeTopic(`${'x'.repeat(115)}${i}`)) };
  assert.ok(topicsAsContext(many.topics).length <= 600);
});

test('countdown counts whole local days', () => {
  const today = new Date(2026, 9, 23, 23, 30);
  assert.equal(daysUntil('2026-10-23', today), 0);
  assert.equal(countdownText('2026-10-24', today), 'morgen');
  assert.equal(countdownText('2026-11-06', today), 'in 14 Tagen');
  assert.equal(countdownText('2026-10-20', today), 'war vor 3 Tagen');
  assert.equal(daysUntil('', today), null);
});

test('plain text export and continuation clearly identify self-reported notes', () => {
  const notes = { understood: 'Brüche erweitern', practice: 'Kürzen', next: 'Eine neue Aufgabe' };
  const exam = withTopics(['Kürzen', 'unsure']);
  assert.match(sheetAsText({ stage: 'o1', track: 'sek' }, exam, notes), /Keine Bewertung/);
  assert.match(sheetAsText({ stage: 'o1', track: 'sek' }, exam, notes), /- Kürzen \(Noch unsicher\)/);
  assert.match(buildContinuation(exam, notes), /eigenen Notizen und meine Selbsteinschätzung/);
  assert.match(buildContinuation(exam, notes), /Kürzen/);
  assert.equal(hasContent(EMPTY_EXAM, EMPTY_NOTES), false);
  assert.equal(hasContent(exam, EMPTY_NOTES), true);
});

test('old stage ids are migrated and subjects follow the stage', () => {
  const sheet = (stage, subject) => JSON.stringify({ format: 'lumi-lernzettel', version: 2, stage, track: '', exam: { subject, date: '', topics: [] }, notes: EMPTY_NOTES });
  assert.deepEqual(readLearningSheet(sheet('8', 'Mathematik')).profile, { stage: 'o2', track: '' });
  assert.equal(readLearningSheet(sheet('sek2', 'Deutsch')).profile.stage, 'mittelschule');
  // NMG gibt es auf der Oberstufe nicht mehr: am nächsten liegt Natur und Technik.
  assert.equal(readLearningSheet(sheet('7', 'Natur, Mensch, Gesellschaft')).exam.subject, 'Natur und Technik');
  // Ein Schultyp wird nur auf der Oberstufe übernommen.
  const primarWithTrack = JSON.parse(sheet('p4', 'Deutsch')); primarWithTrack.track = 'bez';
  assert.equal(readLearningSheet(JSON.stringify(primarWithTrack)).profile.track, '');
  assert.match(sheetAsText({ stage: 'o3', track: 'real' }, EMPTY_EXAM, EMPTY_NOTES), /3\. Oberstufe, Realschule/);
});
