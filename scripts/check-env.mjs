// scripts/check-env.mjs  (디버그/재발 방지 확정본)
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const root = process.cwd();
const envLocal = path.join(root, ".env.local");
const envFile = fs.existsSync(envLocal) ? envLocal : path.join(root, ".env");

// UTF-16/UTF-8 모두 처리해서 파싱
function loadEnv(file) {
  if (!fs.existsSync(file)) return {};
  const buf = fs.readFileSync(file);
  const isUtf16LE = buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe;
  const text = buf.toString(isUtf16LE ? "utf16le" : "utf8");
  return dotenv.parse(text);
}
const parsed = loadEnv(envFile);
for (const [k, v] of Object.entries(parsed)) if (!process.env[k]) process.env[k] = v;

// 디버그 로그
console.log("🔎 cwd:", root);
console.log("🔎 env file:", path.basename(envFile));
console.log("🔎 loaded keys:", Object.keys(parsed));

const must = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  // SERVICE_ROLE 계열은 둘 중 하나만 있어도 통과
  "SUPABASE_SERVICE_ROLE|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SERVICE_ROLE_Key",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "ENGINE",
];

const has = new Set(Object.keys(process.env));
const miss = [];
for (const line of must) {
  const opts = line.split("|");
  const ok = opts.some(k => has.has(k) && String(process.env[k] || "").trim() !== "");
  if (!ok) miss.push(opts[0]);
}

// ENGINE 값 검증
const engine = String(process.env.ENGINE || "").toLowerCase().trim();
if (engine && engine !== "swiss" && engine !== "swisseph" && engine !== "datechinese" && engine !== "date-chinese") {
  console.error(`❌ ENGINE 값이 잘못되었습니다: "${engine}". "swiss", "swisseph", "datechinese" 또는 "date-chinese"만 허용됩니다.`);
  process.exit(1);
}

// ENGINE=swiss 또는 swisseph일 때만 SWE_EXE, SE_EPHE_PATH 필수
if (engine === "swiss" || engine === "swisseph") {
  if (!has.has("SWE_EXE") || !String(process.env.SWE_EXE || "").trim()) {
    miss.push("SWE_EXE");
  }
  if (!has.has("SE_EPHE_PATH") || !String(process.env.SE_EPHE_PATH || "").trim()) {
    miss.push("SE_EPHE_PATH");
  }
}

if (process.env.SKIP_ENV_CHECK === "1") {
  console.warn("⚠️ SKIP_ENV_CHECK=1 → 검사 건너뜀");
} else if (miss.length) {
  console.error("❌ Missing ENV:", miss.join(", "));
  process.exit(1);
} else {
  console.log("✅ ENV check OK");
  
  // 파일/디렉토리 존재 검증 (ENGINE=swiss 또는 swisseph일 때만)
  if (engine === "swiss" || engine === "swisseph") {
    const sweExe = String(process.env.SWE_EXE || "").trim();
    const ephePath = String(process.env.SE_EPHE_PATH || "").trim();
    const errors = [];
    
    // SWE_EXE 파일 존재 확인
    if (sweExe) {
      try {
        const stats = fs.statSync(sweExe);
        if (!stats.isFile()) {
          errors.push(`SWE_EXE 경로가 파일이 아닙니다: ${sweExe}`);
        }
      } catch (err) {
        errors.push(`SWE_EXE 파일을 찾을 수 없습니다: ${sweExe}`);
      }
    }
    
    // SE_EPHE_PATH 디렉토리 존재 확인
    if (ephePath) {
      try {
        const stats = fs.statSync(ephePath);
        if (!stats.isDirectory()) {
          errors.push(`SE_EPHE_PATH 경로가 디렉토리가 아닙니다: ${ephePath}`);
        }
      } catch (err) {
        errors.push(`SE_EPHE_PATH 디렉토리를 찾을 수 없습니다: ${ephePath}`);
      }
    }
    
    if (errors.length > 0) {
      console.error("❌ 파일/디렉토리 검증 실패:");
      errors.forEach(err => console.error(`  - ${err}`));
      process.exit(1);
    } else {
      console.log("✅ 파일/디렉토리 검증 OK");
    }
  }
}
