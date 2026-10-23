import React, { useRef, useState } from 'react';
import Icon from './Icon';
import Lights from './Lights';
import { STAGES, SUBJECTS, LEVELS, MAX_TOPICS, MAX_TOPIC_LENGTH, makeTopic, countdownText, formatDate, daysUntil } from '../learning';

export default function ExamPlan({ stage, setStage, exam, setExam, onPracticeTopic, onStartAll, onOpenSheet }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);
  const days = daysUntil(exam.date);
  const full = exam.topics.length >= MAX_TOPICS;

  function addTopic(e) {
    e.preventDefault();
    const parts = draft.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    if (!parts.length || full) return;
    const existing = new Set(exam.topics.map(t => t.text.toLowerCase()));
    const fresh = parts.filter(p => !existing.has(p.toLowerCase())).slice(0, MAX_TOPICS - exam.topics.length).map(p => makeTopic(p));
    setExam({ ...exam, topics: [...exam.topics, ...fresh] });
    setDraft('');
    inputRef.current?.focus();
  }
  const update = (id, patch) => setExam({ ...exam, topics: exam.topics.map(t => (t.id === id ? { ...t, ...patch } : t)) });
  const remove = id => setExam({ ...exam, topics: exam.topics.filter(t => t.id !== id) });

  return (
    <section className="workspace-panel plan">
      <header className="plan-heading">
        <h1>Meine Prüfung</h1>
        <p>Trag ein, was drankommt, und schätz dich bei jedem Thema selbst ein. Lumi übt dann mit dir dort, wo du dich noch unsicher fühlst.</p>
      </header>

      <div className="sheet">
        <div className="sheet-section exam-basics">
          <label className="field">
            <span className="field-label">Stufe</span>
            <select value={stage} onChange={e => setStage(e.target.value)}>{STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
          </label>
          <label className="field">
            <span className="field-label">Fach</span>
            <select value={exam.subject} onChange={e => setExam({ ...exam, subject: e.target.value })}>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select>
          </label>
          <label className="field">
            <span className="field-label">Prüfungsdatum <span className="optional">optional</span></span>
            <input type="date" value={exam.date} onChange={e => setExam({ ...exam, date: e.target.value })} />
          </label>
          {days !== null && (
            <p className={`countdown ${days < 0 ? 'past' : days <= 3 ? 'soon' : ''}`} aria-live="polite">
              <Icon name="calendar" size={18} />
              <span><strong>{countdownText(exam.date)}</strong> · {formatDate(exam.date)}</span>
            </p>
          )}
        </div>

        <div className="sheet-section">
          <div className="section-title">
            <h2>Themen</h2>
            <span className="count">{exam.topics.length} / {MAX_TOPICS}</span>
          </div>

          <form className="topic-add" onSubmit={addTopic}>
            <label className="sr-only" htmlFor="new-topic">Neues Thema</label>
            <input id="new-topic" ref={inputRef} value={draft} maxLength={MAX_TOPIC_LENGTH * 3} disabled={full}
              onChange={e => setDraft(e.target.value)}
              placeholder={full ? 'Mehr Themen passen nicht auf einen Plan.' : 'Zum Beispiel: Brüche kürzen'} />
            <button className="button secondary" type="submit" disabled={!draft.trim() || full}><Icon name="plus" size={18} /> Hinzufügen</button>
          </form>
          <p className="field-help">Mehrere Themen auf einmal? Trenn sie mit Komma.</p>

          {exam.topics.length === 0 ? (
            <div className="empty-topics">
              <p><strong>Noch keine Themen.</strong> Schau auf dem Prüfungsblatt oder im Heft nach, was drankommt, und schreib jedes Thema einzeln auf.</p>
            </div>
          ) : (
            <ul className="topic-list">
              {exam.topics.map(t => (
                <li key={t.id} className={`topic-row level-${t.level || 'none'}`}>
                  <span className={`topic-dot light-${t.level || 'none'}`} aria-hidden="true" />
                  <span className="topic-text">{t.text}</span>
                  <fieldset className="level-picker">
                    <legend className="sr-only">Wie sicher fühlst du dich bei {t.text}?</legend>
                    {LEVELS.map(l => (
                      <label key={l.id} className={`level-option level-${l.id}`}>
                        <input type="radio" name={`level-${t.id}`} value={l.id} checked={t.level === l.id} onChange={() => update(t.id, { level: l.id })} />
                        <span>{l.short}</span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="topic-actions">
                    <button className="button practice" onClick={() => onPracticeTopic(t)}>Üben</button>
                    <button className="icon-only" onClick={() => remove(t.id)} aria-label={`${t.text} entfernen`}><Icon name="trash" size={18} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {exam.topics.length > 0 && (
          <div className="sheet-section plan-footer">
            <Lights topics={exam.topics} />
            <div className="plan-actions">
              <button className="button secondary" onClick={onOpenSheet}><Icon name="note" size={18} /> Zum Lernzettel</button>
              <button className="button primary" onClick={onStartAll}>Mit Lumi üben</button>
            </div>
          </div>
        )}
      </div>
      <p className="small-text plan-note">Deine Einschätzung ist nur für dich. Lumi vergibt keine Noten. Alles bleibt in dieser Sitzung, bis du den Lernzettel herunterlädst.</p>
    </section>
  );
}
