import {
  beatUnitToQuarterNotes,
  durationToQuarterNotes,
  type BeatUnit,
} from "./notes";

import type { PlaybackEvent, PlaybackItem } from "./playbackTypes";

export function buildPlaybackEvents(
  items: PlaybackItem[],
  bpm: number,
  beatUnit: BeatUnit = "seminima",
): PlaybackEvent[] {
  const events: PlaybackEvent[] = [];

  const beatDurationMs = 60000 / bpm;
  const beatValue = beatUnitToQuarterNotes(beatUnit);

  type NotePlaybackItem = PlaybackItem & {
    token: Extract<PlaybackItem["token"], { kind: "note" }>;
  };

  function findNextNote(
    sourceItems: PlaybackItem[],
    startIndex: number,
  ): { item: NotePlaybackItem; index: number } | null {
    for (let i = startIndex; i < sourceItems.length; i++) {
      const item = sourceItems[i];

      if (item.token.kind === "note") {
        return {
          item: item as NotePlaybackItem,
          index: i,
        };
      }
    }

    return null;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    switch (item.token.kind) {
      case "note": {
        let totalQuarterNotes = durationToQuarterNotes(
          item.token.duration,
        );

        let currentNote = item.token;

        while (currentNote.tieEnd) {
          const next = findNextNote(items, i + 1);

          if (!next || next.item.token.id !== currentNote.id) {
            break;
          }

          totalQuarterNotes += durationToQuarterNotes(
            next.item.token.duration,
          );

          currentNote = next.item.token;
          i = next.index;
        }

        events.push({
          ...item,

          durationMs:
            (totalQuarterNotes / beatValue) *
            beatDurationMs,

          moveCursor: true,
        });

        break;
      }

      case "rest":
        events.push({
          ...item,

          durationMs:
            (durationToQuarterNotes(item.token.duration) /
              beatValue) *
            beatDurationMs,

          moveCursor: false,
        });

        break;

      default:
        events.push({
          ...item,
          durationMs: 0,
          moveCursor: false,
        });
    }
  }

  return events;
}
