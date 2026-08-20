import type { NoteDuration, NoteId } from "./notes";
import { durationToText } from "./duration";
import { findNote, REST } from "./notes";

export type Token =
  | {
      kind: "note";
      id: NoteId;
      key: string;
      duration: NoteDuration;
      tieEnd?: boolean;
    }
  | {
      kind: "rest";
      duration: NoteDuration;
    }
  | { kind: "space" }
  | { kind: "newline" }
  | { kind: "bar" }
  | { kind: "breath" }
  | { kind: "colon" }
  | { kind: "voltaStart" }
  | { kind: "voltaSeparator" }
  | { kind: "voltaEnd" }
  | { kind: "voltaNumber"; value: string };

export function tokensToText(tokens: Token[]): string {
  return tokens
    .map((token) => {
      switch (token.kind) {
        case "note":
          return (
            token.key +
            durationToText(token.duration) +
            (token.tieEnd ? "~" : "")
          );

        case "rest":
          return REST.key + durationToText(token.duration);

        case "space":
          return " ";

        case "newline":
          return "\n";

        case "bar":
          return "|";

        case "breath":
          return ",";

        case "colon":
          return ":";

        case "voltaStart":
          return "[";

        case "voltaNumber":
          return token.value;

        case "voltaSeparator":
          return "+";

        case "voltaEnd":
          return "]";
      }
    })
    .join("");
}

export function createRestToken(): Extract<Token, { kind: "rest" }> {
  return {
    kind: "rest",
    duration: {
      figure: "seminima",
      dotted: false,
    },
  };
}

export function normalizeTokens(tokens: Token[]): Token[] {
  return tokens.map((token) => {
    if (token.kind !== "note") {
      return token;
    }

    const note = findNote(token.id);

    if (!note) {
      return token;
    }

    return {
      ...token,
      key: token.key || note.key,
    };
  });
}
