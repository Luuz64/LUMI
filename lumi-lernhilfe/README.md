# Lumi – Lernhilfe statt Abkürzung

Eine KI-Lernbegleiterin für Kinder und Jugendliche. Statt fertige Antworten
zu liefern, stellt Lumi Gegenfragen und führt Schritt für Schritt zum
eigenen Lösungsweg.

## Lokal testen (optional)

```
npm install
npm run dev
```

Hinweis: lokal funktioniert nur das Frontend ohne KI-Antworten, da die
Backend-Funktion (`/api/chat.js`) erst auf Vercel mit dem hinterlegten
API-Key läuft. Zum echten Testen am besten direkt deployen (siehe unten).

## Live schalten – Schritt für Schritt

### 1. GitHub-Account erstellen
- Gehe auf https://github.com/signup
- E-Mail, Passwort, Benutzername eingeben, Account verifizieren

### 2. Neues Repository erstellen
- Auf github.com oben rechts auf "+" → "New repository"
- Name z. B. `lumi-lernhilfe`
- Sichtbarkeit: "Private" (empfohlen, da noch Prototyp)
- "Create repository" klicken

### 3. Code hochladen
Im Terminal, im Ordner dieses Projekts:

```
git init
git add .
git commit -m "Erster Lumi-Prototyp"
git branch -M main
git remote add origin https://github.com/DEIN-BENUTZERNAME/lumi-lernhilfe.git
git push -u origin main
```

(GitHub zeigt dir diese genauen Befehle auch direkt nach dem Erstellen des
Repos an – einfach von dort kopieren.)

### 4. Anthropic API-Key erstellen
- Gehe auf https://console.anthropic.com
- Account erstellen, Zahlungsmethode hinterlegen (Pay-as-you-go)
- Unter "API Keys" einen neuen Key erstellen, Wert kopieren und sicher
  aufbewahren (wird nur einmal angezeigt)

### 5. Bei Vercel deployen
- Gehe auf https://vercel.com/signup
- "Continue with GitHub" wählen, Vercel mit GitHub verbinden
- "Add New" → "Project"
- Dein `lumi-lernhilfe`-Repository auswählen → "Import"
- Bei "Environment Variables" hinzufügen:
  - Name: `ANTHROPIC_API_KEY`
  - Wert: dein Key von Schritt 4
- "Deploy" klicken

Nach 1–2 Minuten ist die App live unter einer URL wie
`lumi-lernhilfe.vercel.app`.

### 6. Spätere Änderungen
Jede Änderung, die du committest und pushst (`git push`), wird automatisch
neu deployed. Du musst nichts manuell wiederholen.

### 7. Eigene Domain (optional, später)
In den Vercel-Projekteinstellungen unter "Domains" kannst du eine eigene
Domain wie `lumi-lernhilfe.ch` hinterlegen, falls du eine kaufst.

## Kosten im Blick behalten
- Vercel: kostenlos im Hobby-Plan für dieses Projektvolumen
- Anthropic API: nur Kosten pro genutzter Konversation (Bruchteile von
  Rappen bis wenige Rappen je Austausch). Limit/Budget-Alarm lässt sich in
  der Anthropic Console einstellen.
