export type NoteId =
  | "A4"
  | "As4"
  | "B4"
  | "C5"
  | "Cs5"
  | "D5"
  | "Ds5"
  | "E5"
  | "F5"
  | "Fs5"
  | "G5"
  | "Gs5"
  | "A5"
  | "As5"
  | "B5"
  | "C6"
  | "Cs6"
  | "D6"
  | "Ds6"
  | "E6"
  | "F6";

export interface NoteInfo {
  id: NoteId;
  label: string;
  octave: 4 | 5 | 6;
  accidental: boolean;
  key: string;
  altKeys?: string[];
  pitch: number;
}

export const NOTES: NoteInfo[] = [
  { id: "A4", label: "A4", octave: 4, accidental: false, key: "a", pitch: 69 },
  { id: "As4", label: "A♯4", octave: 4, accidental: true, key: "a#", altKeys: ["bb"], pitch: 70 },
  { id: "B4", label: "B4", octave: 4, accidental: false, key: "b", altKeys: ["cb"], pitch: 71 },

  { id: "C5", label: "C5", octave: 5, accidental: false, key: "c", altKeys: ["db", "b#"], pitch: 72 },
  { id: "Cs5", label: "C♯5", octave: 5, accidental: true, key: "c#", altKeys: ["db"], pitch: 73 },
  { id: "D5", label: "D5", octave: 5, accidental: false, key: "d", pitch: 74 },
  { id: "Ds5", label: "D♯5", octave: 5, accidental: true, key: "d#", altKeys: ["eb"], pitch: 75 },
  { id: "E5", label: "E5", octave: 5, accidental: false, key: "e", altKeys: ["fb"], pitch: 76 },
  { id: "F5", label: "F5", octave: 5, accidental: false, key: "f", altKeys: ["e#"], pitch: 77 },
  { id: "Fs5", label: "F♯5", octave: 5, accidental: true, key: "f#", altKeys: ["gb"], pitch: 78 },
  { id: "G5", label: "G5", octave: 5, accidental: false, key: "g", pitch: 79 },
  { id: "Gs5", label: "G♯5", octave: 5, accidental: true, key: "g#", altKeys: ["ab"], pitch: 80 },

  { id: "A5", label: "A5", octave: 5, accidental: false, key: "A", pitch: 81 },
  { id: "As5", label: "A♯5", octave: 5, accidental: true, key: "A#", altKeys: ["Bb"], pitch: 82 },
  { id: "B5", label: "B5", octave: 5, accidental: false, key: "B", altKeys: ["Cb"], pitch: 83 },

  { id: "C6", label: "C6", octave: 6, accidental: false, key: "C", altKeys: ["Db", "B#"], pitch: 84 },
  { id: "Cs6", label: "C♯6", octave: 6, accidental: true, key: "C#", altKeys: ["Db"], pitch: 85 },
  { id: "D6", label: "D6", octave: 6, accidental: false, key: "D", pitch: 86 },
  { id: "Ds6", label: "D♯6", octave: 6, accidental: true, key: "D#", altKeys: ["Eb"], pitch: 87 },
  { id: "E6", label: "E6", octave: 6, accidental: false, key: "E", altKeys: ["Fb"], pitch: 88 },
  { id: "F6", label: "F6", octave: 6, accidental: false, key: "F", altKeys: ["E#"], pitch: 89 },
];

export type NoteFigure =
  | "semibreve"
  | "minima"
  | "seminima"
  | "colcheia"
  | "semicolcheia";

export type BeatUnit = NoteFigure;

export interface NoteDuration {
  figure: NoteFigure;
  dotted: boolean;
}

export interface RestInfo {
  key: string;
  label: string;
}

export const REST: RestInfo = {
  key: "R",
  label: "-",
};

const BY_KEY = new Map<string, NoteInfo>();

for (const note of NOTES) {
  BY_KEY.set(note.key, note);

  for (const altKey of note.altKeys ?? []) {
    BY_KEY.set(altKey, note);
  }
}

export function findNote(key: string): NoteInfo | null {
  return BY_KEY.get(key) ?? null;
}

export function durationToQuarterNotes(duration: NoteDuration): number {
  let value: number;

  switch (duration.figure) {
    case "semibreve":
      value = 4;
      break;

    case "minima":
      value = 2;
      break;

    case "seminima":
      value = 1;
      break;

    case "colcheia":
      value = 0.5;
      break;

    case "semicolcheia":
      value = 0.25;
      break;
  }

  return duration.dotted ? value * 1.5 : value;
}

export function beatUnitToQuarterNotes(beatUnit: BeatUnit): number {
  switch (beatUnit) {
    case "semibreve":
      return 4;

    case "minima":
      return 2;

    case "seminima":
      return 1;

    case "colcheia":
      return 0.5;

    case "semicolcheia":
      return 0.25;
  }
}

export function durationToMilliseconds(
  duration: NoteDuration,
  bpm: number,
  beatUnit: BeatUnit = "seminima",
): number {
  const beatDurationMs = 60000 / bpm;
  const beatValue = beatUnitToQuarterNotes(beatUnit);
  const noteValue = durationToQuarterNotes(duration);

  return (noteValue / beatValue) * beatDurationMs;
}

export function inferBeatUnit(timeSignature: string): BeatUnit {
  const parts = timeSignature.split("/");

  if (parts.length !== 2) {
    return "seminima";
  }

  switch (Number(parts[1])) {
    case 1:
      return "semibreve";

    case 2:
      return "minima";

    case 4:
      return "seminima";

    case 8:
      return "colcheia";

    case 16:
      return "semicolcheia";

    default:
      return "seminima";
  }
}

export function noteIdToFrequency(noteId: NoteId): number {
  const note = NOTES.find((item) => item.id === noteId);

  if (!note) {
    throw new Error(`Nota desconhecida: ${noteId}`);
  }

  return 440 * Math.pow(2, (note.pitch - 69) / 12);
}
