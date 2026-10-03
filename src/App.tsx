import { useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAmbientSound } from './hooks/useAmbientSound'
import { DEFAULT_SETTINGS } from './settings'
import type { Settings } from './settings'
import Greeting from './components/Greeting'
import HeroClock from './components/HeroClock'
import FocusIntention from './components/FocusIntention'
import SettingsPanel from './components/SettingsPanel'
import PomodoroTimer from './components/PomodoroTimer'
import TodoList from './components/TodoList'
import AmbientSound from './components/AmbientSound'

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

  // Umgebungsgeraeusch dauerhaft steuern - unabhaengig vom Einstellungs-Panel.
  useAmbientSound(settings.ambientEnabled, settings.ambientVolume)

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
            <PomodoroTimer
              workMinutes={settings.pomodoroWorkMinutes}
              shortBreakMinutes={settings.pomodoroShortBreakMinutes}
              longBreakMinutes={settings.pomodoroLongBreakMinutes}
            />
          </section>

          <section className="region region--todo" aria-label="Aufgaben">
            <span className="region-label">Aufgaben</span>
            <TodoList />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>HeroClock &middot; dein ruhiger Ort zum Fokussieren</p>
      </footer>

      {/*
        Der Ambient-Klang laeuft ueber useAmbientSound dauerhaft in der App.
        Hier werden nur die Steuerelemente im Einstellungs-Panel angezeigt.
      */}
      <SettingsPanel
        open={isSettingsOpen}
        settings={settings}
        onChange={updateSettings}
        onClose={() => setIsSettingsOpen(false)}
        ambientControl={
          <AmbientSound
            enabled={settings.ambientEnabled}
            volume={settings.ambientVolume}
            onToggle={(ambientEnabled) => updateSettings({ ambientEnabled })}
            onVolumeChange={(ambientVolume) =>
              updateSettings({ ambientVolume })
            }
          />
        }
      />
    </div>
  )
}

export default App
