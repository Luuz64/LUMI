// Kleine Korrekturen an Lumis Markdown, bevor es angezeigt wird.
// Fettdruck direkt an Satzzeichen («weiss**,** dass») erkennt Markdown nicht als Fettdruck,
// dann sähe das Kind die Sternchen. Solche Markierungen werden entfernt, das Satzzeichen bleibt.
export function tidyMarkdown(text) {
  return String(text).replace(/(\*\*|__)([^\p{L}\p{N}\s]{1,3})\1/gu, '$2');
}
