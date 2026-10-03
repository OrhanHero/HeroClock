import { describe, expect, it } from 'vitest'
import {
  createInitialState,
  CYCLES_BEFORE_LONG_BREAK,
  durationForPhase,
  nextPhase,
  pomodoroReducer,
  type PomodoroDurations,
  type PomodoroState,
} from './pomodoro'

const DURATIONS: PomodoroDurations = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
}

/** Fuehrt eine Aktion wiederholt aus. */
function dispatchMany(
  state: PomodoroState,
  action: Parameters<typeof pomodoroReducer>[1],
  times: number,
): PomodoroState {
  let next = state
  for (let i = 0; i < times; i += 1) {
    next = pomodoroReducer(next, action, DURATIONS)
  }
  return next
}

describe('durationForPhase', () => {
  it('rechnet Minuten in Sekunden um', () => {
    expect(durationForPhase('work', DURATIONS)).toBe(25 * 60)
    expect(durationForPhase('shortBreak', DURATIONS)).toBe(5 * 60)
    expect(durationForPhase('longBreak', DURATIONS)).toBe(15 * 60)
  })

  it('erzwingt mindestens eine Minute', () => {
    const tiny: PomodoroDurations = {
      workMinutes: 0,
      shortBreakMinutes: -3,
      longBreakMinutes: 0.4,
    }
    expect(durationForPhase('work', tiny)).toBe(60)
    expect(durationForPhase('shortBreak', tiny)).toBe(60)
    expect(durationForPhase('longBreak', tiny)).toBe(60)
  })
})

describe('nextPhase', () => {
  it('fuehrt von Fokus in die kurze Pause und zaehlt die Fokus-Phase', () => {
    expect(nextPhase('work', 0)).toEqual({
      phase: 'shortBreak',
      completedWorkSessions: 1,
    })
  })

  it('fuehrt nach der vierten Fokus-Phase in die lange Pause', () => {
    expect(nextPhase('work', CYCLES_BEFORE_LONG_BREAK - 1)).toEqual({
      phase: 'longBreak',
      completedWorkSessions: CYCLES_BEFORE_LONG_BREAK,
    })
  })

  it('fuehrt von jeder Pause zurueck in die Fokus-Phase ohne Zaehler zu aendern', () => {
    expect(nextPhase('shortBreak', 2)).toEqual({
      phase: 'work',
      completedWorkSessions: 2,
    })
    expect(nextPhase('longBreak', 4)).toEqual({
      phase: 'work',
      completedWorkSessions: 4,
    })
  })
})

