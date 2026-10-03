import { useCallback, useEffect, useState } from 'react'

/**
 * Gemeinsames Praefix fuer alle in localStorage gespeicherten HeroClock-Werte.
 * So lassen sich App-Daten eindeutig von anderen Eintraegen unterscheiden.
 */
export const STORAGE_PREFIX = 'heroclock:'

type SetValue<T> = (value: T | ((previous: T) => T)) => void

function readFromStorage<T>(storageKey: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (raw === null) {
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    // Beschaedigte oder nicht parsbare Werte ignorieren und auf den Fallback zurueckfallen.
    return fallback
  }
}

/**
 * Typisierter localStorage-Hook.
 *
 * Liest den Startwert einmalig aus localStorage (mit sicherem JSON-Parsen und
 * Fallback) und schreibt jede Aenderung zurueck. Das verwendete Schluessel-Praefix
 * sorgt fuer eine konsistente Namensgebung ueber die gesamte App.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const storageKey = `${STORAGE_PREFIX}${key}`

  const [value, setValue] = useState<T>(() => readFromStorage(storageKey, initialValue))

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      // Schreibfehler (z. B. voller Speicher oder privater Modus) still ignorieren.
    }
  }, [storageKey, value])

  const update = useCallback<SetValue<T>>((next) => {
    setValue((previous) =>
      typeof next === 'function' ? (next as (p: T) => T)(previous) : next,
    )
  }, [])

  return [value, update]
}

export default useLocalStorage
