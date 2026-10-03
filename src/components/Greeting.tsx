import { useEffect, useState } from 'react'
import { greetingForHour } from '../utils/time'

interface GreetingProps {
  /** Optionaler Name fuer eine persoenliche Ansprache. */
  name: string
}

/**
 * Tageszeitabhaengige Begruessung, optional mit Namen.
 * Prueft periodisch die aktuelle Stunde, damit die Begruessung bei einem
 * Tageswechsel (z. B. von Abend zu Nacht) automatisch mitwandert.
 */
function Greeting({ name }: GreetingProps) {
  const [hour, setHour] = useState<number>(() => new Date().getHours())

  useEffect(() => {
    const id = window.setInterval(() => {
      setHour(new Date().getHours())
    }, 60_000)

    return () => {
      window.clearInterval(id)
    }
  }, [])

  const greeting = greetingForHour(hour)
  const trimmedName = name.trim()

  return (
    <section className="greeting" aria-label="Begruessung">
      <h1 className="greeting__text">
        {trimmedName ? `${greeting}, ${trimmedName}` : greeting}
      </h1>
    </section>
  )
}

export default Greeting
