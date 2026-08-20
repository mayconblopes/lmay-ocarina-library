import type { NoteId } from "./notes";
import { noteIdToFrequency } from "./notes";
import { getAudioContext } from "./AudioContext";
import type {
  InstrumentEngine,
  PlayingNote,
} from "./InstrumentEngine";

export class SynthEngine implements InstrumentEngine {
  private context: AudioContext;

  private activeNotes = new Set<PlayingNote>();

  constructor() {
    this.context = getAudioContext();
  }

  async resume(): Promise<void> {
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  playNote(
    noteId: NoteId,
    durationMs: number,
  ): PlayingNote {
    const frequency = noteIdToFrequency(noteId);

    const oscillator =
      this.context.createOscillator();

    const gain =
      this.context.createGain();

    const now = this.context.currentTime;

    const duration = Math.max(
      0.01,
      durationMs / 1000,
    );

    const attack = Math.min(
      0.02,
      duration / 4,
    );

    const release = Math.min(
      0.05,
      duration / 3,
    );

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      frequency,
      now,
    );

    gain.gain.setValueAtTime(
      0,
      now,
    );

    gain.gain.linearRampToValueAtTime(
      0.18,
      now + attack,
    );

    const releaseStart = Math.max(
      now + attack,
      now + duration - release,
    );

    gain.gain.setValueAtTime(
      0.18,
      releaseStart,
    );

    gain.gain.linearRampToValueAtTime(
      0,
      now + duration,
    );

    oscillator.connect(gain);
    gain.connect(this.context.destination);

    let stopped = false;
    let resolveFinished!: () => void;

    const finished = new Promise<void>(
      (resolve) => {
        resolveFinished = resolve;
      },
    );

    const playingNote: PlayingNote = {
      finished,

      stop: () => {
        if (stopped) {
          return;
        }

        stopped = true;

        const stopTime =
          this.context.currentTime;

        const fadeTime = 0.015;

        gain.gain.cancelScheduledValues(
          stopTime,
        );

        gain.gain.setValueAtTime(
          gain.gain.value,
          stopTime,
        );

        gain.gain.linearRampToValueAtTime(
          0,
          stopTime + fadeTime,
        );

        try {
          oscillator.stop(
            stopTime + fadeTime,
          );
        } catch {
          // Oscillator already stopped.
        }
      },
    };

    oscillator.onended = () => {
      this.activeNotes.delete(
        playingNote,
      );

      resolveFinished();
    };

    this.activeNotes.add(
      playingNote,
    );

    oscillator.start(now);

    oscillator.stop(
      now + duration,
    );

    return playingNote;
  }

  stopAll(): void {
    for (const note of this.activeNotes) {
      note.stop();
    }

    this.activeNotes.clear();
  }
}
