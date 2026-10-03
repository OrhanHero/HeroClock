/*
 * HeroClock Zeit-Hilfsfunktionen
 * Reine, testbare Funktionen zur Formatierung von Uhrzeit und Datum sowie
 * fuer die tageszeitabhaengige Begruessung. Alle Ausgaben sind auf Deutsch.
 */

/**
 * Formatiert die Uhrzeit als Stunden und Minuten.
 *
 * @param date   Zeitpunkt, der formatiert werden soll.
 * @param use24h true fuer 24-Stunden-Format, false fuer 12-Stunden-Format mit AM/PM.
 */
export function formatTime(date: Date, use24h: boolean): string {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24h,
  }).format(date)
}

/**
 * Formatiert die Sekunden einer Uhrzeit zweistellig, z. B. "07" oder "42".
 *
 * Wird als eigenes, kleineres Element neben der Hauptzeit angezeigt, damit sich
 * jede Sekunde sichtbar etwas aendert (kontinuierliche Aktivitaet wie bei
 * Flip-Uhren, die den Browser/Compositor beschaeftigt haelt).
 *
 * @param date Zeitpunkt, dessen Sekunden formatiert werden sollen.
 */
export function formatSeconds(date: Date): string {
  return String(date.getSeconds()).padStart(2, '0')
}

/**
 * Formatiert das Datum als langes deutsches Datum, z. B. "Montag, 3. Oktober".
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

/**
 * Liefert eine tageszeitabhaengige Begruessung.
 *
 *  - 5 bis 10 Uhr:  "Guten Morgen"
 *  - 11 bis 17 Uhr: "Guten Tag"
 *  - 18 bis 22 Uhr: "Guten Abend"
 *  - 23 bis 4 Uhr:  "Gute Nacht"
 *
 * @param hour Stunde des Tages (0-23).
 */
export function greetingForHour(hour: number): string {
  if (hour >= 5 && hour <= 10) {
    return 'Guten Morgen'
  }
  if (hour >= 11 && hour <= 17) {
    return 'Guten Tag'
  }
  if (hour >= 18 && hour <= 22) {
    return 'Guten Abend'
  }
  return 'Gute Nacht'
}

/**
 * Prueft, ob eine Stunde in das Nachtfenster faellt (Burn-In-Schutz / Dimming).
 *
 * Das Fenster darf ueber Mitternacht reichen, z. B. von 22 bis 7 Uhr. In diesem
 * Fall gilt die Nacht, wenn die Stunde >= Start ODER < Ende ist.
 *
 * @param hour  Stunde des Tages (0-23).
 * @param start Startstunde des Nachtfensters (0-23).
 * @param end   Endstunde des Nachtfensters (0-23), exklusiv.
 */
export function isNightHour(hour: number, start: number, end: number): boolean {
  if (start === end) {
    return false
  }
  if (start < end) {
    return hour >= start && hour < end
  }
  // Fenster ueber Mitternacht, z. B. 22 bis 7.
  return hour >= start || hour < end
}

/**
 * Formatiert eine Dauer in Sekunden als "mm:ss".
 *
 * Negative Werte werden auf 0 begrenzt, Minuten koennen bei langen Dauern
 * ueber 59 hinausgehen (z. B. "90:00").
 *
 * @param totalSeconds Gesamtdauer in Sekunden.
 */
export function formatMmSs(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return `${mm}:${ss}`
}
