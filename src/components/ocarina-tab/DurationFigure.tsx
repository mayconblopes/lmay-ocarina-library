import { parseNoteDuration } from '../../lib/tablature/duration'

interface DurationFigureProps {
  duration: string
  dotted: boolean
}

const FIGURES = {
  semibreve: '𝅝',
  minima: '𝅗𝅥',
  seminima: '𝅘𝅥',
  colcheia: '𝅘𝅥𝅮',
  semicolcheia: '𝅘𝅥𝅯',
} as const

/**
 * O Noto Music não possui métricas visuais uniformes entre
 * os diferentes glifos de duração. Estes fatores compensam
 * essa diferença para que as figuras tenham aparência
 * aproximadamente equivalente.
 */
const FIGURE_SCALE = {
  semibreve: 1,
  minima: 1,
  seminima: 1,
  colcheia: 1,
  semicolcheia: 1,
} as const

export default function DurationFigure({
  duration,
  dotted,
}: DurationFigureProps) {
  const parsedDuration = parseNoteDuration(duration)

  const figure = FIGURES[parsedDuration.figure]
  const scale = FIGURE_SCALE[parsedDuration.figure]

  const isDotted = dotted || parsedDuration.dotted

  return (
    <span
      aria-hidden='true'
      className='flex items-center justify-center leading-none'
    >
      <span
        className='font-noto-music inline-flex items-center'
        style={{
          fontSize: '0.4em',
          lineHeight: 1,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {figure}
        {isDotted && '𝅭'}
      </span>
    </span>
  )
}
