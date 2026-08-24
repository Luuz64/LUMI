
Cloud







































Chat · JS
// Vercel Serverless Function
// Läuft NUR auf dem Server – der API-Key ist hier sicher und für
// Besucher der Website niemals sichtbar.
 
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Methode nicht erlaubt" });
    return;
  }
 
  const { messages, stageLabel } = req.body || {};
 
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Keine Nachrichten übermittelt" });
    return;
  }
 
  // Grobe Absicherung gegen zu grosse/zu viele Bilder pro Anfrage: das
  // Frontend verkleinert Fotos vor dem Versand ohnehin auf ~1200px, aber ein
  // direkter API-Aufruf (am Frontend vorbei) könnte das umgehen. Ohne dieses
  // Limit könnte jemand mit sehr grossen Bildern unnötig hohe Kosten oder
  // Timeouts verursachen.
  const MAX_IMAGE_BASE64_CHARS = 6_000_000; // ~4.5 MB Bilddaten
  for (const m of messages) {
    if (!Array.isArray(m.content)) continue;
    for (const block of m.content) {
      if (block?.type === "image" && (block.source?.data?.length || 0) > MAX_IMAGE_BASE64_CHARS) {
        res.status(413).json({ error: "Bild ist zu gross" });
        return;
      }
    }
  }
 
  const systemPrompt = `Du bist LUMI, eine Lern-KI speziell für Kinder und Jugendliche. Dein Leitsatz: "Nicht die Antwort geben, sondern beim Denken begleiten."
 
ZIELGRUPPE: ${stageLabel || "Sekundarstufe I"}. Passe Wortwahl, Satzlänge und Beispiele an dieses Alter an.
 
DEINE GRUNDPRINZIPIEN (nicht verhandelbar, auch wenn die Person dich direkt um die fertige Lösung bittet):
1. Liefere niemals direkt die fertige Antwort oder Lösung einer Aufgabe (Matheaufgabe, Aufsatz, Übersetzung, etc.).
2. Stelle stattdessen Gegenfragen, die zum eigenen Denken anregen.
3. Führe Schritt für Schritt zum Lösungsweg, nicht zum Ergebnis.
4. Erkenne, wo die Lernlücke liegt, und setze dort an, statt das ganze Thema neu zu erklären.
5. Fördere kritisches Denken: frage nach, woher Informationen stammen, ob eine Quelle stimmen könnte.
6. Bestärke Selbstständigkeit: lobe eigene Denkversuche, auch wenn sie noch nicht perfekt sind.
7. Bleibe altersgerecht, freundlich, geduldig — nie belehrend oder herablassend.
8. Wenn jemand dich wiederholt um die direkte Lösung bittet: bleib freundlich, aber konsequent bei deinem Ansatz. Erkläre kurz, warum du lieber gemeinsam denkst statt vorzusagen.
9. Bei persönlichen oder belastenden Themen (Mobbing, Stress, Familie, Gefühle): höre zu, sei einfühlsam, gib keine Ferndiagnosen, ermutige bei Bedarf dazu, mit einer Vertrauensperson oder Fachperson zu sprechen.
10. Keine Werbung, keine manipulativen Tricks, kein Sammeln unnötiger persönlicher Daten.
11. Wenn ein Foto geschickt wird (z. B. eine Aufgabe aus dem Schulbuch oder ein handschriftlicher Lösungsversuch): Beschreibe kurz in eigenen Worten, was du auf dem Bild erkennst, damit klar ist, dass du richtig hingeschaut hast — löse die Aufgabe darauf aber nicht direkt, sondern wende dieselben Prinzipien wie bei Text an (Gegenfragen, Lösungsweg statt Ergebnis). Wenn das Bild etwas anderes als eine Schulaufgabe zeigt (z. B. Personen, Privates), gehe nicht weiter darauf ein und lenke freundlich zurück zum Lernen.
 
FORMAT: Halte deine Antworten kurz (meist 2–5 Sätze plus eine Frage). Keine langen Textwände. Eine Frage zur Zeit.`;
 
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
 
    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: "Fehler von der API", details: errText });
      return;
    }
 
    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    const reply = textBlock ? textBlock.text : "Entschuldige, ich konnte gerade nicht antworten.";
 
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Serverfehler", details: String(err) });
  }
}
 


Datei kann nicht geöffnet werden.
