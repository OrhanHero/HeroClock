import { useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { DEFAULT_SETTINGS } from './settings'
import type { Settings } from './settings'
import Greeting from './components/Greeting'
import HeroClock from './components/HeroClock'
import FocusIntention from './components/FocusIntention'
import SettingsPanel from './components/SettingsPanel'

function App() {
  // Alle Nutzereinstellungen liegen als ein Objekt unter 'heroclock:settings'.
  const [storedSettings, setStoredSettings] = useLocalStorage<Settings>(
    'settings',
    DEFAULT_SETTINGS,
  )

  // Fehlende Felder (z. B. aus aelteren Versionen) mit Standardwerten ergaenzen.
  const settings: Settings = { ...DEFAULT_SETTINGS, ...storedSettings }

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Aktives Theme ueber ein data-theme-Attribut am <html>-Element setzen.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setStoredSettings((previous) => ({
        ...DEFAULT_SETTINGS,
        ...previous,
        ...patch,
      }))
    },
    [setStoredSettings],
  )

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <button
          type="button"
          className="settings-button"
          aria-label="Einstellungen oeffnen"
          aria-expanded={isSettingsOpen}
          title="Einstellungen"
          onClick={() => setIsSettingsOpen(true)}
        >
          <span aria-hidden="true">&#9881;</span>
          <span>Einstellungen</span>
        </button>
      </header>

      <main className="app-main">
        <Greeting name={settings.name} />
        <HeroClock use24h={settings.use24h} />
        <FocusIntention />

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

      <SettingsPanel
        open={isSettingsOpen}
        settings={settings}
        onChange={updateSettings}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}

export default App
