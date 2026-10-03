# HeroClock

HeroClock ist eine ruhige, eigenstaendige Uhr fuer den Dauerbetrieb auf
Touch-Displays. Die App zeigt eine grosse Uhr mit Datum und einer persoenlichen
Begruessung in einer aufgeraeumten, zentrierten Oberflaeche und ist auf den
Kiosk-/Vollbildbetrieb (z. B. auf einem Amazon Echo Show) ausgelegt.

Die gesamte Gestaltung, Farbwelt, Texte und Klaenge sind originaer. HeroClock
ist ein eigenstaendiges Projekt und steht in keinerlei Verbindung zu einem
anderen Produkt. Es werden keine fremden Marken, Designs, Inhalte oder Dateien
verwendet. Klaenge entstehen ausschliesslich zur Laufzeit per WebAudio.

## Funktionen

- **Hero-Uhr** mit sehr grosser Anzeige (CSS `clamp` bis 14rem), umschaltbar
  zwischen 24- und 12-Stunden-Format, inklusive deutschem Datum.
- **Persoenliche Begruessung** je nach Tageszeit (Morgen, Tag, Abend, Nacht),
  optional mit dem hinterlegten Namen.
- **Drei eigenstaendige Themes** (siehe unten), lokal gespeichert.
- **Umgebungsgeraeusch** als sanftes, kontinuierlich per WebAudio erzeugtes
  Rauschen mit Lautstaerke-Regler. Es werden keine externen Audiodateien
  geladen; der Klang entsteht vollstaendig im Browser.
- **Dauerbetrieb/Kiosk-Modus** fuer Touch-Displays (z. B. Amazon Echo Show 11,
  1920x1200):
  - Viewportfuellende, zentrierte Darstellung ohne Scrollbalken.
  - Haelt den Bildschirm aktiv ueber die Screen-Wake-Lock-API und fordert die
    Sperre nach einem Standby automatisch neu an. Fehlt die API (z. B.
    blockiert), spielt im Hintergrund ein selbst erzeugtes, unsichtbares,
    stummes 1x1-Video in Dauerschleife, um den Standby zu verhindern.
  - Eine Beruehrung der Flaeche aktiviert den nativen Vollbildmodus.
  - Nachtmodus/Dimming mit tiefem Schwarz (`#000000`) als Burn-In-Schutz,
    zeitgesteuert ueber ein konfigurierbares Nachtfenster.
  - Das Einstellungs-Panel ist bei Platzmangel intern scrollbar (Touch).
- **Einstellungen** fuer Name, Uhrzeit-Format (24h/12h), Theme,
  Umgebungsgeraeusch (an/aus + Lautstaerke) und Nachtmodus (an/aus +
  Start-/Endstunde) - alle Werte werden unter dem `localStorage`-Schluessel
  `heroclock:settings` gesichert.

## Technik

- Vite + React 18 + TypeScript (strict mode)
- Theming ueber CSS-Variablen und ein `data-theme`-Attribut
- Persistenz ueber einen typisierten `useLocalStorage`-Hook (Praefix `heroclock:`)
- Klaenge ausschliesslich ueber die WebAudio-API (gefiltertes Rauschen), ohne
  externe Assets
- Unit-Tests mit Vitest decken die reinen Zeit-Hilfsfunktionen ab

## Entwicklung

```bash
npm install     # Abhaengigkeiten installieren
npm run dev     # Entwicklungsserver starten
npm run build   # Type-Check + Produktions-Build nach dist/
npm run preview # Produktions-Build lokal ansehen
npm run test    # Unit-Tests (Vitest) einmalig ausfuehren
```

## Betrieb

HeroClock ist eine statische Single-Page-App. Nach `npm run build` liegt das
Ergebnis in `dist/` und kann als statische Site auf einen Webspace geladen
werden (z. B. per SFTP, etwa unter `kahraman.biz`). Im Dauerbetrieb wird die
Seite auf dem Touch-Display im Vollbild aufgerufen.

## Themes

Drei eigenstaendige Themes stehen zur Auswahl und werden lokal gespeichert:

- **Tagesanbruch** - helles, warmes Tageslicht-Theme
- **Mitternacht** - ruhiges, dunkles Nacht-Theme
- **Aurora** - lebendiger Farbverlauf im Hintergrund
