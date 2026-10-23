# Lehrplan 21 in LUMI

Stand: Oktober 2026

## Was LUMI heute weiss

Die Datei `shared/curriculum.js` beschreibt das Aargauer Schulsystem und wird von Oberfläche und Server gemeinsam genutzt:

- **Stufen:** 1.–6. Klasse Primarschule, 1.–3. Oberstufe, danach Mittelschule/Gymnasium oder Berufslehre.
- **Zyklen:** 1. Zyklus bis 2. Klasse, 2. Zyklus 3.–6. Klasse, 3. Zyklus Oberstufe.
- **Schultyp auf der Oberstufe:** Realschule (grundlegende), Sekundarschule (erweiterte), Bezirksschule (hohe Anforderungen). Alle drei arbeiten an denselben Kompetenzzielen.
- **Fächer je Stufe:** NMG auf der Primarschule; NT, RZG, WAH und ERG auf der Oberstufe; Französisch ab der 5. Klasse; Medien und Informatik ab der 5. Klasse; Englisch als 1. Fremdsprache.
- **Kompetenzbereiche** pro Fach, wörtlich wie auf [ag.lehrplan.ch](https://ag.lehrplan.ch), in Mathematik zusätzlich die drei Handlungsaspekte.

Der Server baut daraus einen Abschnitt «Schulkontext» im Prompt (`curriculumContext()`), zum Beispiel:

```
Kanton Aargau.
Stufe: 2. Klasse Oberstufe (3. Zyklus des Aargauer Lehrplan Volksschule (basiert auf dem Lehrplan 21)).
Schultyp: Bezirksschule mit hohen Anforderungen. …
Fach: Natur und Technik (Physik, Chemie, Biologie).
Kompetenzbereiche im Lehrplan: Wesen und Bedeutung von Naturwissenschaften und Technik verstehen; Stoffe untersuchen und gewinnen; …
```

Lumi kennt damit die **Bereiche**, aber noch nicht die einzelnen **Kompetenzen und Kompetenzstufen** (z. B. was in der 5. Klasse bei «Zahl und Variable» erwartet wird). Genau das soll die Schnittstelle liefern.

**Vor dem Klasseneinsatz prüfen:** Startklasse Englisch (im Code ab 3. Klasse angenommen) und die Fächerliste mit der aktuellen Aargauer Stundentafel abgleichen.

## Die offizielle Schnittstelle

- Adresse: `https://api.lehrplan.ch` (Doku: `https://api.lehrplan.ch/dokumentation.php`, Manual `Datenschnittstelle_LP21-2026_02_15.pdf`)
- Zugang: Nutzungsvereinbarung mit der D-EDK-Geschäftsstelle, danach Login-Daten. Kontakt über [lehrplan21.ch/api-schnittstelle-zum-lehrplan-21](https://www.lehrplan21.ch/api-schnittstelle-zum-lehrplan-21) (Telefon 041 226 00 69).
- Abfrage: `getData.php?kanton=ag&sprache=de&uid=<UID>`, Antwort als JSON.
- Aargau ist als eigene Kantonsversion verfügbar (`kanton=ag`), inklusive der Aargauer Ergänzungen.
- Wichtige Felder: `strukturtyp` (Fachbereich, Kompetenzbereich, Kompetenz, Kompetenzstufe …), `code`, `bezeichnung`, `zyklus` (1, 12, 2, 23, 3), `grundanspruch`, `orientierungspunkt`, `hierarchie_unten`, `Versionsdatum`.
- Bedingung laut Manual: «korrekte und kohärente Darstellung» der verwendeten Daten.

## Plan nach Erhalt des Zugangs

1. Zugangsdaten als Umgebungsvariablen setzen (nur lokal, nie im Repo): `LP21_USER`, `LP21_PASSWORD`, `LP21_ROOT_UID`.
2. `node scripts/lp21-import.mjs` ausführen. Das Skript läuft die Hierarchie bis zu den Kompetenzstufen ab und schreibt `shared/lp21-ag.json`. Es ist ein **ungetesteter Entwurf**: Die Art der Anmeldung (angenommen: HTTP Basic Auth) und die Start-UID beim ersten Lauf prüfen.
3. Export prüfen und einchecken. Lumi fragt die Schnittstelle **nicht live** ab: Ein Export pro Lehrplanversion reicht, ist schneller, und die Schulkinder-Anfragen erreichen nie einen weiteren Dienst.
4. `curriculumContext()` erweitern: Statt nur der Bereiche die Kompetenzstufen des passenden Zyklus mitgeben, bei langen Listen nur die zum gewählten Thema passenden (Stichwortsuche über `bezeichnung`). Grundansprüche markieren, damit Lumi weiss, was alle erreichen sollen.
5. Im Prüfungsplan Themen aus den Kompetenzen vorschlagen (optional, nur als Hilfe beim Eintragen).

## Offene Fragen an die Geschäftsstelle

- Darf LUMI Auszüge (Titel von Kompetenzbereichen und Kompetenzstufen) an einen KI-Anbieter übermitteln, damit die Antworten zum Lehrplan passen? Die Inhalte werden nicht verändert und den Kindern nicht als offizieller Lehrplantext angezeigt.
- Kosten und Lizenz, auch für ein nicht-kommerzielles Pilotprojekt.
- Technische Anmeldung, Abfragelimits und die UID des Einstiegselements für `kanton=ag`.
- Wie werden Aktualisierungen angekündigt (Versionsdatum, Änderungslog)?
