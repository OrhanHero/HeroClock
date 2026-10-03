import { useEffect } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'

/** Verfuegbare, eigenstaendige Themes von HeroClock. */
const THEMES = [
  { id: 'daybreak', label: 'Tagesanbruch' },
  { id: 'midnight', label: 'Mitternacht' },
  { id: 'aurora', label: 'Aurora' },
] as const

type ThemeId = (typeof THEMES)[number]['id']

const DEFAULT_THEME: ThemeId = 'daybreak'

function App() {
  const [theme, setTheme] = useLocalStorage<ThemeId>('theme', DEFAULT_THEME)

  // Aktives Theme ueber ein data-theme-Attribut am <html>-Element setzen.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div
          className="theme-switch"
          role="group"
          aria-label="Theme auswaehlen"
        >
          {THEMES.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={theme === option.id}
              onClick={() => setTheme(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="settings-button"
          aria-label="Einstellungen oeffnen"
          title="Einstellungen"
        >
          <span aria-hidden="true">&#9881;</span>
          <span>Einstellungen</span>
        </button>
      </header>

      <main className="app-main">
        <section className="region region--greeting" aria-label="Begruessung">
          <span className="region-label">Begruessung</span>
          <p className="region-placeholder">Willkommen zurueck bei HeroClock.</p>
        </section>

        <section className="region region--clock" aria-label="Uhr">
          <span className="region-label">Uhr</span>
          <p className="region-placeholder">--:--</p>
        </section>

        <section className="region region--intention" aria-label="Fokus-Absicht">
          <span className="region-label">Deine Absicht</span>
          <p className="region-placeholder">
            Worauf moechtest du dich heute konzentrieren?
          </p>
        </section>

        <div className="region-grid">
          <section className="region region--timer" aria-label="Fokus-Timer">
            <span className="region-label">Fokus-Timer</span>
            <p className="region-placeholder">Pomodoro folgt in Kuerze.</p>
          </section>

          <section className="region region--todo" aria-label="Aufgaben">
            <span className="region-label">Aufgaben</span>
            <p className="region-placeholder">Deine Aufgabenliste erscheint hier.</p>
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>HeroClock &middot; dein ruhiger Ort zum Fokussieren</p>
      </footer>
    </div>
  )
}

export default App
