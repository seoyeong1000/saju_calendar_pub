// /app/api/bazi/route.ts
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const ReqSchema = z.object({
  localISO: z.string(),      // "2025-11-09T16:00:00"
  tzid: z.string(),          // "Asia/Seoul"
  tzMinutes: z.number(),     // 540
  lon: z.number(),           // 127.02
  lat: z.number(),           // 37.50
  options: z.object({
    useTrueSolarTime: z.boolean().optional(),
    zishiSplit: z.string().optional(),
  }).optional(),
});

function supa() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Supabase env missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = ReqSchema.parse(body);
    const sb = supa();

    // 1) 요청 저장
    const { data: r1, error: e1 } = await sb
      .from("astro_request")
      .insert({
        local_iso: input.localISO,
        tzid: input.tzid,
        tz_offset_min: input.tzMinutes,
        lon: input.lon,
        lat: input.lat,
        options_json: input.options ?? {},
      })
      .select("request_id")
      .single();
    if (e1) throw e1;

    // 2) 결과 placeholder (queued)
    const { error: e2 } = await sb
      .from("astro_result")
      .insert({ request_id: r1.request_id, status: "queued", result_json: {}, log_json: {} });
    if (e2) throw e2;

    return NextResponse.json({ ok: true, request_id: r1.request_id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 400 });
  }
}
