// engine/engine.date.ts
import type { Engine, BaziInput, BaziOutput } from "./engine.types";
import { CalendarChinese } from "date-chinese"; // ← 핵심: ChineseDate가 아님

const heavenly = ["갑","을","병","정","무","기","경","신","임","계"];
const earthly  = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
const gz = (n: number) => `${heavenly[n % 10]}${earthly[n % 12]}`;

export class DateChineseEngine implements Engine {
  async calc(input: BaziInput): Promise<BaziOutput> {
    const d = new Date(input.localISO);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid localISO");

    const cc = new CalendarChinese();
    cc.fromDate(d);

    const y   = (cc as any).sexagenaryYear?.() ?? 0;
    const m   = (cc as any).sexagenaryMonth?.() ?? 0;
    const day = (cc as any).sexagenaryDay?.() ?? 0;
    const hr  = (cc as any).sexagenaryDayTime?.() ?? 0;

    return {
      yearPillar:  gz(y),
      monthPillar: gz(m),
      dayPillar:   gz(day),
      hourPillar:  gz(hr),
      meta: { engine: "dateChinese" },
    };
  }
}
