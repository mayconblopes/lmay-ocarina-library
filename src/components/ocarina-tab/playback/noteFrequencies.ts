const FREQUENCIES: Record<string, number> = {
  a: 440.00,
  'a#': 466.16,
  bb: 466.16,
  b: 493.88,
  cb: 493.88,

  c: 523.25,
  'b#': 523.25,
  'c#': 554.37,
  db: 554.37,

  d: 587.33,
  'd#': 622.25,
  eb: 622.25,

  e: 659.26,
  fb: 659.26,

  f: 698.46,
  'e#': 698.46,
  'f#': 739.99,
  gb: 739.99,

  g: 783.99,
  'g#': 830.61,
  ab: 830.61,

  A: 880.00,
  'A#': 932.33,
  Bb: 932.33,
  B: 987.77,
  Cb: 987.77,

  C: 1046.50,
  B#: 1046.50,
  C#: 1108.73,
  Db: 1108.73,

  D: 1174.66,
  D#: 1244.51,
  Eb: 1244.51,

  E: 1318.51,
  Fb: 1318.51,

  F: 1396.91,
  E#: 1396.91,
}

export function findNoteFrequency(key: string): number | null {
  return FREQUENCIES[key] ?? null
}
