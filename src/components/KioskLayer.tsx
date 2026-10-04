import { useCallback } from 'react'

/*
 * KioskLayer
 * Optimierung fuer den Dauerbetrieb auf Touch-Geraeten (z. B. Echo Show 11):
 * Loest bei Beruehrung/Klick den nativen Vollbildmodus aus
 * (element.requestFullscreen()). Fehler werden tolerant abgefangen, da der
 * Browser/das Geraet den Vollbildwunsch ablehnen kann.
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
  const handleActivate = useCallback(() => {
    requestFullscreenSafely()
  }, [])

  return (
    /*
      Unsichtbarer Klick-/Touch-Layer: eine Beruehrung irgendwo auf der Flaeche
      aktiviert den Vollbildmodus. Liegt hinter den Bedienelementen, damit
      Buttons weiterhin normal funktionieren.
    */
    <button
      type="button"
      className="kiosk-fullscreen-layer"
      aria-label="Vollbild aktivieren"
      onClick={handleActivate}
    />
  )
}

export default KioskLayer
