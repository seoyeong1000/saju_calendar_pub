// engine/engine.swiss.ts
import type { Engine, BaziInput, BaziOutput } from "./engine.types";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
// 임시: 연/일주는 안정적인 라이브러리로 먼저 산출(다음 단계에서 Swiss로 교체)
import { CalendarChinese } from "date-chinese";

const pexec = promisify(execFile);

// 간지표(10천간, 12지지)
const HG = ["갑","을","병","정","무","기","경","신","임","계"];
const EG = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
const gz = (n: number) => `${HG[n % 10]}${EG[n % 12]}`;

// -------------------------------
// 1) SwissEph: 태양 황경(0~360°) 구하기
// -------------------------------
async function getSunLongitudeBySwiss(iso: string): Promise<number> {
  // 입력 시간 UTC로 변환
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid localISO");
  const utc = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);

  // swetest 인자 만들기 (날짜: DD.MM.YYYY, 시간: -utHH.MMSS)
  const DD = String(utc.getUTCDate()).padStart(2, "0");
  const MM = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const YYYY = utc.getUTCFullYear();
  const hh = String(utc.getUTCHours()).padStart(2, "0");
  const mi = String(utc.getUTCMinutes()).padStart(2, "0");
  const ss = String(utc.getUTCSeconds()).padStart(2, "0");

  const sweExe = process.env.SWE_EXE || "C:\\sweph\\bin\\swetest64.exe";
  const ephe = process.env.SE_EPHE_PATH || "C:\\sweph\\ephe";

  // 핵심 포인트:
  // -edir<path>  : 공백 없이
  // -bDD.MM.YYYY : 날짜
  // -utHH:MM     : UTC 시간
  // -p s         : 태양만 출력(소문자 s = Sun)
  // -eswe        : Swiss Ephem
  const args = [
    `-edir${ephe}`,
    `-b${DD}.${MM}.${YYYY}`,
    (hh === "00" && mi === "00") ? "-ut0" : `-ut${hh}:${mi}`,
    "-p0",         // ← Sun을 인덱스 0으로 명확 지정 (소행성/별 불러오지 않음)
    "-eswe",
  ];


  const { stdout } = await pexec(sweExe, args, { windowsHide: true });

  // 표준 출력에서 태양(Longitude) 추출
  // 예시 라인(버전에 따라 공백 다를 수 있음):
  //  Sun  312°34'56"  ...
  // 또는  Sun   312.5823 ...
  // → 정규식: 'Sun' 이후 첫 번째 '숫자(도)'를 찾음
  const line = stdout.split(/\r?\n/).find(l => /\d/.test(l)) || "";
  // 1) 도·분·초 형식
  let m = line.match(/(\d{1,3})[°\s]+(\d{1,2})['\s]+(\d{1,2})/);
  if (m) {
    const deg = +m[1], min = +m[2], sec = +m[3];
    return deg + min / 60 + sec / 3600;
  }
  // 2) 소수 도수 형식(첫 번째 0~360 사이 실수)
  m = line.match(/(\d{1,3}\.\d{3,})/);
  if (m) {
    const v = parseFloat(m[1]);
    if (v >= 0 && v < 360) return v;
  }
  throw new Error("Sun longitude parse failed:\n" + stdout);
}

// -------------------------------
// 2) 월지(月支): 절기 보정 (태양 황경 → 월지)
//    규칙: 입춘(315°)을 시작으로 30°마다 다음 달지
//    범위: [315,345)=寅, [345,15)=卯, [15,45)=辰, ... 순환
// -------------------------------
function monthBranchFromSunLon(lon: number): number {
  // 315° 기준으로 30° 단위 구간 인덱스
  let idx = Math.floor(((lon - 315 + 360) % 360) / 30);
  if (idx < 0) idx += 12;
  // 寅(2)부터 시작하도록 매핑: 寅, 卯, 辰, 巳, 午, 未, 申, 酉, 戌, 亥, 子, 丑
  const order = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];
  return order[idx]; // 0=자,1=축,2=인...
}

