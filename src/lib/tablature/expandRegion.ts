import type { PlaybackItem, RepeatRegion } from "./playbackTypes";

export function expandRegion(region: RepeatRegion): PlaybackItem[] {
  return [
    ...region.common,

    ...region.firstEnding,

    ...region.common.map((item) => ({
      ...item,
      pass: 2,
    })),

    ...region.secondEnding.map((item) => ({
      ...item,
      pass: 2,
    })),
  ];
}
