import type { NoteId } from '../../lib/tablature/notes'

export interface OcarinaNoteGlyph {
  key: string
  glyph: string
  noteId: string
  frequency: number
  altKeys?: string[]
  
}

const SOLFEGE_BY_KEY: Record<string, string> = {
  'a': 'Lá',
  'a#': 'Lá♯',
  'bb': 'Si♭',

  'b': 'Si',
  'cb': 'Dó♭',

  'c': 'Dó',
  'b#': 'Si♯',

  'c#': 'Dó♯',
  'db': 'Ré♭',

  'd': 'Ré',

  'd#': 'Ré♯',
  'eb': 'Mi♭',

  'e': 'Mi',
  'fb': 'Fá♭',

  'f': 'Fá',
  'e#': 'Mi♯',

  'f#': 'Fá♯',
  'gb': 'Sol♭',

  'g': 'Sol',

  'g#': 'Sol♯',
  'ab': 'Lá♭',

  'A': 'Lá',
  'A#': 'Lá♯',
  'Bb': 'Si♭',

  'B:': 'Si',
  'Cb': 'Dó♭',

  'C': 'Dó',
  'B#': 'Si♯',

  'C#': 'Dó♯',
  'Db': 'Ré♭',

  'D': 'Ré',

  'D#': 'Ré♯',
  'Eb': 'Mi♭',

  'E': 'Mi',
  'Fb': 'Fá♭',

  'F': 'Fá',
  'E#': 'Mi♯',
}

export function getOcarinaSolfegeName(key: string): string | null {
  return SOLFEGE_BY_KEY[key] ?? null
}

export const OCARINA_NOTE_GLYPHS: OcarinaNoteGlyph[] = [
  { key: 'a', glyph: 'A', noteId: 'A4', frequency: 440 },

  {
    key: 'a#',
    glyph: 'B',
    noteId: 'As4',
    frequency: 466.16,
    altKeys: ['bb'],
  },

  {
    key: 'b',
    glyph: 'C',
    noteId: 'B4',
    frequency: 493.88,
    altKeys: ['cb'],
  },

  {
    key: 'c',
    glyph: 'D',
    noteId: 'C5',
    frequency: 523.25,
    altKeys: ['b#'],
  },

  {
    key: 'c#',
    glyph: 'E',
    noteId: 'Cs5',
    frequency: 554.37,
    altKeys: ['db'],
  },

  {
    key: 'd',
    glyph: 'F',
    noteId: 'D5',
    frequency: 587.33,
  },

  {
    key: 'd#',
    glyph: 'G',
    noteId: 'Ds5',
    frequency: 622.25,
    altKeys: ['eb'],
  },

  {
    key: 'e',
    glyph: 'H',
    noteId: 'E5',
    frequency: 659.25,
    altKeys: ['fb'],
  },

  {
    key: 'f',
    glyph: 'I',
    noteId: 'F5',
    frequency: 698.46,
    altKeys: ['e#'],
  },

  {
    key: 'f#',
    glyph: 'J',
    noteId: 'Fs5',
    frequency: 739.99,
    altKeys: ['gb'],
  },

  {
    key: 'g',
    glyph: 'K',
    noteId: 'G5',
    frequency: 783.99,
  },

  {
    key: 'g#',
    glyph: 'L',
    noteId: 'Gs5',
    frequency: 830.61,
    altKeys: ['ab'],
  },

  {
    key: 'A',
    glyph: 'M',
    noteId: 'A5',
    frequency: 880,
  },

  {
    key: 'A#',
    glyph: 'N',
    noteId: 'As5',
    frequency: 932.33,
    altKeys: ['Bb'],
  },

  {
    key: 'B',
    glyph: 'O',
    noteId: 'B5',
    frequency: 987.77,
    altKeys: ['Cb'],
  },

  {
    key: 'C',
    glyph: 'P',
    noteId: 'C6',
    frequency: 1046.5,
    altKeys: ['B#'],
  },

  {
    key: 'C#',
    glyph: 'Q',
    noteId: 'Cs6',
    frequency: 1108.73,
    altKeys: ['Db'],
  },

  {
    key: 'D',
    glyph: 'R',
    noteId: 'D6',
    frequency: 1174.66,
  },

  {
    key: 'D#',
    glyph: 'S',
    noteId: 'Ds6',
    frequency: 1244.51,
    altKeys: ['Eb'],
  },

  {
    key: 'E',
    glyph: 'T',
    noteId: 'E6',
    frequency: 1318.51,
    altKeys: ['Fb'],
  },

  {
    key: 'F',
    glyph: 'U',
    noteId: 'F6',
    frequency: 1396.91,
    altKeys: ['E#'],
  },
]

const BY_KEY = new Map<string, OcarinaNoteGlyph>()

for (const note of OCARINA_NOTE_GLYPHS) {
  BY_KEY.set(note.key, note)

  for (const altKey of note.altKeys ?? []) {
    BY_KEY.set(altKey, note)
  }
}

export function findOcarinaNote(
  key: string,
): OcarinaNoteGlyph | null {
  return BY_KEY.get(key) ?? null
}
