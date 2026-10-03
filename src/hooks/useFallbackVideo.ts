import { useEffect, useRef } from 'react'

/*
 * useFallbackVideo
 * Erzeugt - vollstaendig zur Laufzeit, ohne fremde Mediendateien - ein winziges
 * (1x1 Pixel), stummgeschaltetes, endlos loopendes Video und spielt es im
 * uebergebenen <video>-Element ab.
 *
 * Zweck: Falls die Screen-Wake-Lock-API im Browser (z. B. Silk auf dem Echo
 * Show) blockiert ist, taeuscht ein dauerhaft abspielendes Video Medien-
 * Aktivitaet vor und verhindert so den Standby.
 *
 * Das Video wird selbst erzeugt: ein 1x1-Canvas wird ueber captureStream() als
 * MediaStream abgegriffen und per MediaRecorder in einen Blob geschrieben.
 * Es werden also keine urheberrechtlich geschuetzten Assets eingebunden.
 */

/**
 * Erzeugt eine kurze, selbst gerenderte Video-Blob-URL (1x1, stumm) oder null,
 * falls die noetigen APIs fehlen.
 */
async function createTinyVideoUrl(): Promise<string | null> {
  if (typeof document === 'undefined' || typeof MediaRecorder === 'undefined') {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx || typeof canvas.captureStream !== 'function') {
    return null
  }

  // Ein einzelnes schwarzes Pixel zeichnen - der Inhalt ist unerheblich.
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, 1, 1)

  const stream = canvas.captureStream(1)

  return new Promise<string | null>((resolve) => {
    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(stream)
    } catch {
      resolve(null)
      return
    }

    const chunks: BlobPart[] = []
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data)
      }
    }
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop())
      if (chunks.length === 0) {
        resolve(null)
        return
      }
      const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' })
      resolve(URL.createObjectURL(blob))
    }
    recorder.onerror = () => {
      stream.getTracks().forEach((track) => track.stop())
      resolve(null)
    }

    recorder.start()
    // Kurze Aufnahme genuegt - das Video wird spaeter in Dauerschleife gespielt.
    window.setTimeout(() => {
      try {
        recorder.stop()
      } catch {
        resolve(null)
      }
    }, 250)
  })
}

/**
 * Haengt ein selbst erzeugtes Fallback-Video an das uebergebene <video>-Element
 * und startet es, solange `active` true ist. Wird nur gebraucht, wenn die
 * Wake-Lock-API nicht zur Verfuegung steht.
 */
export function useFallbackVideo(
  videoRef: React.RefObject<HTMLVideoElement>,
  active: boolean,
): void {
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!active) {
      return
    }

    let cancelled = false

    // Erneuter Startversuch bei der ersten Nutzergeste (Autoplay-Block in Silk).
    const retryPlay = (): void => {
      const video = videoRef.current
      if (!video || !video.src) {
        return
      }
      void video.play().catch(() => undefined)
    }

    const gestureEvents: Array<keyof DocumentEventMap> = [
      'pointerdown',
      'touchstart',
      'click',
      'keydown',
    ]
    gestureEvents.forEach((type) => {
      document.addEventListener(type, retryPlay, { passive: true })
    })

    void createTinyVideoUrl().then((url) => {
      if (cancelled || !url) {
        if (url) {
          URL.revokeObjectURL(url)
        }
        return
      }
      urlRef.current = url
      const video = videoRef.current
      if (!video) {
        return
      }
      video.src = url
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.autoplay = true
      // Wiedergabe kann ohne Nutzergeste abgelehnt werden - still ignorieren.
      // Der Autoplay-Block wird spaeter beim ersten Touch (retryPlay) umgangen.
      void video.play().catch((error) => {
        console.debug('Fallback-Video Autoplay blockiert:', error)
      })
    })

    return () => {
      cancelled = true
      gestureEvents.forEach((type) => {
        document.removeEventListener(type, retryPlay)
      })
      const video = videoRef.current
      if (video) {
        video.pause()
        video.removeAttribute('src')
        video.load()
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current)
        urlRef.current = null
      }
    }
  }, [active, videoRef])
}

export default useFallbackVideo
