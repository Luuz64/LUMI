import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import LumiCharacter from './components/LumiCharacter';
import Icon from './components/Icon';
import ExamPlan from './components/ExamPlan';
import LearningSheet from './components/LearningSheet';
import { STAGES, EMPTY_EXAM, EMPTY_NOTES, MAX_IMPORT_BYTES, makeLearningSheet, readLearningSheet, sheetAsText, buildContinuation, buildTopicStart, buildExamStart, topicsAsContext, hasContent } from './learning';
import './styles.css';
import './mascot.css';
import './plan.css';


const LOCAL_PREVIEW = import.meta.env.VITE_LOCAL_PREVIEW === 'true';

const STARTERS = [
  { subject: 'Mathematik', title: 'Brüche endlich verstehen', text: 'Ich möchte Brüche besser verstehen. Finde bitte zuerst heraus, was ich schon kann.', symbol: '½', color: 'blue' },
  { subject: 'Deutsch', title: 'Ideen in Worte verwandeln', text: 'Ich möchte selbst einen guten Text schreiben. Hilf mir, meine Ideen zu ordnen.', symbol: 'Aa', color: 'pink' },
  { subject: 'Natur, Mensch, Gesellschaft', title: 'Der Natur auf der Spur', text: 'Ich möchte verstehen, wie Pflanzen wachsen. Beginne mit einer Frage zu meinem Vorwissen.', symbol: 'N', color: 'green' },
];
const HELP = [
  { mode: 'hint', label: 'Ein kleiner Hinweis', text: 'Gib mir bitte einen kleinen Hinweis zum aktuellen Schritt, ohne ihn für mich zu lösen.' },
  { mode: 'example', label: 'Ein ähnliches Beispiel', text: 'Zeige mir bitte den Denkweg an einem anderen Beispiel. Danach versuche ich meine Aufgabe selbst.' },
  { mode: 'check', label: 'Teste mein Verständnis', text: 'Gib mir bitte eine neue kurze Aufgabe zum Thema, damit ich selbst prüfen kann, ob ich es verstanden habe. Warte auf meinen Versuch.' },
];

