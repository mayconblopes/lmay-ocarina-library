import { getAudioContext, resumeAudioContext } from './AudioContext'

export async function playTone(
  frequency: number,
  durationMs: number,
): Promise<void> {
  await resumeAudioContext()

  const audioContext = getAudioContext()

  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency

  oscillator.connect(gain)
  gain.connect(audioContext.destination)

  const now = audioContext.currentTime
  const duration = durationMs / 1000

  const attack = Math.min(0.02, duration / 4)
  const release = Math.min(0.05, duration / 4)

  gain.gain.setValueAtTime(0, now)

  gain.gain.linearRampToValueAtTime(1, now + attack)

  gain.gain.setValueAtTime(
    1,
    Math.max(now + attack, now + duration - release),
  )

  gain.gain.linearRampToValueAtTime(0, now + duration)

  oscillator.start(now)
  oscillator.stop(now + duration)
}
