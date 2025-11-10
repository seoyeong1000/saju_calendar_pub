import { z } from "zod";

function pickServiceRole() {
  const v =
    process.env.SUPABASE_SERVICE_ROLE ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    (process.env as any).SUPABASE_SERVICE_ROLE_Key ??
    null;
  return v;
}

const Raw = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE: pickServiceRole(),
  CLERK_PK: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SK: process.env.CLERK_SECRET_KEY,
  ENGINE: process.env.ENGINE ?? "swiss",
  SWE_EXE: process.env.SWE_EXE,
  SE_EPHE_PATH: process.env.SE_EPHE_PATH,
};

// 기본 스키마 (ENGINE 제외)
const BaseSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON: z.string().min(10),
  SUPABASE_SERVICE_ROLE: z.string().min(10),
  CLERK_PK: z.string().min(10),
  CLERK_SK: z.string().min(10),
  ENGINE: z.enum(["swiss", "swisseph", "dateChinese"]),
  SWE_EXE: z.string().optional(),
  SE_EPHE_PATH: z.string().optional(),
});

// 조건부 검증: ENGINE=swiss일 때만 SWE_EXE, SE_EPHE_PATH 필수
const parsed = BaseSchema.safeParse(Raw);
if (!parsed.success) {
  const issues = parsed.error.issues.map(i => `- ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`ENV invalid. 아래 키를 확인하세요:\n${issues}`);
}

const validated = parsed.data;

// ENGINE=swiss 또는 swisseph일 때 SWE_EXE, SE_EPHE_PATH 필수 검증
if (validated.ENGINE === "swiss" || validated.ENGINE === "swisseph") {
  if (!validated.SWE_EXE || validated.SWE_EXE.trim().length < 2) {
    throw new Error("ENV invalid. ENGINE=swiss일 때 SWE_EXE는 필수입니다.");
  }
  if (!validated.SE_EPHE_PATH || validated.SE_EPHE_PATH.trim().length < 2) {
    throw new Error("ENV invalid. ENGINE=swiss일 때 SE_EPHE_PATH는 필수입니다.");
  }
}

export const ENV = validated;
