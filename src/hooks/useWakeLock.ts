import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * useWakeLock
 * Kapselt die Screen-Wake-Lock-API, um den Bildschirm dauerhaft aktiv zu halten.
 * Gedacht fuer den Dauerbetrieb (z. B. Echo Show 11 im Silk-Browser), damit das
 * Geraet nicht in den Standby wechselt.
 *
 * Verhalten (bewusst aggressiv):
 * - Fordert die Sperre bereits beim Aktivieren an (nicht erst beim ersten
 *   Touch), zusaetzlich erneut bei visibilitychange (Sichtbarwerden) und nach
 *   einem Vollbild-Wechsel (fullscreenchange), da das System die Sperre in
 *   diesen Faellen automatisch freigibt.
 * - Stellt eine manuelle Anforderung (requestNow) bereit, die direkt aus einer
 *   Nutzergeste (z. B. ein Schalter im Einstellungs-Panel) aufgerufen werden
 *   kann. Wake Lock verlangt in vielen Browsern eine Nutzergeste; ein sichtbarer
 *   Schalter macht das zuverlaessig ausloesbar.
 * - Faengt fehlende Unterstuetzung und Fehler (z. B. Blockierung durch den
 *   Browser) still ab (console.debug statt throw) und meldet den groben Status.
 */

/** Minimale Typbeschreibung der Wake-Lock-API (nicht in allen TS-Libs vorhanden). */
interface WakeLockSentinelLike {
  released: boolean
  release: () => Promise<void>
  addEventListener: (type: 'release', listener: () => void) => void
}

interface WakeLockApi {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>
}

/** Grober Status des Wake Lock fuer die Anzeige in der Oberflaeche. */
export type WakeLockStatus = 'unsupported' | 'inactive' | 'active'

export interface WakeLockState {
  /** Wird die Wake-Lock-API im Browser grundsaetzlich unterstuetzt? */
  supported: boolean
  /** Aktueller, grober Status (unsupported | inactive | active). */
  status: WakeLockStatus
  /**
   * Fordert die Sperre sofort an. Ideal aus einer Nutzergeste heraus, da Wake
   * Lock haeufig eine Interaktion verlangt. Fehler werden still abgefangen.
   */
  requestNow: () => void
}

/** Prueft, ob die Wake-Lock-API im aktuellen Browser vorhanden ist. */
export function isWakeLockSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'wakeLock' in navigator &&
    typeof (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock
      ?.request === 'function'
  )
}

/**
 * Haelt eine Screen-Wake-Lock aktiv, solange `enabled` true ist.
 *
 * @returns Statusobjekt inkl. manueller Anforderungsfunktion (requestNow),
 *          die direkt aus einer Nutzergeste aufgerufen werden kann.
 */
export function useWakeLock(enabled: boolean): WakeLockState {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null)
  const enabledRef = useRef(enabled)
  const supported = isWakeLockSupported()
  const [active, setActive] = useState(false)

  // Immer den aktuellen enabled-Wert kennen, auch aus stabilen Callbacks heraus.
  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  // Interne Anforderung. Stabil referenziert, damit sie aus Nutzergesten und
  // Event-Listenern gleichermassen aufgerufen werden kann.
  const acquire = useCallback(async (): Promise<void> => {
    if (!supported || !enabledRef.current) {
      return
    }
    // Nur anfordern, wenn die Seite sichtbar ist - sonst lehnt der Browser ab.
    if (
      typeof document !== 'undefined' &&
      document.visibilityState !== 'visible'
    ) {
      return
    }
    if (sentinelRef.current && !sentinelRef.current.released) {
      return
    }
    try {
      const wakeLock = (navigator as Navigator & { wakeLock: WakeLockApi })
        .wakeLock
      const sentinel = await wakeLock.request('screen')
      if (!enabledRef.current) {
        void sentinel.release().catch(() => undefined)
        return
      }
      sentinelRef.current = sentinel
      setActive(true)
      // Wird die Sperre vom System freigegeben, Referenz zuruecksetzen,
      // damit sie beim naechsten Sichtbarwerden neu angefordert wird.
      sentinel.addEventListener('release', () => {
        sentinelRef.current = null
        setActive(false)
      })
    } catch (error) {
      // Nicht unterstuetzt oder blockiert - still ignorieren, Fallback greift.
      console.debug('Wake Lock konnte nicht angefordert werden:', error)
      setActive(false)
    }
  }, [supported])

  const requestNow = useCallback(() => {
    void acquire()
  }, [acquire])

  useEffect(() => {
    if (!enabled || !supported) {
      setActive(false)
      return
    }

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        void acquire()
      }
    }

    // Nach einem Vollbild-Wechsel gibt das System die Sperre oft frei.
    const handleFullscreenChange = (): void => {
      void acquire()
    }

    // Bereits beim Mount/Aktivieren anfordern (nicht erst beim ersten Touch).
    void acquire()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      const sentinel = sentinelRef.current
      sentinelRef.current = null
      setActive(false)
      if (sentinel && !sentinel.released) {
        void sentinel.release().catch(() => {
          // Freigabe-Fehler sind unkritisch.
        })
      }
    }
  }, [enabled, supported, acquire])

  const status: WakeLockStatus = !supported
    ? 'unsupported'
    : active
      ? 'active'
      : 'inactive'

  return { supported, status, requestNow }
}

export default useWakeLock
