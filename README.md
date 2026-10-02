# Sonias Tagescockpit

Persönliches Tagescockpit für Sonia (Executive Assistant bei Lade.ZEIT GmbH, Gründerin von NIA – Gateway Germany).
Ursprünglich mit Claude gebaut, hier als eigenständige Web-App für GitHub + Vercel.

## Was drin ist

| Bereich | Was es tut |
|---|---|
| **Sag's einfach** | Diktierfeld (iPhone-Tastatur-Mikrofon). Die KI „Nele“ zerlegt das Diktat in Aufgaben, Wasser, Bewegung, Pause, Notiz und Vorhaben-Status und trägt alles ein. |
| **Tagesladestand** | Akku-Anzeige: Anteil der heute erledigten Aufgaben. |
| **Heute** | Aufgabenliste mit Bereichen Lade.ZEIT / NIA / Privat, Filter, abhaken, löschen. |
| **Für dich** | Wasser (8 Gläser à 250 ml), Bewegung, Pause, Gedanke des Tages. |
| **Dein Team** | Sechs Assistentinnen mit eigener Rolle: Nele (Termine & Tagesgeschäft), Rieke (Förderanträge & Patente), Amina (NIA), Noor (Schreiben & Bücher), Jara (Weg zur COO), Sana (Alltag & Ausgleich). Jede kennt den aktuellen Tagesstand. |
| **Lade.ZEIT · Vorhaben** | Karten mit Status (offen → laufend → wartet → erledigt), nächstem Schritt und Frist. |

## Aufbau

```
index.html          ← die ganze App (HTML, CSS, JavaScript in einer Datei)
api/assistant.js    ← Vercel-Funktion, ruft OpenAI auf (Schlüssel bleibt geheim auf dem Server)
```

- **Speicher:** aktuell `localStorage` im Browser (Schlüssel `sonia-cockpit-v1`), also pro Gerät.
- **KI:** `index.html` ruft `POST /api/assistant` mit `{messages, json}` auf. Die erste Nachricht ist immer die Rolle + der Tageskontext (wird zur System-Nachricht). Antwort: `{text}`.
- **Schutz:** Die Funktion verlangt den Header `x-cockpit-pass`, der mit `COCKPIT_PASSWORD` übereinstimmen muss. Die Seite fragt das Passwort einmal ab und merkt es sich.

## Online bringen (Vercel)

1. Neues GitHub-Repository anlegen, beide Dateien hochladen (Ordnerstruktur beibehalten).
2. In Vercel: „Add New → Project“ → das Repository importieren → Deploy (keine Build-Einstellungen nötig).
3. In Vercel unter **Settings → Environment Variables** eintragen:
   - `OPENAI_API_KEY` = dein OpenAI-Schlüssel
   - `COCKPIT_PASSWORD` = ein eigenes Passwort
   - optional `OPENAI_MODEL` = gewünschtes Modell
4. Neu deployen. Fertig: Seite öffnen, Passwort eingeben.

## Nächste Ausbaustufen (Wunschliste)

1. **Alle Geräte synchron:** `localStorage` durch Supabase ersetzen (Tabellen `tasks`, `projects`, `days`, `chats`). Die Stellen im Code sind `persist()` und der Block „Speicher (dieses Gerät)“.
2. **Morgen-Briefing mit Terminen:** Outlook-Kalender (Microsoft Graph) über eine zweite Vercel-Funktion `api/termine.js` anbinden und oben „Guten Morgen, Sonia, das sind deine Termine“ anzeigen; Termine zusätzlich in `contextBlock()` an die Assistentinnen geben.
3. **Geld-Sicht:** Kachel, in die Sonia Kontostand bzw. NIA-Umsatz selbst einträgt (auch per Diktat), mit Verlauf und „zuletzt aktualisiert“.
4. **Telegram:** Telegram-Bot, dessen Nachrichten (auch Sprachnachrichten) über eine Vercel-Funktion in dieselbe Datenbank laufen.

## Gestaltung

Dunkel-erster Look (Petrol + Messing), helle Variante automatisch nach Systemeinstellung.
Schriften: Bodoni Moda (Überschriften), Figtree (Text), JetBrains Mono (Etiketten). Farben stehen als Variablen oben im `<style>`.
