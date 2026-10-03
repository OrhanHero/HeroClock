import { useCallback, useEffect, useReducer, useRef } from 'react'
import { formatMmSs } from '../utils/time'
import {
  createInitialState,
  PHASE_LABEL,
  pomodoroReducer,
  type PomodoroAction,
  type PomodoroDurations,
  type PomodoroState,
} from '../utils/pomodoro'

interface PomodoroTimerProps {
  /** Dauer einer Fokus-Phase in Minuten. */
  workMinutes: number
  /** Dauer einer kurzen Pause in Minuten. */
  shortBreakMinutes: number
  /** Dauer einer langen Pause in Minuten. */
  longBreakMinutes: number
}

/**
 * Spielt einen kurzen, selbst erzeugten Klang ueber die WebAudio-API ab.
 * Es werden ausschliesslich OscillatorNodes verwendet - keine Audiodateien.
 */
function playChime(ascending: boolean): void {
  if (typeof window === 'undefined') {
    return
  }
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AudioCtx) {
    return
  }

  const ctx = new AudioCtx()
  const now = ctx.currentTime
  // Zwei kurze Toene: aufsteigend beim Start der Fokus-Phase, absteigend fuer Pausen.
  const notes = ascending ? [523.25, 659.25] : [659.25, 523.25]

  notes.forEach((frequency, index) => {
    const start = now + index * 0.18
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start(start)
    oscillator.stop(start + 0.18)
  })

  // Kontext schliessen, sobald die Toene verklungen sind.
  window.setTimeout(() => {
    void ctx.close()
  }, 600)
}

/**
 * Pomodoro-Timer mit Fokus- und Pausen-Phasen.
 *
 * Die gesamte Phasen- und Dauerlogik liegt im reinen `pomodoroReducer`
 * (siehe utils/pomodoro.ts). Der Tick laeuft ueber einen setInterval in
 * useEffect und wird sauber aufgeraeumt. Der Phasenwechsel wird genau einmal
 * im Reducer berechnet; der WebAudio-Klang ertoent als Nebenwirkung in einem
 * Effekt, der auf den Wechselzaehler reagiert - und daher auch unter
 * React.StrictMode nur einmal pro Wechsel spielt.
 */
function PomodoroTimer({
  workMinutes,
  shortBreakMinutes,
  longBreakMinutes,
}: PomodoroTimerProps) {
  const durations: PomodoroDurations = {
    workMinutes,
    shortBreakMinutes,
    longBreakMinutes,
  }

  // Dauer-Einstellungen in einem Ref spiegeln, damit der Reducer stets die
  // aktuellen Werte sieht, ohne dass sich seine Identitaet aendern muss.
  const durationsRef = useRef(durations)
  durationsRef.current = durations

  const reducer = useCallback(
    (state: PomodoroState, action: PomodoroAction) =>
      pomodoroReducer(state, action, durationsRef.current),
    [],
  )

  const [state, dispatch] = useReducer(
    reducer,
    durationsRef.current,
    createInitialState,
  )
  const { phase, secondsLeft, isRunning, completedWorkSessions } = state

  // Beim Aendern der Dauer-Einstellungen die verbleibende Zeit angleichen,
  // solange der Timer pausiert ist.
  useEffect(() => {
    dispatch({ type: 'syncDurations' })
  }, [workMinutes, shortBreakMinutes, longBreakMinutes])

  // Sekunden-Tick ueber setInterval, nur solange der Timer laeuft. Der Tick
  // dekrementiert bzw. loest beim Erreichen der Null den Phasenwechsel im
  // Reducer aus - ohne hier selbst Nebenwirkungen auszufuehren.
  useEffect(() => {
    if (!isRunning) {
      return
    }
    const id = window.setInterval(() => {
      dispatch({ type: 'tick' })
    }, 1000)
    return () => {
      window.clearInterval(id)
    }
  }, [isRunning])

  // Klang als Nebenwirkung genau einmal pro Phasenwechsel. Der Effekt haengt
  // am monotonen Wechselzaehler, daher spielt er auch unter StrictMode nicht
  // doppelt und greift nicht in die State-Berechnung ein.
  const lastTransitionRef = useRef(0)
  useEffect(() => {
    if (state.transitionCount === 0) {
      return
    }
    if (state.transitionCount === lastTransitionRef.current) {
      return
    }
    lastTransitionRef.current = state.transitionCount
    playChime(state.lastTransitionToWork)
  }, [state.transitionCount, state.lastTransitionToWork])

  const handleStartPause = () => {
    dispatch({ type: 'toggleRunning' })
  }

  const handleReset = () => {
    dispatch({ type: 'reset' })
  }

  const handleSkip = () => {
    dispatch({ type: 'skip' })
  }

  return (
    <div className="pomodoro">
      <div className="pomodoro__phase" data-phase={phase}>
        {PHASE_LABEL[phase]}
      </div>
      <div
        className="pomodoro__time"
        role="timer"
        aria-live="polite"
        aria-label={`Verbleibende Zeit in der Phase ${PHASE_LABEL[phase]}`}
      >
        {formatMmSs(secondsLeft)}
      </div>
      <p className="pomodoro__cycle">
        Abgeschlossene Fokus-Phasen: {completedWorkSessions}
      </p>
      <div className="pomodoro__controls">
        <button
          type="button"
          className="pomodoro__button pomodoro__button--primary"
          onClick={handleStartPause}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          className="pomodoro__button"
          onClick={handleSkip}
        >
          Ueberspringen
        </button>
        <button
          type="button"
          className="pomodoro__button"
          onClick={handleReset}
        >
          Zuruecksetzen
        </button>
      </div>
    </div>
  )
}

export default PomodoroTimer
