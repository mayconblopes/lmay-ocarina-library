import { playTone } from './Instrument'
import { findNoteFrequency } from './noteFrequencies'

export async function playNote(
  key: string,
  durationMs: number,
): Promise<void> {
  const frequency = findNoteFrequency(key)

  if (frequency === null) {
    console.warn(`Nota não encontrada para playback: ${key}`)
    return
  }

  await playTone(frequency, durationMs)
}
