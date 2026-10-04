import { useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useNightDimming } from './hooks/useNightDimming'
import { DEFAULT_SETTINGS } from './settings'
import type { Settings } from './settings'
import Greeting from './components/Greeting'
import HeroClock from './components/HeroClock'
import SettingsPanel from './components/SettingsPanel'
import KioskLayer from './components/KioskLayer'

function App() {
  // Alle Nutzereinstellungen liegen als ein Objekt unter 'heroclock:settings'.
  const [storedSettings, setStoredSettings] = useLocalStorage<Settings>(
    'settings',
    DEFAULT_SETTINGS,
  )

  // Fehlende Felder (z. B. aus aelteren Versionen) mit Standardwerten ergaenzen.
  // Ueberzaehlige Felder aus frueheren Versionen werden dabei einfach ignoriert.
  const settings: Settings = { ...DEFAULT_SETTINGS, ...storedSettings }

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Aktives Theme ueber ein data-theme-Attribut am <html>-Element setzen.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  // Nachtmodus/Dimming fuer den Dauerbetrieb (Burn-In-Schutz).
  useNightDimming(
    settings.nightDimming,
    settings.nightStartHour,
    settings.nightEndHour,
  )

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
      {/*
        Kiosk-Schicht fuer den Dauerbetrieb (Echo Show 11): loest bei Beruehrung
        den Vollbildmodus aus.
      */}
      <KioskLayer />

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
        <HeroClock use24h={settings.use24h} showSeconds={settings.showSeconds} />
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
