import { parseNoteDuration } from '../../lib/tablature/duration'

interface DurationFigureProps {
  duration: string
  dotted: boolean
  size?: string
  visualScale?: number
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
  size = '0.35em',
  visualScale = 1,
}: DurationFigureProps) {
  const parsedDuration = parseNoteDuration(duration)

  const figure = FIGURES[parsedDuration.figure]
  const scale = FIGURE_SCALE[parsedDuration.figure]

  const isDotted = dotted || parsedDuration.dotted

  return (
    <span
      aria-hidden='true'
      className='inline-flex items-center justify-center leading-none'
    >
      <span
        className='font-noto-music inline-flex items-center'
        style={{
          fontSize: size,
          lineHeight: 1,
          transform: `scale(${scale * visualScale})`,
          transformOrigin: 'center center',
        }}
      >
        {figure}
        {isDotted && '𝅭'}
      </span>
    </span>
  )
}