import type { Token } from "./token";
import type { PlaybackItem } from "./playbackTypes";

import { parseRepeatRegion } from "./parseRepeatRegion";
import { expandRegion } from "./expandRegion";

function isRepeatStart(tokens: Token[], index: number): boolean {
  return (
    tokens[index]?.kind === "bar" &&
    tokens[index + 1]?.kind === "colon"
  );
}

export function expandRepeats(tokens: Token[]): PlaybackItem[] {
  const result: PlaybackItem[] = [];

  let i = 0;

  while (i < tokens.length) {
    if (isRepeatStart(tokens, i)) {
      const { region, nextIndex } = parseRepeatRegion(tokens, i);

      result.push(...expandRegion(region));

      i = nextIndex;
      continue;
    }

    result.push({
      token: tokens[i],
      sourceIndex: i,
      pass: 1,
    });

    i++;
  }

  return result;
}
