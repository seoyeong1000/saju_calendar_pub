// /app/api/bazi/route.ts
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

const ReqSchema = z.object({
  localISO: z.string(), // "2025-11-09T16:00:00"
  tzid: z.string(), // "Asia/Seoul"
  tzMinutes: z.number(), // 540
  lon: z.number(), // 127.02
  lat: z.number(), // 37.50
  options: z
    .object({
      useTrueSolarTime: z.boolean().optional(),
      zishiSplit: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = ReqSchema.parse(body);
    const sb = getServiceRoleClient();

    console.log("[API /api/bazi] 요청 데이터:", {
      localISO: input.localISO,
      tzid: input.tzid,
      tzMinutes: input.tzMinutes,
      lon: input.lon,
      lat: input.lat,
    });

    // 1) 요청 저장
    const { data: r1, error: e1 } = await sb
      .from("astro_request")
      .insert({
        local_wall_iso: input.localISO,
        tzid: input.tzid,
        tz_offset_min: input.tzMinutes,
        lon_deg: input.lon,
        lat_deg: input.lat,
        options_json: input.options ?? {},
      })
      .select("request_id")
      .single();

    if (e1) {
      console.error("[API /api/bazi] astro_request 삽입 오류:", e1);
      // 스키마 캐시 오류인 경우 더 명확한 메시지 제공
      if (
        e1.message?.includes("schema cache") ||
        e1.message?.includes("column")
      ) {
        throw new Error(
          `데이터베이스 스키마 오류: ${e1.message}. 마이그레이션이 적용되었는지 확인해주세요.`,
        );
      }
      throw e1;
    }

    console.log("[API /api/bazi] 요청 저장 성공, request_id:", r1?.request_id);

    // 2) 결과 placeholder (queued)
    const { error: e2 } = await sb
      .from("astro_result")
      .insert({
        request_id: r1.request_id,
        status: "queued",
        result_json: {},
        log_json: {},
      });

    if (e2) {
      console.error("[API /api/bazi] astro_result 삽입 오류:", e2);
      throw e2;
    }

    console.log("[API /api/bazi] 결과 placeholder 생성 성공");

    return NextResponse.json({ ok: true, request_id: r1.request_id });
  } catch (err: any) {
    console.error("[API /api/bazi] 전체 오류:", err);
    return NextResponse.json(
      { ok: false, error: String(err.message || err) },
      { status: 400 },
    );
  }
}
