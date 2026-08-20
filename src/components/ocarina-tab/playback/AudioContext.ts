let context: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!context) {
    context = new AudioContext()
  }

  return context
}

export async function resumeAudioContext(): Promise<void> {
  const audioContext = getAudioContext()

  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }
}
