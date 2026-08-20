import type { NoteId } from "./notes";

export interface PlayingNote {
  stop(): void;
  finished: Promise<void>;
}

export interface InstrumentEngine {
  resume(): Promise<void>;

  playNote(
    noteId: NoteId,
    durationMs: number,
  ): PlayingNote;

  stopAll(): void;
}
