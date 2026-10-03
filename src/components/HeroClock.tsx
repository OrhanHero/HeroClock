import { useEffect, useState } from 'react'
import { formatDate, formatTime } from '../utils/time'

interface HeroClockProps {
  /** true fuer 24-Stunden-Format, false fuer 12-Stunden-Format. */
  use24h: boolean
}

/**
 * Grosse, prominente Uhr. Aktualisiert sich jede Sekunde ueber ein Intervall,
 * das beim Entfernen der Komponente wieder aufgeraeumt wird.
 */
function HeroClock({ use24h }: HeroClockProps) {
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearInterval(id)
    }
  }, [])

  return (
    <section className="hero-clock" aria-label="Aktuelle Uhrzeit">
      <time className="hero-clock__time" dateTime={now.toISOString()}>
        {formatTime(now, use24h)}
      </time>
      <p className="hero-clock__date">{formatDate(now)}</p>
    </section>
  )
}

export default HeroClock
