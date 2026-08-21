import { useEffect, useMemo, useRef, useState } from 'react'

import { parseTextToTokens } from '../../../lib/tablature/parser'
import { expandRepeats } from '../../../lib/tablature/expandRepeats'
import { buildPlaybackEvents } from '../../../lib/tablature/buildPlaybackEvents'
import { PlaybackEngine } from '../../../lib/tablature/PlaybackEngine'

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

  function handleBpmChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(event.currentTarget.value)

    setCurrentBpm(value)
    onBpmChange?.(value)
  }

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

        <input
          id='ocarina-tab-bpm'
          type='range'
          min={MIN_BPM}
          max={MAX_BPM}
          step='1'
          value={currentBpm}
          onChange={handleBpmChange}
          className='w-32'
        />

        <span className='w-25 text-right text-sm tabular-nums text-muted-foreground'>
          {`${getTempoName(currentBpm)}: ${currentBpm}`}
        </span>
      </div>
    </div>
  )
}
