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
}

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  use24h: true,
  theme: DEFAULT_THEME,
}
