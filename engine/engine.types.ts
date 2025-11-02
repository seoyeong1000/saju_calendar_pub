export type BaziInput = {
  localISO: string;     // "2024-02-01T00:00:00"
  tzid: string;         // "Asia/Seoul"
  lat?: number;
  lon?: number;
  useApparentSolar?: boolean;
};

export type BaziOutput = {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  meta: { engine: string; preview?: string };
};

export interface Engine {
  calc(input: BaziInput): Promise<BaziOutput>;
}
