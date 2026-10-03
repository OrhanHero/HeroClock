import { useEffect, useRef } from 'react'

/*
 * useWakeLock
 * Kapselt die Screen-Wake-Lock-API, um den Bildschirm dauerhaft aktiv zu halten.
 * Gedacht fuer den Dauerbetrieb (z. B. Echo Show 11 im Silk-Browser), damit das
 * Geraet nicht in den Standby wechselt.
 *
 * Verhalten:
 * - Fordert beim Aktivieren navigator.wakeLock.request('screen') an.
 * - Fordert die Sperre erneut an, wenn die Seite nach einem Tab-Wechsel oder
 *   Standby wieder sichtbar wird (visibilitychange), da das System die Sperre
 *   in diesen Faellen automatisch freigibt.
 * - Faengt fehlende Unterstuetzung und Fehler (z. B. Blockierung durch den
 *   Browser) still ab und gibt zurueck, ob die API ueberhaupt verfuegbar ist.
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
 * @returns true, wenn die Wake-Lock-API grundsaetzlich unterstuetzt wird.
 *          Bei false sollte ein Fallback (z. B. ein unsichtbares Video) greifen.
 */
export function useWakeLock(enabled: boolean): boolean {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null)
  const supported = isWakeLockSupported()

  useEffect(() => {
    if (!enabled || !supported) {
      return
    }

    const wakeLock = (navigator as Navigator & { wakeLock: WakeLockApi })
      .wakeLock
    let cancelled = false

    const acquire = async (): Promise<void> => {
      // Nur anfordern, wenn die Seite sichtbar ist - sonst lehnt der Browser ab.
      if (document.visibilityState !== 'visible') {
        return
      }
      if (sentinelRef.current && !sentinelRef.current.released) {
        return
      }
      try {
        const sentinel = await wakeLock.request('screen')
        if (cancelled) {
          void sentinel.release()
          return
        }
        sentinelRef.current = sentinel
        // Wird die Sperre vom System freigegeben, Referenz zuruecksetzen,
        // damit sie beim naechsten Sichtbarwerden neu angefordert wird.
        sentinel.addEventListener('release', () => {
          sentinelRef.current = null
        })
      } catch {
        // Nicht unterstuetzt oder blockiert - still ignorieren, Fallback greift.
      }
    }

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        void acquire()
      }
    }

    void acquire()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      const sentinel = sentinelRef.current
      sentinelRef.current = null
      if (sentinel && !sentinel.released) {
        void sentinel.release().catch(() => {
          // Freigabe-Fehler sind unkritisch.
        })
      }
    }
  }, [enabled, supported])

  return supported
}

export default useWakeLock
