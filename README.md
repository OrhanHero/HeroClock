# HeroClock

HeroClock ist ein ruhiges, eigenstaendiges Fokus-Dashboard fuer konzentriertes
Arbeiten. Die App zeigt Uhr, Begruessung, Tagesabsicht, einen Fokus-Timer und
eine Aufgabenliste in einer aufgeraeumten, zentrierten Oberflaeche.

Die gesamte Gestaltung, Farbwelt und Texte sind originaer. Es werden keine
fremden Marken, Designs oder Inhalte verwendet.

## Technik

- Vite + React 18 + TypeScript (strict mode)
- Theming ueber CSS-Variablen und ein `data-theme`-Attribut
- Persistenz ueber einen typisierten `useLocalStorage`-Hook (Praefix `heroclock:`)

## Entwicklung

```bash
npm install     # Abhaengigkeiten installieren
npm run dev     # Entwicklungsserver starten
npm run build   # Type-Check + Produktions-Build nach dist/
npm run preview # Produktions-Build lokal ansehen
```

## Themes

Drei eigenstaendige Themes stehen zur Auswahl und werden lokal gespeichert:

- **Tagesanbruch** - helles, warmes Tageslicht-Theme
- **Mitternacht** - ruhiges, dunkles Nacht-Theme
- **Aurora** - lebendiger Farbverlauf im Hintergrund
