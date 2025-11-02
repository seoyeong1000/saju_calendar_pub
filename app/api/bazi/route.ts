// app/api/bazi/route.ts
import { NextResponse } from "next/server";
import { createEngine } from "../../../engine";
// 만약 이 줄에 빨간줄(경로 에러)이 생기면 ↓로 교체하세요
// import { SwissEngine } from "../../../engine/engine.swiss";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { localISO, tzid } = body ?? {};
    if (!localISO || !tzid) {
      return NextResponse.json({ error: "localISO, tzid are required" }, { status: 400 });
    }

    const engine = createEngine();
    const result = await engine.calc({ localISO, tzid });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}