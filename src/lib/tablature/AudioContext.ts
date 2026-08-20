let context: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!context) {
    context = new AudioContext();
  }

  return context;
}
