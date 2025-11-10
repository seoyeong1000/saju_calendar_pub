/**
 * @file page.tsx
 * @description 만세력 결과 페이지
 *
 * 계산된 만세력 결과를 표시합니다.
 * Supabase에서 결과를 조회하거나, 엔진을 직접 호출하여 계산합니다.
 */

import { BaziResult } from "@/components/bazi/bazi-result";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { createEngine } from "@/engine";

interface PageProps {
  searchParams: Promise<{
    requestId?: string;
  }>;
}

async function getBaziResult(requestId: string) {
  console.log("[getBaziResult] 시작, requestId:", requestId);
  const supabase = getServiceRoleClient();

  // Supabase에서 결과 조회
  const { data: result, error } = await supabase
    .from("astro_result")
    .select("*")
    .eq("request_id", requestId)
    .single();

  console.log("[getBaziResult] result:", result, "error:", error);

  // astro_result가 없거나 queued 상태면 직접 계산
  if (error || !result || result.status === "queued") {
    console.log("[getBaziResult] result가 없거나 queued 상태, 직접 계산 시작");
    // 요청 정보 가져오기
    const { data: request, error: reqError } = await supabase
      .from("astro_request")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (reqError || !request) {
      console.error("[getBaziResult] astro_request 조회 실패:", reqError);
      throw new Error("요청 정보를 찾을 수 없습니다.");
    }

    console.log("[getBaziResult] request 조회 성공:", request);

    // 엔진으로 직접 계산
    const engine = createEngine();
    const input = {
      localISO: request.local_wall_iso,
      tzid: request.tzid,
      lon: request.lon_deg,
      lat: request.lat_deg,
    };

    console.log("[getBaziResult] 계산 입력:", input);

    const calculated = await engine.calc(input);

    console.log("[getBaziResult] 계산 결과:", calculated);

    // astro_result가 존재하는 경우에만 업데이트
    if (result) {
      console.log("[getBaziResult] astro_result 업데이트 시작");
      await supabase
        .from("astro_result")
        .update({
          status: "ok",
          result_json: calculated,
        })
        .eq("request_id", requestId);
    } else {
      console.log("[getBaziResult] astro_result가 없어 업데이트 건너뜀");
    }

    return calculated;
  }

  // 이미 계산된 결과 반환
  console.log("[getBaziResult] 완료된 결과 반환");
  if (result.status === "ok" && result.result_json) {
    return result.result_json as {
      yearPillar: string;
      monthPillar: string;
      dayPillar: string;
      hourPillar: string;
      meta?: any;
    };
  }

  console.error("[getBaziResult] 유효하지 않은 결과 상태:", result.status);
  throw new Error("결과를 가져올 수 없습니다.");
}

export default async function BaziResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestId = params.requestId;

  if (!requestId) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">오류</h1>
          <p className="text-muted-foreground">
            요청 ID가 없습니다. 다시 계산해주세요.
          </p>
        </div>
      </main>
    );
  }

  try {
    const result = await getBaziResult(requestId);

    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <BaziResult result={result} requestId={requestId} />
      </main>
    );
  } catch (error) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">오류</h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "결과를 가져오는 중 오류가 발생했습니다."}
          </p>
        </div>
      </main>
    );
  }
}

