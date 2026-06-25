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

// Lumi als animiertes Inline-SVG (von Luca selbst per ChatGPT generierter Code).
// Inline statt <img src="..."> eingebunden, weil eingebettete SVG-Animationen
// in <img>-Tags je nach Browser unzuverlässig abspielen — als direktes JSX-
// Markup laufen die @keyframes-Animationen garantiert in jedem Browser.
// "thinking" beschleunigt den Flügelschlag/Glow leicht, ohne die Grundanimation
// zu ersetzen, damit Lumi beim Nachdenken sichtbar "aktiver" wirkt.
function LumiCharacter({ thinking, size }) {
  return (
    <div className={"lumi-character" + (thinking ? " lumi-character-thinking" : "")} style={{ width: size, height: size }}>
      <svg viewBox="0 0 720 720" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LUMI, ein freundliches leuchtendes Glühwürmchen">
        <defs>
          <radialGradient id="lumiBodyGrad" cx="36%" cy="22%" r="78%">
            <stop offset="0%" stopColor="#30486e" />
            <stop offset="45%" stopColor="#16243a" />
            <stop offset="100%" stopColor="#07101e" />
          </radialGradient>
          <radialGradient id="lumiFaceGrad" cx="45%" cy="22%" r="70%">
            <stop offset="0%" stopColor="#1c3150" />
            <stop offset="100%" stopColor="#050b15" />
          </radialGradient>
          <radialGradient id="lumiBellyGrad" cx="45%" cy="18%" r="75%">
            <stop offset="0%" stopColor="#fff3a3" />
            <stop offset="42%" stopColor="#ffd15c" />
            <stop offset="100%" stopColor="#ff9f26" />
          </radialGradient>
          <radialGradient id="lumiWingGrad" cx="38%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#f7fff7" stopOpacity=".76" />
            <stop offset="42%" stopColor="#7fd9a8" stopOpacity=".45" />
            <stop offset="100%" stopColor="#ffcf66" stopOpacity=".18" />
          </radialGradient>
          <radialGradient id="lumiTipGrad" cx="42%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff7c6" />
            <stop offset="55%" stopColor="#ffcf66" />
            <stop offset="100%" stopColor="#ffb84d" />
          </radialGradient>
          <filter id="lumiSoftGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 1  0 0.72 0 0 .55  0 0 0.2 0 .12  0 0 0 .75 0" result="gold" />
            <feMerge><feMergeNode in="gold" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="lumiWingGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="lumiShadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="18" stdDeviation="20" floodColor="#000000" floodOpacity=".34" />
          </filter>
        </defs>
        <g id="lumiSparkles" opacity=".9">
          <circle cx="134" cy="186" r="4" fill="#ffcf66" /><circle cx="590" cy="192" r="3" fill="#7fd9a8" />
          <circle cx="615" cy="506" r="5" fill="#ffcf66" /><circle cx="112" cy="504" r="3" fill="#7fd9a8" />
          <circle cx="548" cy="404" r="2.8" fill="#ffcf66" /><circle cx="182" cy="404" r="2.8" fill="#fff3a3" />
          <circle cx="644" cy="318" r="3.2" fill="#fff3a3" /><circle cx="82" cy="320" r="3.2" fill="#7fd9a8" />
          <circle cx="480" cy="139" r="2.5" fill="#ffcf66" /><circle cx="247" cy="143" r="2.5" fill="#7fd9a8" />
        </g>
        <ellipse cx="360" cy="590" rx="110" ry="23" fill="#050b15" opacity=".45" filter="url(#lumiShadow)" />
        <g id="lumiBody" filter="url(#lumiShadow)">
          <g id="lumiWings" filter="url(#lumiWingGlow)">
            <path id="lumiLeftWingUpper" d="M300 365 C206 244 118 227 87 298 C58 364 151 420 301 389 C312 386 310 379 300 365Z" fill="url(#lumiWingGrad)" stroke="#ffcf66" strokeOpacity=".75" strokeWidth="4" />
            <path id="lumiRightWingUpper" d="M420 365 C514 244 602 227 633 298 C662 364 569 420 419 389 C408 386 410 379 420 365Z" fill="url(#lumiWingGrad)" stroke="#ffcf66" strokeOpacity=".75" strokeWidth="4" />
            <path id="lumiLeftWingLower" d="M305 402 C214 395 158 443 182 493 C208 548 289 510 331 423 C335 414 324 405 305 402Z" fill="url(#lumiWingGrad)" stroke="#7fd9a8" strokeOpacity=".45" strokeWidth="3" />
            <path id="lumiRightWingLower" d="M415 402 C506 395 562 443 538 493 C512 548 431 510 389 423 C385 414 396 405 415 402Z" fill="url(#lumiWingGrad)" stroke="#7fd9a8" strokeOpacity=".45" strokeWidth="3" />
            <path d="M155 322 C206 334 250 354 295 379" stroke="#d8ffe5" strokeOpacity=".38" strokeWidth="3" strokeLinecap="round" />
            <path d="M565 322 C514 334 470 354 425 379" stroke="#d8ffe5" strokeOpacity=".38" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g id="lumiAntennae" stroke="#16243a" strokeWidth="12" strokeLinecap="round">
            <path id="lumiAntennaLeft" d="M322 221 C301 174 265 156 224 154" />
            <path id="lumiAntennaRight" d="M398 221 C419 174 455 156 496 154" />
            <circle cx="221" cy="154" r="26" fill="url(#lumiTipGrad)" stroke="#ffcf66" strokeWidth="4" filter="url(#lumiSoftGlow)" />
            <circle cx="499" cy="154" r="26" fill="url(#lumiTipGrad)" stroke="#ffcf66" strokeWidth="4" filter="url(#lumiSoftGlow)" />
          </g>
          <ellipse cx="360" cy="326" rx="150" ry="135" fill="url(#lumiBodyGrad)" />
          <ellipse cx="360" cy="342" rx="118" ry="82" fill="url(#lumiFaceGrad)" stroke="#253c60" strokeWidth="3" opacity=".98" />
          <ellipse id="lumiEyes" cx="320" cy="333" rx="11" ry="31" fill="#fffdf4" />
          <ellipse cx="400" cy="333" rx="11" ry="31" fill="#fffdf4" />
          <path d="M241 287 C280 207 385 177 464 236" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" opacity=".09" />
          <ellipse cx="360" cy="446" rx="86" ry="86" fill="url(#lumiBodyGrad)" />
          <g id="lumiBellyGlow" filter="url(#lumiSoftGlow)">
            <path d="M271 458 C285 551 435 551 449 458 C422 502 298 502 271 458Z" fill="url(#lumiBellyGrad)" />
            <path d="M286 492 C320 512 398 512 434 492" stroke="#fff3a3" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
          </g>
          <ellipse cx="283" cy="433" rx="24" ry="31" fill="url(#lumiBodyGrad)" transform="rotate(-22 283 433)" />
          <ellipse cx="437" cy="433" rx="24" ry="31" fill="url(#lumiBodyGrad)" transform="rotate(22 437 433)" />
        </g>
      </svg>
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
              <div className="lumi-onboarding-character">
                <LumiCharacter thinking={false} size={150} />
              </div>
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
            <div className="lumi-header-character">
              <LumiCharacter thinking={loading} size={140} />
            </div>
            <div className="lumi-header-text">
              <p className="lumi-header-title">LUMI</p>
              <p className="lumi-header-subtitle">{STAGES.find((s) => s.id === stage)?.label}</p>
            </div>
            <button
              onClick={() => {
                setStage(null);
                setGroup(null);
                setMessages([]);
              }}
              className="lumi-back-btn lumi-header-corner-btn"
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
        padding: 2rem 1.5rem;
        box-sizing: border-box;
      }
      .lumi-onboarding-inner {
        position: relative;
        z-index: 2;
        width: 100%;
        max-width: 400px;
        text-align: center;
      }
      .lumi-onboarding-character {
        margin: 0 auto 8px;
        width: 150px;
        height: 150px;
      }
      .lumi-hero {
        font-family: 'Fraunces', serif;
        font-weight: 600;
        font-size: clamp(24px, 5.5vw, 32px);
        line-height: 1.25;
        letter-spacing: -0.3px;
        margin: 0 0 10px;
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
        margin: 0 0 clamp(18px, 3.5vh, 28px);
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
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(127, 217, 168, 0.15);
        margin-bottom: 12px;
        position: relative;
      }
      .lumi-header-character {
        margin-bottom: 6px;
      }
      .lumi-character {
        position: relative;
        display: block;
      }
      .lumi-character svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      #lumiBody {
        transform-origin: 360px 360px;
        animation: lumi-float 3.6s ease-in-out infinite;
      }
      #lumiLeftWingUpper { transform-origin: 288px 365px; animation: lumi-flap-left-up 0.42s ease-in-out infinite; }
      #lumiRightWingUpper { transform-origin: 432px 365px; animation: lumi-flap-right-up 0.42s ease-in-out infinite; }
      #lumiLeftWingLower { transform-origin: 296px 405px; animation: lumi-flap-left-low 0.42s ease-in-out infinite; }
      #lumiRightWingLower { transform-origin: 424px 405px; animation: lumi-flap-right-low 0.42s ease-in-out infinite; }
      #lumiBellyGlow { transform-origin: 360px 488px; animation: lumi-pulse-glow 2.4s ease-in-out infinite; }
      #lumiAntennaLeft, #lumiAntennaRight {
        transform-box: fill-box;
        transform-origin: bottom center;
        animation: lumi-antenna-wiggle 2.8s ease-in-out infinite;
      }
      #lumiAntennaRight { animation-delay: -0.6s; }
      #lumiEyes { animation: lumi-blink 6s infinite; transform-origin: 360px 338px; }
      #lumiSparkles circle { animation: lumi-twinkle 2.2s ease-in-out infinite; }
      #lumiSparkles circle:nth-child(2n) { animation-delay: -0.7s; }
      #lumiSparkles circle:nth-child(3n) { animation-delay: -1.3s; }

      /* Beim Nachdenken: Flügelschlag und Glow-Puls beschleunigen sich leicht,
         als würde Lumi sichtbar aktiver/konzentrierter werden — ohne die
         Grundanimationen (Schweben, Blinzeln, Fühler) zu unterbrechen. */
      .lumi-character-thinking #lumiLeftWingUpper,
      .lumi-character-thinking #lumiRightWingUpper,
      .lumi-character-thinking #lumiLeftWingLower,
      .lumi-character-thinking #lumiRightWingLower {
        animation-duration: 0.26s;
      }
      .lumi-character-thinking #lumiBellyGlow {
        animation-duration: 1.1s;
      }

      @keyframes lumi-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      @keyframes lumi-flap-left-up { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(-24deg) translateY(-4px); } }
      @keyframes lumi-flap-right-up { 0%, 100% { transform: rotate(7deg); } 50% { transform: rotate(24deg) translateY(-4px); } }
      @keyframes lumi-flap-left-low { 0%, 100% { transform: rotate(6deg); } 50% { transform: rotate(-8deg) translateY(3px); } }
      @keyframes lumi-flap-right-low { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(8deg) translateY(3px); } }
      @keyframes lumi-pulse-glow { 0%, 100% { opacity: 0.86; transform: scale(1); } 50% { opacity: 1; transform: scale(1.04); } }
      @keyframes lumi-antenna-wiggle { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(4deg); } }
      @keyframes lumi-blink { 0%, 92%, 100% { transform: scaleY(1); } 94% { transform: scaleY(0.08); } 96% { transform: scaleY(1); } }
      @keyframes lumi-twinkle { 0%, 100% { opacity: 0.25; transform: scale(0.75); } 50% { opacity: 1; transform: scale(1.15); } }
      @media (prefers-reduced-motion: reduce) {
        #lumiBody, #lumiLeftWingUpper, #lumiRightWingUpper, #lumiLeftWingLower, #lumiRightWingLower,
        #lumiBellyGlow, #lumiAntennaLeft, #lumiAntennaRight, #lumiEyes, #lumiSparkles circle {
          animation: none !important;
        }
      }
      .lumi-header-text {
        margin-bottom: 8px;
      }
      .lumi-header-corner-btn {
        position: absolute;
        top: 0;
        right: 0;
      }
      .lumi-header-title {
        margin: 0;
        font-family: 'Fraunces', serif;
        font-weight: 600;
        font-size: 16px;
        letter-spacing: 1.5px;
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
