# 프로젝트 TODO 체크리스트

## 인프라 및 설정

- [x] `.cursor/` 디렉토리
  - [x] `rules/` 커서룰
  - [x] `mcp.json` MCP 서버 설정
  - [x] `dir.md` 프로젝트 디렉토리 구조 (실제 위치: `docs/DIR.md`)
- [x] `.github/` 디렉토리 (GitHub Actions, PR 템플릿 등)
- [x] `.husky/` 디렉토리 (Git hooks, 선택사항)

## Next.js 앱 파일

- [x] `app/favicon.ico` 파일
- [x] `app/not-found.tsx` 파일 (404 페이지)
- [x] `app/robots.ts` 파일 (SEO용 robots.txt)
- [x] `app/sitemap.ts` 파일 (SEO용 sitemap.xml)
- [x] `app/manifest.ts` 파일 (PWA 매니페스트)

## 만세력 시스템 (PRD 기반)

- [x] `engine/` 디렉토리
  - [x] `engine.swiss.ts` (Swiss Ephemeris 엔진)
  - [x] `engine.date.ts` (date-chinese 엔진)
  - [x] `engine.types.ts` (타입 정의)
  - [x] `index.ts` (엔진 팩토리)
- [x] `app/api/bazi/` API 라우트
  - [x] `route.ts` (POST /api/bazi)
  - [x] `finish/route.ts` (완료 처리)
- [x] `app/bazi-test/` 테스트 페이지
- [x] 환경 변수 검증
  - [x] `ENGINE=swiss|dateChinese` (엔진 선택)
  - [x] `SWE_EXE` (Swiss Ephemeris 실행 파일 경로)
  - [x] `SE_EPHE_PATH` (천문 데이터 경로)

## 데이터베이스 (Supabase)

- [x] `supabase/` 디렉토리
  - [x] `migrations/` 디렉토리
  - [x] `config.toml` 파일
- [x] Supabase 스키마 마이그레이션 검증
  - [x] `users` 테이블 (Clerk 동기화)
  - [x] `astro_request` 테이블 (요청 로그)
  - [x] `astro_result` 테이블 (결과 저장)
  - [x] `astro_swe_log` 테이블 (Swiss Ephemeris 로그)
  - [x] `astro_cache_sunlon` 테이블 (캐시)
- [x] Storage 버킷 설정
  - [x] `uploads` 버킷 (사용자 파일 저장소)

## 정적 파일

- [x] `public/` 디렉토리
  - [x] `icons/` 디렉토리 (PWA 아이콘)
  - [x] `logo.png` 파일
  - [x] `og-image.png` 파일

## 설정 파일

- [x] `tsconfig.json` 파일
- [x] `.cursorignore` 파일
- [x] `.gitignore` 파일
- [x] `.prettierignore` 파일
- [x] `.prettierrc` 파일
- [x] `eslint.config.mjs` 파일
- [x] `next.config.ts` 파일
- [x] `postcss.config.mjs` 파일
- [x] `components.json` 파일 (shadcn/ui 설정)

## 문서

- [x] `AGENTS.md` 파일
- [x] `CLAUDE.md` 파일
- [x] `README.md` 파일
- [x] `docs/DIR.md` 파일
- [x] `docs/PRD.md` 파일
- [x] `docs/TODO.md` 파일
- [x] `docs/mermaid.md` 파일

## 기타

- [x] `middleware.ts` 파일 (Clerk 인증 미들웨어)
- [x] `scripts/check-env.mjs` 파일 (환경 변수 검증)
- [x] `components/` 디렉토리
  - [x] `ui/` 디렉토리 (shadcn/ui 컴포넌트)
  - [x] `providers/` 디렉토리 (React Context 프로바이더)
  - [x] `Navbar.tsx` 컴포넌트
- [x] `lib/` 디렉토리
  - [x] `supabase/` 디렉토리 (Supabase 클라이언트들)
  - [x] `utils.ts` 파일
- [x] `hooks/` 디렉토리
  - [x] `use-sync-user.ts` 훅
