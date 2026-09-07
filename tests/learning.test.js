import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_EXAM, EMPTY_NOTES, makeLearningSheet, readLearningSheet, sheetAsText, buildContinuation } from '../src/learning.js';

test('learning sheet round-trip includes only explicit notes and exam fields, never chat history', () => {
  const exam = { ...EMPTY_EXAM, topic: 'Brüche', date: '2026-10-15', messages: ['private chat'] };
  const notes = { ...EMPTY_NOTES, understood: 'Nenner vergleichen', secret: 'not exported' };
  const sheet = makeLearningSheet('5', exam, notes);
  assert.deepEqual(readLearningSheet(JSON.stringify(sheet)), sheet);
  assert.equal(JSON.stringify(sheet).includes('private chat'), false);
  assert.equal(JSON.stringify(sheet).includes('not exported'), false);
});
test('import rejects oversized, malformed and incompatible files', () => {
  for (const text of ['{', 'null', '[]', '{}', 'x'.repeat(12001)]) assert.throws(() => readLearningSheet(text));
  for (const mutation of [d => d.stage = 'admin', d => d.version = 2, d => d.notes.next = [], d => d.exam.subject = 'untrusted', d => d.notes.next = 'x'.repeat(1501)]) {
    const d = makeLearningSheet('5', EMPTY_EXAM, EMPTY_NOTES); mutation(d); assert.throws(() => readLearningSheet(JSON.stringify(d)));
  }
});
test('import does not spread injected object properties', () => {
  const d = makeLearningSheet('5', EMPTY_EXAM, EMPTY_NOTES);
  const malicious = JSON.stringify(d).replace('"notes":{', '"notes":{"__proto__":{"polluted":true},"unexpected":"value",');
  const loaded = readLearningSheet(malicious);
  assert.equal(Object.hasOwn(loaded.notes, '__proto__'), false);
  assert.equal(Object.hasOwn(loaded.notes, 'unexpected'), false);
  assert.equal({}.polluted, undefined);
});
test('plain text export and continuation clearly identify self-reported notes', () => {
  const notes = { understood: 'Brüche erweitern', practice: 'Kürzen', next: 'Eine neue Aufgabe' };
  assert.match(sheetAsText('5', EMPTY_EXAM, notes), /Keine Bewertung/);
  assert.match(buildContinuation(notes), /eigenen Notizen/);
  assert.match(buildContinuation(notes), /Kürzen/);
});
