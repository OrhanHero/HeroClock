import { useEffect, useRef } from 'react'
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
}

/**
 * Einschiebbares Einstellungs-Panel.
 *
 * Enthaelt Name, Uhrzeit-Format und Theme-Auswahl. Das Panel ist bewusst so
 * aufgebaut, dass spaetere Features (z. B. Umgebungsgeraeusche oder
 * Pomodoro-Optionen) weitere Abschnitte ergaenzen koennen, indem sie das
 * Settings-Objekt erweitern und hier zusaetzliche Steuerelemente einfuegen.
 */
function SettingsPanel({ open, settings, onChange, onClose }: SettingsPanelProps) {
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
        </div>
      </aside>
    </div>
  )
}

export default SettingsPanel
