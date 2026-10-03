import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Settings, ThemeId } from '../settings'
import ThemeSwitcher from './ThemeSwitcher'

interface SettingsPanelProps {
  /** Ist das Panel geoeffnet? */
  open: boolean
  /** Aktuelle Einstellungen. */
  settings: Settings
  /** Teil-Aktualisierung der Einstellungen. */
  onChange: (patch: Partial<Settings>) => void
  /** Schliessen des Panels. */
  onClose: () => void
  /** Steuerelemente fuer das Umgebungsgeraeusch (bleibt in App gemountet). */
  ambientControl?: ReactNode
}

/**
 * Einschiebbares Einstellungs-Panel.
 *
 * Enthaelt Name, Uhrzeit-Format und Theme-Auswahl. Das Panel ist bewusst so
 * aufgebaut, dass spaetere Features (z. B. Umgebungsgeraeusche oder
 * Pomodoro-Optionen) weitere Abschnitte ergaenzen koennen, indem sie das
 * Settings-Objekt erweitern und hier zusaetzliche Steuerelemente einfuegen.
 */
/** Begrenzt eine Minuten-Eingabe auf einen sinnvollen Bereich (1-180). */
function clampMinutes(raw: string): number {
  const value = Number(raw)
  if (Number.isNaN(value)) {
    return 1
  }
  return Math.min(180, Math.max(1, Math.round(value)))
}

function SettingsPanel({
  open,
  settings,
  onChange,
  onClose,
  ambientControl,
}: SettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Schliessen per Escape-Taste, solange das Panel geoeffnet ist.
  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="settings-overlay" role="presentation" onClick={onClose}>
      <aside
        ref={panelRef}
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Einstellungen"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="settings-panel__header">
          <h2>Einstellungen</h2>
          <button
            type="button"
            className="settings-panel__close"
            aria-label="Einstellungen schliessen"
            onClick={onClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>

        <div className="settings-panel__body">
          <section className="settings-field">
            <label className="settings-field__label" htmlFor="settings-name">
              Dein Name
            </label>
            <input
              id="settings-name"
              type="text"
              className="settings-field__input"
              value={settings.name}
              placeholder="Wie duerfen wir dich nennen?"
              onChange={(event) => onChange({ name: event.target.value })}
            />
            <p className="settings-field__hint">
              Optional. Erscheint in deiner persoenlichen Begruessung.
            </p>
          </section>

          <section className="settings-field">
            <span className="settings-field__label">Uhrzeit-Format</span>
            <div
              className="settings-segmented"
              role="group"
              aria-label="Uhrzeit-Format waehlen"
            >
              <button
                type="button"
                aria-pressed={settings.use24h}
                onClick={() => onChange({ use24h: true })}
              >
                24 Stunden
              </button>
              <button
                type="button"
                aria-pressed={!settings.use24h}
                onClick={() => onChange({ use24h: false })}
              >
                12 Stunden
              </button>
            </div>
          </section>

          <section className="settings-field">
            <span className="settings-field__label">Theme</span>
            <ThemeSwitcher
              theme={settings.theme}
              onChange={(theme: ThemeId) => onChange({ theme })}
            />
          </section>

          <section className="settings-field">
            <span className="settings-field__label">Pomodoro-Dauern (Minuten)</span>
            <div className="settings-durations">
              <label className="settings-duration">
                <span className="settings-field__hint">Fokus</span>
                <input
                  type="number"
                  min={1}
                  max={180}
                  className="settings-field__input"
                  value={settings.pomodoroWorkMinutes}
                  onChange={(event) =>
                    onChange({
                      pomodoroWorkMinutes: clampMinutes(event.target.value),
                    })
                  }
                />
              </label>
              <label className="settings-duration">
                <span className="settings-field__hint">Kurze Pause</span>
                <input
                  type="number"
                  min={1}
                  max={180}
                  className="settings-field__input"
                  value={settings.pomodoroShortBreakMinutes}
                  onChange={(event) =>
                    onChange({
                      pomodoroShortBreakMinutes: clampMinutes(
                        event.target.value,
                      ),
                    })
                  }
                />
              </label>
              <label className="settings-duration">
                <span className="settings-field__hint">Lange Pause</span>
                <input
                  type="number"
                  min={1}
                  max={180}
                  className="settings-field__input"
                  value={settings.pomodoroLongBreakMinutes}
                  onChange={(event) =>
                    onChange({
                      pomodoroLongBreakMinutes: clampMinutes(event.target.value),
                    })
                  }
                />
              </label>
            </div>
          </section>

          <section className="settings-field">
            <span className="settings-field__label">Umgebungsgeraeusch</span>
            {ambientControl}
          </section>
        </div>
      </aside>
    </div>
  )
}

export default SettingsPanel
