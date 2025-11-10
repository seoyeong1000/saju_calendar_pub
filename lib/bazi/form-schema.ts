/**
 * @file form-schema.ts
 * @description 만세력 입력 폼을 위한 Zod 스키마 정의
 *
 * 사용자 입력 폼의 유효성 검사를 위한 스키마를 정의합니다.
 * 입력된 데이터를 API 요청 형식으로 변환하는 함수도 포함합니다.
 */

import { z } from "zod";

/**
 * 사용자 입력 폼 스키마
 */
export const baziFormSchema = z.object({
  // 이름 (최대 12글자)
  name: z
    .string()
    .min(1, "이름을 입력해주세요")
    .max(12, "이름은 최대 12글자까지 입력 가능합니다"),

  // 성별
  gender: z.enum(["female", "male"], {
    required_error: "성별을 선택해주세요",
  }),

  // 달력 종류 (양력/음력)
  calendarType: z.enum(["solar", "lunar"], {
    required_error: "달력 종류를 선택해주세요",
  }),

  // 생년월일
  birthDate: z
    .string()
    .regex(/^\d{4}\/\d{2}\/\d{2}$/, "날짜 형식이 올바르지 않습니다 (YYYY/MM/DD)"),

  // 시간
  birthTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "시간 형식이 올바르지 않습니다 (HH:MM)")
    .optional(),

  // 시간 모름 옵션
  timeUnknown: z.boolean().default(false),

  // 야자시/조자시 옵션
  lateNightEarlyMorning: z.boolean().default(false),

  // 도시
  city: z
    .string()
    .min(1, "도시를 입력해주세요")
    .refine(
      (val) => {
        // 도시명이 비어있지 않은지 확인
        return val.trim().length > 0;
      },
      { message: "도시를 입력해주세요" }
    ),
});

export type BaziFormData = z.infer<typeof baziFormSchema>;

/**
 * API 요청 형식으로 변환
 */
export interface BaziApiRequest {
  localISO: string; // "2024-02-01T00:00:00"
  tzid: string; // "Asia/Seoul"
  tzMinutes: number; // 540
  lon: number; // 127.02
  lat: number; // 37.50
  options?: {
    useTrueSolarTime?: boolean;
    zishiSplit?: string;
  };
}

/**
 * 폼 데이터를 API 요청 형식으로 변환
 * @param formData 폼 데이터
 * @param coordinates 도시 좌표 (경도, 위도)
 * @returns API 요청 데이터
 */
export function transformFormDataToApiRequest(
  formData: BaziFormData,
  coordinates: { lon: number; lat: number }
): BaziApiRequest {
  // 시간 처리: 시간 모름이면 12:00, 야자시/조자시는 향후 처리
  let time = formData.birthTime || "12:00";
  if (formData.timeUnknown) {
    time = "12:00";
  }

  // 날짜와 시간을 합쳐서 ISO 형식으로 변환
  const [year, month, day] = formData.birthDate.split("/").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  // localISO 생성 (YYYY-MM-DDTHH:mm:00 형식)
  const localISO = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;

  // 타임존 정보 (한국은 Asia/Seoul, UTC+9 = 540분)
  const tzid = "Asia/Seoul";
  const tzMinutes = 540;

  return {
    localISO,
    tzid,
    tzMinutes,
    lon: coordinates.lon,
    lat: coordinates.lat,
    options: {
      useTrueSolarTime: true, // 진태양시 사용
      zishiSplit: formData.lateNightEarlyMorning ? "traditional" : undefined,
    },
  };
}

