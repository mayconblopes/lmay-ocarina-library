import { useState } from 'react'
import { findOcarinaNote, getOcarinaSolfegeName } from './ocarina-tab/noteMap'
import { parseOcarinaTab } from './ocarina-tab/parser'
import OcarinaTabPlayer from './ocarina-tab/playback/OcarinaTabPlayer'
import DurationFigure from './ocarina-tab/DurationFigure'

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

  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(
    null,
  )
  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null)

  const isPlaying = activeTokenIndex !== null

  return (
    <figure className='my-10 overflow-x-auto rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm'>
      {title && (
        <figcaption className='mb-4 text-sm font-semibold text-foreground'>
          {title}
        </figcaption>
      )}

      {/* Informações musicais */}
      <div className='mb-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground'>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>Compasso</span>

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

        <div className='flex items-center gap-2'>
          <span className='font-medium'>Andamento</span>

          <span className='flex items-center font-semibold text-foreground'>
            {getBeatUnitLabel(beatUnit)} = {currentBpm}
          </span>
        </div>
      </div>

      <div className='mb-5 flex flex-wrap items-center gap-x-6 gap-y-3'>
        <div className='flex items-center gap-4'>
          <label
            htmlFor='ocarina-tab-size'
            className='shrink-0 text-sm font-medium text-muted-foreground'
          >
            Tamanho
          </label>

          <input
            id='ocarina-tab-size'
            type='range'
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            value={fontSize}
            onChange={event => {
              setFontSize(Number(event.currentTarget.value))
            }}
            className='w-48'
          />

          <span className='w-12 text-right text-sm tabular-nums text-muted-foreground'>
            {Math.round(
              ((fontSize - MIN_FONT_SIZE) / (MAX_FONT_SIZE - MIN_FONT_SIZE)) *
                99 +
                1,
            )}
          </span>
        </div>

        <label className='flex cursor-pointer items-center gap-2 text-sm text-muted-foreground'>
          <input
            type='checkbox'
            checked={showSolfege}
            onChange={event => setShowSolfege(event.currentTarget.checked)}
            className='h-4 w-4'
          />
          Solfejo
        </label>

        <label className='flex cursor-pointer items-center gap-2 text-sm text-muted-foreground'>
          <input
            type='checkbox'
            checked={showDuration}
            onChange={event => setShowDuration(event.currentTarget.checked)}
            className='h-4 w-4'
          />
          Duração
        </label>
      </div>

      <div
        className='flex flex-wrap items-center gap-x-3 gap-y-2'
        style={{ fontSize: `${fontSize}px` }}
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
                      ? 'bg-emerald-100/80 px-1.5 py-0.5 ring-1 ring-emerald-300/80 dark:bg-emerald-100/40 dark:ring-emerald-700'
                      : 'px-1.5 py-0.5',
                  ].join(' ')}
                >
                  {!isPlaying && isSelected && (
                    <span
                      aria-hidden='true'
                      className='pointer-events-none absolute -top-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-600'
                    />
                  )}

                  {/* Digitação + ligadura */}
                  <span className='inline-flex items-center'>
                    {note ? (
                      <span
                        className='font-ocarina'
                        style={{ fontSize: `${fontSize}px` }}
                      >
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

                  {showDuration && (
                    <DurationFigure duration={token.duration} dotted={false} />
                  )}

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
                    <DurationFigure duration={token.duration} dotted={false} />
                  )}
                </div>
              )

            case 'bar':
              return (
                <span
                  key={index}
                  className='mx-1 text-[0.7em] text-muted-foreground'
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
              return <span key={index} className='w-1' />

            case 'newline':
              return <span key={index} className='basis-full h-0' />

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

      <OcarinaTabPlayer
        value={value}
        bpm={currentBpm}
        beatUnit={beatUnit}
        onBpmChange={setCurrentBpm}
        selectedTokenIndex={selectedTokenIndex}
        onActiveTokenChange={setActiveTokenIndex}
      />
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