export default function App() {
  const [pilotCode, setPilotCode] = useState('');
  const [view, setView] = useState('learn');
  const [stage, setStage] = useState('5');
  const [exam, setExam] = useState({ ...EMPTY_EXAM });
  const [notes, setNotes] = useState({ ...EMPTY_NOTES });
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failed, setFailed] = useState(null);
  const [notice, setNotice] = useState('');
  const [motion, setMotion] = useState(true);
  const requestRef = useRef(null);
  const generation = useRef(0);
  const bottomRef = useRef(null);
  const privacyRef = useRef(null);
  const importRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  }, [messages, loading, error]);
  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    const warn = e => { if (messages.length || hasContent(exam, notes) || input) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [messages.length, notes, exam, input]);
  useEffect(() => { if (notice) { const t = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(t); } }, [notice]);

  function stopRequest() {
    generation.current += 1;
    requestRef.current?.abort(); requestRef.current = null;
    setLoading(false);
  }
  function clearChat() { stopRequest(); setMessages([]); setError(''); setFailed(null); setInput(''); }
  function resetAll() {
    if (!window.confirm('Diese Sitzung beenden? Chat, Prüfung und Notizen werden aus dieser Seite entfernt. Lade deinen Lernzettel vorher herunter. Bereits übermittelte Daten beim KI-Anbieter werden dadurch nicht gelöscht.')) return;
    setPilotCode('');
    clearChat(); setSession(null); setExam({ ...EMPTY_EXAM }); setNotes({ ...EMPTY_NOTES }); setStage('5'); setView('learn');
    setNotice('Die Sitzung auf dieser Seite ist beendet.');
  }
  function newTopic() {
    if (messages.length && !window.confirm('Ein neues Thema beginnen? Der bisherige Chat wird aus dieser Seite entfernt. Dein Lernzettel bleibt.')) return;
    clearChat(); setSession(null); setView('learn');
  }

  async function send(text, mode = 'coach', retry = false, overrideSession = null) {
    const content = (text ?? input).trim();
    if (!content || requestRef.current) return;
    if (!LOCAL_PREVIEW && !pilotCode.trim()) { setError('Trage bitte zuerst deinen Testcode ein. Deine Nachricht wurde noch nicht gesendet.'); return; }
    if (content.length > 4000) { setError('Teile deine Aufgabe bitte in kleinere Abschnitte (höchstens 4000 Zeichen).'); return; }
    const current = overrideSession || session || { stage, subject: exam.subject, topic: '', date: '' };
    const nextMessages = retry ? messages : [...messages, { role: 'user', content }];
    if (nextMessages.length > 25 || nextMessages.reduce((n, m) => n + m.content.length, 0) > 26000) {
      setError('Diese Lernrunde ist voll. Nimm das Wichtigste in deinen Lernzettel auf und beginne ein neues Thema.'); return;
    }
    setSession(current); setMessages(nextMessages); setInput(''); setError(''); setFailed(null); setLoading(true); setView('learn');
    const controller = new AbortController(); requestRef.current = controller;
    const requestId = ++generation.current;
    const timer = setTimeout(() => controller.abort(), 35000);
    try {
      if (LOCAL_PREVIEW) throw new Error('Diese Designvorschau hat keine KI-Verbindung. Prüfung und Lernzettel kannst du bereits ausprobieren.');
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Lumi-Pilot-Code': pilotCode.trim() }, signal: controller.signal,
        body: JSON.stringify({ messages: nextMessages, stage: current.stage, mode, context: { subject: current.subject, topic: current.topic, date: current.date } }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Lumi ist gerade nicht erreichbar. Bitte versuche es später noch einmal.');
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Es kam keine Antwort an. Bitte versuche es noch einmal.');
      if (requestId === generation.current) setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      if (requestId === generation.current) {
        setError(err.name === 'AbortError' ? 'Die Antwort dauert gerade zu lange. Du kannst es nochmals versuchen.' : err.message);
        setFailed({ text: content, mode });
      }
    } finally {
      clearTimeout(timer);
      if (requestId === generation.current) { requestRef.current = null; setLoading(false); }
    }
  }
  function startPractice(topicLabel, text) {
    if (messages.length && !window.confirm('Eine neue Lernrunde starten? Dein bisheriger Chat wird aus dieser Seite entfernt. Lernzettel und Themen bleiben.')) return;
    clearChat();
    setSession({ stage, subject: exam.subject, topic: topicLabel, date: exam.date });
    setView('learn');
    setInput(text);
    setNotice('Deine Lernrunde ist bereit. Prüfe die Nachricht und sende sie an Lumi.');
    setTimeout(() => inputRef.current?.focus(), 0);
  }
  const practiceTopic = topic => startPractice(topic.text, buildTopicStart(topic));
  const practiceExam = () => exam.topics.length && startPractice(topicsAsContext(exam.topics), buildExamStart(exam));
  async function loadSheet(e) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('Dieser Lernzettel ist zu gross.');
      const sheet = readLearningSheet(await file.text());
      if ((messages.length || hasContent(exam, notes)) && !window.confirm('Lernzettel laden? Die aktuelle Sitzung und deine bisherigen Notizen werden ersetzt.')) return;
      clearChat(); setStage(sheet.stage); setExam(sheet.exam); setNotes(sheet.notes); setSession(null); setView('notes');
      setNotice('Lernzettel geladen. Er wurde nicht an die KI gesendet.');
    } catch (err) { setNotice(err.message); }
  }
  function download() {
    const blob = new Blob([JSON.stringify(makeLearningSheet(stage, exam, notes), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'mein-lumi-lernzettel.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Lernzettel heruntergeladen. Bewahre ihn an deinem eigenen Speicherort auf.');
  }
  async function copyNotes() {
    try { await navigator.clipboard.writeText(sheetAsText(stage, exam, notes)); setNotice('Lernzettel kopiert.'); }
    catch { setNotice('Kopieren ist hier nicht möglich. Du kannst den Lernzettel herunterladen.'); }
  }
  function continueLearning() {
    if (messages.length && !window.confirm('Mit dem Lernzettel eine neue Runde beginnen? Der bisherige Chat wird aus dieser Seite entfernt.')) return;
    clearChat(); setSession({ stage, subject: exam.subject, topic: topicsAsContext(exam.topics), date: exam.date }); setInput(buildContinuation(exam, notes)); setView('learn');
    setNotice('Prüfe den Text vor dem Senden. Erst dann gehen diese Notizen an die KI.');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const currentStage = STAGES.find(s => s.id === (session?.stage || stage))?.label;
  return <div className={`app ${motion ? '' : 'motion-off'}`}>
    <a className="skip-link" href="#main">Zum Lernbereich</a>
    <aside className="sidebar">
      <button className="brand" onClick={() => setView('learn')} aria-label="Lumi Lernbereich"><span className="brand-light">✦</span><span>LUMI<span className="brand-dot">.</span></span></button>
      <div className="sidebar-intro">Dein Licht zum Denken.</div>
      <nav aria-label="Hauptnavigation">
        {[['learn', 'book', 'Mit Lumi lernen'], ['exam', 'calendar', 'Meine Prüfung'], ['notes', 'note', 'Mein Lernzettel']].map(([id, icon, label]) =>
          <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} aria-current={view === id ? 'page' : undefined} onClick={() => setView(id)}><Icon name={icon} /><span>{label}</span>{view === id && <span className="nav-mark" />}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="session-card"><Icon name="shield" /><strong>Nur diese Sitzung</strong><p>Dein Lernverlauf bleibt nicht dauerhaft in dieser App.</p><button onClick={() => privacyRef.current.showModal()}>Was passiert mit meinen Daten?</button></div>
        <button className="sidebar-action" onClick={resetAll}><Icon name="reset" size={18} /> Sitzung beenden</button>
        <span className="pilot-label">LUMI · Entwicklungsversion</span>
      </div>
    </aside>
    <main id="main" className="main">
      <header className="topbar"><span className="eyebrow">DEIN LERNRAUM</span><div className="topbar-actions"><label className="motion-toggle"><input type="checkbox" checked={motion} onChange={e => setMotion(e.target.checked)} /><span>Animation</span></label><button className="icon-button" onClick={() => privacyRef.current.showModal()} aria-label="Datenschutz öffnen"><Icon name="shield" /></button></div></header>
      {LOCAL_PREVIEW && <div className="preview-banner">Vorschau ohne KI-Verbindung. Prüfung und Lernzettel kannst du ausprobieren.</div>}
      {view === 'learn' && <>
        {!messages.length && !session ? <>
          <section className="welcome">
            <div className="welcome-copy"><div className="welcome-kicker"><span /> KLEINE SCHRITTE. GROSSE AHA-MOMENTE.</div><h1>In dir steckt<br />ein <span>heller Kopf.</span></h1><p>Bring deine Frage mit.<br />Wir finden deinen nächsten Schritt.</p><div className="lumi-caption"><span className="caption-line" /> Zusammen mit Lumi</div></div>
            <div className="mascot-stage"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><span className="star star-one">✦</span><span className="star star-two">✧</span><LumiCharacter thinking={false} size="100%" /><div className="mascot-speech">Was möchtest du verstehen?</div></div>
          </section>
          <section className="learn-start"><div className="section-heading"><h2>Wo starten wir?</h2><label className="stage-picker"><span>Meine Stufe</span><select value={stage} onChange={e => setStage(e.target.value)}>{STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label></div>
            <div className="topic-grid">{STARTERS.map(s => <button className={`topic-card ${s.color}`} key={s.subject} disabled={loading} onClick={() => send(s.text, 'coach', false, { stage, subject: s.subject, topic: '', date: '' })}><span className="subject-symbol">{s.symbol}</span><span className="topic-subject">{s.subject}</span><strong>{s.title}</strong><Icon name="arrow" /></button>)}</div>
            <button className="exam-shortcut" onClick={() => setView('exam')}><span className="shortcut-icon"><Icon name="calendar" /></span><span><strong>Eine Prüfung steht an?</strong><span>Wir üben Schritt für Schritt für deinen Termin.</span></span><Icon name="arrow" /></button>
          </section>
        </> : <section className="conversation" aria-label="Lerngespräch">
          <div className="conversation-header"><div className="chat-mascot"><LumiCharacter thinking={loading} size={84} /></div><div><div className="eyebrow">DEINE LERNRUNDE</div><h1>{session?.topic || 'Ein Schritt weiter.'}</h1><p>{currentStage}{session?.topic ? ` · ${session.subject}` : ''}</p></div><button className="button secondary compact" onClick={newTopic}>Neues Thema</button></div>
          <div className="chat-log" role="log" aria-label="Nachrichten" aria-live="polite" aria-relevant="additions"><div className="chat-welcome"><Icon name="spark" size={18} /><span>Du denkst mit. Lumi hilft dir weiter.</span></div>{messages.map((m, i) => <article className={`message ${m.role}`} key={i}><span className="message-author">{m.role === 'user' ? 'Du' : 'Lumi'}</span><div className="message-content"><ReactMarkdown skipHtml components={{ img: () => null, a: ({ children }) => <span>{children}</span> }}>{m.content}</ReactMarkdown></div></article>)}{loading && <div className="thinking" role="status"><span /><span /><span /><span className="thinking-label">Lumi denkt nach …</span></div>}<div ref={bottomRef} /></div>
        </section>}
        <section className="composer-section" aria-label="Nachricht schreiben">
          {!LOCAL_PREVIEW && <div className="pilot-access"><label htmlFor="pilot-code">Dein Testcode</label><input id="pilot-code" type="password" value={pilotCode} onChange={e => setPilotCode(e.target.value)} maxLength={128} autoComplete="off" spellCheck={false} autoCapitalize="none" aria-describedby="pilot-code-help" /><p id="pilot-code-help">Den Code erhältst du von der Person, die dich zum Test eingeladen hat. Du brauchst kein Konto. Bitte teste vorerst nur als erwachsene Person mit erfundenen Angaben.</p></div>}
          {messages.length > 0 && !loading && !failed && <div className="help-options" aria-label="Weitere Hilfe">{HELP.map(h => <button key={h.mode} onClick={() => send(h.text, h.mode)}>{h.label}</button>)}</div>}
          {error && <div className="error-box" role="alert"><span>{error}</span>{failed && <button onClick={() => send(failed.text, failed.mode, true)} disabled={loading}>Nochmals versuchen</button>}{failed && <button onClick={() => { setInput(failed.text); setMessages(prev => prev.slice(0, -1)); setFailed(null); setError(''); }}>Nachricht bearbeiten</button>}</div>}
          <form className="composer" onSubmit={e => { e.preventDefault(); send(); }}><label className="sr-only" htmlFor="question">Deine Frage an Lumi</label><textarea ref={inputRef} id="question" value={input} onChange={e => setInput(e.target.value)} placeholder="Deine Frage, deine Aufgabe, dein erster Gedanke …" maxLength={4000} rows={2} disabled={!!failed} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} /><button className="send-button" type="submit" disabled={!input.trim() || loading || !!failed} aria-label="Nachricht senden"><Icon name="send" /></button></form>
          <p className="composer-note"><Icon name="shield" size={15} /><span>Keine Namen oder privaten Angaben eingeben. Nachrichten gehen an einen KI-Anbieter. <button onClick={() => privacyRef.current.showModal()}>Mehr dazu</button></span></p><p className="ai-note">Lumi kann sich irren. Prüfe wichtige Schritte mit deinem Lernmaterial.</p>
        </section>
      </>}
      {view === 'exam' && <ExamPlan stage={stage} setStage={setStage} exam={exam} setExam={setExam} onPracticeTopic={practiceTopic} onStartAll={practiceExam} onOpenSheet={() => setView('notes')} />}
      {view === 'notes' && <LearningSheet stage={stage} exam={exam} notes={notes} setNotes={setNotes} onEditPlan={() => setView('exam')} onContinue={continueLearning} onDownload={download} onCopy={copyNotes} onLoad={() => importRef.current.click()} />}
      <footer className="footer"><span>Dein Tempo. Dein Denkweg.</span><span>Brauchst du Hilfe? Ruf <a href="tel:147">147</a> an – rund um die Uhr.</span><button onClick={() => privacyRef.current.showModal()}>Datenschutz & Hinweise zum Testbetrieb</button></footer>
    </main>
    <input ref={importRef} className="sr-only" tabIndex={-1} type="file" accept=".json,application/json" aria-label="Lumi-Lernzettel laden" onChange={loadSheet} />
    {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Hinweis schliessen"><Icon name="close" size={18} /></button></div>}
    <dialog ref={privacyRef} className="privacy-dialog"><div className="dialog-heading"><Icon name="shield" size={26} /><h2>Deine Daten bei Lumi</h2><button className="icon-button" onClick={() => privacyRef.current.close()} aria-label="Datenschutzhinweise schliessen" autoFocus><Icon name="close" /></button></div><div className="dialog-body"><p><strong>Du entscheidest, was du mitnehmen möchtest.</strong> Diese Version legt keine Konten an und speichert Chats oder Lernstände nicht dauerhaft in der App. Beim Neuladen oder Beenden der Sitzung werden sie aus der Seite entfernt.</p><h3>Dein Testzugang</h3><p>Der Testcode wird nur in dieser geöffneten Seite gehalten und zur Prüfung an den Lumi-Server gesendet, nicht an die KI. Beim Beenden der Sitzung wird er aus der Seite entfernt. Er ist kein persönliches Konto.</p><h3>Was geht an die KI?</h3><p>Beim Senden gehen dein bisheriger Chat dieser Lernrunde, die gewählte Stufe und gegebenenfalls Fach, Themen und Prüfungstermin über den Server an Anthropic. Gib keine Namen, Adressen oder anderen privaten Angaben ein. Es gibt keinen Filter, der alle persönlichen Angaben sicher erkennen kann.</p><h3>Was ist mit meinem Lernzettel?</h3><p>Notizen bleiben zunächst in dieser Seite. Herunterladen speichert eine Datei auf deinem Gerät. Laden liest sie in die Seite ein. Erst wenn du sie beim Weiterlernen als Nachricht sendest, gehen sie an die KI. Auf geteilten Geräten: eigene Speicherplätze verwenden und die Sitzung am Ende beenden.</p><h3>Was bedeutet „Sitzung beenden“?</h3><p>Das entfernt die Daten aus dieser Seite. Es löscht keine heruntergeladenen Dateien oder bereits beim Anbieter verarbeiteten Daten. Lumi verwendet keine Analyse- oder Werbedienste und lädt keine externen Schriftarten. Beim Hosting und KI-Anbieter können jedoch technische Protokolle und Aufbewahrungsfristen bestehen.</p><div className="pilot-notice"><strong>Entwicklungsversion – noch keine Freigabe für Schülerdaten.</strong><p>Vor dem Klasseneinsatz müssen die Schule und der Betreiber die Anbietervereinbarungen, Speicherorte und -fristen, Zugriffsregeln, Kostenbegrenzung und Verantwortlichkeiten prüfen. Diese Hinweise ersetzen keine vollständige Datenschutzerklärung des Betreibers.</p></div><p>Lumi ist eine Lernhilfe, kann Fehler machen und ersetzt keine Lehrperson. Bei belastenden oder gefährlichen Situationen wende dich an eine vertraute erwachsene Person.</p><h3>Hilfe, wenn es dir nicht gut geht</h3><p><strong>147</strong> – Pro Juventute, Beratung für Kinder und Jugendliche (rund um die Uhr, auch Chat und SMS)<br /><strong>143</strong> – Die Dargebotene Hand<br /><strong>144</strong> – Notfall Sanität · <strong>117</strong> – Polizei</p></div><button className="button primary" onClick={() => privacyRef.current.close()}>Verstanden</button></dialog>
  </div>;
}
