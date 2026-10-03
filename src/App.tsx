import { useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAmbientSound } from './hooks/useAmbientSound'
import { useNightDimming } from './hooks/useNightDimming'
import { useWakeLock } from './hooks/useWakeLock'
import { DEFAULT_SETTINGS } from './settings'
import type { Settings } from './settings'
import Greeting from './components/Greeting'
import HeroClock from './components/HeroClock'
import SettingsPanel from './components/SettingsPanel'
import AmbientSound from './components/AmbientSound'
import KioskLayer from './components/KioskLayer'

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

  // Nachtmodus/Dimming fuer den Dauerbetrieb (Burn-In-Schutz).
  useNightDimming(
    settings.nightDimming,
    settings.nightStartHour,
    settings.nightEndHour,
  )

  // Bildschirm wach halten (Anti-Standby). Fordert den Wake Lock bereits beim
  // Start an und erneuert ihn bei Sichtbarkeit/Vollbild. Der Status und die
  // manuelle Erneuerung (per Nutzergeste) werden im Einstellungs-Panel genutzt.
  const wakeLock = useWakeLock(settings.keepAwake)

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
        Kiosk-Schicht fuer den Dauerbetrieb (Echo Show 11): haelt den Bildschirm
        aktiv (Wake Lock + Video-Fallback) und loest bei Beruehrung den Vollbild-
        modus aus.
      */}
      <KioskLayer
        keepAwake={settings.keepAwake}
        wakeLockActive={wakeLock.status === 'active'}
      />

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

      {/*
        Der Ambient-Klang laeuft ueber useAmbientSound dauerhaft in der App.
        Hier werden nur die Steuerelemente im Einstellungs-Panel angezeigt.
      */}
      <SettingsPanel
        open={isSettingsOpen}
        settings={settings}
        onChange={updateSettings}
        onClose={() => setIsSettingsOpen(false)}
        wakeLockStatus={wakeLock.status}
        onKeepAwakeRequest={wakeLock.requestNow}
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
