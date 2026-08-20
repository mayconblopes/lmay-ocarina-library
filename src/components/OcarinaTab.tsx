import { useState } from 'react'
import { findOcarinaNote } from './ocarina-tab/noteMap'
import { parseOcarinaTab } from './ocarina-tab/parser'
import OcarinaTabPlayer from './ocarina-tab/playback/OcarinaTabPlayer'

interface OcarinaTabProps {
  value: string
  title?: string
}

const MIN_FONT_SIZE = 24
const MAX_FONT_SIZE = 64
const DEFAULT_FONT_SIZE = 64

export default function OcarinaTab({ value, title }: OcarinaTabProps) {
  const tokens = parseOcarinaTab(value)

  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)

  return (
    <figure className='my-10 overflow-x-auto rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm'>
      {title && (
        <figcaption className='mb-4 text-sm font-semibold text-foreground'>
          {title}
        </figcaption>
      )}

      <div className='mb-5 flex items-center gap-4'>
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
          onChange={(event) => {
            const value = Number(event.currentTarget.value)

            setFontSize(value)
          }}
          className='w-48'
        />

        <span className='w-12 text-right text-sm tabular-nums text-muted-foreground'>
          {fontSize}px
        </span>
      </div>

      <div
        className='flex flex-wrap items-center gap-x-3 gap-y-2'
        style={{ fontSize: `${fontSize}px` }}
      >
        {tokens.map((token, index) => {
          switch (token.kind) {
            case 'note': {
              const note = findOcarinaNote(token.value)

              return (
                <span
                  key={index}
                  className='inline-flex items-center text-foreground'
                >
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

                  {token.duration && (
                    <span className='font-mono text-[0.6em]'>
                      {token.duration}
                    </span>
                  )}

                  {token.tieEnd && (
                    <span className='font-mono text-[0.6em]'>
                      ~
                    </span>
                  )}
                </span>
              )
            }

            case 'rest':
              return (
                <span
                  key={index}
                  className='font-mono text-[0.6em] italic text-muted-foreground'
                >
                  R{token.duration}
                </span>
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
              return (
                <span key={index} className='w-1' />
              )

            case 'newline':
              return (
                <span key={index} className='basis-full h-0' />
              )

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
      <OcarinaTabPlayer value={value} />
    </figure>
  )
}
