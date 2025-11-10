/**
 * @file bazi-confirm.tsx
 * @description 프로필 확인 컴포넌트
 *
 * 사용자가 입력한 정보를 확인하고, 시간 보정 정보를 표시합니다.
 */

"use client";

import * as React from "react";
import { User, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateTimeCorrection } from "@/lib/bazi/time-correction";
import { useRouter } from "next/navigation";

interface BaziConfirmProps {
  name: string;
  gender: "female" | "male";
  calendarType: "solar" | "lunar";
  birthDate: string;
  birthTime: string;
  timeUnknown: boolean;
  lateNightEarlyMorning: boolean;
  city: string;
  cityFullName: string;
  lon: number;
  lat: number;
  requestId: string;
}

export function BaziConfirm({
  name,
  gender,
  calendarType,
  birthDate,
  birthTime,
  timeUnknown,
  lateNightEarlyMorning,
  city,
  cityFullName,
  lon,
  lat,
  requestId,
}: BaziConfirmProps) {
  const router = useRouter();
  const [isCalculating, setIsCalculating] = React.useState(false);
  const correction = React.useMemo(
    () => calculateTimeCorrection(lon, lat),
    [lon, lat]
  );

  const genderText = gender === "female" ? "여자" : "남자";
  const calendarText = calendarType === "solar" ? "양" : "음";
  const timeText = timeUnknown ? "시간 모름" : birthTime;

  const handleGoToResult = async () => {
    console.group("만세력 계산 완료 처리");
    console.log("Request ID:", requestId);

    setIsCalculating(true);

    try {
      // 계산 완료 API 호출
      const response = await fetch("/api/bazi/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId }),
      });

      const result = await response.json();
      console.log("Finish API 응답:", result);

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "계산 완료 처리 실패");
      }

      // 결과 페이지로 이동
      router.push(`/bazi/result?requestId=${requestId}`);
    } catch (error) {
      console.error("만세력 계산 완료 처리 실패:", error);
      alert(`오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCalculating(false);
      console.groupEnd();
    }
  };

  const handleEdit = () => {
    router.push("/bazi");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">입력하신 프로필을 확인해주세요.</h2>

      {/* 이름/성별 */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="rounded-md border bg-background px-3 py-3 pl-11 text-sm">
          {name} / {genderText}
        </div>
      </div>

      {/* 생년월일시 */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="rounded-md border bg-background px-3 py-3 pl-11 text-sm">
          {calendarText} {birthDate} {timeText}
        </div>
      </div>

      {/* 지역 */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="rounded-md border bg-background px-3 py-3 pl-11 text-sm">
          {cityFullName}
        </div>
      </div>

      {/* 시간 보정 안내 */}
      <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm">
        입력하신 지역 정보에 따라 {correction.correctionFormatted}을 보정합니다.
      </div>

      {/* 버튼 */}
      <div className="flex flex-col gap-4 pt-4">
        <Button
          type="button"
          size="lg"
          onClick={handleGoToResult}
          disabled={isCalculating}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900"
        >
          {isCalculating ? "계산 중..." : "만세력 보러가기"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleEdit}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900"
        >
          프로필 수정하기
        </Button>
      </div>
    </div>
  );
}

