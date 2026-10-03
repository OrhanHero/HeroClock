import { useEffect, useRef } from 'react'

/** Buendelt die aktiven WebAudio-Knoten eines Ambient-Klangs. */
interface AudioGraph {
  context: AudioContext
  gain: GainNode
  source: AudioBufferSourceNode
}

/** Begrenzt die Lautstaerke sicher auf den Bereich 0 bis 1. */
export function clampVolume(volume: number): number {
  if (Number.isNaN(volume)) {
    return 0
  }
  return Math.min(1, Math.max(0, volume))
}

/**
 * Erzeugt einen weichen, kontinuierlichen Rausch-Klang (gefiltertes Rauschen)
 * ueber die WebAudio-API. Es werden keine Audiodateien geladen - der Klang
 * entsteht vollstaendig zur Laufzeit.
 */
function createAmbientGraph(volume: number): AudioGraph | null {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AudioCtx) {
    return null
  }

  const context = new AudioCtx()

  // Zwei Sekunden rosa-aehnliches Rauschen in einen Loop-Puffer schreiben.
  const bufferSize = context.sampleRate * 2
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < bufferSize; i += 1) {
    const white = Math.random() * 2 - 1
    // Einfacher Tiefpass fuer ein sanfteres, weniger harsches Rauschen.
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }

  const source = context.createBufferSource()
  source.buffer = buffer
  source.loop = true

  // Zusaetzlicher Tiefpassfilter fuer einen ruhigen, warmen Klang.
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 800

  const gain = context.createGain()
  gain.gain.value = clampVolume(volume)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)
  source.start()

  return { context, gain, source }
}

/** Stoppt die Quelle und schliesst den AudioContext sauber. */
function stopGraph(graph: AudioGraph): void {
  try {
    graph.source.stop()
  } catch {
    // Bereits gestoppt - ignorieren.
  }
  graph.source.disconnect()
  graph.gain.disconnect()
  void graph.context.close()
}

/**
 * Haelt einen laufenden Ambient-Klang am Leben, solange `enabled` true ist.
 *
 * Der AudioContext wird erst beim Aktivieren erstellt (also nach einer
 * Nutzergeste) und beim Deaktivieren sauber gestoppt und geschlossen. Der Hook
 * wird dauerhaft in der App gehalten, damit der Klang unabhaengig von einzelnen
 * UI-Komponenten (z. B. dem Einstellungs-Panel) weiterlaeuft.
 */
export function useAmbientSound(enabled: boolean, volume: number): void {
  const graphRef = useRef<AudioGraph | null>(null)

  useEffect(() => {
    if (enabled && !graphRef.current) {
      graphRef.current = createAmbientGraph(volume)
    }
    if (!enabled && graphRef.current) {
      stopGraph(graphRef.current)
      graphRef.current = null
    }
    return () => {
      if (graphRef.current) {
        stopGraph(graphRef.current)
        graphRef.current = null
      }
    }
    // Lautstaerke-Aenderungen werden im zweiten Effekt behandelt, ohne den
    // Graphen neu aufzubauen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.gain.gain.value = clampVolume(volume)
    }
  }, [volume])
}

export default useAmbientSound
