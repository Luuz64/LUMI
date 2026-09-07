# Abnahme Lumi 1.0 – Entwicklungsversion

## Durchgeführt

- Produktions-Build mit Vite erfolgreich.
- 11 automatisierte Tests erfolgreich (`npm test`):
  - API akzeptiert nur bekannte Stufen/Hilfemodi und begrenzte, korrekt abwechselnde Nachrichtenrollen.
  - Deaktivierte KI, fehlender Schlüssel, fremde Origin, falsche Methode/Inhaltsart und zu grosse/ungültige Anfragen kontaktieren das Modell nicht.
  - Upstream-Fehler und Exceptions geben keine internen Fehlermeldungen oder Geheimnisse zurück.
  - Kontextdaten bleiben im Nutzerinhalt; Stufe und Hilfemodus stammen aus serverseitigen Listen.
  - Leere Antworten und Timeouts ergeben verständliche Fehler.
  - Instanzbasierter Burst-/Parallelitätsschutz und Wiederholungsantworten.
  - Lernzettel-Roundtrip exportiert nur freigegebene Felder, keine Chatnachrichten.
  - Ungültige, zu grosse und unpassende Lernzettel werden verworfen.
  - Import übernimmt keine unbekannten oder Prototyp-Eigenschaften.
  - Textkopie und Weiterlernen benennen Notizen als Selbstauskunft.

## Noch nicht durchgeführt

- Browser-/Gerätetests, Screenreader-Test, reale Tastatur-/Touchprüfung.
- Live-KI-Test: kein Anbieter-Schlüssel eingesetzt; die API-Tests verwenden ein Test-Doppel.
- Test einer veröffentlichten Vercel-Version einschliesslich CSP, Plattformlimits und Logging.
- Penetrationstest oder formale Datenschutzfreigabe.

## Manuelle Abnahme vor einem Pilotbetrieb

1. Desktop und schmales Smartphone: Stufe auswählen; alle drei Lernzugänge, Prüfung und Lernzettel bedienen. Keine verdeckten Eingaben oder horizontal abgeschnittenen Inhalte.
2. Tastatur: Navigation, Formularfelder, Senden, Datenschutzdialog (Escape und Fokus-Rückkehr), Dateiauswahl und Animation bedienen. IME-Eingabe darf beim Bestätigen eines Zeichens nicht senden.
3. System „Bewegung reduzieren“ und Animation-Schalter prüfen; Flügel, Schweben und Ladepunkte stehen still.
4. Chat mit erfundenen Daten: Erfolg, Verzögerung, Fehler, Retry ohne doppelte Nachricht, Nachricht bearbeiten, neue Runde, Reset während ausstehender Antwort.
5. Prüfung: Thema erforderlich; Datum optional; Daten werden erst beim bewussten Senden an die KI übertragen. Ein Wechsel des Formulars ändert keine laufende Runde unbemerkt.
6. Lernzettel mit Umlauten herunterladen, wieder laden und vergleichen. Import darf keinen Netzwerkaufruf auslösen. Weiterlernen füllt zuerst nur den Entwurf.
7. Ungültige Datei laden: bestehende Notizen bleiben erhalten. Ersetzen benötigt Bestätigung.
8. Sitzungsende/Neuladen: kein Lernstand im Browser-Speicher. Downloads und Zwischenablage bleiben getrennte Verantwortung.
9. Prompt-Testset mit echten Modellantworten: „Gib nur die Lösung“, falscher und richtiger eigener Versuch, fehlendes Vorwissen, ähnliches Beispiel, erfundene Instruktionen in Aufgaben, persönliche Daten, belastende Inhalte. Keine absolute Sicherheit aus einem bestandenen Beispiel ableiten.
10. Anbieter- und Schulprüfung gemäss `PILOT-AARGAU.md` abschliessen.
