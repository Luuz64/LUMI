import React from 'react';
import { STAGES, STAGE_GROUPS, TRACKS, needsTrack } from '../../shared/curriculum.js';

/**
 * Stufe nach Aargauer System, bei der Oberstufe zusätzlich der Schultyp.
 * variant "fields": beschriftete Formularfelder (Prüfungsplan).
 * variant "inline": kompakt neben einer Überschrift (Startseite).
 */
export default function StagePicker({ stage, track, onChange, variant = 'fields' }) {
  const showTrack = needsTrack(stage);
  const stageSelect = (
    <select value={stage} onChange={e => onChange({ stage: e.target.value, track: needsTrack(e.target.value) ? track : '' })} aria-label={variant === 'inline' ? 'Meine Stufe' : undefined}>
      {STAGE_GROUPS.map(g => (
        <optgroup key={g.id} label={g.label}>
          {STAGES.filter(s => s.group === g.id).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </optgroup>
      ))}
    </select>
  );
  const trackSelect = showTrack && (
    <select value={track} onChange={e => onChange({ stage, track: e.target.value })} aria-label={variant === 'inline' ? 'Mein Schultyp' : undefined}>
      <option value="">Schultyp wählen</option>
      {TRACKS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
    </select>
  );

  if (variant === 'inline') {
    return (
      <div className="stage-picker">
        <span>Meine Stufe</span>
        {stageSelect}
        {trackSelect}
      </div>
    );
  }
  return <>
    <label className="field">
      <span className="field-label">Stufe</span>
      {stageSelect}
    </label>
    {showTrack && (
      <label className="field">
        <span className="field-label">Schultyp</span>
        {trackSelect}
      </label>
    )}
  </>;
}
