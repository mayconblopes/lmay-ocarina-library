import { findOcarinaNote } from '../noteMap'
import { getAudioContext, resumeAudioContext } from './AudioContext'

export interface PlayingNote {
  stop: () => void
  finished: Promise<void>
}

export async function startOcarinaNote(
  note: string,
  durationMs: number,
): Promise<PlayingNote | null> {
  const ocarinaNote = findOcarinaNote(note)

  if (!ocarinaNote) {
    return null
  }

  await resumeAudioContext()

  const context = getAudioContext()

  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = ocarinaNote.frequency

  oscillator.connect(gain)
  gain.connect(context.destination)

  const now = context.currentTime
  const duration = Math.max(durationMs / 1000, 0.05)

  const attack = Math.min(0.015, duration / 4)
  const release = Math.min(0.08, duration / 3)

  gain.gain.setValueAtTime(0, now)

  gain.gain.linearRampToValueAtTime(
    0.35,
    now + attack,
  )

  gain.gain.setValueAtTime(
    0.35,
    now + Math.max(attack, duration - release),
  )

  gain.gain.linearRampToValueAtTime(
    0,
    now + duration,
  )

  let stopped = false
  let resolveFinished!: () => void

  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve
  })

  oscillator.onended = () => {
    resolveFinished()
  }

  oscillator.start(now)
  oscillator.stop(now + duration)

  function stop() {
    if (stopped) {
      return
    }

    stopped = true

    const stopTime = context.currentTime
    const fadeTime = 0.015

    gain.gain.cancelScheduledValues(stopTime)
    gain.gain.setValueAtTime(
      gain.gain.value,
      stopTime,
    )

    gain.gain.linearRampToValueAtTime(
      0,
      stopTime + fadeTime,
    )

    oscillator.stop(stopTime + fadeTime)
  }

  return {
    stop,
    finished,
  }
}
