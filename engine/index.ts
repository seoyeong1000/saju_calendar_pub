// engine/index.ts
import type { Engine } from "./engine.types";
import { DateChineseEngine } from "./engine.date";
import { SwissEngine } from "./engine.swiss";

export function createEngine(): Engine {
  const id = (process.env.ENGINE || "swissEph").toLowerCase();
  if (id === "datechinese" || id === "date-chinese") return new DateChineseEngine();
  return new SwissEngine();
}
