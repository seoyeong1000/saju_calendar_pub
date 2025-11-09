// engine/engine.swiss.ts
// ⬇️ 이 파일 전체를 그대로 덮어쓰기 하세요.
import type { Engine, BaziInput, BaziOutput } from "./engine.types";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { CalendarChinese } from "date-chinese";

const pexec = promisify(execFile);

// 천간/지지
const HG = ["갑","을","병","정","무","기","경","신","임","계"] as const;
const EG = ["자","축","인","묘","진","사","오","미","신","유","술","해"] as const;
const gz = (n: number) => `${HG[n % 10]}${EG[n % 12]}`;

/* ──────────────────────────────────────────────────────────
   시간·타임존 유틸
   ────────────────────────────────────────────────────────── */

/** localISO: 'YYYY-MM-DDTHH:mm' 또는 'YYYY-MM-DDTHH:mm:ss' → 숫자 파트 */
function parseLocalISO(localISO: string) {
  const m = localISO.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) throw new Error('localISO must be YYYY-MM-DDTHH:mm or :ss');
  const [_, Y,M,D,h,mi,ss] = m;
  return { Y:+Y, M:+M, D:+D, h:+h, mi:+mi, ss: ss?+ss:0 };
}

/** tz 오프셋(분): input.tzMinutes 우선, 없으면 tzid로 계산(Asia/Seoul=540) */
function resolveTzOffsetMin(localISO: string, tzid?: string, tzMinutes?: number): number {
  if (typeof tzMinutes === 'number' && Number.isFinite(tzMinutes)) return tzMinutes;
  if (!tzid) return 0; // 미지정 시 UTC 가정

  // 벽시(localISO)와 해당 tz의 '보이는 시각' 차이로 오프셋 산출 (DST 포함 안전)
  const { Y,M,D,h,mi,ss } = parseLocalISO(localISO);
  const fakeUtc = Date.UTC(Y, M-1, D, h, mi, ss); // 벽시를 UTC로 가정한 epoch
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tzid, hour12:false,
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit',
    timeZoneName:'shortOffset'
  });
  const parts = fmt.formatToParts(fakeUtc);
  const pick = (t:string) => parts.find(p=>p.type===t)?.value!;
  const tzH = +pick('hour'), tzM = +pick('minute'), tzS = +pick('second');
  const tzYear = +pick('year'), tzMonth = +pick('month'), tzDay = +pick('day');

  const seenEpoch = Date.UTC(tzYear, tzMonth-1, tzDay, tzH, tzM, tzS);
  const wallEpoch = Date.UTC(Y, M-1, D, h, mi, ss);
  const offsetMin = Math.round((wallEpoch - seenEpoch) / 60000);
  return offsetMin;
}

