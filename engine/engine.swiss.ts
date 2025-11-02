import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Engine, BaziInput, BaziOutput } from "./engine.types";

const pexecFile = promisify(execFile);

function fmtDateForSwetest(localISO: string) {
  const d = new Date(localISO);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid localISO");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export class SwissEngine implements Engine {
  async calc(input: BaziInput): Promise<BaziOutput> {
    const exe  = process.env.SWE_EXE      || "C:\\sweph\\bin\\swetest64.exe";
    const ephe = process.env.SE_EPHE_PATH || "C:\\sweph\\ephe";
    const b = fmtDateForSwetest(input.localISO);

    const args = [`-edir${ephe}`, `-b${b}`, `-ut0`, `-p`, `-eswe`];
    const { stdout } = await pexecFile(exe, args, { windowsHide: true });

    const preview = stdout.split("\n").slice(0, 6).join("\n");
    return {
      yearPillar: "WIP-연주",
      monthPillar: "WIP-월주",
      dayPillar: "WIP-일주",
      hourPillar: "WIP-시주",
      meta: { engine: "swissEph", preview },
    };
  }
}
