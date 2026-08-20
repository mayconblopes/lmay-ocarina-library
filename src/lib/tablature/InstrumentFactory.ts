import type { InstrumentEngine } from "./InstrumentEngine";
import { SynthEngine } from "./SynthEngine";

export type InstrumentType = "synth";

export async function createInstrument(
  type: InstrumentType = "synth",
): Promise<InstrumentEngine> {
  switch (type) {
    case "synth":
      return new SynthEngine();
  }
}
