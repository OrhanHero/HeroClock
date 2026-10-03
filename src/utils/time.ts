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
