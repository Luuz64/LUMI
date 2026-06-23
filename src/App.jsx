import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const STAGE_GROUPS = [
  {
    id: "primar",
    label: "Primarstufe",
    desc: "1.–6. Schuljahr",
    options: [
      { id: "1", label: "1. Schuljahr" },
      { id: "2", label: "2. Schuljahr" },
      { id: "3", label: "3. Schuljahr" },
      { id: "4", label: "4. Schuljahr" },
      { id: "5", label: "5. Schuljahr" },
      { id: "6", label: "6. Schuljahr" },
    ],
  },
  {
    id: "ober",
    label: "Oberstufe / Sek I",
    desc: "7.–9. Schuljahr",
    options: [
      { id: "7", label: "7. Schuljahr" },
      { id: "8", label: "8. Schuljahr" },
      { id: "9", label: "9. Schuljahr" },
    ],
  },
  {
    id: "sek2group",
    label: "Sek II / Lehre",
    desc: "Gymi, Berufslehre, FMS, ...",
    options: [{ id: "sek2", label: "Sek II / Lehre" }],
  },
];

// Flache Liste aller Endauswahl-Optionen, damit Lookup per id weiterhin einfach bleibt
const STAGES = STAGE_GROUPS.flatMap((g) => g.options);

const STARTERS = [
  "Ich verstehe diese Matheaufgabe nicht",
  "Wie schreibe ich einen guten Aufsatz?",
  "Was bedeutet eigentlich Photosynthese?",
  "Ich habe Stress mit einer Freundschaft",
];

// Anzahl Glühwürmchen im Hintergrund. Bewusst klein gehalten (siehe Design-
// Feedback "zu überfüllt") und nur als ruhiges Ambiente, nie als Hauptfokus.
const FIREFLY_COUNT = 9;

// Schlanke Komponenten-Zuordnung, damit Markdown-Elemente (fett, Listen, Absätze)
// ohne unschöne Extra-Abstände in die Chat-Bubble passen.
const markdownComponents = {
  p: ({ children }) => <p style={{ margin: "0 0 6px" }}>{children}</p>,
  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  ul: ({ children }) => <ul style={{ margin: "4px 0 6px", paddingLeft: 20 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: "4px 0 6px", paddingLeft: 20 }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
};

// Feste, einmalig berechnete Zufallspositionen für die Glühwürmchen, damit sie
// nicht bei jedem Re-Render (z.B. während des Tippens) neu gewürfelt werden
// und dadurch sichtbar "springen".
const FIREFLIES = Array.from({ length: FIREFLY_COUNT }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 2 + Math.random() * 2,
  green: Math.random() > 0.6,
  duration: 5 + Math.random() * 6,
  delay: Math.random() * 5,
}));

function FireflyField() {
  return (
    <div className="lumi-fireflies" aria-hidden="true">
      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          className="lumi-firefly"
          style={{
            left: f.left + "%",
            top: f.top + "%",
            width: f.size,
            height: f.size,
            background: f.green ? "var(--lumi-green)" : "var(--lumi-gold)",
            animationDuration: f.duration + "s",
            animationDelay: f.delay + "s",
          }}
        />
      ))}
    </div>
  );
}

// Feste Mini-Positionen für Lumis Schwarm-Charakter im Header. Anders als das
// grossflächige Hintergrund-Ambiente (FireflyField) ist dies ein kompaktes,
// wiedererkennbares "Wesen" — Lumi besteht selbst aus mehreren Lichtpunkten,
// die sich locker zu einer Form halten statt einzeln zu verstreuen.
const SWARM_DOTS = Array.from({ length: 7 }, (_, i) => {
  const angle = (i / 7) * Math.PI * 2;
  return {
    baseX: Math.cos(angle) * 6,
    baseY: Math.sin(angle) * 6,
    size: 2.5 + Math.random() * 1.5,
    green: i % 3 === 0,
    delay: Math.random() * 2,
  };
});

