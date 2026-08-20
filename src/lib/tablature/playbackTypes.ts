import type { BeatUnit } from "./notes";
import type { Token } from "./token";

export interface PlaybackItem {
  token: Token;

  /**
   * Índice original dentro da tablatura.
   */
  sourceIndex: number;

  /**
   * Número da passagem.
   */
  pass: number;
}

export interface PlaybackEvent {
  token: Token;

  sourceIndex: number;

  pass: number;

  durationMs: number;

  /**
   * Indica se este evento representa uma posição musical
   * que deve mover o cursor visual.
   */
  moveCursor: boolean;
}

export interface PlaybackOptions {
  bpm: number;
  beatUnit: BeatUnit;
}

export interface RepeatRegion {
  common: PlaybackItem[];
  firstEnding: PlaybackItem[];
  secondEnding: PlaybackItem[];
}
