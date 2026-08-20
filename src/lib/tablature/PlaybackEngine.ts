import type { PlaybackEvent } from "./playbackTypes";

export interface PlaybackCallbacks {
  onEvent?: (
    eventIndex: number,
    event: PlaybackEvent,
  ) => void;

  onEnd?: () => void;
}

export class PlaybackEngine {
  private events: PlaybackEvent[];

  private currentIndex = 0;

  private timer: number | null = null;

  private playing = false;

  private callbacks: PlaybackCallbacks;

  private nextEventTime = 0;

  constructor(
    events: PlaybackEvent[],
    callbacks: PlaybackCallbacks = {},
  ) {
    this.events = events;
    this.callbacks = callbacks;
  }

  play(sourceIndex?: number) {
    if (this.playing) {
      return;
    }

    if (sourceIndex != null) {
      const eventIndex = this.events.findIndex(
        (event) => event.sourceIndex === sourceIndex,
      );

      if (eventIndex !== -1) {
        this.currentIndex = eventIndex;
      }
    }

    this.playing = true;

    this.nextEventTime = performance.now();

    this.scheduleCurrent();
  }

  pause() {
    this.playing = false;

    this.clearTimer();
  }

  stop() {
    this.pause();

    this.currentIndex = 0;
    this.nextEventTime = 0;
  }

  seekToSourceIndex(sourceIndex: number) {
    const eventIndex = this.events.findIndex(
      (event) => event.sourceIndex === sourceIndex,
    );

    if (eventIndex !== -1) {
      this.currentIndex = eventIndex;
    }
  }

  seekToCursorIndex(cursorIndex: number) {
    const eventIndex = this.events.findIndex(
      (event) =>
        event.moveCursor &&
        event.sourceIndex >= cursorIndex,
    );

    if (eventIndex !== -1) {
      this.currentIndex = eventIndex;
    }
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  isPlaying() {
    return this.playing;
  }

  private scheduleCurrent() {
    if (!this.playing) {
      return;
    }

    if (this.currentIndex >= this.events.length) {
      this.playing = false;

      this.clearTimer();

      this.callbacks.onEnd?.();

      return;
    }

    const event = this.events[this.currentIndex];

    this.callbacks.onEvent?.(
      this.currentIndex,
      event,
    );

    this.nextEventTime += event.durationMs;

    const delay = Math.max(
      0,
      this.nextEventTime - performance.now(),
    );

    this.timer = window.setTimeout(() => {
      this.currentIndex++;

      this.scheduleCurrent();
    }, delay);
  }

  private clearTimer() {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
