import { useEffect, useRef, useState } from 'react'
import { Minus, Music2, Plus, RotateCw, SlidersHorizontal } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { findOcarinaNote, getOcarinaSolfegeName } from './ocarina-tab/noteMap'
import { parseOcarinaTab } from './ocarina-tab/parser'
import OcarinaTabPlayer from './ocarina-tab/playback/OcarinaTabPlayer'
import DurationFigure from './ocarina-tab/DurationFigure'
import MusicScore from './MusicScore'
import { usePressAndHold } from '../lib/usePressAndHold'

import type { BeatUnit } from '../lib/tablature/notes'

interface OcarinaTabProps {
  value: string
  title?: string
  timeSignature?: string
  bpm?: number
  beatUnit?: BeatUnit
}

const MIN_FONT_SIZE = 24
const MAX_FONT_SIZE = 64
const DEFAULT_FONT_SIZE = 64
const DEFAULT_BPM = 100

type ViewMode = 'tab' | 'score'

type ControlFeedback =
  | {
      type: 'fontSize'
      value: number
    }
  | {
      type: 'bpm'
      value: number
    }
  | null

export default function OcarinaTab({
  value,
  title,
  timeSignature = '4/4',
  bpm = DEFAULT_BPM,
  beatUnit = 'seminima',
}: OcarinaTabProps) {
  const tokens = parseOcarinaTab(value)

  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)
  const [showSolfege, setShowSolfege] = useState(true)
  const [showDuration, setShowDuration] = useState(true)
  const [currentBpm, setCurrentBpm] = useState(bpm)
  const [viewMode, setViewMode] = useState<ViewMode>('tab')
  const [measuresPerLine, setMeasuresPerLine] = useState(1)
  const [isMobilePortrait, setIsMobilePortrait] = useState(false)

  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(
    null,
  )

  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null)

  /*
   * Feedback visual temporário dos controles:
   *
   * - fontSize → percentual de 1 a 100
   * - bpm      → valor atual do BPM
   */
  const [controlFeedback, setControlFeedback] =
    useState<ControlFeedback>(null)

  /*
   * Timer usado exclusivamente para o feedback do BPM.
   *
   * Cada alteração de BPM reinicia o timer. Assim, enquanto
   * o usuário estiver mantendo o botão pressionado e o valor
   * continuar mudando, o feedback permanecerá visível.
   */
  const bpmFeedbackTimeoutRef = useRef<number | null>(null)

  const isPlaying = activeTokenIndex !== null

  /*
   * O valor mostrado no pequeno controle de tamanho
   * é uma escala de 1 a 100.
   */
  const fontSizePercentage = Math.round(
    ((fontSize - MIN_FONT_SIZE) /
      (MAX_FONT_SIZE - MIN_FONT_SIZE)) *
      99 +
      1,
  )

  /*
   * --------------------------------------------------------------------------
   * TAMANHO DA TABLATURA
   * --------------------------------------------------------------------------
   *
   * Não colocamos onPointerDown/onPointerUp diretamente no botão,
   * porque esses handlers poderiam sobrescrever handlers fornecidos
   * pelo usePressAndHold através de {...decreaseFontSize} e
   * {...increaseFontSize}.
   *
   * O feedback é controlado por eventos em capture no container.
   */

  const decreaseFontSize = usePressAndHold(() => {
    setFontSize(size => Math.max(MIN_FONT_SIZE, size - 1))
  })

  const increaseFontSize = usePressAndHold(() => {
    setFontSize(size => Math.min(MAX_FONT_SIZE, size + 1))
  })

  const beginFontSizeFeedback = () => {
    setControlFeedback({
      type: 'fontSize',
      value: fontSizePercentage,
    })
  }

  const endFontSizeFeedback = () => {
    setControlFeedback(null)
  }

  /*
   * Enquanto o botão estiver pressionado, o usePressAndHold altera
   * fontSize. Sempre que fontSize mudar, atualizamos o valor grande
   * mostrado no centro da tela.
   */
  useEffect(() => {
    setControlFeedback(feedback => {
      if (feedback?.type !== 'fontSize') {
        return feedback
      }

      return {
        type: 'fontSize',
        value: fontSizePercentage,
      }
    })
  }, [fontSize, fontSizePercentage])

  /*
   * --------------------------------------------------------------------------
   * BPM
   * --------------------------------------------------------------------------
   */

  const handleBpmChange = (nextBpm: number) => {
    setCurrentBpm(nextBpm)

    /*
     * Atualiza imediatamente o feedback visual.
     */
    setControlFeedback({
      type: 'bpm',
      value: nextBpm,
    })

    /*
     * Se o usuário continuar segurando o botão, o player continuará
     * chamando onBpmChange. Cada chamada reinicia este timer.
     */
    if (bpmFeedbackTimeoutRef.current !== null) {
      window.clearTimeout(bpmFeedbackTimeoutRef.current)
    }

    bpmFeedbackTimeoutRef.current = window.setTimeout(() => {
      setControlFeedback(feedback => {
        if (feedback?.type !== 'bpm') {
          return feedback
        }

        return null
      })

      bpmFeedbackTimeoutRef.current = null
    }, 500)
  }

  /*
   * Limpeza do timer quando o componente desmontar.
   */
  useEffect(() => {
    return () => {
      if (bpmFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(bpmFeedbackTimeoutRef.current)
      }
    }
  }, [])

  /*
   * --------------------------------------------------------------------------
   * ORIENTAÇÃO
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(max-width: 767px) and (orientation: portrait)',
    )

    const updateMobilePortrait = () => {
      setIsMobilePortrait(mediaQuery.matches)
    }

    updateMobilePortrait()
    mediaQuery.addEventListener('change', updateMobilePortrait)

    return () => mediaQuery.removeEventListener('change', updateMobilePortrait)
  }, [])

  const mobilePortraitMeasuresPerLine = isMobilePortrait
    ? Math.min(measuresPerLine, 3)
    : measuresPerLine

  const measuresPerLineOptions = isMobilePortrait
    ? [1, 2, 3]
    : [1, 2, 3, 4, 5]

  return (
    <figure className='my-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm'>
      {/* ============================================================
          Feedback visual
          ============================================================ */}

      {controlFeedback && (
        <div
          className='pointer-events-none fixed inset-0 z-[100] flex items-center justify-center'
          aria-hidden='true'
        >
          <div className='rounded-2xl border border-border bg-background/95 px-10 py-6 shadow-2xl backdrop-blur-sm'>
            <span className='block min-w-[5rem] text-center text-7xl font-bold tabular-nums text-foreground'>
              {controlFeedback.value}
            </span>
          </div>
        </div>
      )}

      {/* ============================================================
          Orientação
          ============================================================ */}

      <div className='hidden border-b border-yellow-400 bg-yellow-100 px-4 py-3 max-[767px]:portrait:flex'>
        <div className='flex w-full items-center justify-center gap-2 text-center text-xs font-bold text-yellow-900'>
          <RotateCw className='size-4 shrink-0' aria-hidden='true' />

          <span>Melhor visualização em modo paisagem.</span>
        </div>
      </div>

      {/* ============================================================
          Cabeçalho
          ============================================================ */}

      <div className='px-6 pt-5 max-[640px]:px-4'>
        {title && (
          <figcaption className='mb-5 text-base font-semibold text-foreground'>
            {title}
          </figcaption>
        )}

        {/* ==========================================================
            Informações musicais
            ========================================================== */}

        <div className='mb-5 flex flex-wrap items-center gap-3 max-[640px]:gap-2'>
          {/* Compasso */}

          <div className='flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 max-[640px]:px-2.5'>
            <Music2
              className='size-4 shrink-0 text-muted-foreground'
              aria-hidden='true'
            />

            <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              Compasso
            </span>

            <span className='flex items-center font-semibold text-foreground'>
              {timeSignature.split('/')[0]}

              <DurationFigure
                duration={beatUnit}
                dotted={false}
                size='8px'
                visualScale={1.75}
              />
            </span>
          </div>

          {/* Andamento */}

          <div className='flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 max-[640px]:px-2.5'>
            <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              Andamento
            </span>

            <span className='font-semibold text-foreground'>
              {getBeatUnitLabel(beatUnit)} = {currentBpm}
            </span>
          </div>
        </div>

        {/* ==========================================================
            Controles
            ========================================================== */}

        <div className='mb-5 flex flex-wrap items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-stretch'>
          {/* --------------------------------------------------------
              Modo de exibição
              -------------------------------------------------------- */}

          <ToggleGroup
            value={[viewMode]}
            onValueChange={values => {
              const nextValue = values[0]

              if (nextValue === 'tab' || nextValue === 'score') {
                setViewMode(nextValue)
              }
            }}
            className='w-fit rounded-lg border border-border bg-muted/40 p-1 max-[640px]:w-full'
            aria-label='Modo de exibição'
          >
            <ToggleGroupItem
              value='tab'
              aria-label='Exibir tablatura'
              className='gap-2 px-3 max-[640px]:flex-1'
            >
              <SlidersHorizontal className='size-4' aria-hidden='true' />

              <span>Tablatura</span>
            </ToggleGroupItem>

            <ToggleGroupItem
              value='score'
              aria-label='Exibir partitura'
              className='gap-2 px-3 max-[640px]:flex-1'
            >
              <Music2 className='size-4' aria-hidden='true' />

              <span>Partitura</span>
            </ToggleGroupItem>
          </ToggleGroup>

          {/* --------------------------------------------------------
              Controles específicos da visualização
              -------------------------------------------------------- */}

          <div className='flex flex-wrap items-center gap-x-5 gap-y-3 max-[640px]:w-full'>
            {/* ======================================================
                Controles da tablatura
                ====================================================== */}

            {viewMode === 'tab' && (
              <>
                {/* Tamanho */}

                <div
                  className='flex min-w-0 items-center gap-3 max-[640px]:w-full'
                  onPointerDownCapture={beginFontSizeFeedback}
                  onPointerUpCapture={endFontSizeFeedback}
                  onPointerCancelCapture={endFontSizeFeedback}
                >

                  <div className='flex items-center rounded-md border border-border bg-muted/40'>
                    <button
                      type='button'
                      {...decreaseFontSize}
                      disabled={fontSize <= MIN_FONT_SIZE}
                      className='flex size-7 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
                      aria-label='Diminuir tamanho da tablatura'
                    >
                      <Minus className='size-3.5' aria-hidden='true' />
                    </button>

                    <span className='min-w-9 text-center text-sm tabular-nums text-muted-foreground'>
                      Tamanho: {fontSizePercentage}
                    </span>

                    <button
                      type='button'
                      {...increaseFontSize}
                      disabled={fontSize >= MAX_FONT_SIZE}
                      className='flex size-7 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
                      aria-label='Aumentar tamanho da tablatura'
                    >
                      <Plus className='size-3.5' aria-hidden='true' />
                    </button>
                  </div>
                </div>

                {/* Opções */}

                <div className='flex items-center gap-5 max-[640px]:w-full max-[640px]:justify-center'>
                  {/* Solfejo */}

                  <label className='flex cursor-pointer items-center gap-2 text-sm text-muted-foreground'>
                    <Checkbox
                      checked={showSolfege}
                      onCheckedChange={checked => {
                        setShowSolfege(checked === true)
                      }}
                    />

                    <span>Solfejo</span>
                  </label>

                  {/* Duração */}

                  <label className='flex cursor-pointer items-center gap-2 text-sm text-muted-foreground'>
                    <Checkbox
                      checked={showDuration}
                      onCheckedChange={checked => {
                        setShowDuration(checked === true)
                      }}
                    />

                    <span>Duração</span>
                  </label>
                </div>
              </>
            )}

            {/* ======================================================
                Controles da partitura
                ====================================================== */}

            {viewMode === 'score' && (
              <div className='flex min-w-0 items-center gap-3 max-[640px]:w-full'>
                <span className='shrink-0 text-sm font-medium text-muted-foreground'>
                  Compassos por linha
                </span>

                <ToggleGroup
                  value={[String(measuresPerLine)]}
                  onValueChange={values => {
                    const nextValue = Number(values[0])

                    if (measuresPerLineOptions.includes(nextValue)) {
                      setMeasuresPerLine(nextValue)
                    }
                  }}
                  className='shrink-0 rounded-md border border-border bg-muted/40 p-0.5'
                  aria-label='Compassos por linha'
                >
                  {measuresPerLineOptions.map(value => (
                    <ToggleGroupItem
                      key={value}
                      value={String(value)}
                      aria-label={`${value} compasso${value === 1 ? '' : 's'} por linha`}
                      className='size-7 px-0 text-xs'
                    >
                      {value}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          Área de visualização
          ============================================================ */}

      <div className='px-6 pb-5 max-[640px]:px-4'>
        {viewMode === 'tab' ? (
          <div
            className={[
              'flex flex-wrap items-center',
              'gap-x-3 gap-y-2',
              'max-[767px]:portrait:gap-x-2',
              'max-[767px]:portrait:gap-y-1.5 max-[767px]:portrait:text-[30px]',
            ].join(' ')}
            style={{
              fontSize: `${fontSize}px`,
            }}
          >
            {tokens.map((token, index) => {
              switch (token.kind) {
                case 'note': {
                  const note = findOcarinaNote(token.value)
                  const solfegeName = getOcarinaSolfegeName(token.value)

                  const isSelected = selectedTokenIndex === index
                  const isActive = activeTokenIndex === index

                  return (
                    <span
                      key={index}
                      onClick={() => {
                        if (!isPlaying) {
                          setSelectedTokenIndex(index)
                        }
                      }}
                      className={[
                        'relative inline-flex flex-col items-center',
                        'cursor-pointer select-none',
                        'rounded-md transition-colors',
                        isActive
                          ? [
                              'bg-emerald-100/80',
                              'px-1.5 py-0.5',
                              'ring-1 ring-emerald-300/80',
                              'dark:bg-emerald-100/40',
                              'dark:ring-emerald-700',
                            ].join(' ')
                          : 'px-1.5 py-0.5 hover:bg-muted/60',
                      ].join(' ')}
                    >
                      {!isPlaying && isSelected && (
                        <span
                          aria-hidden='true'
                          className='pointer-events-none absolute -top-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600'
                        />
                      )}

                      {/* Digitação + ligadura */}

                      <span className='inline-flex items-center'>
                        {note ? (
                          <span className='font-ocarina'>
                            {note.glyph}
                          </span>
                        ) : (
                          <span className='font-mono text-[0.75em]'>
                            {token.value}
                          </span>
                        )}

                        {token.tieEnd && (
                          <span className='font-mono text-[0.6em]'>~</span>
                        )}
                      </span>

                      {/* Duração */}

                      {showDuration && (
                        <DurationFigure
                          duration={token.duration}
                          dotted={false}
                        />
                      )}

                      {/* Solfejo */}

                      {showSolfege && solfegeName && (
                        <span
                          className='font-sans text-[0.32em] font-medium leading-none text-muted-foreground'
                          aria-hidden='true'
                        >
                          {solfegeName}
                        </span>
                      )}
                    </span>
                  )
                }

                case 'rest':
                  return (
                    <div
                      key={index}
                      className='relative inline-flex flex-col items-center'
                    >
                      <span className='text-[0.6em] text-muted-foreground'>
                        ¶P{token.duration}
                      </span>

                      {showDuration && (
                        <DurationFigure
                          duration={token.duration}
                          dotted={false}
                        />
                      )}
                    </div>
                  )

                case 'bar':
                  return (
                    <span
                      key={index}
                      className='mx-1 text-[0.7em] text-muted-foreground max-[767px]:portrait:mx-0.5'
                    >
                      |
                    </span>
                  )

                case 'breath':
                  return (
                    <span
                      key={index}
                      className='text-[0.7em] text-muted-foreground'
                    >
                      ,
                    </span>
                  )

                case 'space':
                  return (
                    <span
                      key={index}
                      className='w-1 max-[767px]:portrait:w-0.5'
                    />
                  )

                case 'newline':
                  return <span key={index} className='h-0 basis-full' />

                case 'colon':
                  return (
                    <span
                      key={index}
                      className='text-[0.7em] font-medium text-muted-foreground'
                    >
                      :
                    </span>
                  )

                case 'voltaStart':
                  return (
                    <span
                      key={index}
                      className='text-[0.7em] font-medium text-primary'
                    >
                      [
                    </span>
                  )

                case 'voltaEnd':
                  return (
                    <span
                      key={index}
                      className='text-[0.7em] font-medium text-primary'
                    >
                      ]
                    </span>
                  )

                case 'voltaNumber':
                  return (
                    <span
                      key={index}
                      className='text-[0.5em] font-semibold text-primary'
                    >
                      {token.value}
                    </span>
                  )
              }
            })}
          </div>
        ) : (
          <div className='w-full pb-2'>
            <MusicScore
              value={value}
              timeSignature={timeSignature}
              activeTokenIndex={activeTokenIndex}
              measuresPerLine={mobilePortraitMeasuresPerLine}
            />
          </div>
        )}
      </div>

      {/* ============================================================
          Player
          ============================================================ */}

      <div className='border-t border-border bg-muted/20 px-6 py-3 max-[640px]:px-4'>
        <OcarinaTabPlayer
          value={value}
          bpm={currentBpm}
          beatUnit={beatUnit}
          onBpmChange={handleBpmChange}
          selectedTokenIndex={selectedTokenIndex}
          onActiveTokenChange={setActiveTokenIndex}
        />
      </div>
    </figure>
  )
}

function getBeatUnitLabel(beatUnit: BeatUnit): string {
  switch (beatUnit) {
    case 'semibreve':
      return '𝅝'

    case 'minima':
      return '𝅗𝅥'

    case 'seminima':
      return '𝅘𝅥'

    case 'colcheia':
      return '𝅘𝅥𝅮'

    case 'semicolcheia':
      return '𝅘𝅥𝅯'
  }
}