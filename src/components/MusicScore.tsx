import { useEffect, useRef } from 'react'
import {
  Accidental,
  Articulation,
  BarlineType,
  Dot,
  Formatter,
  Renderer,
  Stave,
  StaveNote,
  StaveTie,
  Volta,
  Voice,
} from 'vexflow'

import { findOcarinaNote } from './ocarina-tab/noteMap'
import { parseOcarinaTab } from './ocarina-tab/parser'
import type { OcarinaTabToken } from './ocarina-tab/types'

interface MusicScoreProps {
  value: string
  timeSignature: string
  activeTokenIndex: number | null
  measuresPerLine: number
}

const MEASURE_HEIGHT = 150

export default function MusicScore({
  value,
  timeSignature,
  activeTokenIndex,
  measuresPerLine,
}: MusicScoreProps) {
  const scoreCanvasRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorPositionsRef = useRef<Map<number, CursorPosition>>(new Map())

  useEffect(() => {
    const container = scoreCanvasRef.current

    if (!container) {
      return
    }

    const render = () => {
      container.replaceChildren()
      cursorPositionsRef.current.clear()

      const measures = splitMeasures(parseOcarinaTab(value))
      const layout = createLayout(measures, container.clientWidth, measuresPerLine)
      const renderer = new Renderer(container, Renderer.Backends.SVG)
      renderer.resize(
        layout.width,
        Math.max(layout.rows.length, 1) * MEASURE_HEIGHT,
      )

      const context = renderer.getContext()
      const notesBySource = new Map<number, StaveNote>()

      layout.rows.forEach((row, rowIndex) => {
        row.forEach((item, columnIndex) => {
          drawMeasure(
            context,
            item.measure,
            item.width,
            rowIndex,
            columnIndex,
            timeSignature,
            measures.length,
            measuresPerLine,
            cursorPositionsRef.current,
            notesBySource,
          )
        })
      })

      drawTies(context, measures, notesBySource)
      updateCursor(cursorRef.current, cursorPositionsRef.current, activeTokenIndex)
    }

    render()
    const observer = new ResizeObserver(render)
    observer.observe(container)

    return () => observer.disconnect()
  }, [measuresPerLine, timeSignature, value])

  useEffect(() => {
    updateCursor(cursorRef.current, cursorPositionsRef.current, activeTokenIndex)
  }, [activeTokenIndex])

  return (
    <div
      className='relative w-full overflow-hidden rounded-lg bg-white px-2 py-1 text-slate-900'
      aria-label='Partitura musical'
    >
      <div ref={scoreCanvasRef} />
      <div
        ref={cursorRef}
        className='pointer-events-none absolute z-10 hidden w-0.5 rounded-full bg-emerald-100 shadow-[0_0_0_1px_rgba(5,150,105,0.35)]'
        aria-hidden='true'
      />
    </div>
  )
}

interface CursorPosition {
  left: number
  top: number
  height: number
}

function drawMeasure(
  context: ReturnType<Renderer['getContext']>,
  measure: ScoreMeasure,
  width: number,
  row: number,
  column: number,
  timeSignature: string,
  measureCount: number,
  measuresPerLine: number,
  cursorPositions: Map<number, CursorPosition>,
  notesBySource: Map<number, StaveNote>,
) {
  const stave = new Stave(
    column * width,
    row * MEASURE_HEIGHT + 12,
    width,
  )

  if (row === 0 && column === 0) {
    stave.addClef('treble', 'default', '8va').addTimeSignature(timeSignature)
  }

  applyBarlines(stave, measure, measureCount, measuresPerLine)
  applyVolta(stave, measure)

  stave.setContext(context).draw()

  if (measure.tokens.length === 0) {
    return
  }

  const notes = measure.tokens.map(({ token }) => createStaveNote(token))
  const [beats, beatValue] = parseTimeSignature(timeSignature)
  const voice = new Voice({
    num_beats: beats,
    beat_value: beatValue,
  })
  voice.setMode(Voice.Mode.SOFT)
  voice.addTickables(notes)

  measure.breathAfter.forEach(sourceIndex => {
    const noteIndex = measure.tokens.findIndex(item => item.sourceIndex === sourceIndex)
    const note = notes[noteIndex]

    if (note) {
      note.addModifier(new Articulation('a,'), 0)
    }
  })

  new Formatter().joinVoices([voice]).format([voice], Math.max(width - 80, 40))
  voice.draw(context, stave)

  measure.tokens.forEach(({ token, sourceIndex }, noteIndex) => {
    const note = notes[noteIndex]
    notesBySource.set(sourceIndex, note)
    cursorPositions.set(sourceIndex, {
      left: note.getAbsoluteX(),
      top: stave.getYForLine(0) - 14,
      height: 106,
    })
  })
}

