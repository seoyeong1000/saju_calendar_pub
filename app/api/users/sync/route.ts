
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
// ⛔ 기존: import { supaAdmin } from "@/lib/supabase-admin";
// /app/api/users/sync/route.ts 맨 위
// 잘못된 예: import { supaAdmin } from "../../../../lib/supabase/supabase-admin";
import { supaAdmin } from "../../../../lib/supabase-admin";  // ← 이걸로 교체



export async function POST() {
  try {
    // 1) 인증 체크
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2) Clerk에서 사용자 정보 가져오기(이름 등)
    const cu = await currentUser().catch(() => null);
    const displayName =
      cu?.fullName ?? cu?.username ?? cu?.emailAddresses?.[0]?.emailAddress ?? null;

    // 3) Supabase users 테이블에 upsert
    //    스키마 예: public.users(id uuid pk, clerk_id text unique, name text, ...)
    const { error } = await supaAdmin
      .from("users")
      .upsert({ clerk_id: userId, name: displayName }, { onConflict: "clerk_id" });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
