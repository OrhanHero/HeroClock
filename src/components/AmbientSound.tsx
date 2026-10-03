interface AmbientSoundProps {
  /** Ist das Umgebungsgeraeusch aktiviert? */
  enabled: boolean
  /** Lautstaerke von 0 bis 1. */
  volume: number
  /** Aktivierung umschalten. */
  onToggle: (enabled: boolean) => void
  /** Lautstaerke aendern. */
  onVolumeChange: (volume: number) => void
}

/**
 * Steuerelemente fuer das selbst erzeugte Umgebungsgeraeusch (An/Aus und
 * Lautstaerke). Der eigentliche WebAudio-Klang wird vom Hook `useAmbientSound`
 * in der App erzeugt und laeuft unabhaengig von dieser Komponente weiter.
 *
 * Es werden ausschliesslich zur Laufzeit erzeugte Klaenge verwendet - keine
 * externen Audiodateien.
 */
function AmbientSound({
  enabled,
  volume,
  onToggle,
  onVolumeChange,
}: AmbientSoundProps) {
  return (
    <div className="ambient">
      <div
        className="settings-segmented"
        role="group"
        aria-label="Umgebungsgeraeusch an oder aus"
      >
        <button type="button" aria-pressed={enabled} onClick={() => onToggle(true)}>
          An
        </button>
        <button
          type="button"
          aria-pressed={!enabled}
          onClick={() => onToggle(false)}
        >
          Aus
        </button>
      </div>

      <label className="ambient__volume">
        <span className="settings-field__hint">Lautstaerke</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          disabled={!enabled}
          aria-label="Lautstaerke des Umgebungsgeraeuschs"
          onChange={(event) => onVolumeChange(Number(event.target.value))}
        />
      </label>

      <p className="settings-field__hint">
        Sanftes, zur Laufzeit erzeugtes Rauschen (WebAudio) - keine externen
        Audiodateien.
      </p>
    </div>
  )
}

export default AmbientSound
