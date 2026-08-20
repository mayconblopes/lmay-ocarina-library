import type { Token } from "./token";
import type { PlaybackItem, RepeatRegion } from "./playbackTypes";

export interface ParseRepeatRegionResult {
  region: RepeatRegion;
  nextIndex: number;
}

export function parseRepeatRegion(
  tokens: Token[],
  startIndex: number,
): ParseRepeatRegionResult {
  const region: RepeatRegion = {
    common: [],
    firstEnding: [],
    secondEnding: [],
  };

  let state: "common" | "first" | "second" = "common";

  let i = startIndex;

  if (isRepeatStart(tokens, i)) {
    i += 2;
  }

  while (i < tokens.length) {
    if (isVolta(tokens, i, "1")) {
      state = "first";
      i += 2;
      continue;
    }

    if (isRepeatEnd(tokens, i)) {
      state = "second";
      i += 2;
      continue;
    }

    if (isVolta(tokens, i, "2")) {
      i += 2;
      continue;
    }

    if (state === "second" && tokens[i].kind === "voltaEnd") {
      return {
        region,
        nextIndex: i + 1,
      };
    }

    if (
      tokens[i].kind === "voltaStart" ||
      tokens[i].kind === "voltaEnd" ||
      tokens[i].kind === "voltaNumber" ||
      tokens[i].kind === "voltaSeparator"
    ) {
      i++;
      continue;
    }

    const item: PlaybackItem = {
      token: tokens[i],
      sourceIndex: i,
      pass: 1,
    };

    switch (state) {
      case "common":
        region.common.push(item);
        break;

      case "first":
        region.firstEnding.push(item);
        break;

      case "second":
        region.secondEnding.push(item);
        break;
    }

    i++;
  }

  return {
    region,
    nextIndex: i,
  };
}

function isRepeatStart(tokens: Token[], index: number): boolean {
  return (
    tokens[index]?.kind === "bar" &&
    tokens[index + 1]?.kind === "colon"
  );
}

function isRepeatEnd(tokens: Token[], index: number): boolean {
  return (
    tokens[index]?.kind === "colon" &&
    tokens[index + 1]?.kind === "bar"
  );
}

function isVolta(
  tokens: Token[],
  index: number,
  number: string,
): boolean {
  return (
    tokens[index]?.kind === "voltaStart" &&
    tokens[index + 1]?.kind === "voltaNumber" &&
    tokens[index + 1].value === number
  );
}
