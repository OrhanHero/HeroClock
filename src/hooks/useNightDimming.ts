import { useEffect, useState } from 'react'
import { isNightHour } from '../utils/time'

/*
 * useNightDimming
 * Schaltet im Dauerbetrieb (z. B. Echo Show) den Nachtmodus/Dimming, um das
 * Panel vor Burn-In zu schuetzen. Setzt waehrend des Nachtfensters ein
 * data-dimmed="true"-Attribut am <html>-Element, auf das die Themes mit tiefem
 * Schwarz (#000000) und gedaempften Inhalten reagieren.
 *
 * Die Pruefung laeuft ressourcenschonend nur einmal pro Minute.
 */
export function useNightDimming(
  enabled: boolean,
  startHour: number,
  endHour: number,
): void {
  const [dimmed, setDimmed] = useState<boolean>(() =>
    enabled ? isNightHour(new Date().getHours(), startHour, endHour) : false,
  )

  useEffect(() => {
    if (!enabled) {
      setDimmed(false)
      return
    }

    const evaluate = (): void => {
      setDimmed(isNightHour(new Date().getHours(), startHour, endHour))
    }

    evaluate()
    const id = window.setInterval(evaluate, 60_000)
    return () => {
      window.clearInterval(id)
    }
  }, [enabled, startHour, endHour])

  useEffect(() => {
    const root = document.documentElement
    if (dimmed) {
      root.setAttribute('data-dimmed', 'true')
    } else {
      root.removeAttribute('data-dimmed')
    }
    return () => {
      root.removeAttribute('data-dimmed')
    }
  }, [dimmed])
}

export default useNightDimming
