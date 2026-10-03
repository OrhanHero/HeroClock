# HeroClock

HeroClock ist ein ruhiges, eigenstaendiges Fokus-Dashboard fuer konzentriertes
Arbeiten. Die App vereint Uhr, Begruessung, Tagesabsicht, einen Pomodoro-Timer,
eine Aufgabenliste und ein optionales Umgebungsgeraeusch in einer
aufgeraeumten, zentrierten Oberflaeche.

Die gesamte Gestaltung, Farbwelt, Texte und Klaenge sind originaer. HeroClock
ist ein eigenstaendiges Projekt und steht in keinerlei Verbindung zu einem
anderen Produkt. Es werden keine fremden Marken, Designs, Inhalte oder Dateien
verwendet.

## Funktionen

- **Hero-Uhr** mit grosser Anzeige, umschaltbar zwischen 24- und 12-Stunden-Format.
- **Persoenliche Begruessung** je nach Tageszeit (Morgen, Tag, Abend, Nacht).
- **Tagesabsicht** zum Festhalten des aktuellen Fokus.
- **Pomodoro-Timer** mit konfigurierbaren Dauern fuer Fokus (Standard 25 Min.),
  kurze Pause (Standard 5 Min.) und lange Pause (Standard 15 Min.). Start,
  Pause, Ueberspringen und Zuruecksetzen stehen bereit. Phasen wechseln
  automatisch zwischen "Fokus" und "Pause"; nach vier Fokus-Phasen folgt eine
  lange Pause. Beim Phasenwechsel ertoent ein kurzer, zur Laufzeit per WebAudio
  erzeugter Klang (keine Audiodateien).
- **Aufgabenliste** zum Hinzufuegen, Abhaken (durchgestrichen) und Loeschen von
  Aufgaben. Die Liste wird lokal gespeichert und bleibt ueber Neuladen erhalten.
- **Umgebungsgeraeusch** als sanftes, kontinuierlich per WebAudio erzeugtes
  Rauschen mit Lautstaerke-Regler. Es werden keine externen Audiodateien
  geladen; der Klang entsteht vollstaendig im Browser.
- **Drei eigenstaendige Themes** (siehe unten), lokal gespeichert.
- **Dauerbetrieb/Kiosk-Modus** fuer Touch-Displays (z. B. Amazon Echo Show):
  - Zentrierte, an den Viewport angepasste Darstellung ohne Scrollbalken.
  - Haelt den Bildschirm aktiv ueber die Screen-Wake-Lock-API und fordert die
    Sperre nach einem Standby automatisch neu an. Fehlt die API (z. B.
    blockiert), spielt im Hintergrund ein selbst erzeugtes, unsichtbares,
    stummes 1x1-Video in Dauerschleife, um den Standby zu verhindern.
  - Eine Beruehrung der Flaeche aktiviert den nativen Vollbildmodus.
  - Nachtmodus mit tiefem Schwarz (`#000000`) als Burn-In-Schutz, zeitgesteuert
    ueber ein konfigurierbares Nachtfenster.
- **Einstellungen** fuer Name, Uhrzeit-Format, Theme, Pomodoro-Dauern,
  Umgebungsgeraeusch und Nachtmodus - alle Werte werden im `localStorage`
  gesichert.

## Technik

- Vite + React 18 + TypeScript (strict mode)
- Theming ueber CSS-Variablen und ein `data-theme`-Attribut
- Persistenz ueber einen typisierten `useLocalStorage`-Hook (Praefix `heroclock:`)
- Klaenge ausschliesslich ueber die WebAudio-API (OscillatorNode / gefiltertes
  Rauschen), ohne externe Assets
- Optionale Unit-Tests mit Vitest fuer die reinen Zeit-Hilfsfunktionen

## Entwicklung

```bash
npm install     # Abhaengigkeiten installieren
npm run dev     # Entwicklungsserver starten
npm run build   # Type-Check + Produktions-Build nach dist/
npm run preview # Produktions-Build lokal ansehen
npm run test    # Unit-Tests (Vitest) einmalig ausfuehren
```

## Themes

Drei eigenstaendige Themes stehen zur Auswahl und werden lokal gespeichert:

- **Tagesanbruch** - helles, warmes Tageslicht-Theme
- **Mitternacht** - ruhiges, dunkles Nacht-Theme
- **Aurora** - lebendiger Farbverlauf im Hintergrund
