import { useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

import { parseTextToTokens } from '../../../lib/tablature/parser'
import { expandRepeats } from '../../../lib/tablature/expandRepeats'
import { buildPlaybackEvents } from '../../../lib/tablature/buildPlaybackEvents'
import { PlaybackEngine } from '../../../lib/tablature/PlaybackEngine'
import { usePressAndHold } from '../../../lib/usePressAndHold'

import { startOcarinaNote, type PlayingNote } from './OcarinaSynth'

import type { Token } from '../../../lib/tablature/token'
import type { BeatUnit } from '../../../lib/tablature/notes'

interface OcarinaTabPlayerProps {
  value: string
  bpm?: number
  beatUnit?: BeatUnit
  onBpmChange?: (bpm: number) => void
  onActiveTokenChange?: (sourceIndex: number | null) => void
  selectedTokenIndex?: number | null
}

type NoteToken = Extract<Token, { kind: 'note' }>

const MIN_BPM = 40
const MAX_BPM = 200

function getTempoName(bpm: number) {
  if (bpm < MIN_BPM || bpm > MAX_BPM) {
    return 'Fora do intervalo permitido'
  }

  if (bpm >= 40 && bpm <= 60) return 'Largo'
  if (bpm >= 61 && bpm <= 76) return 'Adagio'
  if (bpm >= 77 && bpm <= 108) return 'Andante'
  if (bpm >= 109 && bpm <= 120) return 'Allegretto'
  if (bpm >= 121 && bpm <= 168) return 'Allegro'
  if (bpm >= 169 && bpm <= 200) return 'Presto'

  return 'Indefinido'
}

export default function OcarinaTabPlayer({
  value,
  bpm = 100,
  beatUnit = 'seminima',
  onBpmChange,
  onActiveTokenChange,
  selectedTokenIndex = null,
}: OcarinaTabPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [currentBpm, setCurrentBpm] = useState(bpm)
  useEffect(() => {
    setCurrentBpm(bpm)
  }, [bpm])

  const engineRef = useRef<PlaybackEngine | null>(null)
  const currentNoteRef = useRef<PlayingNote | null>(null)

  const events = useMemo(() => {
    const tokens = parseTextToTokens(value)
    const items = expandRepeats(tokens)

    return buildPlaybackEvents(items, currentBpm, beatUnit)
  }, [value, currentBpm, beatUnit])

  useEffect(() => {
    engineRef.current?.stop()
    currentNoteRef.current?.stop()

    currentNoteRef.current = null

    const engine = new PlaybackEngine(events, {
      onEvent(_, event) {
        if (event.moveCursor) {
          onActiveTokenChange?.(event.sourceIndex)
        }

        if (event.token.kind !== 'note') {
          return
        }

        const noteToken: NoteToken = event.token
        const noteKey = noteToken.key
        const durationMs = event.durationMs

        void (async () => {
          const note = await startOcarinaNote(noteKey, durationMs)

          currentNoteRef.current = note

          if (!note) {
            return
          }

          await note.finished

          if (currentNoteRef.current === note) {
            currentNoteRef.current = null
          }
        })()
      },

      onEnd() {
        setPlaying(false)
        onActiveTokenChange?.(null)
      },
    })

    engineRef.current = engine

    return () => {
      engine.stop()

      currentNoteRef.current?.stop()
      currentNoteRef.current = null
    }
  }, [events, onActiveTokenChange])

  function play() {
    const engine = engineRef.current

    if (!engine) {
      return
    }

    if (engine.getCurrentIndex() >= events.length) {
      engine.stop()
    }

    if (engine.getCurrentIndex() === 0 && selectedTokenIndex != null) {
      engine.play(selectedTokenIndex)
    } else {
      engine.play()
    }

    setPlaying(true)
  }

  function pause() {
    engineRef.current?.pause()

    currentNoteRef.current?.stop()
    currentNoteRef.current = null

    setPlaying(false)
  }

  function stop() {
    engineRef.current?.stop()

    currentNoteRef.current?.stop()
    currentNoteRef.current = null

    setPlaying(false)
    onActiveTokenChange?.(null)
  }

  function handleBpmChange(delta: number) {
    const value = Math.min(MAX_BPM, Math.max(MIN_BPM, currentBpm + delta))

    setCurrentBpm(value)
    onBpmChange?.(value)
  }

  const decreaseBpm = usePressAndHold(() => handleBpmChange(-1))
  const increaseBpm = usePressAndHold(() => handleBpmChange(1))

  return (
    <div className='mt-5 flex flex-wrap items-center gap-3'>
      {!playing ? (
        <button
          type='button'
          onClick={play}
          className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90'
        >
          ▶ Play
        </button>
      ) : (
        <button
          type='button'
          onClick={pause}
          className='rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted'
        >
          ⏸ Pause
        </button>
      )}

      <button
        type='button'
        onClick={stop}
        className='rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted'
      >
        ■ Stop
      </button>

      <div className='ml-2 flex items-center gap-2'>
        <label
          htmlFor='ocarina-tab-bpm'
          className='text-sm font-medium text-muted-foreground'
        >
          BPM
        </label>

        <div className='flex items-center rounded-md border border-border bg-muted/40'>
          <button
            type='button'
            {...decreaseBpm}
            disabled={currentBpm <= MIN_BPM}
            className='flex size-7 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
            aria-label='Diminuir BPM'
          >
            <Minus className='size-3.5' aria-hidden='true' />
          </button>

          <span
            id='ocarina-tab-bpm'
            className='min-w-24 px-1 text-center text-[11px] tabular-nums text-muted-foreground'
          >
            {`${getTempoName(currentBpm)}: ${currentBpm}`}
          </span>

          <button
            type='button'
            {...increaseBpm}
            disabled={currentBpm >= MAX_BPM}
            className='flex size-7 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
            aria-label='Aumentar BPM'
          >
            <Plus className='size-3.5' aria-hidden='true' />
          </button>
        </div>
      </div>
    </div>
  )
}
