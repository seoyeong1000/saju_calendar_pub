import type { Engine, BaziInput, BaziOutput } from "./engine.types";
import { ChineseDate } from "date-chinese";

/** 간지 표 */
const heavenly = ["갑","을","병","정","무","기","경","신","임","계"];
const earthly  = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

function gz(ganZhiIndex: number) {
  const g = heavenly[ganZhiIndex % 10];
  const z = earthly[ganZhiIndex % 12];
  return `${g}${z}`;
}

export class DateChineseEngine implements Engine {
  async calc(input: BaziInput): Promise<BaziOutput> {
    const d = new Date(input.localISO);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid localISO");

    // date-chinese는 JS Date(UTC기반)를 받아 중국력으로 변환
    const cd = new ChineseDate();
    cd.fromDate(d); // 지역/타임존 고려 필요: v1은 간단 스모크

    // 간지 인덱스 얻기
    const yGZ = cd.getGanzhiYear();
    const mGZ = cd.getGanzhiMonth();
    const dGZ = cd.getGanzhiDay();
    const hGZ = cd.getGanzhiDayTime(); // 시주: 일간 기준

    return {
      yearPillar: gz(yGZ),
      monthPillar: gz(mGZ),
      dayPillar: gz(dGZ),
      hourPillar: gz(hGZ),
      meta: { engine: "dateChinese" },
    };
  }
}
