import { describe, expect, it } from 'vitest'
import { formatMmSs, formatTime, greetingForHour } from './time'

describe('greetingForHour', () => {
  it('liefert "Guten Morgen" am Rand von 5 bis 10 Uhr', () => {
    expect(greetingForHour(5)).toBe('Guten Morgen')
    expect(greetingForHour(7)).toBe('Guten Morgen')
    expect(greetingForHour(10)).toBe('Guten Morgen')
  })

  it('liefert "Guten Tag" von 11 bis 17 Uhr', () => {
    expect(greetingForHour(11)).toBe('Guten Tag')
    expect(greetingForHour(17)).toBe('Guten Tag')
  })

  it('liefert "Guten Abend" von 18 bis 22 Uhr', () => {
    expect(greetingForHour(18)).toBe('Guten Abend')
    expect(greetingForHour(22)).toBe('Guten Abend')
  })

  it('liefert "Gute Nacht" von 23 bis 4 Uhr', () => {
    expect(greetingForHour(23)).toBe('Gute Nacht')
    expect(greetingForHour(0)).toBe('Gute Nacht')
    expect(greetingForHour(4)).toBe('Gute Nacht')
  })
})

describe('formatTime', () => {
  const date = new Date(2024, 0, 1, 13, 5, 0)

  it('formatiert im 24-Stunden-Format ohne AM/PM', () => {
    const result = formatTime(date, true)
    expect(result).toBe('13:05')
  })

  it('formatiert im 12-Stunden-Format mit Tageszeit-Angabe', () => {
    const result = formatTime(date, false)
    // Enthaelt die Stunde 1 (statt 13) und einen AM/PM-Hinweis.
    expect(result).toMatch(/1[:.]05/)
    expect(result.toLowerCase()).toMatch(/pm|nachm/)
  })
})

describe('formatMmSs', () => {
  it('formatiert Sekunden als mm:ss mit fuehrenden Nullen', () => {
    expect(formatMmSs(0)).toBe('00:00')
    expect(formatMmSs(5)).toBe('00:05')
    expect(formatMmSs(65)).toBe('01:05')
    expect(formatMmSs(1500)).toBe('25:00')
  })

  it('begrenzt negative Werte auf 00:00', () => {
    expect(formatMmSs(-10)).toBe('00:00')
  })

  it('erlaubt Minuten ueber 59', () => {
    expect(formatMmSs(5400)).toBe('90:00')
  })
})
