import { useCallback, useRef } from 'react'
import { useWakeLock } from '../hooks/useWakeLock'
import { useFallbackVideo } from '../hooks/useFallbackVideo'

/*
 * KioskLayer
 * Buendelt die Optimierungen fuer den Dauerbetrieb auf Touch-Geraeten
 * (z. B. Echo Show 11 im Vollbild):
 *
 * - Haelt den Bildschirm ueber die Screen-Wake-Lock-API aktiv.
 * - Loest bei Beruehrung/Klick den nativen Vollbildmodus aus
 *   (element.requestFullscreen()), Fehler werden tolerant abgefangen.
 * - Falls die Wake-Lock-API nicht verfuegbar ist, laeuft im Hintergrund ein
 *   selbst erzeugtes, unsichtbares, stummes 1x1-Video in Dauerschleife, um
 *   Standby zu verhindern.
 */

function requestFullscreenSafely(): void {
  const element = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void
  }
  // Bereits im Vollbild? Dann nichts tun.
  if (document.fullscreenElement) {
    return
  }
  try {
    if (typeof element.requestFullscreen === 'function') {
      void element.requestFullscreen().catch(() => undefined)
    } else if (typeof element.webkitRequestFullscreen === 'function') {
      void element.webkitRequestFullscreen()
    }
  } catch {
    // Vollbild kann vom Browser/Geraet abgelehnt werden - unkritisch.
  }
}

function KioskLayer() {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Wake Lock aktiv halten; liefert zurueck, ob die API unterstuetzt wird.
  const wakeLockSupported = useWakeLock(true)

  // Fallback-Video nur erzeugen, wenn die Wake-Lock-API fehlt.
  useFallbackVideo(videoRef, !wakeLockSupported)

  const handleActivate = useCallback(() => {
    requestFullscreenSafely()
  }, [])

  return (
    <>
      {/*
        Unsichtbarer Klick-/Touch-Layer: eine Beruehrung irgendwo auf der Flaeche
        aktiviert den Vollbildmodus. Liegt hinter den Bedienelementen, damit
        Buttons weiterhin normal funktionieren.
      */}
      <button
        type="button"
        className="kiosk-fullscreen-layer"
        aria-label="Vollbild aktivieren"
        onClick={handleActivate}
      />

      {/*
        Fallback: unsichtbares, stummes 1x1-Video in Dauerschleife. Quelle wird
        zur Laufzeit selbst erzeugt (kein fremdes Asset). Nur aktiv, wenn die
        Wake-Lock-API nicht unterstuetzt wird.
      */}
      {!wakeLockSupported && (
        <video
          ref={videoRef}
          className="kiosk-fallback-video"
          muted
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
    </>
  )
}

export default KioskLayer
