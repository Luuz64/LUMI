# LUMI – Lernbegleitung, Pilotversion

Lumi begleitet Kinder und Jugendliche beim Denken. Diese Version überarbeitet die Oberfläche und ergänzt Prüfungsvorbereitung sowie mitnehmbare Lernzettel ohne Konten oder zentrale Lernstand-Datenbank.

**Status:** Entwicklungsversion, noch nicht für echte Schülerdaten freigegeben. Technische Schutzmassnahmen ersetzen weder die schulische Prüfung noch Anbietervereinbarungen. Die KI ist in einer neuen Installation standardmässig ausgeschaltet.

## Was umgesetzt ist

- Neue responsive Lernoberfläche: dunkle Lumi-Welt, helle Arbeitsfläche, vorhandenes animiertes SVG-Glühwürmchen als zentraler Charakter.
- Animation abschaltbar; Systemeinstellung für reduzierte Bewegung wird berücksichtigt.
- Schulstufen 1–9 und Sek II/Lehre bleiben verfügbar. Voreinstellung ist das 5. Schuljahr und sichtbar änderbar.
- Freies Lernen, Prüfungsvorbereitung mit Fach/Themen/optionalem Datum.
- Drei Hilfen: Hinweis, anderes erklärtes Beispiel, Verständnisprüfung. Richtige eigene Lösungen dürfen bestätigt werden.
- Lernzettel mit **eigenen** Notizen. JSON-Download und validierter Import; Text kopieren; bewusstes Senden der Notizen zum Weiterlernen.
- Kein localStorage, sessionStorage, Cookie, Konto oder Datenbankspeicher für Chat/Lernstand. Daten bleiben in React-Zustand bis Neuladen oder Sitzungsende.
- Keine externen Schriften, Analytics oder Werbedienste. Von KI-Nachrichten eingebettete Bilder und anklickbare Links werden nicht geladen/angeboten.
- Serverprüfung für Stufe, Hilfemodus, Rollenfolge und Eingabegrössen; Zeitlimit; generische Fehler; keine Chat-Inhalte in Anwendung-Logs; no-store für API-Antworten.
- Einfacher flüchtiger Schutz gegen schnelle Anfragen und parallele Aufrufe pro Serverinstanz. **Kein verteiltes Kostenlimit.**

## Projektordner

**Aktive Quelle ist der Repository-Hauptordner (`./`).** `lumi-lernhilfe/` enthält eine unveränderte ältere Version und ist nicht der Einstieg für diesen Ausbau. In Vercel sowohl Project Settings als auch das tatsächliche Deployment auf Root Directory und Build prüfen. Den alten Unterordner nicht als Root Directory auswählen.

## Lokal

Node.js 20 oder neuer empfohlen.

```sh
npm ci
npm run dev
```

`npm run dev` startet die Oberfläche. Die Vercel-Funktion unter `/api/chat` läuft damit **nicht**. Der Chat zeigt lokal einen Verbindungs-/Einrichtungsfehler; es werden keine KI-Antworten simuliert. Für einen integrierten Betreibertest Vercels Entwicklungsumgebung oder ein geschütztes Vercel-Preview mit den unten genannten serverseitigen Einstellungen verwenden. Keine echten Schülerdaten verwenden.

```sh
npm test
npm run build
```

## Vercel-Testbereitstellung

1. Diese Änderungen in einen separaten Git-Branch übernehmen und ein **geschütztes Preview** erstellen; nicht ungeprüft in `main` übernehmen. Kein Deployment wurde durch diese Bearbeitung vorgenommen.
2. Root Directory `./`, Build `npm run build`, Output `dist`. Die `vercel.json` enthält Build und Sicherheitsheader. Eine eventuelle Vercel-Vorschau-Toolbar kann durch die CSP gesperrt werden; keine Lockerung für den Schulbetrieb ohne Prüfung.
3. Serverseitige Umgebungsvariablen wie in `.env.example` setzen. Den API-Schlüssel niemals in `VITE_*`, Git oder einem Chat hinterlegen.
4. Für einen bewussten **Betreibertest mit erfundenen Beispielen**: `LUMI_AI_ENABLED=true`, `ANTHROPIC_API_KEY` gesetzt und `LUMI_APP_ORIGIN` auf die exakte HTTPS-Origin ohne Pfad. `VERCEL_URL` wird zusätzlich als vertrauenswürdige Preview-Origin akzeptiert. Geänderte Variablen benötigen ein neues Deployment.
5. `ANTHROPIC_MODEL` ist optional; der bestehende Modellname `claude-sonnet-4-6` wurde beibehalten. Verfügbarkeit und Konditionen müssen im eigenen Anbieterkonto geprüft werden.
6. Vor öffentlicher Nutzung: plattformweiten Missbrauchsschutz und Budgetgrenze einrichten. Origin-Prüfung ist keine Authentifizierung; fremde Clients können einen Origin-Header nachbilden. Der eingebaute Burst-Schutz reicht bei mehreren Serverinstanzen nicht aus.
7. Die offene Schul-/Datenschutzprüfung in `docs/PILOT-AARGAU.md` abschliessen. `LUMI_AI_ENABLED=true` ist ein technischer Schalter, **keine Datenschutzfreigabe**.

