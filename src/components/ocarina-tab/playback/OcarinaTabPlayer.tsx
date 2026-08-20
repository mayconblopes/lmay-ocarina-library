import { useEffect, useMemo, useRef, useState } from 'react'

import { parseTextToTokens } from '../../../lib/tablature/parser'
import { expandRepeats } from '../../../lib/tablature/expandRepeats'
import { buildPlaybackEvents } from '../../../lib/tablature/buildPlaybackEvents'
import { PlaybackEngine } from '../../../lib/tablature/PlaybackEngine'

import {
  startOcarinaNote,
  type PlayingNote,
} from './OcarinaSynth'

interface OcarinaTabPlayerProps {
  value: string
  bpm?: number
}

export default function OcarinaTabPlayer({
  value,
  bpm = 100,
}: OcarinaTabPlayerProps) {
  const [playing, setPlaying] = useState(false)

  const engineRef = useRef<PlaybackEngine | null>(null)
  const currentNoteRef = useRef<PlayingNote | null>(null)

  const events = useMemo(() => {
    const tokens = parseTextToTokens(value)
    const items = expandRepeats(tokens)

    return buildPlaybackEvents(items, bpm, 'seminima')
  }, [value, bpm])

  useEffect(() => {
    engineRef.current?.stop()
    currentNoteRef.current?.stop()

    currentNoteRef.current = null

    const engine = new PlaybackEngine(events, {
      onEvent(_, event) {
        if (event.token.kind !== 'note') {
          return
        }

        const noteToken = event.token

        void (async () => {
          const note = await startOcarinaNote(
            noteToken.key,
            event.durationMs,
          )

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
      },
    })

    engineRef.current = engine

    return () => {
      engine.stop()

      currentNoteRef.current?.stop()
      currentNoteRef.current = null
    }
  }, [events])

  function play() {
    const engine = engineRef.current

    if (!engine) {
      return
    }

    if (engine.getCurrentIndex() >= events.length) {
      engine.stop()
    }

    engine.play()

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
  }

  return (
    <div className='mt-5 flex items-center gap-2'>
      {!playing ? (
        <button
          type='button'
          onClick={play}
          className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
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

      <span className='ml-2 text-sm text-muted-foreground'>
        {bpm} BPM
      </span>
    </div>
  )
}
