import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Settings, ThemeId } from '../settings'
import type { WakeLockStatus } from '../hooks/useWakeLock'
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
  /** Grober Status des Wake Lock (Anti-Standby) fuer die Anzeige. */
  wakeLockStatus: WakeLockStatus
  /**
   * Fordert den Wake Lock sofort an. Wird aus einer Nutzergeste (Schalter)
   * aufgerufen, da Wake Lock i. d. R. eine Interaktion verlangt.
   */
  onKeepAwakeRequest: () => void
  /** Steuerelemente fuer das Umgebungsgeraeusch (bleibt in App gemountet). */
  ambientControl?: ReactNode
}

/** Liefert eine kurze, deutsche Statusbeschreibung fuer den Anti-Standby. */
function wakeLockStatusText(status: WakeLockStatus): string {
  switch (status) {
    case 'active':
      return 'aktiv'
    case 'unsupported':
      return 'nicht unterstuetzt (Video-Fallback aktiv)'
    default:
      return 'bereit (nach erster Beruehrung aktiv)'
  }
}

/**
 * Einschiebbares Einstellungs-Panel.
 *
 * Enthaelt Name, Uhrzeit-Format und Theme-Auswahl. Das Panel ist bewusst so
 * aufgebaut, dass spaetere Features (z. B. Umgebungsgeraeusche oder
 * Pomodoro-Optionen) weitere Abschnitte ergaenzen koennen, indem sie das
 * Settings-Objekt erweitern und hier zusaetzliche Steuerelemente einfuegen.
 */
/** Begrenzt eine Stunden-Eingabe auf 0-23. */
function clampHour(raw: string): number {
  const value = Number(raw)
  if (Number.isNaN(value)) {
    return 0
  }
  return Math.min(23, Math.max(0, Math.round(value)))
}

function SettingsPanel({
  open,
  settings,
  onChange,
  onClose,
  wakeLockStatus,
  onKeepAwakeRequest,
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
            <span className="settings-field__label">Sekunden anzeigen</span>
            <div
              className="settings-segmented"
              role="group"
              aria-label="Sekundenanzeige waehlen"
            >
              <button
                type="button"
                aria-pressed={settings.showSeconds}
                onClick={() => onChange({ showSeconds: true })}
              >
                An
              </button>
              <button
                type="button"
                aria-pressed={!settings.showSeconds}
                onClick={() => onChange({ showSeconds: false })}
              >
                Aus
              </button>
            </div>
            <p className="settings-field__hint">
              Zeigt die laufenden Sekunden an. Die staendige Bewegung haelt das
              Display aktiv und beugt dem Standby vor.
            </p>
          </section>

          <section className="settings-field">
            <span className="settings-field__label">Bildschirm wach halten</span>
            <div
              className="settings-segmented"
              role="group"
              aria-label="Bildschirm wach halten waehlen"
            >
              <button
                type="button"
                aria-pressed={settings.keepAwake}
                onClick={() => {
                  onChange({ keepAwake: true })
                  // Direkt aus der Nutzergeste anfordern - Wake Lock braucht
                  // i. d. R. eine Interaktion, um zuverlaessig zu greifen.
                  onKeepAwakeRequest()
                }}
              >
                An
              </button>
              <button
                type="button"
                aria-pressed={!settings.keepAwake}
                onClick={() => onChange({ keepAwake: false })}
              >
                Aus
              </button>
            </div>
            <p className="settings-field__hint">
              Verhindert den Standby (z. B. auf dem Echo Show) ueber Wake Lock,
              ein Video-Fallback und eine dezente Dauer-Animation.
            </p>
            {settings.keepAwake && (
              <>
                <p className="settings-field__hint">
                  Status: {wakeLockStatusText(wakeLockStatus)}
                </p>
                <button
                  type="button"
                  className="settings-field__input"
                  onClick={onKeepAwakeRequest}
                >
                  Wachhaltung jetzt aktivieren/erneuern
                </button>
              </>
            )}
          </section>

          <section className="settings-field">
            <span className="settings-field__label">Theme</span>
            <ThemeSwitcher
              theme={settings.theme}
              onChange={(theme: ThemeId) => onChange({ theme })}
            />
          </section>

          <section className="settings-field">
            <span className="settings-field__label">Umgebungsgeraeusch</span>
            {ambientControl}
          </section>

          <section className="settings-field">
            <span className="settings-field__label">
              Nachtmodus (Burn-In-Schutz)
            </span>
            <div
              className="settings-segmented"
              role="group"
              aria-label="Nachtmodus waehlen"
            >
              <button
                type="button"
                aria-pressed={settings.nightDimming}
                onClick={() => onChange({ nightDimming: true })}
              >
                An
              </button>
              <button
                type="button"
                aria-pressed={!settings.nightDimming}
                onClick={() => onChange({ nightDimming: false })}
              >
                Aus
              </button>
            </div>
            <p className="settings-field__hint">
              Dimmt das Display nachts mit tiefem Schwarz, um das Panel im
              Dauerbetrieb zu schonen.
            </p>
            <div className="settings-durations">
              <label className="settings-duration">
                <span className="settings-field__hint">Beginn (Uhr)</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  className="settings-field__input"
                  value={settings.nightStartHour}
                  disabled={!settings.nightDimming}
                  onChange={(event) =>
                    onChange({ nightStartHour: clampHour(event.target.value) })
                  }
                />
              </label>
              <label className="settings-duration">
                <span className="settings-field__hint">Ende (Uhr)</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  className="settings-field__input"
                  value={settings.nightEndHour}
                  disabled={!settings.nightDimming}
                  onChange={(event) =>
                    onChange({ nightEndHour: clampHour(event.target.value) })
                  }
                />
              </label>
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}

export default SettingsPanel
