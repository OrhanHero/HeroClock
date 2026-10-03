import { useCallback, useRef } from 'react'
import { useFallbackVideo } from '../hooks/useFallbackVideo'

/*
 * KioskLayer
 * Buendelt die Optimierungen fuer den Dauerbetrieb auf Touch-Geraeten
 * (z. B. Echo Show 11 im Vollbild):
 *
 * - Loest bei Beruehrung/Klick den nativen Vollbildmodus aus
 *   (element.requestFullscreen()), Fehler werden tolerant abgefangen.
 * - Haelt - solange der Anti-Standby aktiv ist - ein selbst erzeugtes,
 *   unsichtbares, stummes 1x1-Video in Dauerschleife bereit, falls die
 *   Wake-Lock-API nicht greift.
 * - Rendert eine dauerhaft laufende, extrem dezente Aktivitaets-Animation
 *   (praktisch unsichtbares 1px-Element). Sie haelt den Compositor/Browser
 *   kontinuierlich beschaeftigt - analog zur permanent laufenden Flip-Animation
 *   bekannter Flip-Uhren, die den Standby zuverlaessig verhindert.
 *
 * Der eigentliche Wake Lock wird in App gehalten (useWakeLock), damit das
 * Einstellungs-Panel Status und manuelle Erneuerung anzeigen kann.
 */

interface KioskLayerProps {
  /** Ist der Anti-Standby grundsaetzlich aktiviert (Nutzer-Einstellung)? */
  keepAwake: boolean
  /** Ist der Wake Lock aktuell aktiv? Dann wird das Video-Fallback geschont. */
  wakeLockActive: boolean
}

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

function KioskLayer({ keepAwake, wakeLockActive }: KioskLayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Fallback-Video laufen lassen, solange der Anti-Standby aktiv ist, der Wake
  // Lock aber (noch) nicht greift. So ist bereits vor dem ersten Touch Medien-
  // Aktivitaet vorhanden; ein spaeterer Touch versucht die Wiedergabe erneut.
  const fallbackActive = keepAwake && !wakeLockActive
  useFallbackVideo(videoRef, fallbackActive)

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
        Dauerhaft laufende, extrem dezente Aktivitaets-Animation. Ein nahezu
        unsichtbares 1px-Element wird per CSS-Animation endlos minimal bewegt,
        um Browser/Compositor kontinuierlich zu beschaeftigen (gegen Standby).
        Nur aktiv, wenn der Anti-Standby eingeschaltet ist. Ressourcenschonend:
        eine einzige CSS-Transform-/Opacity-Animation, kein JS-Loop.
      */}
      {keepAwake && (
        <span className="kiosk-activity-pulse" aria-hidden="true" />
      )}

      {/*
        Fallback: unsichtbares, stummes 1x1-Video in Dauerschleife. Quelle wird
        zur Laufzeit selbst erzeugt (kein fremdes Asset). Nur vorhanden, wenn der
        Anti-Standby aktiv ist und der Wake Lock (noch) nicht greift.
      */}
      {fallbackActive && (
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