// Lumi als eigener Charakter: ein kleiner, in sich gehaltener Schwarm aus
// Lichtpunkten. Reagiert auf "thinking" (= Antwort wird gerade verarbeitet),
// indem sich die Punkte enger zusammenziehen und heller werden — als würde
// sich das Licht für einen Moment konzentrieren.
function LumiSwarm({ thinking }) {
  return (
    <div className={"lumi-swarm" + (thinking ? " lumi-swarm-thinking" : "")} aria-hidden="true">
      {SWARM_DOTS.map((d, i) => {
        const dotColor = d.green ? "var(--lumi-green)" : "var(--lumi-gold)";
        return (
          <span
            key={i}
            className="lumi-swarm-dot"
            style={{
              "--base-x": d.baseX + "px",
              "--base-y": d.baseY + "px",
              width: d.size,
              height: d.size,
              background: dotColor,
              color: dotColor,
              animationDelay: d.delay + "s",
            }}
          />
        );
      })}
    </div>
  );
}

export default function App() {
  const [group, setGroup] = useState(null);
  const [stage, setStage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text) {
    const content = text !== undefined ? text : input;
    if (!content.trim() || loading) return;

    const userMsg = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const stageLabel = STAGES.find((s) => s.id === stage)?.label;
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, stageLabel }),
      });
      const data = await response.json();
      const reply = data.reply || "Entschuldige, ich konnte gerade nicht antworten.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Es gab ein Verbindungsproblem. Magst du es nochmal versuchen?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function selectGroup(g) {
    // Gruppen mit nur einer Option (Sek II / Lehre) direkt übernehmen,
    // statt eine Zwischenseite mit nur einem Button zu zeigen.
    if (g.options.length === 1) {
      setStage(g.options[0].id);
    } else {
      setGroup(g.id);
    }
  }

  if (!stage) {
    const activeGroup = STAGE_GROUPS.find((g) => g.id === group);

    if (!activeGroup) {
      return (
        <div className="lumi-root">
          <LumiStyles />
          <div className="lumi-onboarding">
            <FireflyField />
            <div className="lumi-onboarding-inner">
              <h1 className="lumi-hero">
                Dein Licht
                <br />
                zum Denken.
              </h1>
              <p className="lumi-subtitle">
                Nicht die Antwort geben, sondern beim Denken begleiten.
              </p>

              <p className="lumi-label">In welcher Schulstufe bist du?</p>

              <div className="lumi-stage-list">
                {STAGE_GROUPS.map((g) => (
                  <button key={g.id} onClick={() => selectGroup(g)} className="lumi-stage-btn">
                    <span className="lumi-stage-btn-title">{g.label}</span>
                    <span className="lumi-stage-btn-desc">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="lumi-root">
        <LumiStyles />
        <div className="lumi-onboarding">
          <FireflyField />
          <div className="lumi-onboarding-inner">
            <h1 className="lumi-hero lumi-hero-small">
              Dein Licht
              <br />
              zum Denken.
            </h1>

            <button onClick={() => setGroup(null)} className="lumi-back-btn">
              ← Zurück
            </button>

            <p className="lumi-label">In welchem Schuljahr genau?</p>

            <div className="lumi-stage-list">
              {activeGroup.options.map((s) => (
                <button key={s.id} onClick={() => setStage(s.id)} className="lumi-stage-btn">
                  <span className="lumi-stage-btn-title">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lumi-root">
      <LumiStyles />
      <div className="lumi-chat">
        <FireflyField />
        <div className="lumi-chat-inner">
          <div className="lumi-header">
            <div className="lumi-header-left">
              <LumiSwarm thinking={loading} />
              <div>
                <p className="lumi-header-title">LUMI</p>
                <p className="lumi-header-subtitle">{STAGES.find((s) => s.id === stage)?.label}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setStage(null);
                setGroup(null);
                setMessages([]);
              }}
              className="lumi-back-btn"
            >
              Stufe ändern
            </button>
          </div>

          <div ref={scrollRef} className="lumi-message-area">
            {messages.length === 0 && (
              <div className="lumi-starters">
                <p className="lumi-label">Worüber möchtest du nachdenken?</p>
                <div className="lumi-starters-list">
                  {STARTERS.map((s) => (
                    <button key={s} onClick={() => sendMessage(s)} className="lumi-starter-btn">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={"lumi-bubble " + (m.role === "user" ? "lumi-bubble-user" : "lumi-bubble-assistant")}>
                {m.role === "assistant" ? (
                  <ReactMarkdown components={markdownComponents}>{m.content}</ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            ))}

            {loading && (
              <div className="lumi-bubble lumi-bubble-assistant lumi-bubble-loading">Lumi denkt nach …</div>
            )}
          </div>

          <div className="lumi-input-row">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Schreib Lumi etwas …"
              rows={1}
              className="lumi-textarea"
            />
            <button onClick={() => sendMessage()} disabled={loading} className="lumi-send-btn" aria-label="Senden">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Globale Styles (CSS-Variablen, Schriftimport, Keyframes, responsive Regeln).
// Inline-Styles in React können weder @keyframes noch @media-Queries abbilden,
// deshalb läuft das gesamte Lumi-Design über dieses eingebettete Stylesheet.
function LumiStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

      :root {
        --lumi-bg: #0b1320;
        --lumi-surface: #16243a;
        --lumi-gold: #ffb84d;
        --lumi-green: #7fd9a8;
        --lumi-text: #f4f1e8;
        --lumi-muted: #5a6b7a;
      }

      .lumi-root {
        font-family: 'Inter', system-ui, sans-serif;
        background: var(--lumi-bg);
        color: var(--lumi-text);
        min-height: 100vh;
      }

      /* ---------- Glühwürmchen-Hintergrund ---------- */
      .lumi-fireflies {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }
      .lumi-firefly {
        position: absolute;
        border-radius: 50%;
        opacity: 0.3;
        animation-name: lumi-firefly-float;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }
      @keyframes lumi-firefly-float {
        0%, 100% { transform: translate(0, 0); opacity: 0.25; }
        25% { transform: translate(8px, -12px); opacity: 0.55; }
        50% { transform: translate(-6px, -6px); opacity: 0.3; }
        75% { transform: translate(10px, 8px); opacity: 0.5; }
      }
      @media (prefers-reduced-motion: reduce) {
        .lumi-firefly { animation: none !important; }
      }

      /* ---------- Onboarding ---------- */
      .lumi-onboarding {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 1.5rem;
        box-sizing: border-box;
      }
      .lumi-onboarding-inner {
        position: relative;
        z-index: 2;
        width: 100%;
        max-width: 400px;
        text-align: center;
      }
      .lumi-hero {
        font-family: 'Fraunces', serif;
        font-weight: 600;
        font-size: clamp(26px, 6vw, 34px);
        line-height: 1.3;
        letter-spacing: -0.3px;
        margin: 0 0 14px;
        color: var(--lumi-text);
      }
      .lumi-hero-small {
        font-size: clamp(20px, 4vw, 24px);
        margin-bottom: 20px;
      }
      .lumi-subtitle {
        font-size: 13px;
        line-height: 1.5;
        color: var(--lumi-muted);
        margin: 0 0 clamp(28px, 6vh, 44px);
      }
      .lumi-label {
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.4px;
        color: var(--lumi-green);
        margin: 0 0 14px;
      }
      .lumi-stage-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .lumi-stage-btn {
        text-align: left;
        padding: 14px 16px;
        border-radius: 12px;
        border: 1px solid rgba(127, 217, 168, 0.2);
        background: rgba(22, 36, 58, 0.5);
        color: var(--lumi-text);
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        transition: border-color 0.15s, background 0.15s;
      }
      .lumi-stage-btn:hover {
        border-color: rgba(255, 184, 77, 0.4);
        background: rgba(255, 184, 77, 0.08);
      }
      .lumi-stage-btn:focus-visible {
        outline: 2px solid var(--lumi-gold);
        outline-offset: 2px;
      }
      .lumi-stage-btn-title {
        display: block;
      }
      .lumi-stage-btn-desc {
        display: block;
        font-size: 11px;
        font-weight: 400;
        color: var(--lumi-muted);
        margin-top: 2px;
      }
      .lumi-back-btn {
        font-family: inherit;
        font-size: 12px;
        padding: 6px 12px;
        border-radius: 8px;
        border: 1px solid rgba(127, 217, 168, 0.2);
        background: transparent;
        color: var(--lumi-muted);
        cursor: pointer;
        margin-bottom: 18px;
      }
      .lumi-back-btn:hover {
        color: var(--lumi-text);
        border-color: rgba(127, 217, 168, 0.4);
      }

      /* ---------- Chat ---------- */
      .lumi-chat {
        position: relative;
        min-height: 100vh;
      }
      .lumi-chat-inner {
        position: relative;
        z-index: 2;
        max-width: 640px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        height: 100vh;
        padding: 1rem 1.25rem;
        box-sizing: border-box;
      }
      .lumi-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(127, 217, 168, 0.15);
        margin-bottom: 12px;
      }
      .lumi-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .lumi-swarm {
        position: relative;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }
      .lumi-swarm-dot {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        opacity: 0.85;
        box-shadow: 0 0 4px currentColor;
        transform: translate(calc(-50% + var(--base-x)), calc(-50% + var(--base-y)));
        animation: lumi-swarm-breathe 3.2s ease-in-out infinite;
        transition: transform 0.7s ease-in-out, opacity 0.4s, box-shadow 0.4s;
      }
      @keyframes lumi-swarm-breathe {
        0%, 100% { transform: translate(calc(-50% + var(--base-x)), calc(-50% + var(--base-y))) scale(1); }
        50% { transform: translate(calc(-50% + var(--base-x) * 1.15), calc(-50% + var(--base-y) * 1.15)) scale(1.1); }
      }
      .lumi-swarm-thinking .lumi-swarm-dot {
        transform: translate(calc(-50% + var(--base-x) * 0.35), calc(-50% + var(--base-y) * 0.35)) scale(1.3);
        opacity: 1;
        box-shadow: 0 0 7px currentColor;
        animation: lumi-swarm-pulse 0.9s ease-in-out infinite;
      }
      @keyframes lumi-swarm-pulse {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        .lumi-swarm-dot { animation: none !important; transition: none !important; }
      }
      .lumi-header-title {
        margin: 0;
        font-family: 'Fraunces', serif;
        font-weight: 600;
        font-size: 14px;
        letter-spacing: 1px;
      }
      .lumi-header-subtitle {
        margin: 0;
        font-size: 12px;
        color: var(--lumi-muted);
      }
      .lumi-message-area {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-right: 4px;
      }
      .lumi-starters {
        margin-top: 8px;
      }
      .lumi-starters-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .lumi-starter-btn {
        text-align: left;
        padding: 10px 12px;
        font-size: 13px;
        font-family: inherit;
        border-radius: 8px;
        border: 1px solid rgba(127, 217, 168, 0.2);
        background: rgba(22, 36, 58, 0.4);
        color: var(--lumi-text);
        cursor: pointer;
      }
      .lumi-starter-btn:hover {
        border-color: rgba(255, 184, 77, 0.4);
      }
      .lumi-bubble {
        max-width: 82%;
        border-radius: 14px;
        padding: 10px 14px;
        font-size: 14px;
        line-height: 1.6;
        white-space: pre-wrap;
      }
      .lumi-bubble-user {
        align-self: flex-end;
        background: var(--lumi-gold);
        color: #2c1b04;
        white-space: pre-wrap;
      }
      .lumi-bubble-assistant {
        align-self: flex-start;
        background: var(--lumi-surface);
        color: var(--lumi-text);
      }
      .lumi-bubble-loading {
        color: var(--lumi-muted);
      }
      .lumi-input-row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        align-items: flex-end;
      }
      .lumi-textarea {
        flex: 1;
        resize: none;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid rgba(127, 217, 168, 0.2);
        background: rgba(22, 36, 58, 0.5);
        color: var(--lumi-text);
        font-size: 14px;
        font-family: inherit;
        min-height: 40px;
      }
      .lumi-textarea::placeholder {
        color: var(--lumi-muted);
      }
      .lumi-textarea:focus-visible {
        outline: 2px solid var(--lumi-gold);
        outline-offset: 1px;
      }
      .lumi-send-btn {
        padding: 10px 16px;
        border-radius: 10px;
        border: 1px solid var(--lumi-gold);
        background: var(--lumi-gold);
        color: #2c1b04;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
      }
      .lumi-send-btn:disabled {
        opacity: 0.5;
        cursor: default;
      }

      /* ---------- Grössere Bildschirme: etwas mehr Luft, nicht mehr Inhalt ---------- */
      @media (min-width: 768px) {
        .lumi-onboarding-inner {
          max-width: 440px;
        }
        .lumi-chat-inner {
          padding: 1.5rem 2rem;
        }
      }
    `}</style>
  );
}