/** 진태양시 보정: 경도보정(+선택 EoT) */
function applyTrueSolarTime(localWall: Date, tzOffsetMin: number, lon?: number, useEoT = true) {
  if (lon == null || Number.isNaN(lon)) {
    return { tst: localWall, offsetMin: 0, eotMin: 0 };
  }
  const stdMeridianDeg = 15 * (tzOffsetMin / 60); // 예: 540분 = +9h → 135E
  const longMin = 4 * (lon - stdMeridianDeg);     // 경도 보정(분): 1° = 4분

  // 시방정식(EoT) 근사(±1~2분 정확도)
  let eotMin = 0;
  if (useEoT) {
    const y = localWall.getUTCFullYear();
    const start = Date.UTC(y, 0, 0);
    const today = Date.UTC(y, localWall.getUTCMonth(), localWall.getUTCDate());
    const n = Math.floor((today - start) / 86400000);
    const B = (2 * Math.PI * (n - 81)) / 364;
    eotMin = 9.87 * Math.sin(2*B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  }

  const offsetMin = longMin - eotMin;
  const tst = new Date(localWall.getTime() + offsetMin * 60000);
  return { tst, offsetMin, eotMin };
}

/** ‘자시=23:00~01:00’ 2시간 슬롯(0~11) */
function hourBranchIndexFromTST(tst: Date): number {
  const h = tst.getHours();
  const m = tst.getMinutes();
  const minsFrom23 = (((h + 24) % 24) - 23) * 60 + m; // 23시를 원점
  const norm = (minsFrom23 + 24 * 60) % (24 * 60);
  return Math.floor(norm / 120); // 0:자, 1:축, ..., 11:해
}

/** 일간 → 자시 시작천간 인덱스(甲己=甲, 乙庚=丙, 丙辛=戊, 丁壬=庚, 戊癸=壬) */
function hourStemStartByDayStem(dayStemIdx: number): number {
  const table = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  return table[dayStemIdx % 10];
}

/* ──────────────────────────────────────────────────────────
   Swiss Ephemeris: 태양 황경(0~360°) — 견고한 호출&파싱
   ────────────────────────────────────────────────────────── */

function sweCmdArgs(utcEpochMs: number) {
  const d = new Date(utcEpochMs);
  const DD = String(d.getUTCDate()).padStart(2, "0");
  const MM = String(d.getUTCMonth() + 1).padStart(2, "0");
  const YYYY = d.getUTCFullYear();
  const HH = String(d.getUTCHours()).padStart(2, "0");
  const MI = String(d.getUTCMinutes()).padStart(2, "0");
  const SS = String(d.getUTCSeconds()).padStart(2, "0");

  // 시도 A: -fl(경도 decimal), -g,(CSV)
  const main = [
    `-b${DD}.${MM}.${YYYY}`,
    (HH === "00" && MI === "00" && SS === "00") ? "-ut0" : `-ut${HH}:${MI}:${SS}`,
    "-p0",    // Sun
    "-fl",    // ecliptic longitude (decimal)
    "-g,",    // CSV-ish
    "-eswe"
  ];

  // 시도 B: -fPl (행성명, 경도) + -g,
  const fallback = [
    `-b${DD}.${MM}.${YYYY}`,
    (HH === "00" && MI === "00" && SS === "00") ? "-ut0" : `-ut${HH}:${MI}:${SS}`,
    "-p0",
    "-fPl",
    "-g,",
    "-eswe"
  ];

  return { main, fallback };
}

async function runSwetest(args: string[]) {
  const sweExe = process.env.SWE_EXE || "C:\\sweph\\bin\\swetest64.exe";
  const ephe = process.env.SE_EPHE_PATH || "C:\\sweph\\ephe";
  const fullArgs = [`-edir${ephe}`, ...args];
  const { stdout, stderr } = await pexec(sweExe, fullArgs, { windowsHide: true, shell: false });
  return { stdout: stdout?.trim() ?? "", stderr: stderr?.trim() ?? "", exe: sweExe, args: fullArgs };
}

function tryParseLon(stdout: string): number | null {
  // 1) CSV 마지막 토큰의 숫자
  const lines = stdout.split(/\r?\n/).filter(l => /\d/.test(l));
  if (lines.length) {
    const tokens = lines[0].split(",");
    const last = tokens[tokens.length - 1]?.trim();
    const asNum = parseFloat(last);
    if (Number.isFinite(asNum) && asNum >= 0 && asNum < 360) return asNum;
  }
  // 2) 전체 텍스트에서 0~360 실수 찾기(백업)
  const m = stdout.match(/(\d{1,3}(?:\.\d+)?)(?=[^\d]|$)/g);
  if (m) {
    for (const s of m) {
      const v = parseFloat(s);
      if (Number.isFinite(v) && v >= 0 && v < 360) return v;
    }
  }
  return null;
}

async function getSunLongitudeBySwiss(localISO: string, tzOffsetMin: number): Promise<{lon:number, debug:any}> {
  // localISO(벽시) → UTC epoch
  const { Y,M,D,h,mi,ss } = parseLocalISO(localISO);
  const utcEpoch = Date.UTC(Y, M-1, D, h, mi, ss) - tzOffsetMin * 60000;

  const { main, fallback } = sweCmdArgs(utcEpoch);

  // 시도 A
  let res = await runSwetest(main);
  let lon = tryParseLon(res.stdout);
  if (lon == null) {
    // 시도 B
    const res2 = await runSwetest(fallback);
    lon = tryParseLon(res2.stdout);
    if (lon == null) {
      const snippetA = (res.stdout || res.stderr || "").slice(0, 400);
      const snippetB = (res2.stdout || res2.stderr || "").slice(0, 400);
      const cmdA = `${res.exe} ${res.args.join(" ")}`;
      const cmdB = `${res2.exe} ${res2.args.join(" ")}`;
      const msg = [
        "Sun longitude parse failed.",
        "--- Attempt A ---",
        cmdA,
        snippetA,
        "--- Attempt B ---",
        cmdB,
        snippetB
      ].join("\n");
      throw new Error(msg);
    }
    return { lon, debug: { cmd: `${res2.exe} ${res2.args.join(" ")}`, stdoutSnippet: (res2.stdout||res2.stderr||"").slice(0,200) } };
  }
  return { lon, debug: { cmd: `${res.exe} ${res.args.join(" ")}`, stdoutSnippet: (res.stdout||res.stderr||"").slice(0,200) } };
}

/** 월지(月支): 태양 황경 → 절기 구간 매핑(입춘=315° 시작) */
function monthBranchFromSunLon(lon: number): number {
  // [315°,345°) 寅, [345°,15°) 卯, [15°,45°) 辰 …
  const idx = Math.floor(((lon - 315 + 360) % 360) / 30); // 0~11
  const order = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];    // 寅,卯,辰,… (0=자)
  return order[idx];
}

