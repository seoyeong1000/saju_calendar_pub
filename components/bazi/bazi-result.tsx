/**
 * @file bazi-result.tsx
 * @description 만세력 결과 표시 컴포넌트
 *
 * 계산된 사주 결과를 시각적으로 표시합니다.
 * 연주, 월주, 일주, 시주를 큰 글씨로 강조하여 표시하고,
 * 디버그 정보는 접을 수 있는 섹션으로 제공합니다.
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";

interface BaziResultData {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  meta?: {
    engine?: string;
    note?: string;
    debug?: any;
  };
}

interface BaziResultProps {
  result: BaziResultData;
  requestId: string;
  onSave?: () => void;
}

export function BaziResult({ result, requestId, onSave }: BaziResultProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    console.group("만세력 결과 저장");
    console.log("Request ID:", requestId);
    console.log("결과 데이터:", result);

    setIsSaving(true);

    try {
      // TODO: Supabase에 결과 저장 (사용자별)
      // 현재는 requestId만 있으므로, 향후 사용자 인증 정보와 함께 저장
      if (onSave) {
        await onSave();
      } else {
        // 기본 저장 로직
        console.log("결과 저장 완료");
      }
    } catch (error) {
      console.error("결과 저장 실패:", error);
      alert("결과 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
      console.groupEnd();
    }
  };

  const handleRecalculate = () => {
    router.push("/bazi");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">만세력 결과</h2>
        <p className="text-muted-foreground">계산된 사주 결과입니다.</p>
      </div>

      {/* 사주 결과 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="text-sm text-muted-foreground mb-2">연주</div>
          <div className="text-3xl font-bold">{result.yearPillar}</div>
        </div>
        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="text-sm text-muted-foreground mb-2">월주</div>
          <div className="text-3xl font-bold">{result.monthPillar}</div>
        </div>
        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="text-sm text-muted-foreground mb-2">일주</div>
          <div className="text-3xl font-bold">{result.dayPillar}</div>
        </div>
        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="text-sm text-muted-foreground mb-2">시주</div>
          <div className="text-3xl font-bold">{result.hourPillar}</div>
        </div>
      </div>

      {/* 메타 정보 */}
      {result.meta && (
        <div className="rounded-lg border bg-card p-4">
          <div className="space-y-2">
            {result.meta.engine && (
              <div className="text-sm">
                <span className="font-medium">엔진:</span> {result.meta.engine}
              </div>
            )}
            {result.meta.note && (
              <div className="text-sm text-muted-foreground">
                {result.meta.note}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 디버그 정보 (접을 수 있음) */}
      {result.meta?.debug && (
        <Accordion type="single" collapsible>
          <AccordionItem value="debug">
            <AccordionTrigger>디버그 정보</AccordionTrigger>
            <AccordionContent>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
                {JSON.stringify(result.meta.debug, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* 액션 버튼 */}
      <div className="flex flex-col gap-4 pt-4">
        <Button
          type="button"
          size="lg"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? "저장 중..." : "결과 저장하기"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleRecalculate}
          className="w-full"
        >
          다시 계산하기
        </Button>
      </div>
    </div>
  );
}

