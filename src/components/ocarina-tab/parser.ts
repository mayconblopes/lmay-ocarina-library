import type { OcarinaTabToken } from './types'

function parseDuration(text: string, start: number) {
  const remainder = text.slice(start)

  const match = remainder.match(/^(_{1,2}|-{1,2})?(\.)?/)

  const duration = match?.[0] ?? ''

  return {
    duration,
    dotted: duration.endsWith('.'),
    consumed: duration.length,
  }
}

export function parseOcarinaTab(text: string): OcarinaTabToken[] {
  const tokens: OcarinaTabToken[] = []

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '\r') {
      continue
    }

    if (char === '\n') {
      tokens.push({ kind: 'newline' })
      continue
    }

    if (char === ' ') {
      tokens.push({ kind: 'space' })
      continue
    }

    if (char === '|') {
      tokens.push({ kind: 'bar' })
      continue
    }

    if (char === ',') {
      tokens.push({ kind: 'breath' })
      continue
    }

    if (char === ':') {
      tokens.push({ kind: 'colon' })
      continue
    }

    if (char === '[') {
      tokens.push({ kind: 'voltaStart' })
      continue
    }

    if (char === ']') {
      tokens.push({ kind: 'voltaEnd' })
      continue
    }

    if (/\d/.test(char)) {
      let value = char

      while (i + 1 < text.length) {
        const next = text[i + 1]

        if (/\d/.test(next) || next === '+') {
          value += next
          i++
          continue
        }

        break
      }

      tokens.push({
        kind: 'voltaNumber',
        value,
      })

      continue
    }

    /*
     * R representa pausa.
     *
     * Diferentemente das notas, R não possui variações
     * de oitava na sintaxe da tablatura.
     */
    if (char.toUpperCase() === 'R') {
      const { duration, dotted, consumed } = parseDuration(text, i + 1)

      tokens.push({
        kind: 'rest',
        duration,
        dotted,
      })

      i += consumed
      continue
    }

    if (/[A-Za-z]/.test(char)) {
      let value = char
      let consumed = 1

      /*
       * Acidente:
       *
       * a#
       * Bb
       * etc.
       */
      const next = text[i + 1]

      if (next === '#' || next === 'b') {
        value += next
        consumed = 2
      }

      const {
        duration,
        dotted,
        consumed: durationConsumed,
      } = parseDuration(text, i + consumed)

      /*
       * Ligadura:
       *
       * c~
       * c-~
       * c_~
       */
      let tieEnd = false

      const tieIndex = i + consumed + durationConsumed

      if (text[tieIndex] === '~') {
        tieEnd = true
      }

      tokens.push({
        kind: 'note',
        value,
        duration,
        dotted,
        tieEnd,
      })

      i +=
        consumed +
        durationConsumed +
        (tieEnd ? 1 : 0) -
        1

      continue
    }
  }

  return tokens
}