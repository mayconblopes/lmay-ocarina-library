export type OcarinaTabToken =
  | {
      kind: 'note'
      value: string
      duration: string
      dotted: boolean
      tieEnd: boolean
    }
  | {
      kind: 'rest'
      duration: string
      dotted: boolean
    }
  | {
      kind: 'bar'
    }
  | {
      kind: 'breath'
    }
  | {
      kind: 'space'
    }
  | {
      kind: 'newline'
    }
  | {
      kind: 'colon'
    }
  | {
      kind: 'voltaStart'
    }
  | {
      kind: 'voltaEnd'
    }
  | {
      kind: 'voltaNumber'
      value: string
    }