describe('pomodoroReducer', () => {
  it('startet im Fokus-Zustand mit korrekter Dauer', () => {
    const state = createInitialState(DURATIONS)
    expect(state.phase).toBe('work')
    expect(state.secondsLeft).toBe(25 * 60)
    expect(state.isRunning).toBe(false)
    expect(state.completedWorkSessions).toBe(0)
    expect(state.transitionCount).toBe(0)
  })

  it('toggleRunning schaltet den Laufzustand um', () => {
    const state = createInitialState(DURATIONS)
    const running = pomodoroReducer(state, { type: 'toggleRunning' }, DURATIONS)
    expect(running.isRunning).toBe(true)
    const paused = pomodoroReducer(
      running,
      { type: 'toggleRunning' },
      DURATIONS,
    )
    expect(paused.isRunning).toBe(false)
  })

  it('tick dekrementiert nur, solange der Timer laeuft', () => {
    const idle = createInitialState(DURATIONS)
    expect(pomodoroReducer(idle, { type: 'tick' }, DURATIONS).secondsLeft).toBe(
      idle.secondsLeft,
    )

    const running = pomodoroReducer(idle, { type: 'toggleRunning' }, DURATIONS)
    const ticked = pomodoroReducer(running, { type: 'tick' }, DURATIONS)
    expect(ticked.secondsLeft).toBe(running.secondsLeft - 1)
  })

  it('wechselt beim Erreichen der Null von Fokus in die kurze Pause - genau einmal', () => {
    let state = createInitialState(DURATIONS)
    state = pomodoroReducer(state, { type: 'toggleRunning' }, DURATIONS)
    state = { ...state, secondsLeft: 1 }
    const after = pomodoroReducer(state, { type: 'tick' }, DURATIONS)
    expect(after.phase).toBe('shortBreak')
    expect(after.secondsLeft).toBe(5 * 60)
    expect(after.completedWorkSessions).toBe(1)
    // Phase und Dauer stimmen ueberein, der Wechsel wurde genau einmal gezaehlt.
    expect(after.transitionCount).toBe(1)
    expect(after.lastTransitionToWork).toBe(false)
  })

  it('wechselt nach der vierten Fokus-Phase in die lange Pause', () => {
    const state: PomodoroState = {
      ...createInitialState(DURATIONS),
      isRunning: true,
      completedWorkSessions: CYCLES_BEFORE_LONG_BREAK - 1,
      secondsLeft: 1,
    }
    const after = pomodoroReducer(state, { type: 'tick' }, DURATIONS)
    expect(after.phase).toBe('longBreak')
    expect(after.secondsLeft).toBe(15 * 60)
    expect(after.completedWorkSessions).toBe(CYCLES_BEFORE_LONG_BREAK)
  })

  it('wechselt von einer Pause zurueck in die Fokus-Phase', () => {
    const state: PomodoroState = {
      ...createInitialState(DURATIONS),
      phase: 'shortBreak',
      isRunning: true,
      completedWorkSessions: 1,
      secondsLeft: 1,
    }
    const after = pomodoroReducer(state, { type: 'tick' }, DURATIONS)
    expect(after.phase).toBe('work')
    expect(after.secondsLeft).toBe(25 * 60)
    expect(after.completedWorkSessions).toBe(1)
    expect(after.lastTransitionToWork).toBe(true)
  })

  it('skip wechselt die Phase sofort, unabhaengig von der Restzeit', () => {
    const state = createInitialState(DURATIONS)
    const after = pomodoroReducer(state, { type: 'skip' }, DURATIONS)
    expect(after.phase).toBe('shortBreak')
    expect(after.completedWorkSessions).toBe(1)
    expect(after.transitionCount).toBe(1)
  })

  it('durchlaeuft einen vollen Zyklus bis zur langen Pause', () => {
    let state: PomodoroState = {
      ...createInitialState(DURATIONS),
      isRunning: true,
    }
    // Vier Fokus-Phasen (jeweils mit anschliessender Pause) durchspielen.
    const phases: string[] = []
    for (let i = 0; i < 7; i += 1) {
      state = { ...state, secondsLeft: 1 }
      state = pomodoroReducer(state, { type: 'tick' }, DURATIONS)
      phases.push(state.phase)
    }
    // work->short->work->short->work->short->work ... die vierte Fokus-Phase
    // endet in der langen Pause.
    expect(phases).toEqual([
      'shortBreak',
      'work',
      'shortBreak',
      'work',
      'shortBreak',
      'work',
      'longBreak',
    ])
    expect(state.completedWorkSessions).toBe(CYCLES_BEFORE_LONG_BREAK)
  })

  it('reset kehrt zur Fokus-Phase zurueck und stoppt den Timer', () => {
    let state: PomodoroState = {
      ...createInitialState(DURATIONS),
      phase: 'longBreak',
      isRunning: true,
      completedWorkSessions: 4,
      secondsLeft: 42,
    }
    state = pomodoroReducer(state, { type: 'reset' }, DURATIONS)
    expect(state.phase).toBe('work')
    expect(state.isRunning).toBe(false)
    expect(state.completedWorkSessions).toBe(0)
    expect(state.secondsLeft).toBe(25 * 60)
  })

  it('syncDurations gleicht die Restzeit nur im pausierten Zustand an', () => {
    const paused: PomodoroState = {
      ...createInitialState(DURATIONS),
      secondsLeft: 10,
    }
    const synced = pomodoroReducer(paused, { type: 'syncDurations' }, DURATIONS)
    expect(synced.secondsLeft).toBe(25 * 60)

    const running: PomodoroState = {
      ...createInitialState(DURATIONS),
      isRunning: true,
      secondsLeft: 10,
    }
    const unchanged = pomodoroReducer(
      running,
      { type: 'syncDurations' },
      DURATIONS,
    )
    expect(unchanged.secondsLeft).toBe(10)
  })

  it('tick dekrementiert mehrfach ohne vorzeitigen Wechsel', () => {
    let state: PomodoroState = {
      ...createInitialState(DURATIONS),
      isRunning: true,
      secondsLeft: 5,
    }
    state = dispatchMany(state, { type: 'tick' }, 3)
    expect(state.secondsLeft).toBe(2)
    expect(state.phase).toBe('work')
    expect(state.transitionCount).toBe(0)
  })
})
