/*
 * HeroClock Einstellungen
 * Zentrale Definition des Einstellungs-Objekts, das als Ganzes unter dem
 * localStorage-Schluessel 'heroclock:settings' gespeichert wird.
 *
 * Das Objekt ist bewusst erweiterbar gehalten: spaetere Features (z. B.
 * Umgebungsgeraeusche oder Pomodoro-Optionen) koennen eigene Felder ergaenzen,
 * ohne bestehende Daten zu brechen. Fehlende Felder werden beim Laden aus
 * DEFAULT_SETTINGS ergaenzt.
 */

/** Verfuegbare, eigenstaendige Themes von HeroClock. */
export const THEMES = [
  { id: 'daybreak', label: 'Tagesanbruch' },
  { id: 'midnight', label: 'Mitternacht' },
  { id: 'aurora', label: 'Aurora' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export const DEFAULT_THEME: ThemeId = 'daybreak'

export interface Settings {
  /** Optionaler Name fuer eine persoenliche Begruessung. */
  name: string
  /** true = 24-Stunden-Format, false = 12-Stunden-Format. */
  use24h: boolean
  /** Aktuell gewaehltes Theme. */
  theme: ThemeId
  /** Dauer einer Fokus-Phase in Minuten. */
  pomodoroWorkMinutes: number
  /** Dauer einer kurzen Pause in Minuten. */
  pomodoroShortBreakMinutes: number
  /** Dauer einer langen Pause in Minuten. */
  pomodoroLongBreakMinutes: number
  /** Umgebungsgeraeusch aktiviert? */
  ambientEnabled: boolean
  /** Lautstaerke des Umgebungsgeraeuschs (0 bis 1). */
  ambientVolume: number
}

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  use24h: true,
  theme: DEFAULT_THEME,
  pomodoroWorkMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  ambientEnabled: false,
  ambientVolume: 0.4,
}