function applyBarlines(
  stave: Stave,
  measure: ScoreMeasure,
  measureCount: number,
  measuresPerLine: number,
) {
  const isLast = measure.index === measureCount - 1
  const isLineStart = measure.index % measuresPerLine === 0

  stave.setBegBarType(
    measure.beginRepeat
      ? BarlineType.REPEAT_BEGIN
      : isLineStart
        ? BarlineType.SINGLE
        : BarlineType.NONE,
  )
  stave.setEndBarType(
    measure.endRepeat
      ? BarlineType.REPEAT_END
      : measure.endDouble || isLast
        ? BarlineType.END
        : BarlineType.SINGLE,
  )
}

function applyVolta(stave: Stave, measure: ScoreMeasure) {
  if (measure.voltaLabel) {
    stave.setVoltaType(Volta.type.BEGIN_END, measure.voltaLabel, 0)
  }
}

interface ScoreLayout {
  width: number
  rows: { measure: ScoreMeasure; width: number }[][]
}

function createLayout(
  measures: ScoreMeasure[],
  containerWidth: number,
  maxMeasuresPerLine: number,
): ScoreLayout {
  const width = Math.max(containerWidth, 1)
  const rows: ScoreLayout['rows'] = []
  let row: ScoreLayout['rows'][number] = []
  let rowWidth = 0

  measures.forEach(measure => {
    const preferredWidth = Math.max(150, 70 + measure.length * 28)
    const shouldWrap =
      row.length > 0 &&
      (row.length >= maxMeasuresPerLine || rowWidth + preferredWidth > width)

    if (shouldWrap) {
      rows.push(row)
      row = []
      rowWidth = 0
    }

    row.push({ measure, width: preferredWidth })
    rowWidth += preferredWidth
  })

  if (row.length > 0) {
    rows.push(row)
  }

  rows.forEach(currentRow => {
    const measureWidth = width / currentRow.length
    currentRow.forEach(item => {
      item.width = measureWidth
    })
  })

  return { width, rows }
}

function drawTies(
  context: ReturnType<Renderer['getContext']>,
  measures: ScoreMeasure[],
  notesBySource: Map<number, StaveNote>,
) {
  const notes = measures
    .flatMap(measure => measure.tokens)
    .sort((left, right) => left.sourceIndex - right.sourceIndex)

  notes.forEach((item, index) => {
    if (item.token.kind !== 'note' || !item.token.tieEnd) {
      return
    }

    const next = notes[index + 1]
    const firstNote = notesBySource.get(item.sourceIndex)
    const lastNote = next ? notesBySource.get(next.sourceIndex) : undefined

    if (next?.token.kind === 'note' && firstNote && lastNote) {
      new StaveTie({ firstNote, lastNote })
        .setContext(context)
        .draw()
    }
  })
}

interface ScoreToken {
  token: OcarinaTabToken
  sourceIndex: number
}

interface ScoreMeasure {
  index: number
  tokens: ScoreToken[]
  breathAfter: number[]
  beginRepeat: boolean
  endRepeat: boolean
  endDouble: boolean
  voltaLabel: string | null
}

