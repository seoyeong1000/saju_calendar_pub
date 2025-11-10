import type { Engine } from "./engine.types";
import { DateChineseEngine } from "./engine.date";
import { SwissEngine } from "./engine.swiss";

export function createEngine(): Engine {
  const id = (process.env.ENGINE || "swissEph").toLowerCase();
  if (id === "datechinese" || id === "date-chinese") return new DateChineseEngine();
  // swiss, swisseph, swisseph 등 모든 경우 Swiss Engine 반환
  return new SwissEngine();
}