## Grenzen

- Ohne Datei-Export gehen Notizen beim Neuladen verloren. Browser warnen nach Möglichkeit; gerade mobil ist eine Warnung nicht garantiert.
- Lernzettel enthalten Lerninformationen und können personenbezogen sein. Auf geteilten Geräten keine Dateien oder Zwischenablagen ungeschützt zurücklassen. Sitzungsende löscht weder Downloads noch Zwischenablage, Server-Logs oder bereits übermittelte Inhalte beim Anbieter.
- Der Client übermittelt den bisherigen Verlauf einer Lernrunde. Langzeitgedächtnis, Datei-/Foto-Upload von Aufgaben und automatische Kompetenzbewertung sind nicht eingebaut.
- Maximal 13 Nutzerbeiträge pro Runde, zusätzlich 26 000 Zeichen Gesamtverlauf. Danach Lernzettel mitnehmen und neue Runde starten.
- Promptregeln reduzieren direkte Lösungsausgaben und unangemessene Inhalte, können sie aber nicht sicher ausschliessen. Modellqualität und Kinderschutz sind noch mit echten Modellantworten zu prüfen.
- Die API wurde mit einem Test-Doppel geprüft, nicht mit einem echten Anbieter-Schlüssel. Keine Browser-/Geräteprüfung, kein Penetrationstest, keine rechtliche Zertifizierung durchgeführt.

Siehe `docs/ABNAHME.md` für durchgeführte Tests und die verbleibende Abnahme.


## Update: geschützter Erwachsenentest

Der Chat akzeptiert zusätzlich die exakte `VERCEL_BRANCH_URL` aus der
Vercel-Konfiguration. Fremde Preview-Domains und vom Request gelieferte
Host-Header werden nicht freigegeben.

Für das Projekt **lumi**, Umgebung **Preview**, Branch
`feat/lumi-learning-pilot` konfigurieren:

- `LUMI_APP_ORIGIN=https://lumi-git-feat-lumi-learning-pilot-luuz.vercel.app`
- `ANTHROPIC_API_KEY`: bestehenden Schlüssel nur in Vercel hinterlegen.
- `LUMI_PILOT_CODE`: zufälliger Code mit 16–128 Zeichen; nur den eingeladenen
  Erwachsenen mitteilen, kein wiederverwendetes Passwort. Kein `VITE_`-Präfix.
- `LUMI_AI_ENABLED=true` erst für den beaufsichtigten Erwachsenentest setzen.

Danach neu bereitstellen. Die Website bleibt ohne Vercel-Konto aufrufbar,
sofern die Vercel Deployment Protection entsprechend eingestellt ist;
KI-Anfragen benötigen zusätzlich den Testcode. Ohne konfigurierten Code
bleibt die API geschlossen. Rotation des Codes und erneute Bereitstellung
entziehen bisherigen Codes den Zugang auf dieser Bereitstellung. Bereits
existierende alte Bereitstellungen müssen separat geschützt/deaktiviert werden.

Der Code wird nur im Arbeitsspeicher der geöffneten Seite gehalten, beim
Sitzungsende gelöscht und nicht in Modellanfragen oder Lernzettel übernommen.
Ein geteilter Code ist keine persönliche Identifikation und kein Kostenlimit.
Die bestehende Drosselung gilt nur pro Serverinstanz. **Zentrales Kostenlimit,
separate Eingangs-/Ausgangsprüfung und Datenschutzfreigabe für die Klasse
stehen weiterhin aus.** Präzisierte Systemanweisungen ersetzen diese Prüfungen
nicht. Keine echten Schülerdaten verwenden.

Validierung dieses Updates: 14 automatisierte Tests mit simuliertem KI-Anbieter;
keine kostenpflichtige Modellanfrage und keine neue Browserprüfung.
