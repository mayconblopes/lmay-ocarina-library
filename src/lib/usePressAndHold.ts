import { useEffect, useRef, type KeyboardEvent } from 'react'

const INITIAL_DELAY = 400
const REPEAT_INTERVAL = 60

export function usePressAndHold(action: () => void) {
  const actionRef = useRef(action)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  actionRef.current = action

  const stop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const start = () => {
    stop()
    actionRef.current()

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        actionRef.current()
      }, REPEAT_INTERVAL)
    }, INITIAL_DELAY)
  }

  useEffect(() => stop, [])

  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerCancel: stop,
    onPointerLeave: stop,
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
        event.preventDefault()
        actionRef.current()
      }
    },
  }
}