/* ──────────────────────────────────────────────────────────
   메인 엔진
   ────────────────────────────────────────────────────────── */

export class SwissEngine implements Engine {
  async calc(input: BaziInput): Promise<BaziOutput> {
    // (임시) 연/일주: date-chinese
    const cc = new CalendarChinese();
    cc.fromDate(new Date(input.localISO));
    const sexYIdx = (cc as any).sexagenaryYear?.() ?? 0;
    const sexDIdx = (cc as any).sexagenaryDay?.() ?? 0;
    const yearPillar = gz(sexYIdx);
    const dayPillar  = gz(sexDIdx);

    // 1) tz 분 결정 (요청에 tzMinutes 있으면 우선)
    const tzOffsetMin = resolveTzOffsetMin(input.localISO, input.tzid, (input as any).tzMinutes);

    // 2) "벽시(localISO)"를 진짜 epoch로 변환 (보기용 로컬 Date도 만들기)
    const { Y,M,D,h,mi,ss } = parseLocalISO(input.localISO);
    const epochUTC = Date.UTC(Y, M-1, D, h, mi, ss) - tzOffsetMin * 60000;
    const localInTz = new Date(epochUTC + tzOffsetMin * 60000); // tz 기준 벽시(Date)

    // 3) 태양 황경(UTC기준 swetest)으로 월지 판정 (견고 파싱 & 디버그 포함)
    const sun = await getSunLongitudeBySwiss(input.localISO, tzOffsetMin);
    const sunLon = sun.lon;
    const mBranch  = monthBranchFromSunLon(sunLon);
    const yearStem = sexYIdx % 10;
    // 甲己年: 丙寅, 乙庚年: 戊寅, 丙辛年: 庚寅, 丁壬年: 壬寅, 戊癸年: 甲寅
    const monthStartByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // 寅월의 천간
    const mStem = (monthStartByYearStem[yearStem] + ((mBranch - 2 + 12) % 12)) % 10;
    const monthPillar = `${HG[mStem]}${EG[mBranch]}`;

    // 4) 시주: 진태양시(TST = 경도 보정 + EoT 근사) → 2시간 슬롯
    const { tst, offsetMin, eotMin } = applyTrueSolarTime(localInTz, tzOffsetMin, input.lon, true);
    const hBranchIndex = hourBranchIndexFromTST(tst);

    const dayStemIdx   = sexDIdx % 10;
    const startStemIdx = hourStemStartByDayStem(dayStemIdx); // 子시 시작천간
    const hStemIdx     = (startStemIdx + hBranchIndex) % 10;
    const hourPillar   = `${HG[hStemIdx]}${EG[hBranchIndex]}`;

    const output: BaziOutput = {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      meta: {
        engine: "swissEph",
        note: "월지=태양황경(절기), 시주=진태양시(경도+EoT). 연/일주는 임시(date-chinese).",
        debug: {
          tzid: input.tzid,
          tzOffsetMin,
          lon: input.lon ?? null,
          localWallISO: input.localISO,
          localWallAsDate: localInTz.toISOString(),
          tstLocal: tst.toISOString(),
          longOnlyMin: Number(offsetMin.toFixed(2)),
          eotMin: Number(eotMin.toFixed(2)),
          sweCmd: sun.debug.cmd,
          sweOut: sun.debug.stdoutSnippet
        }
      },
    };
    return output;
  }
}

export const engineSwiss: Engine = new SwissEngine();
export default engineSwiss;
