/*
 * HeroClock Pomodoro-Zustandsmaschine
 *
 * Reine, testbare Logik fuer den Pomodoro-Zyklus. Die gesamte Phasen- und
 * Dauer-Berechnung lebt hier als Reducer, damit die React-Komponente keine
 * Nebenwirkungen (Klang, Zaehler) innerhalb eines State-Updaters ausfuehren
 * muss. So gibt es genau eine Quelle der Wahrheit fuer die naechste Phase und
 * ihre Dauer.
 */

/** Mogliche Phasen eines Pomodoro-Zyklus. */
export type Phase = 'work' | 'shortBreak' | 'longBreak'

/** Dauer je Phase in Minuten. */
export interface PomodoroDurations {
  workMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
}

/** Vollstaendiger Zustand der Zustandsmaschine. */
export interface PomodoroState {
  /** Aktuelle Phase. */
  phase: Phase
  /** Verbleibende Sekunden in der aktuellen Phase. */
  secondsLeft: number
  /** Laeuft der Timer gerade? */
  isRunning: boolean
  /** Anzahl abgeschlossener Fokus-Phasen. */
  completedWorkSessions: number
  /**
   * Monoton steigender Zaehler der Phasenwechsel. Dient der Komponente als
   * Ausloeser fuer Nebenwirkungen (z. B. Klang) genau einmal pro Wechsel.
   */
  transitionCount: number
  /**
   * true, wenn der zuletzt vollzogene Wechsel in eine Fokus-Phase fuehrte.
   * Steuert die Richtung des Klangs (aufsteigend fuer Fokus, sonst absteigend).
   */
  lastTransitionToWork: boolean
}

/** Mogliche Aktionen der Zustandsmaschine. */
export type PomodoroAction =
  | { type: 'toggleRunning' }
  | { type: 'tick' }
  | { type: 'skip' }
  | { type: 'reset' }
  | { type: 'syncDurations' }

/** Nach wie vielen Fokus-Phasen eine lange Pause folgt. */
export const CYCLES_BEFORE_LONG_BREAK = 4

/** Deutsche Beschriftung je Phase. */
export const PHASE_LABEL: Record<Phase, string> = {
  work: 'Fokus',
  shortBreak: 'Pause',
  longBreak: 'Lange Pause',
}

/** Liefert die Dauer einer Phase in Sekunden (mindestens eine Minute). */
export function durationForPhase(
  phase: Phase,
  durations: PomodoroDurations,
): number {
  switch (phase) {
    case 'work':
      return Math.max(1, Math.round(durations.workMinutes)) * 60
    case 'shortBreak':
      return Math.max(1, Math.round(durations.shortBreakMinutes)) * 60
    case 'longBreak':
      return Math.max(1, Math.round(durations.longBreakMinutes)) * 60
  }
}

/**
 * Berechnet die naechste Phase und den neuen Zaehler abgeschlossener
 * Fokus-Phasen. Dies ist die einzige Stelle, an der der Phasenwechsel
 * entschieden wird.
 */
export function nextPhase(
  phase: Phase,
  completedWorkSessions: number,
): { phase: Phase; completedWorkSessions: number } {
  if (phase === 'work') {
    const completed = completedWorkSessions + 1
    const next: Phase =
      completed % CYCLES_BEFORE_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak'
    return { phase: next, completedWorkSessions: completed }
  }
  return { phase: 'work', completedWorkSessions }
}

/** Erzeugt den Startzustand der Zustandsmaschine. */
export function createInitialState(durations: PomodoroDurations): PomodoroState {
  return {
    phase: 'work',
    secondsLeft: durationForPhase('work', durations),
    isRunning: false,
    completedWorkSessions: 0,
    transitionCount: 0,
    lastTransitionToWork: false,
  }
}

/**
 * Vollzieht einen Phasenwechsel ausgehend vom aktuellen Zustand. Setzt die
 * Dauer der neuen Phase, erhoeht den Wechselzaehler und merkt sich die
 * Klang-Richtung. Diese Funktion ist die einzige Quelle der Wahrheit fuer den
 * Uebergang und wird sowohl beim Erreichen der Null als auch beim manuellen
 * Ueberspringen verwendet.
 */
function transition(
  state: PomodoroState,
  durations: PomodoroDurations,
): PomodoroState {
  const result = nextPhase(state.phase, state.completedWorkSessions)
  return {
    ...state,
    phase: result.phase,
    completedWorkSessions: result.completedWorkSessions,
    secondsLeft: durationForPhase(result.phase, durations),
    transitionCount: state.transitionCount + 1,
    lastTransitionToWork: result.phase === 'work',
  }
}

/**
 * Reiner Reducer der Pomodoro-Zustandsmaschine. Alle Nebenwirkungen (Klang,
 * Timer) bleiben ausserhalb; der Reducer berechnet nur den neuen Zustand.
 */
export function pomodoroReducer(
  state: PomodoroState,
  action: PomodoroAction,
  durations: PomodoroDurations,
): PomodoroState {
  switch (action.type) {
    case 'toggleRunning':
      return { ...state, isRunning: !state.isRunning }
    case 'tick': {
      if (!state.isRunning) {
        return state
      }
      if (state.secondsLeft <= 1) {
        return transition(state, durations)
      }
      return { ...state, secondsLeft: state.secondsLeft - 1 }
    }
    case 'skip':
      return transition(state, durations)
    case 'reset':
      return {
        ...state,
        phase: 'work',
        completedWorkSessions: 0,
        secondsLeft: durationForPhase('work', durations),
        isRunning: false,
      }
    case 'syncDurations': {
      // Nur im pausierten Zustand die verbleibende Zeit an die neue Dauer
      // der aktuellen Phase angleichen.
      if (state.isRunning) {
        return state
      }
      return {
        ...state,
        secondsLeft: durationForPhase(state.phase, durations),
      }
    }
    default:
      return state
  }
}
