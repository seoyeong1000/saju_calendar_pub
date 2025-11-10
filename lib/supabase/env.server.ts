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

const Schema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON: z.string().min(10),
  SUPABASE_SERVICE_ROLE: z.string().min(10),
  CLERK_PK: z.string().min(10),
  CLERK_SK: z.string().min(10),
  ENGINE: z.enum(["swiss"]),
  SWE_EXE: z.string().min(2),
  SE_EPHE_PATH: z.string().min(2),
});

const parsed = Schema.safeParse(Raw);
if (!parsed.success) {
  const issues = parsed.error.issues.map(i => `- ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`ENV invalid. 아래 키를 확인하세요:\n${issues}`);
}
export const ENV = parsed.data;
