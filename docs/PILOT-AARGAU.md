# Vorbereitung eines Klassentests im Aargau

Stand: 6. September 2026. Arbeitsunterlage für Betreiber und Schule, keine Freigabe oder Rechtsberatung.

## Beabsichtigter Einsatz

Öffentliche Schule im Kanton Aargau; konkrete Klassenstufe und Anzahl Geräte noch offen. Lernbegleitung und formative Übungen, keine Benotung oder automatisierten Entscheidungen. Keine Konten, dauerhaft gespeicherten Chats oder zentralen Lernprofile.

Der Software-Stand ist nicht allein ausreichend für einen Einsatz mit echten Schülerdaten. Zuerst mit erfundenen Aufgaben und Erwachsenen testen.

## Datenfluss im umgesetzten Code

| Handlung | Daten und Empfänger | Speicherung in Lumi |
| --- | --- | --- |
| Seite öffnen | Hosting empfängt übliche Verbindungsdaten; Schriften und Assets kommen von derselben Origin | Keine Anwendungskonten/Analyse-Cookies; Hosting-Protokolle gesondert prüfen |
| Stufe/Prüfung/Notizen eingeben | Zunächst nur geöffnete Browserseite | Flüchtiger React-Zustand |
| Chat senden | Verlauf der aktuellen Runde, Stufe, Fach, gegebenenfalls Thema/Datum an Vercel-API, von dort Anthropic | Kein Chat-Logging oder Datenbankspeicher im Anwendungscode; mögliche Anbieteraufbewahrung bleibt separat zu prüfen |
| Lernzettel herunterladen | JSON mit Stufe, Prüfungsangaben und expliziten Notizen auf das Gerät | Datei bleibt bis zur Löschung durch Nutzer/Schule; kein Chatverlauf enthalten |
| Lernzettel laden | Lokale Datei wird gelesen und geprüft | Nur Seitenzustand; kein KI-Aufruf |
| Mit Notizen weiterlernen | Notizen erscheinen zunächst im editierbaren Texteingabefeld; erst Senden übermittelt sie | Wie Chat |
| Sitzung beenden | Browserzustand wird geleert, ausstehende Browseranfrage abgebrochen | Keine nachträgliche Löschung beim Anbieter; bereits laufende Verarbeitung kann bis zum Timeout fortbestehen |
| API-Missbrauchsschutz | Flüchtiger HMAC der IP mit zufälligem Instanzschlüssel, Zähler | Nur Arbeitsspeicher der Serverinstanz; Zeitfenster 60 Sekunden, Bereinigung beim nächsten Zugriff |

Keine Drittanbieter-Analytics, externen Google Fonts, Werbung, lokal gespeicherten Profile oder automatischen Lernstandsnotizen. Das ist **nicht** gleichbedeutend mit Anonymität oder vollständiger Abwesenheit von Personendaten: Kinder können persönliche Inhalte selbst eingeben; IP-/Hosting-Daten sind gesondert zu betrachten.

## Offene Entscheidungen vor dem Einsatz

| Punkt | Benötigter Nachweis / Entscheidung | Stand |
| --- | --- | --- |
| Verantwortliche Stelle | Betreiberidentität/Kontakt, zuständige Schulleitung und schulische Datenschutz-/ICT-Ansprechperson benennen | Offen |
| Rechtsgrundlage, Zweck, Altersgruppe | Prüfung durch zuständige Schule nach anwendbaren Aargauer Vorgaben; keine pauschale Eltern-Einwilligung als Ersatz annehmen | Offen |
| Hosting | Konkreter Vertrag/Tarif, Region, Log-Inhalte und Fristen, Unterauftragnehmer, Supportzugriffe und Auslandbezug | Nicht eingesehen |
| KI-Anbieter | Vertragliche Bedingungen, Auftragsbearbeitung, Trainingsnutzung, Inhalts-/Missbrauchslogs, Aufbewahrungsfristen, Speicher-/Verarbeitungsorte und Unterauftragnehmer | Nicht eingesehen |
| Auslandsbearbeitung | Rechtsgrundlage und gegebenenfalls Schutzmassnahmen für den tatsächlichen Datenfluss | Offen |
| Information | Vollständige Betreiber-Datenschutzerklärung, verständliche Information für Lernende/Eltern und Lehrperson | UI-Erklärung vorhanden; rechtsverbindliche Betreiberangaben fehlen |
| Schutzbedarf / Folgenabschätzung | Ob eine Datenschutz-Folgenabschätzung oder weitere behördliche Prüfung erforderlich ist, muss die verantwortliche Stelle beurteilen | Offen |
| Zugangs- und Kostenschutz | Preview-Zugang, plattformweite Rate-/Bot-Limits und Anbieterbudget | Nicht eingerichtet; nur zusätzlicher Instanz-Burst-Schutz im Code |
| Schulgeräte | Eigene Speicherplätze, Download-/Zwischenablage-Regeln, Umgang mit gemeinsam genutzten Browsern, Sitzung beenden | Mit Schule festzulegen |
| Modell-/Kinderschutzprüfung | Lösungsausgaben, Falschinformationen, persönliche Angaben, akute Belastung, altersgerechte Antworten anhand erfundener Fälle prüfen | Noch offen |
| Betrieb | Zuständigkeit bei Datenpannen, Beschwerden, Lösch-/Auskunftsanfragen, Anbieterwechsel und Updates | Offen |

## Vorschlag für den Testablauf

1. Betreiber und Kollegin prüfen mit erfundenen Aufgaben auf einem geschützten Preview die Bedienung und Antwortqualität.
2. Die Schule beurteilt den dokumentierten Datenfluss und die tatsächlichen Anbietervereinbarungen. Offene Punkte werden geklärt; Entscheidung festhalten.
3. Erst anschliessend ein begrenzter, begleiteter Klassentest: keine Klarnamen oder persönlichen Geschichten, keine benotungsrelevanten Entscheidungen. Lernende wissen, dass Lumi Fehler machen kann.
4. Feedback möglichst ohne Personenbezug sammeln. Keine Chatprotokolle mit Schülerdaten per E-Mail verschicken.

## Offizielle Orientierung

- Kanton Aargau: [ICT und digitale Medien in der Schule](https://www.ag.ch/de/themen/bildung-forschung/volksschule/regelschule/struktur-organisation/ict-und-digitale-medien)
- Schulportal Aargau: [Datenschutz und Datensicherheit](https://www.schulen-aargau.ch/regelschule/schulorganisation/datenschutz-und-datensicherheit)
- EDÖB: [Datenbearbeitungen in der Cloud](https://www.edoeb.admin.ch/de/datenbearbeitungen-in-der-cloud)
- Educa: [Folgen des neuen Datenschutzgesetzes für Schulen](https://www.educa.ch/de/news/2023/folgen-des-neuen-datenschutzgesetzes-fuer-schulen)

Für die öffentliche Schule ist insbesondere die zuständige kantonale Regelung massgebend. Die EDÖB-Cloud-Hinweise dienen hier ergänzend zur Orientierung für den privaten Anbieter. Die tatsächlichen Verträge und schulischen Vorgaben wurden nicht eingesehen.
