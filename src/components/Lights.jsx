import React from 'react';
import { LEVELS } from '../learning';

/**
 * Lichterkette: one light per topic. The more sure the learner feels, the brighter it glows.
 * Purely a picture of the learner's own self-assessment, never a score.
 */
export default function Lights({ topics, size = 'large' }) {
  if (!topics.length) return null;
  const solid = topics.filter(t => t.level === 'solid').length;
  const okay = topics.filter(t => t.level === 'okay').length;
  const summary = solid === topics.length
    ? `Alle ${topics.length} Themen sitzen.`
    : `${solid} von ${topics.length} ${topics.length === 1 ? 'Thema sitzt' : 'Themen sitzen'}${okay ? `, ${okay} ${okay === 1 ? 'geht' : 'gehen'} so` : ''}.`;
  return (
    <div className={`lights lights-${size}`}>
      <ol className="lights-row" aria-label="Deine Einschätzung pro Thema">
        {[...topics].sort((a, b) => order(b) - order(a)).map(t => (
          <li key={t.id} className={`light light-${t.level || 'none'}`} title={`${t.text}: ${LEVELS.find(l => l.id === t.level)?.label || 'noch nicht eingeschätzt'}`}>
            <span className="sr-only">{t.text}: {LEVELS.find(l => l.id === t.level)?.label || 'noch nicht eingeschätzt'}</span>
          </li>
        ))}
      </ol>
      <p className="lights-summary">{summary}</p>
    </div>
  );
}

const order = t => ({ solid: 3, okay: 2, unsure: 1, '': 0 }[t.level]);