function splitMeasures(tokens: OcarinaTabToken[]): ScoreMeasure[] {
  const measures: ScoreMeasure[] = []
  let current = createMeasure(0)
  let lastSourceIndex: number | null = null

  tokens.forEach((token, sourceIndex) => {
    if (token.kind === 'bar') {
      if (current.tokens.length > 0 || current.voltaLabel) {
        current.endDouble = tokens[sourceIndex + 1]?.kind === 'bar'
        measures.push(current)
        current = createMeasure(measures.length)
      } else if (measures.length > 0) {
        measures[measures.length - 1].endDouble = true
      }
      return
    }

    if (token.kind === 'note' || token.kind === 'rest') {
      current.tokens.push({ token, sourceIndex })
      lastSourceIndex = sourceIndex
      return
    }

    if (token.kind === 'breath' && lastSourceIndex !== null) {
      current.breathAfter.push(lastSourceIndex)
      return
    }

    if (token.kind === 'colon') {
      if (current.tokens.length === 0) {
        current.beginRepeat = true
      } else {
        current.endRepeat = true
      }
      return
    }

    if (token.kind === 'voltaStart') {
      current.voltaLabel = ''
      return
    }

    if (token.kind === 'voltaNumber' && current.voltaLabel !== null) {
      current.voltaLabel += token.value
      return
    }

    if (token.kind === 'voltaEnd' && current.voltaLabel === '') {
      current.voltaLabel = null
    }
  })

  if (current.tokens.length > 0 || current.voltaLabel || measures.length === 0) {
    measures.push(current)
  }

  return measures
}

function createMeasure(index: number): ScoreMeasure {
  return {
    index,
    tokens: [],
    breathAfter: [],
    beginRepeat: false,
    endRepeat: false,
    endDouble: false,
    voltaLabel: null,
  }
}

function updateCursor(
  cursor: HTMLDivElement | null,
  positions: Map<number, CursorPosition>,
  activeTokenIndex: number | null,
) {
  if (!cursor) {
    return
  }

  const position =
    activeTokenIndex === null ? undefined : positions.get(activeTokenIndex)

  if (!position) {
    cursor.style.display = 'none'
    return
  }

  cursor.style.display = 'block'
  cursor.style.left = `${position.left}px`
  cursor.style.top = `${position.top}px`
  cursor.style.height = `${position.height}px`
}

function createStaveNote(token: OcarinaTabToken): StaveNote {
  if (token.kind === 'rest') {
    const note = new StaveNote({
      keys: ['b/4'],
      duration: `${durationToVexFlow(token.duration)}r`,
    })

    if (token.dotted) {
      note.addModifier(new Dot(), 0)
    }

    return note
  }

  const mappedNote = findOcarinaNote(token.value)
  const pitch = mappedNote?.noteId ?? 'C5'
  const [rawLetter, octave] = pitch.match(/^([A-G]s?)([0-9])$/i)?.slice(1) ?? [
    'C',
    '5',
  ]
  const letter = rawLetter.replace('s', '#').replace('S', '#')
  const note = new StaveNote({
    keys: [`${letter.toLowerCase()}/${Number(octave) - 1}`],
    duration: durationToVexFlow(token.duration),
  })

  if (token.value.includes('#')) {
    note.addModifier(new Accidental('#'), 0)
  } else if (token.value.includes('b')) {
    note.addModifier(new Accidental('b'), 0)
  }

  if (token.dotted) {
    note.addModifier(new Dot(), 0)
  }

  return note
}

function parseTimeSignature(timeSignature: string): [number, number] {
  const [beatsText, beatValueText] = timeSignature.split('/')
  const beats = Number(beatsText)
  const beatValue = Number(beatValueText)

  if (![1, 2, 4, 8, 16].includes(beatValue) || !Number.isFinite(beats)) {
    return [4, 4]
  }

  return [Math.max(beats, 1), beatValue]
}

function durationToVexFlow(duration: string): 'w' | 'h' | 'q' | '8' | '16' {
  switch (duration) {
    case '--':
      return 'w'
    case '-':
      return 'h'
    case '_':
      return '8'
    case '__':
      return '16'
    default:
      return 'q'
  }
}
