import { THEMES } from '../settings'
import type { ThemeId } from '../settings'

interface ThemeSwitcherProps {
  /** Aktuell aktives Theme. */
  theme: ThemeId
  /** Callback bei Auswahl eines Themes. */
  onChange: (theme: ThemeId) => void
}

/**
 * Auswahl zwischen den eigenstaendigen HeroClock-Themes.
 * Das Anwenden auf das <html>-Element und das Speichern uebernimmt die App;
 * diese Komponente meldet lediglich die Auswahl.
 */
function ThemeSwitcher({ theme, onChange }: ThemeSwitcherProps) {
  return (
    <div className="theme-switch" role="group" aria-label="Theme auswaehlen">
      {THEMES.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={theme === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitcher
