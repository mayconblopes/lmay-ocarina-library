import type { NoteDuration } from "./notes";

export function parseNoteDuration(text: string): NoteDuration {
  switch (text) {
    case "--.":
      return { figure: "semibreve", dotted: true };

    case "--":
      return { figure: "semibreve", dotted: false };

    case "-.":
      return { figure: "minima", dotted: true };

    case "-":
      return { figure: "minima", dotted: false };

    case "__.":
      return { figure: "semicolcheia", dotted: true };

    case "__":
      return { figure: "semicolcheia", dotted: false };

    case "_.":
      return { figure: "colcheia", dotted: true };

    case "_":
      return { figure: "colcheia", dotted: false };

    case ".":
      return { figure: "seminima", dotted: true };

    default:
      return { figure: "seminima", dotted: false };
  }
}

export function durationToText(duration: NoteDuration): string {
  let text = "";

  switch (duration.figure) {
    case "semibreve":
      text = "--";
      break;

    case "minima":
      text = "-";
      break;

    case "seminima":
      text = "";
      break;

    case "colcheia":
      text = "_";
      break;

    case "semicolcheia":
      text = "__";
      break;
  }

  if (duration.dotted) {
    text += ".";
  }

  return text;
}
