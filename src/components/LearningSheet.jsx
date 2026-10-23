import React from 'react';
import Icon from './Icon';
import Lights from './Lights';
import { stageLabel as formatStage, practiceOrder, levelLabel, countdownText, formatDate, hasContent } from '../learning';

const FIELDS = [
  ['understood', 'Das habe ich verstanden', 'Was kannst du jetzt in eigenen Worten erklären?'],
  ['practice', 'Das möchte ich noch üben', 'Wo brauchst du noch einen Hinweis?'],
  ['next', 'Mein nächster Schritt', 'Womit fängst du beim nächsten Mal an?'],
];

export default function LearningSheet({ stage, track, exam, notes, setNotes, onEditPlan, onContinue, onDownload, onCopy, onLoad }) {
  const stageLabel = formatStage(stage, track);
  const filled = hasContent(exam, notes);

  return (
    <section className="workspace-panel plan">
      <header className="plan-heading">
        <h1>Mein Lernzettel</h1>
        <p>Halte in deinen Worten fest, was du mitnimmst. Der Zettel gehört dir: Lumi bewertet ihn nicht, und er wird nicht gespeichert, bis du ihn herunterlädst.</p>
      </header>

      <article className="sheet learning-sheet" aria-label="Lernzettel">
        <div className="sheet-section sheet-head">
          <div>
            <p className="sheet-subject">{exam.subject}</p>
            <p className="sheet-meta">{stageLabel}</p>
          </div>
          {exam.date ? (
            <p className="sheet-date"><strong>Prüfung {countdownText(exam.date)}</strong><span>{formatDate(exam.date)}</span></p>
          ) : <p className="sheet-date muted">Kein Prüfungsdatum</p>}
        </div>

        <div className="sheet-section">
          <div className="section-title">
            <h2>Themen</h2>
            <button className="text-link no-print" onClick={onEditPlan}><Icon name="pencil" size={16} /> {exam.topics.length ? 'Bearbeiten' : 'Themen eintragen'}</button>
          </div>
          {exam.topics.length ? <>
            <Lights topics={exam.topics} size="small" />
            <ul className="sheet-topics">
              {practiceOrder(exam.topics).map(t => (
                <li key={t.id}>
                  <span className={`topic-dot light-${t.level || 'none'}`} aria-hidden="true" />
                  <span className="topic-text">{t.text}</span>
                  <span className={`level-tag level-${t.level || 'none'}`}>{levelLabel(t.level)}</span>
                </li>
              ))}
            </ul>
          </> : <p className="sheet-empty">Noch keine Themen. Trag unter „Meine Prüfung“ ein, was drankommt, dann erscheinen sie hier.</p>}
        </div>

        <div className="sheet-section reflection">
          <h2>Meine Gedanken</h2>
          {FIELDS.map(([key, title, placeholder]) => (
            <label className="reflection-field" key={key}>
              <span className="field-label">{title}</span>
              <textarea maxLength={1500} rows={3} value={notes[key]} placeholder={placeholder}
                onChange={e => setNotes({ ...notes, [key]: e.target.value })} />
              <span className="print-only print-text">{notes[key] || ' '}</span>
            </label>
          ))}
        </div>

        <div className="sheet-section sheet-actions no-print">
          <button className="button primary" onClick={onContinue} disabled={!filled}>Mit Lumi weiterlernen</button>
          <div className="secondary-actions" role="group" aria-label="Lernzettel mitnehmen">
            <button className="button secondary" onClick={onDownload} disabled={!filled}><Icon name="download" size={18} /> Herunterladen</button>
            <button className="button secondary" onClick={() => window.print()} disabled={!filled}><Icon name="print" size={18} /> Drucken</button>
            <button className="button secondary" onClick={onCopy} disabled={!filled}><Icon name="copy" size={18} /> Kopieren</button>
          </div>
          {!filled && <p className="small-text">Sobald du ein Thema oder eine Notiz eingetragen hast, kannst du den Zettel mitnehmen.</p>}
        </div>
        <p className="print-only print-footer">Mein Lumi-Lernzettel · eigene Notizen und Selbsteinschätzung, keine Bewertung</p>
      </article>

      <div className="load-row no-print">
        <p>Hast du einen Lernzettel von früher?</p>
        <button className="button ghost" onClick={onLoad}><Icon name="upload" size={18} /> Lernzettel laden</button>
      </div>
      <p className="small-text plan-note no-print">Die Datei enthält Fach, Stufe, Themen und deine Notizen, aber keinen Chat. Speichere sie auf deinem eigenen Gerät oder Schulspeicher.</p>
    </section>
  );
}
