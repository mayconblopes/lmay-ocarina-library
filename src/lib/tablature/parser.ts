import { parseNoteDuration } from "./duration";
import { createRestToken } from "./token";
import { findNote, REST } from "./notes";
import type { Token } from "./token";

function parseDuration(text: string, start: number) {
  const remainder = text.slice(start);

  const match = remainder.match(/^(_{1,2}|-{1,2})?(\.)?/);
  const durationText = match?.[0] ?? "";

  return {
    duration: parseNoteDuration(durationText),
    consumed: durationText.length,
  };
}

export function parseTextToTokens(text: string): Token[] {
  const out: Token[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === "\r") {
      continue;
    }

    if (ch === "\n") {
      out.push({ kind: "newline" });
      continue;
    }

    if (ch === " ") {
      out.push({ kind: "space" });
      continue;
    }

    if (ch === "|") {
      out.push({ kind: "bar" });
      continue;
    }

    if (ch === ",") {
      out.push({ kind: "breath" });
      continue;
    }

    if (ch === ":") {
      out.push({ kind: "colon" });
      continue;
    }

    if (ch === "[") {
      out.push({ kind: "voltaStart" });
      continue;
    }

    if (ch === "]") {
      out.push({ kind: "voltaEnd" });
      continue;
    }

    if (ch === "+") {
      out.push({ kind: "voltaSeparator" });
      continue;
    }

    if (ch.toUpperCase() === REST.key) {
      const { duration, consumed } = parseDuration(text, i + 1);

      out.push({
        ...createRestToken(),
        duration,
      });

      i += consumed;
      continue;
    }

    if (/\d/.test(ch)) {
      let value = ch;

      while (i + 1 < text.length) {
        const next = text[i + 1];

        if (/\d/.test(next)) {
          value += next;
          i++;
          continue;
        }

        break;
      }

      out.push({
        kind: "voltaNumber",
        value,
      });

      continue;
    }

    if (/[A-Za-z]/.test(ch)) {
      let key = ch;
      let consumed = 1;

      const next = text[i + 1];

      if (next === "#" || next === "b") {
        const candidate = `${key}${next}`;

        if (findNote(candidate)) {
          key = candidate;
          consumed = 2;
        }
      }

      const note = findNote(key);

      if (!note) {
        continue;
      }

      const {
        duration,
        consumed: durationConsumed,
      } = parseDuration(text, i + consumed);

      let tieEnd = false;

      const nextIndex = i + consumed + durationConsumed;

      if (text[nextIndex] === "~") {
        tieEnd = true;
      }

      out.push({
        kind: "note",
        id: note.id,
        key,
        duration,
        tieEnd,
      });

      i +=
        consumed +
        durationConsumed +
        (tieEnd ? 1 : 0) -
        1;
    }
  }

  return out;
}
