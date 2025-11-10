/**
 * @file time-correction.ts
 * @description 지역별 시간 보정 계산 유틸리티
 *
 * 지역 좌표를 기반으로 진태양시 보정 분수를 계산합니다.
 * 진태양시 = 표준시 + 경도 보정 - EoT (Equation of Time)
 */

/**
 * 시간 보정 계산 결과
 */
export interface TimeCorrectionResult {
  correctionMinutes: number; // 보정 분수 (분 단위)
  correctionFormatted: string; // 포맷된 문자열 (예: "-34분")
}

/**
 * 지역 좌표를 기반으로 시간 보정 계산
 *
 * @param lon 경도 (동경은 양수)
 * @param lat 위도 (북위는 양수)
 * @returns 시간 보정 결과
 *
 * 참고: 정확한 계산을 위해서는 EoT(Equation of Time) 계산이 필요하지만,
 * 여기서는 간단한 경도 보정만 적용합니다.
 * 실제 구현에서는 날짜에 따른 EoT 값을 계산해야 합니다.
 */
export function calculateTimeCorrection(
  lon: number,
  lat: number,
): TimeCorrectionResult {
  // 한국 표준시 기준 경도: 135°E (UTC+9 = 15° × 9시간)
  const standardMeridian = 135;

  // 경도 차이 계산 (도 단위)
  const lonDiff = lon - standardMeridian;

  // 경도 1도 = 4분 차이
  // 경도 보정 분수 계산
  const correctionMinutes = lonDiff * 4;

  // EoT (Equation of Time) 근사값
  // 실제로는 날짜에 따라 달라지지만, 여기서는 평균값 사용
  // EoT는 대략 -14분 ~ +16분 범위
  // 간단히 0으로 가정 (향후 개선 필요)

  // 최종 보정 분수
  const finalCorrection = Math.round(correctionMinutes);

  // 포맷팅
  const sign = finalCorrection >= 0 ? "+" : "";
  const correctionFormatted = `${sign}${finalCorrection}분`;

  return {
    correctionMinutes: finalCorrection,
    correctionFormatted,
  };
}