// -------------------------------
// 3) 시주: 진태양시 보정
//   TST = LMT + EoT + Δλ
//   - EoT(시차)와 Δλ(경도 보정)를 간이식으로 처리
//   - lon이 없으면 서울(126.9784E), tzid 없으면 Asia/Seoul(+9) 가정
//   - 시지: 子=23~01, 丑=01~03, ... (2시간 단위)
//   - 시간: 일간을 기준으로 子시의 시작천간을 정해 등차(1)로 진행
// -------------------------------
function toHourBranchIdx(trueSolarDate: Date): number {
  const h = trueSolarDate.getHours();
  const m = trueSolarDate.getMinutes();
  const t = h + m / 60;
  // 子 23:00~00:59 및 00:00~00:59 해석 차이가 있으나,
  // 실무에선 23~01=子, 01~03=丑 …로 간단히 처리
  const map = [
    [23, 24, 0], [0, 1, 0],   // 子
    [1, 3, 1],                // 丑
    [3, 5, 2],                // 寅
    [5, 7, 3],                // 卯
    [7, 9, 4],                // 辰
    [9, 11, 5],               // 巳
    [11, 13, 6],              // 午
    [13, 15, 7],              // 未
    [15, 17, 8],              // 申
    [17, 19, 9],              // 酉
    [19, 21, 10],             // 戌
    [21, 23, 11],             // 亥
  ] as Array<[number, number, number]>;

  for (const [a, b, idx] of map) {
    if ((t >= a && t < b) || (a === 23 && h === 0)) return idx;
  }
  return 0; // fallback: 子
}

// 일간 → 子시 시작천간 인덱스 (甲己=甲, 乙庚=丙, 丙辛=戊, 丁壬=庚, 戊癸=壬)
function hourStemStartByDayStem(dayStemIdx: number): number {
  const group = dayStemIdx % 10; // 0~9
  const table = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]; // 子시 시작천간
  return table[group];
}

// 간이 EoT(시차) 근사 (분 단위) — MVP용
// 참고: 최대 ±16분 정도, 정확도 강화는 다음 단계에서 개선
function approximateEoTMinutes(date: Date): number {
  // Meeus 근사식의 단순화 버전
  const dayOfYear = Math.floor(
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getUTCFullYear(), 0, 0)) /
      86400000
  );
  const B = (2 * Math.PI * (dayOfYear - 81)) / 364;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  return eot; // 분
}

function buildTrueSolarTime(input: BaziInput): Date {
  const tzOffsetHr =
    input.tzid?.startsWith("Asia/Seoul") ? 9 : new Date().getTimezoneOffset() / -60 || 9;
  const lon = typeof input.lon === "number" ? input.lon : 126.9784; // 서울 기본
  // 1) 로컬시각(표준시) Date
  const local = new Date(input.localISO);
  // 2) 경도 보정(분) = 4 * (경도 - 표준자오(15*TZ))
  const stdLon = 15 * tzOffsetHr;
  const deltaLonMin = 4 * (lon - stdLon);
  // 3) 시차(EoT) 분
  const eot = approximateEoTMinutes(local);
  // 4) 진태양시 = 표준시 + (Δλ + EoT)
  const tst = new Date(local.getTime() + (deltaLonMin + eot) * 60_000);
  return tst;
}

// -------------------------------
// 4) 엔진 본체
// -------------------------------
export class SwissEngine implements Engine {
  async calc(input: BaziInput): Promise<BaziOutput> {
    // (임시) 연/일주는 date-chinese로 먼저 얻는다. 월/시는 아래 보정 사용
    const cc = new CalendarChinese();
    cc.fromDate(new Date(input.localISO));

    const sexY = (cc as any).sexagenaryYear?.() ?? 0;
    const sexD = (cc as any).sexagenaryDay?.() ?? 0;
    const yearPillar = gz(sexY);
    const dayPillar = gz(sexD);

    // 1) 월지: 태양 황경으로 결정
    const lon = await getSunLongitudeBySwiss(input.localISO);
    const mBranch = monthBranchFromSunLon(lon);

    // 월간(천간) 산출: 보통 "해당 해의 입춘 기준" 규칙 사용
    // MVP에서는 간단히 '연간'과의 상관식으로 근사(향후 정식식으로 교체)
    const yearStem = sexY % 10;
    // 연간에 따른 월간 시작(寅월부터 10간 순행)
    // 甲己年: 丙寅, 乙庚年: 戊寅, 丙辛年: 庚寅, 丁壬年: 壬寅, 戊癸年: 甲寅
    const monthStartByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // 寅월의 천간 인덱스
    const mStem = (monthStartByYearStem[yearStem] + ((mBranch - 2 + 12) % 12)) % 10;
    const monthPillar = `${HG[mStem]}${EG[mBranch]}`;

    // 2) 시주: 진태양시 기반
    const tst = buildTrueSolarTime(input);
    const hBranch = toHourBranchIdx(tst);

    // 시간 계산(일간 기반)
    const dayStem = sexD % 10;
    const startStem = hourStemStartByDayStem(dayStem); // 子시 시작천간
    const hStem = (startStem + hBranch) % 10;
    const hourPillar = `${HG[hStem]}${EG[hBranch]}`;

    return {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      meta: {
        engine: "swissEph",
        note:
          "월지=태양황경 기반 절기 보정, 시주=진태양시 근사. 연/일주는 임시(date-chinese) 사용(다음 단계 교체 예정).",
      },
    };
  }
}
