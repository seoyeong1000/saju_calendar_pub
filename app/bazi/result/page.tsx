/**
 * @file page.tsx
 * @description 만세력 결과 페이지
 *
 * 계산된 만세력 결과를 표시합니다.
 * Supabase에서 결과를 조회하거나, 엔진을 직접 호출하여 계산합니다.
 */

import { BaziResult } from "@/components/bazi/bazi-result";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getEngine } from "@/engine";

interface PageProps {
  searchParams: Promise<{
    requestId?: string;
  }>;
}

async function getBaziResult(requestId: string) {
  const supabase = createServiceRoleClient();

  // Supabase에서 결과 조회
  const { data: result, error } = await supabase
    .from("astro_result")
    .select("*")
    .eq("request_id", requestId)
    .single();

  if (error || !result) {
    throw new Error("결과를 찾을 수 없습니다.");
  }

  // 결과가 아직 계산되지 않은 경우 (queued 상태)
  if (result.status === "queued") {
    // 요청 정보 가져오기
    const { data: request, error: reqError } = await supabase
      .from("astro_request")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (reqError || !request) {
      throw new Error("요청 정보를 찾을 수 없습니다.");
    }

    // 엔진으로 직접 계산
    const engine = getEngine();
    const input = {
      localISO: request.local_iso,
      tzid: request.tzid,
      lon: request.lon,
      lat: request.lat,
    };

    const calculated = await engine.calc(input);

    // 결과 업데이트
    await supabase
      .from("astro_result")
      .update({
        status: "ok",
        result_json: calculated,
      })
      .eq("request_id", requestId);

    return calculated;
  }

  // 이미 계산된 결과 반환
  if (result.status === "ok" && result.result_json) {
    return result.result_json as {
      yearPillar: string;
      monthPillar: string;
      dayPillar: string;
      hourPillar: string;
      meta?: any;
    };
  }

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

