// /app/api/bazi/finish/route.ts
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);

function supa() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Supabase env missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const { request_id } = await req.json();
    if (!request_id) throw new Error("request_id required");

    const sb = supa();
    const { data: rq, error } = await sb
      .from("astro_request")
      .select("*")
      .eq("request_id", request_id)
      .single();
    if (error || !rq) throw (error ?? new Error("request not found"));

    const exe = process.env.SWE_EXE!;
    const ephe = process.env.SE_EPHE_PATH!;
    if (!exe || !ephe) throw new Error("SWE_EXE/SE_EPHE_PATH missing");

    // UT 변환 (local_iso - tz_offset_min)
    const dtLocal = new Date(rq.local_iso);
    const ut = new Date(dtLocal.getTime() - (rq.tz_offset_min ?? 0) * 60000);
    const dd = String(ut.getUTCDate()).padStart(2, "0");
    const mm = String(ut.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = ut.getUTCFullYear();
    const hh = String(ut.getUTCHours()).padStart(2, "0");
    const mi = String(ut.getUTCMinutes()).padStart(2, "0");

    // 예시: 태양 황경만 추출(-p0 -fl -g,)
    const args = [`-edir${ephe}`, `-b${dd}.${mm}.${yyyy}`, `-ut${hh}:${mi}`, "-p0", "-fl", "-g,"];
    const { stdout } = await execFileAsync(exe, args, { windowsHide: true });

    const last = stdout.trim().split(",").pop();
    const solarLongitude = last ? Number(last) : null;

    const result_json = {
      request_id,
      ut: ut.toISOString(),
      lon: rq.lon, lat: rq.lat, tzid: rq.tzid,
      solarLongitude,
      // TODO: 실제 사주 계산 로직으로 교체
      pillars_demo: { year: "갑자", month: "갑자", day: "갑자", hour: "갑자" },
    };

    const { error: e3 } = await sb
      .from("astro_result")
      .update({ status: "ok", result_json, log_json: { cmd: { exe, args }, stdout } })
      .eq("request_id", request_id);
    if (e3) throw e3;

    return NextResponse.json({ ok: true, request_id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err.message || err) }, { status: 400 });
  }
}
