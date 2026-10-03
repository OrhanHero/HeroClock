import { useCallback, useEffect, useRef, useState } from 'react'
import { formatMmSs } from '../utils/time'

/** Mogliche Phasen eines Pomodoro-Zyklus. */
type Phase = 'work' | 'shortBreak' | 'longBreak'

interface PomodoroTimerProps {
  /** Dauer einer Fokus-Phase in Minuten. */
  workMinutes: number
  /** Dauer einer kurzen Pause in Minuten. */
  shortBreakMinutes: number
  /** Dauer einer langen Pause in Minuten. */
  longBreakMinutes: number
}

/** Deutsche Beschriftung je Phase. */
const PHASE_LABEL: Record<Phase, string> = {
  work: 'Fokus',
  shortBreak: 'Pause',
  longBreak: 'Lange Pause',
}

/** Nach wie vielen Fokus-Phasen eine lange Pause folgt. */
const CYCLES_BEFORE_LONG_BREAK = 4

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
 * Der Tick laeuft ueber einen setInterval in useEffect und wird sauber
 * aufgeraeumt. Beim Phasenwechsel ertoent ein per WebAudio erzeugter Klang.
 */
function PomodoroTimer({
  workMinutes,
  shortBreakMinutes,
  longBreakMinutes,
}: PomodoroTimerProps) {
  const durationFor = useCallback(
    (phase: Phase): number => {
      switch (phase) {
        case 'work':
          return Math.max(1, Math.round(workMinutes)) * 60
        case 'shortBreak':
          return Math.max(1, Math.round(shortBreakMinutes)) * 60
        case 'longBreak':
          return Math.max(1, Math.round(longBreakMinutes)) * 60
      }
    },
    [workMinutes, shortBreakMinutes, longBreakMinutes],
  )

  const [phase, setPhase] = useState<Phase>('work')
  const [secondsLeft, setSecondsLeft] = useState(() => durationFor('work'))
  const [isRunning, setIsRunning] = useState(false)
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0)

  // Laufenden Zustand in einem Ref spiegeln, damit der Interval-Callback stabil bleibt.
  const phaseRef = useRef(phase)
  const completedRef = useRef(completedWorkSessions)
  phaseRef.current = phase
  completedRef.current = completedWorkSessions

  // Wenn die Dauer-Einstellungen sich aendern und der Timer pausiert ist,
  // die verbleibende Zeit der aktuellen Phase angleichen.
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(durationFor(phaseRef.current))
    }
  }, [durationFor, isRunning])

  // Bestimmt die naechste Phase und wechselt dorthin, inkl. Klang.
  const advancePhase = useCallback(() => {
    const current = phaseRef.current
    let next: Phase
    if (current === 'work') {
      const completed = completedRef.current + 1
      setCompletedWorkSessions(completed)
      next =
        completed % CYCLES_BEFORE_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak'
    } else {
      next = 'work'
    }
    setPhase(next)
    setSecondsLeft(durationFor(next))
    playChime(next === 'work')
  }, [durationFor])

  // Sekunden-Tick ueber setInterval, nur solange der Timer laeuft.
  useEffect(() => {
    if (!isRunning) {
      return
    }
    const id = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          advancePhase()
          return durationFor(
            phaseRef.current === 'work'
              ? completedRef.current % CYCLES_BEFORE_LONG_BREAK === 0
                ? 'longBreak'
                : 'shortBreak'
              : 'work',
          )
        }
        return previous - 1
      })
    }, 1000)
    return () => {
      window.clearInterval(id)
    }
  }, [isRunning, advancePhase, durationFor])

  const handleStartPause = () => {
    setIsRunning((running) => !running)
  }

  const handleReset = () => {
    setIsRunning(false)
    setPhase('work')
    setCompletedWorkSessions(0)
    setSecondsLeft(durationFor('work'))
  }

  const handleSkip = () => {
    advancePhase()
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
