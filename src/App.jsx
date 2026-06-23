import React, { useState, useRef, useEffect } from "react";

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
    options: [
      { id: "sek2", label: "Sek II / Lehre" },
    ],
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
        <div style={styles.onboardingWrap}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={styles.avatar}>
              <span style={{ fontSize: 26 }}>💡</span>
            </div>
            <h1 style={{ margin: "0 0 0.5rem", fontSize: 28, fontWeight: 600 }}>Lumi</h1>
            <p style={{ color: "#6b6a63", margin: 0, fontSize: 15 }}>
              Nicht die Antwort geben, sondern beim Denken begleiten.
            </p>
          </div>

          <p style={{ fontSize: 14, color: "#6b6a63", marginBottom: "0.75rem" }}>
            In welcher Schulstufe bist du?
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {STAGE_GROUPS.map((g) => (
              <button key={g.id} onClick={() => selectGroup(g)} style={styles.stageButton}>
                <span style={{ fontWeight: 600, fontSize: 14, display: "block" }}>{g.label}</span>
                <span style={{ fontSize: 12, color: "#6b6a63" }}>{g.desc}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div style={styles.onboardingWrap}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={styles.avatar}>
            <span style={{ fontSize: 26 }}>💡</span>
          </div>
          <h1 style={{ margin: "0 0 0.5rem", fontSize: 28, fontWeight: 600 }}>Lumi</h1>
          <p style={{ color: "#6b6a63", margin: 0, fontSize: 15 }}>
            Nicht die Antwort geben, sondern beim Denken begleiten.
          </p>
        </div>

        <button onClick={() => setGroup(null)} style={{ ...styles.smallButton, marginBottom: "1rem" }}>
          ← Zurück
        </button>

        <p style={{ fontSize: 14, color: "#6b6a63", marginBottom: "0.75rem" }}>
          In welchem Schuljahr genau?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeGroup.options.map((s) => (
            <button key={s.id} onClick={() => setStage(s.id)} style={styles.stageButton}>
              <span style={{ fontWeight: 600, fontSize: 14, display: "block" }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.chatWrap}>
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={styles.avatarSmall}>
            <span style={{ fontSize: 16 }}>💡</span>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Lumi</p>
            <p style={{ margin: 0, fontSize: 12, color: "#6b6a63" }}>
              {STAGES.find((s) => s.id === stage)?.label}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setStage(null);
            setGroup(null);
            setMessages([]);
          }}
          style={styles.smallButton}
        >
          Stufe ändern
        </button>
      </div>

      <div ref={scrollRef} style={styles.messageArea}>
        {messages.length === 0 && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 14, color: "#6b6a63", marginBottom: 10 }}>
              Worüber möchtest du nachdenken?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {STARTERS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)} style={styles.starterButton}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#1c1c1a" : "#f0efe9",
              color: m.role === "user" ? "#ffffff" : "#1c1c1a",
            }}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.bubble, alignSelf: "flex-start", background: "#f0efe9", color: "#6b6a63" }}>
            Lumi denkt nach...
          </div>
        )}
      </div>

      <div style={styles.inputRow}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Schreib Lumi etwas..."
          rows={1}
          style={styles.textarea}
        />
        <button onClick={() => sendMessage()} disabled={loading} style={styles.sendButton}>
          →
        </button>
      </div>
    </div>
  );
}

const styles = {
  onboardingWrap: {
    maxWidth: 440,
    margin: "0 auto",
    padding: "4rem 1.5rem",
    minHeight: "100vh",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#e9f0fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#e9f0fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stageButton: {
    textAlign: "left",
    padding: "14px 16px",
    borderRadius: 10,
    border: "1px solid #e3e1d8",
    background: "#ffffff",
    cursor: "pointer",
  },
  chatWrap: {
    maxWidth: 600,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    padding: "1rem 1.25rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottom: "1px solid #e3e1d8",
    marginBottom: 12,
  },
  smallButton: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #e3e1d8",
    background: "#ffffff",
    cursor: "pointer",
  },
  messageArea: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingRight: 4,
  },
  starterButton: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 13,
    borderRadius: 8,
    border: "1px solid #e3e1d8",
    background: "#ffffff",
    cursor: "pointer",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 14,
    padding: "10px 14px",
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    marginTop: 12,
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    resize: "none",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e3e1d8",
    fontSize: 14,
    fontFamily: "inherit",
    minHeight: 40,
  },
  sendButton: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #1c1c1a",
    background: "#1c1c1a",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 16,
  },
};
