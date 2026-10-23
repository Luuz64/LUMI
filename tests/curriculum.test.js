import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES, subjectsFor, fitSubject, stageLabel, curriculumContext, migrateStage, needsTrack } from '../shared/curriculum.js';

const labels = stage => subjectsFor(stage).map(s => s.label);

test('subjects follow the Aargau timetable logic', () => {
  assert.ok(labels('p2').includes('Natur, Mensch, Gesellschaft'));
  assert.ok(!labels('p2').includes('Englisch'));
  assert.ok(labels('p3').includes('Englisch'));
  assert.ok(!labels('p4').includes('Französisch'));
  assert.ok(labels('p5').includes('Französisch'));
  assert.ok(labels('p5').includes('Medien und Informatik'));
  assert.ok(!labels('o1').includes('Natur, Mensch, Gesellschaft'));
  for (const s of ['Natur und Technik', 'Räume, Zeiten, Gesellschaften', 'Wirtschaft, Arbeit, Haushalt', 'Ethik, Religionen, Gemeinschaft']) assert.ok(labels('o3').includes(s), s);
  assert.ok(labels('lehre').includes('Allgemeinbildender Unterricht (ABU)'));
  assert.ok(!labels('mittelschule').includes('Allgemeinbildender Unterricht (ABU)'));
  for (const stage of STAGES) assert.equal(labels(stage.id).at(-1), 'Anderes Fach');
});

test('subjects carry over sensibly when the stage changes', () => {
  assert.equal(fitSubject('o1', 'Natur, Mensch, Gesellschaft'), 'Natur und Technik');
  assert.equal(fitSubject('p4', 'Natur und Technik'), 'Natur, Mensch, Gesellschaft');
  assert.equal(fitSubject('mittelschule', 'Natur und Technik'), 'Biologie');
  assert.equal(fitSubject('p3', 'Französisch'), 'Mathematik');
  assert.equal(fitSubject('o2', 'Mathematik'), 'Mathematik');
});

test('labels, tracks and migration', () => {
  assert.equal(stageLabel('o2', 'bez'), '2. Oberstufe, Bezirksschule');
  assert.equal(stageLabel('p4', 'bez'), '4. Klasse');
  assert.equal(needsTrack('o3'), true);
  assert.equal(needsTrack('p6'), false);
  assert.deepEqual(['1', '6', '7', '9', 'sek2', 'p3', 'nonsense'].map(migrateStage), ['p1', 'p6', 'o1', 'o3', 'mittelschule', 'p3', null]);
});

test('context names cycle, competence areas and never invents codes', () => {
  const ctx = curriculumContext({ stage: 'p5', subject: 'Mathematik' });
  assert.match(ctx, /5\. Klasse Primarschule, 2\. Zyklus\./);
  assert.match(ctx, /Zahl und Variable; Form und Raum; Grössen, Funktionen, Daten und Zufall/);
  assert.match(ctx, /Handlungsaspekte: Operieren und Benennen/);
  assert.doesNotMatch(ctx, /MA\.\d/);
  assert.match(curriculumContext({ stage: 'p2', subject: 'Anderes Fach' }), /Fach: nicht festgelegt/);
});
