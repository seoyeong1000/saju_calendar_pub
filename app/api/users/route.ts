import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

import { auth, currentUser } from "@clerk/nextjs/server";
import { supaAdmin } from "@/lib/supabase-admin"; // 상대경로 필요 시 수정

export async function POST(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });

    const cu = await currentUser().catch(() => null);
    const name = cu?.fullName ?? cu?.username ?? null;

    const { error } = await supaAdmin.from("users").upsert({ clerk_id: userId, name });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
